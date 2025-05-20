<template>
  <div class="tool split">
    <div class="content">
      <xz-tool-desc :tool-desc="toolDesc"></xz-tool-desc>
      <div class="action">
        <div class="row">
          <div class="config">
            <div class="config-item">
              <span class="text">行数: </span>
              <a-input-number
                v-model="splitConfig.row"
                :max="10"
                :min="1"
                :step="1"
                @change="handleSplitImage"
              ></a-input-number>
            </div>
            <div class="config-item">
              <span class="text">列数: </span>
              <a-input-number
                v-model="splitConfig.col"
                :max="10"
                :min="1"
                :step="1"
                @change="handleSplitImage"
              ></a-input-number>
            </div>
          </div>
          <div class="btns">
            <xz-upload-button @uploadFile="handleUpload" :text="'上传图片'"></xz-upload-button>
            <xz-button class="danger" @click="handleDownload" :text="'下载图片'">
              <IconDownload></IconDownload>
            </xz-button>
          </div>
        </div>
        <div class="row">
          <div class="select-path">
            <span class="text">输出路径: </span>
            <a-input
              readonly
              v-model="splitConfig.outputPath"
              placeholder="请选择输出路径"
              style="width: 200px"
            ></a-input>
            <icon-folder class="icon" @click="handleSelectOutputPath"></icon-folder>
          </div>
          <div class="select-format">
            <span class="text">输出格式: </span>
            <a-select
              v-model="splitConfig.format"
              default-active-first-option
              placeholder="请选择输出格式"
              style="width: 120px"
              @change="handleSplitImage"
            >
              <a-option
                v-for="option in formatOptions"
                :value="option.value"
                :key="option.value"
                :label="option.label"
              ></a-option>
            </a-select>
          </div>
        </div>
      </div>
      <div class="image-area">
        <div class="origin-image">
          <div class="image-container">
            <img :src="imageUrl" alt="" ref="originImage" @load="handleSplitImage" />
          </div>
        </div>
        <div class="split-image">
          <p class="title">拆分预览</p>
          <div class="split-grid" :style="gridStyle">
            <div v-for="(item, index) in splitImages" :key="index" class="split-item">
              <img :src="item" alt="" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { open } from '@tauri-apps/plugin-dialog'
import { path } from '@tauri-apps/api'
import { message, save_file } from '@/utils'
import { Message } from '@arco-design/web-vue'

const toolDesc = ['将图片均等分割为多张图片']

const formatOptions = [
  {
    label: 'jpeg',
    value: 'jpeg'
  },
  {
    label: 'png',
    value: 'png'
  },
  {
    label: 'webp',
    value: 'webp'
  }
]

const splitConfig = reactive<{
  row: number
  col: number
  outputPath: string
  format: string
}>({
  row: 3,
  col: 3,
  outputPath: '',
  format: 'jpeg'
})

// 初始化输出路径为图片文件夹
path.pictureDir().then((dir) => {
  splitConfig.outputPath = dir
})

// 选择输出路径
const handleSelectOutputPath = async () => {
  const path = await open({
    directory: true
  })
  if (path) {
    splitConfig.outputPath = path
  }
}

const imageUrl = ref<string>('')
const originImage = ref<HTMLImageElement | null>(null)
const splitImages = ref<string[]>([])
const originalFile = ref<File | null>(null)

// 计算网格布局样式
const gridStyle = computed(() => {
  return {
    gridTemplateColumns: `repeat(${splitConfig.col}, 1fr)`,
    gridTemplateRows: `repeat(${splitConfig.row}, 1fr)`
  }
})

// 上传图片
const handleUpload = (files: FileList) => {
  if (files.length > 0) {
    const img = files[0]
    if (!img.type.startsWith('image/')) {
      return message({
        content: '必须上传图片嗷~',
        type: 'warning'
      })
    }
    originalFile.value = img
    imageUrl.value = URL.createObjectURL(img)
  }
}

