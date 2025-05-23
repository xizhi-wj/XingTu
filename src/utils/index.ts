import { path } from '@tauri-apps/api'
import { arch, type } from '@tauri-apps/plugin-os'
import { Command } from '@tauri-apps/plugin-shell'
import { writeFile, remove, rename, exists, mkdir } from '@tauri-apps/plugin-fs'
import { Message } from '@arco-design/web-vue'
import appStore from '@/store'
import { invoke } from '@tauri-apps/api/core'
import axios from 'axios'

const store = appStore()

interface MessageOption {
  content: string
  type?: 'success' | 'error' | 'warning' | 'info' | 'loading'
  duration?: number
  closable?: boolean
}

export const getFilenameWithoutExtension = (filename: string) => {
  return filename?.lastIndexOf('.') > 0
    ? filename.substring(0, filename.lastIndexOf('.'))
    : filename || ''
}

export const message = (option: MessageOption) => {
  const { content, type = 'success', duration = 2000, closable = false } = option
  return Message[`${type}`]({
    content,
    duration,
    closable
  })
}

export const getSystemType = () => {
  return type()
}

export const getAppDataPath = () => {
  return path.appLocalDataDir()
}

export const getResourcePath = () => {
  return new Promise<string>(async (resolve, reject) => {
    try {
      const resPath = await path.resourceDir()
      const resourcesPath = await path.join(resPath, 'resources')
      // 检查目录是否存在，不存在则创建
      if (!(await exists(resourcesPath))) {
        await mkdir(resourcesPath, { recursive: true })
      }
      resolve(resourcesPath)
    } catch (error) {
      reject(error)
    }
  })
}

export const getTagColor = (status: string) => {
  switch (status) {
    case '未完成':
      return 'gold'
    case '已完成':
      return 'green'
    case '失败':
      return 'red'
    default:
      return 'blue'
  }
}

export const save_file = (output_path: string, fileName: string, data: Blob) => {
  return new Promise<boolean>(async (resolve, _reject) => {
    try {
      const arrayBuffer = await data.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)
      await invoke('save_image', {
        blobData: Array.from(uint8Array),
        fileName,
        directory: output_path
      })
      const save_path = await path.join(output_path, fileName)
      console.log(`文件已经保存到 ${save_path}`)
      store.log.push(`文件已经保存到 ${save_path}`)
      resolve(true)
    } catch (error) {
      console.log(error)
      store.log.push('保存文件失败: ' + error)
      resolve(false)
    }
  })
}

export const delete_path = (path: string) => {
  return new Promise<boolean>(async (resolve, _reject) => {
    try {
      const isDelete = await invoke('delete_path', { path })
      console.log(isDelete)
      if (isDelete) {
        console.log(`文件已经删除 ${path}`)
        store.log.push(`文件已经删除 ${path}`)
      } else {
        console.log(`文件删除失败 ${path}`)
        store.log.push(`文件删除失败 ${path}`)
      }
      resolve(isDelete as boolean)
    } catch (error) {
      console.log(error)
      store.log.push('删除文件失败: ' + error)
      resolve(false)
    }
  })
}

const xingtuCoreDict = {
  'macos-arm64': 'https://cdn.hoshinagi.top/XingTu-core-macos-arm64.zip',
  'macos-x64': 'https://cdn.hoshinagi.top/XingTu-core-macos-x64.zip',
  'windows-x64': 'https://cdn.hoshinagi.top/XingTu-core-windows.zip'
}

export const download_xingtu_core = async () => {
  return new Promise<boolean>(async (resolve, reject) => {
    try {
      const resourcePath = await getResourcePath()
      console.log('正在下载XingTu-core')
      store.log.push('正在下载XingTu-core')
      let platformToDownload = ''

      const t = type()
      if (t === 'macos') {
        platformToDownload = arch() === 'aarch64' ? 'macos-arm64' : 'macos-x64'
      } else if (t === 'windows') {
        platformToDownload = 'windows-x64'
      } else if (t === 'linux') {
        return console.error(
          'Skip download XingTu-core for linux! Please use pip to install XingTu-core'
        )
      } else {
        return console.error('Unknown platform!')
      }
      const downloadUrl = xingtuCoreDict[platformToDownload as keyof typeof xingtuCoreDict]

      store.log.push('正在下载XingTu-core，请确保下载完成后在使用应用中的工具')

      const res = await axios({
        url: downloadUrl,
        method: 'GET',
        responseType: 'arraybuffer',
        onDownloadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = parseFloat(
              ((progressEvent.loaded * 100) / progressEvent.total).toFixed(2)
            )
            console.log(percent)
            store.log.push(`正在下载XingTu-core,当前下载进度: ${percent}%`)
          }
        }
      })
      store.log.push('下载完成，正在进行保存')
      const zipFilePath = await path.join(resourcePath, `${downloadUrl.split('/').pop()}`)
      await writeFile(zipFilePath, res.data)
      store.log.push('文件保存到 ' + zipFilePath + '，正在进行解压')
      await invoke('extract_zip', {
        zipPath: zipFilePath,
        outputDir: resourcePath
      })
      store.log.push('解压完成，正在进行后续处理')
      // 从downloadUrl提取解压后的文件夹的名字
      const folderName = downloadUrl.split('/').pop()?.split('.')[0] || 'XingTu-core'
      const oldPath = await path.join(resourcePath, folderName)
      const newPath = await path.join(resourcePath, 'XingTu-core')
      await rename(oldPath, newPath)
      store.log.push('处理完成，XingTu-core安装完毕')
      resolve(true)
    } catch (error) {
      console.log(error)
      store.log.push('XingTu-core下载或解压失败: ' + error)
      reject(error)
    }
  })
}

export const getFileInputPath = async (file: File) => {
  const resourcePath = await getResourcePath()
  const tempPath = await path.join(resourcePath, 'temp')
  if (!(await exists(tempPath))) {
    await mkdir(tempPath, {
      recursive: true
    })
  }
  const tempFilePath = await path.join(tempPath, file.name)
  await writeFile(tempFilePath, new Uint8Array(await file.arrayBuffer()))
  return tempFilePath
}

export const run_xingtu_script = (imageItem: ImageItem, config: XingTuConfig) => {
  let tempFilePath = ''
  return new Promise<boolean>(async (resolve, _reject) => {
    try {
      imageItem.status = '正在处理'
      imageItem.complete_status = 1
      store.log.push('正在进行图片处理: ' + imageItem.name)
      tempFilePath = await getFileInputPath(imageItem.raw)
      const configJson = JSON.stringify(config)
      const configBase64 = btoa(String.fromCharCode(...new TextEncoder().encode(configJson)))
      const command = Command.create('xingtu', ['-b', configBase64])
      // 更新了一下依赖就导致使用spawn无法监听到程序的输出和错误，也无法监听到程序是否退出了，无奈只能使用execute了
      // command.stdout.addListener('data', (data) => {
      //   console.log(data)
      //   store.log.push(data.toString())
      // })
      // command.stderr.addListener('data', (_data) => {
      //   if (_data.startsWith('OMP:')) {
      //     return
      //   }
      //   console.log(_data.toString())
      //   store.log.push(_data.toString())
      // })
      // command.addListener('close', () => {
      //   imageItem.is_completed = true
      //   imageItem.complete_status = 2
      //   imageItem.status = '已完成'
      //   // 删除临时文件
      //   tempFilePath && remove(tempFilePath)
      //   store.log.push(`图片处理完成: ${imageItem.name}`)
      //   resolve(true)
      // })
      // command.spawn().catch((error) => {
      //   store.log.push('命令执行失败: ' + error)
      //   resolve(false)
      // })
      const result = await command.execute()
      store.log.push(result.stdout.toString())
      if (!result.stderr.startsWith('OMP:')) {
        store.log.push(result.stderr.toString())
      }
      imageItem.is_completed = true
      imageItem.complete_status = 2
      imageItem.status = '已完成'
      store.log.push(`图片处理完成: ${imageItem.name}`)
      resolve(true)
    } catch (error) {
      store.log.push('图片处理失败' + error)
      resolve(false)
    } finally {
      // 删除临时文件
      tempFilePath && remove(tempFilePath)
    }
  })
}

export const checkEnv = () => {
  return new Promise<boolean>(async (resolve, _reject) => {
    const resourcePath = await getResourcePath()
    const xingtuCorePath = await path.join(resourcePath, 'XingTu-core')
    if (await exists(xingtuCorePath)) {
      store.log.push('XingTu-core已安装')
      resolve(true)
    } else {
      store.log.push('XingTu-core未安装')
      resolve(false)
    }
  })
}

export const resetEnv = () => {
  // 删除虚拟环境
  return new Promise<boolean>(async (resolve, _reject) => {
    try {
      const resourcePath = await getResourcePath()
      // 删除xingtu-core
      const xingtuCorePath = await path.join(resourcePath, 'XingTu-core')
      await delete_path(xingtuCorePath)
      resolve(true)
    } catch (error) {
      console.log(error)
      resolve(false)
    }
  })
}

export const initEnv = async () => {
  try {
    await download_xingtu_core()
    return true
  } catch (error) {
    store.log.push('初始化失败，文件下载失败: ' + error)
    return false
  }
}