// 分割图片
const handleSplitImage = () => {
  if (!imageUrl.value || !originImage.value) return

  const img = originImage.value
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const imgWidth = img.naturalWidth
  const imgHeight = img.naturalHeight

  // 计算每个分割块的尺寸
  const pieceWidth = imgWidth / splitConfig.col
  const pieceHeight = imgHeight / splitConfig.row

  // 清空之前的分割图片
  splitImages.value = []

  // 设置画布大小为单个分割块的大小
  canvas.width = pieceWidth
  canvas.height = pieceHeight

  // 分割图片
  for (let row = 0; row < splitConfig.row; row++) {
    for (let col = 0; col < splitConfig.col; col++) {
      // 清空画布
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // 绘制对应区域的图片到画布
      ctx.drawImage(
        img,
        col * pieceWidth,
        row * pieceHeight,
        pieceWidth,
        pieceHeight,
        0,
        0,
        pieceWidth,
        pieceHeight
      )

      // 将画布内容转为图片URL并保存
      const dataURL = canvas.toDataURL(`image/${splitConfig.format}`, 0.9)
      splitImages.value.push(dataURL)
    }
  }
}

// 下载分割后的图片
const handleDownload = async () => {
  if (splitImages.value.length === 0) {
    return message({
      content: '请先上传并分割图片',
      type: 'warning'
    })
  }

  const folderPath = await path.join(splitConfig.outputPath, 'split')
  message({
    type: 'loading',
    content: '正在保存图片...',
    duration: 0
  })
  // 保存每个分割图片
  for (let i = 0; i < splitImages.value.length; i++) {
    const dataURL = splitImages.value[i]
    // 将dataURL转换为Blob
    const res = await fetch(dataURL)
    const blob = await res.blob()

    // 生成文件名
    const baseName = originalFile.value ? originalFile.value.name.split('.')[0] : 'split'
    const fileName = `${baseName}_${Math.floor(i / splitConfig.col)}_${i % splitConfig.col}.${
      splitConfig.format
    }`
    // 保存文件
    await save_file(folderPath, fileName, blob)
  }
  Message.clear()
  message({
    content: '保存成功',
    type: 'success'
  })
}
</script>

<style scoped lang="scss">
.action {
  background-color: var(--xz-card-bg);
  padding: 10px;
  border-radius: var(--xz-main-radius);
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
  gap: 10px;

  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  .config {
    display: flex;
    align-items: center;
    gap: 10px;

    .config-item {
      display: flex;
      align-items: center;
      gap: 5px;

      .text {
        text-wrap: nowrap;
      }
    }
  }

  .select-path {
    display: flex;
    align-items: center;
    gap: 5px;
    flex: 1;

    .text {
      text-wrap: nowrap;
    }

    .icon {
      cursor: pointer;
      margin-left: 5px;
    }
  }

  .select-format {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-left: 10px;

    .text {
      text-wrap: nowrap;
    }
  }

  .btns {
    display: flex;
    gap: 10px;
  }
}

.image-area {
  background-color: var(--xz-card-bg);
  display: flex;
  padding: 10px;
  border-radius: var(--xz-main-radius);
  height: 500px;

  .origin-image,
  .split-image {
    width: 50%;
    height: 100%;
  }

  .origin-image {
    background-color: var(--xz-secondbg);
    .image-container {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;

      img {
        max-width: 100%;
        max-height: 100%;
        width: auto;
        height: auto;
        object-fit: contain;
      }
    }
  }

  .split-image {
    padding: 10px;
    overflow: auto;

    .title {
      font-weight: bold;
      width: 100%;
      text-align: center;
      margin-bottom: 10px;
      font-size: 1rem;
    }

    .split-grid {
      display: grid;
      gap: 2px;
      width: 100%;

      .split-item {
        width: 100%;
        height: fit-content;
        display: flex;
        justify-content: center;
        align-items: center;

        img {
          max-width: 100%;
          max-height: 100%;
          width: auto;
          height: auto;
          object-fit: contain;
        }
      }
    }
  }
}
</style>
