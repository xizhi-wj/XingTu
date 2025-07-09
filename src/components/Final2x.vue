<template>
  <div class="tool final2x">
    <div class="content">
      <xz-tool-desc :toolDesc="toolDesc"></xz-tool-desc>
      <xz-upload-area v-show="!final2xList.length" @upload="handleUpload"></xz-upload-area>
      <div v-show="final2xList.length" class="container">
        <div class="image-list-container">
          <div class="image-list">
            <div
              :class="image.id === currentImage?.id ? 'image-item active' : 'image-item'"
              @click="handleImageClick(index)"
              v-for="(image, index) in final2xList"
              :key="image.id"
            >
              <div class="image-container">
                <img @load="handleImageLoad" class="image" :src="image.url" alt="" />
              </div>
              <p class="name">{{ image.name }}</p>
            </div>
          </div>
        </div>
        <div ref="previewContainer" class="preview-container">
          <div class="target-image" style="width: 100%">
            <div class="image-container">
              <img
                class="image"
                :src="currentImage?.target_url"
                :style="{
                  width: currentImage?.target_url ? 'auto' : 0,
                  height: currentImage?.target_url ? 'auto' : 0
                }"
              />
            </div>
          </div>
          <div class="origin-image" :style="{ width: `${sliderPosition}%` }">
            <div ref="originImageContainer" class="image-container">
              <img :src="currentImage?.url" alt="" />
            </div>
          </div>
          <div class="slider" @mousedown="startDrag" :style="{ left: `${sliderPosition}%` }"></div>
          <Loading v-show="currentImage?.complete_status === 1" class="loading"></Loading>
        </div>
      </div>
      <div class="footer">
        <div class="config">
          <div class="row config-row">
            <div class="device">
              <a-tooltip content="选择运行的设备，一般默认就好">
                <span class="text">Device</span>
              </a-tooltip>
              <a-select
                v-model="final2xConfig.device"
                default-active-first-option
                placeholder="选择要使用的设备"
                style="width: 120px"
              >
                <a-option
                  v-for="device in DEVICE_OPTIONS"
                  :value="device.value"
                  :label="device.label"
                  :key="device.value"
                ></a-option>
              </a-select>
            </div>
            <div class="model">
              <a-tooltip content="选择要使用的模型">
                <span class="text">Model</span>
              </a-tooltip>
              <a-select
                v-model="final2xConfig.model"
                default-active-first-option
                placeholder="选择要使用的模型"
              >
                <a-option
                  v-for="model in MODEL_OPTIONS"
                  :value="model.value"
                  :label="model.label"
                  :key="model.value"
                ></a-option>
              </a-select>
            </div>
            <div class="scale">
              <a-tooltip
                content="选择图片的放大倍数，比如图片是200x200，放大倍数为2，则输出图片为400x400"
              >
                <span class="text">Scale</span>
                <a-input-number
                  v-model="final2xConfig.targetScale"
                  :step="0.2"
                  :min="0"
                  :max="10"
                  style="width: 100px"
                ></a-input-number>
              </a-tooltip>
            </div>
          </div>
          <div class="row action-row">
            <xz-select-path
              class="output-path"
              v-model:path="final2xConfig.outputPath"
            ></xz-select-path>
            <div class="action">
              <button :disabled="isProcessing" class="btn primary" @click="handleStartSR">
                全部开始
              </button>
              <button :disabled="isProcessing" class="btn danger" @click="handleReset">重置</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DEVICE_OPTIONS, MODEL_OPTIONS } from '@/constant'
import {
  getFileInputPath,
  getFilenameWithoutExtension,
  getResourcePath,
  message,
  run_xingtu_script
} from '@/utils'
import { path } from '@tauri-apps/api'
import { exists, readFile } from '@tauri-apps/plugin-fs'
import { reactive, ref, onMounted, onUnmounted, watch } from 'vue'
import Loading from './common/Loading.vue'

const toolDesc = [
  '第一次使用需要先安装当前使用的模型，这个过程会需要一点时间，开始之后生成的图片会自动保存到目标目录下',
  '图片处理完毕之后会自动显示处理完后的图片进行一个比对，左侧是原图，右侧是处理完的图片'
]

const final2xList = ref<Final2xItem[]>([])

const currentImage = ref<Final2xItem | null>(null)

const isProcessing = ref(false)

const currentIndex = ref(0)

// 滑块位置（百分比）
const sliderPosition = ref(50)
const isDragging = ref(false)
const previewContainer = ref<HTMLElement | null>(null)
const originImageContainer = ref<HTMLElement | null>(null)

const final2xConfig = reactive<{
  outputPath: string
  device: string
  model: string
  targetScale: number
}>({
  outputPath: '',
  device: 'auto',
  model: 'RealESRGAN_RealESRGAN_x4plus_4x.pth',
  targetScale: 2
})

path.pictureDir().then((dir) => {
  final2xConfig.outputPath = dir
})

watch(
  () => final2xConfig.outputPath,
  (newPath) => {
    if (newPath) {
      final2xList.value.forEach((item) => (item.output_path = newPath))
    }
  }
)

watch(
  () => final2xConfig.targetScale,
  (newScale) => {
    if (newScale) {
      final2xList.value.forEach((item) => {
        item.target_scale = newScale
      })
    }
  }
)

const handleUpload = (files: FileList) => {
  const fileList: File[] = []
  for (const file of files) {
    if (file.type.startsWith('image/')) {
      fileList.push(file)
    }
  }
  mapToformatItem(fileList)
}

const handleReset = () => {
  final2xList.value = []
  currentImage.value = null
  currentIndex.value = 0
  sliderPosition.value = 50
  isProcessing.value = false
}

const mapToformatItem = (files: File[]) => {
  for (const file of files) {
    final2xList.value.push({
      name: file.name,
      size: file.size,
      type: file.type,
      status: '未完成',
      url: URL.createObjectURL(file),
      path: '',
      is_completed: false,
      id: `${Date.now()}${Math.floor(Math.random() * 10000)}`,
      raw: file,
      complete_status: 0,
      output_path: final2xConfig.outputPath,
      target_url: '',
      target_scale: final2xConfig.targetScale,
      target_name: '',
      model: final2xConfig.model
    })
  }
  currentImage.value = final2xList.value[0]
}

const handleImageClick = (index: number) => {
  currentImage.value = final2xList.value[index]
  currentIndex.value = index
  sliderPosition.value = 50
}

const tasks: Promise<boolean>[] = []

let maxSize = 3

const handleStartSR = async () => {
  if (!final2xList.value.length) {
    return message({
      content: '请先上传图片',
      type: 'warning'
    })
  }
  const unProcessedList = final2xList.value.filter((item) => item.complete_status === 0)
  if (!unProcessedList.length) {
    return message({
      type: 'warning',
      content: '当前没有需要处理的任务'
    })
  }
  message({
    content: '开始处理全部任务',
    type: 'success'
  })
  const resourcePath = await getResourcePath()
  if (
    await exists(
      await path.join(resourcePath, 'XingTu-core', 'cache_models', `${final2xConfig.model}`)
    )
  ) {
    maxSize = 3
  } else {
    maxSize = 1
  }
  isProcessing.value = true
  let index = 0
  while (index < unProcessedList.length) {
    const final2xItem = unProcessedList[index]
    let targetFilePath = `${final2xItem.output_path}/outputs/${
      final2xItem.target_scale
    }x-${getFilenameWithoutExtension(final2xItem.name)}.png`
    let i = 0
    while (await exists(targetFilePath)) {
      i++
      targetFilePath = `${final2xItem.output_path}/outputs/${
        final2xItem.target_scale
      }x-${getFilenameWithoutExtension(final2xItem.name)}(${i}).png`
    }
    // 获取处理完成后的文件名
    const task = run_xingtu_script(final2xItem, {
      command: 'final2x',
      final2xConfig: {
        device: final2xConfig.device,
        pretrained_model_name: final2xConfig.model,
        target_scale: final2xConfig.targetScale,
        output_path: final2xConfig.outputPath,
        input_path: [await getFileInputPath(final2xItem.raw)]
      }
    })
    tasks.push(task)
    task
      .then(async (res) => {
        if (res) {
          // 读取输出的文件
          const fileData = await readFile(targetFilePath)
          const blob = new Blob([fileData], { type: 'image/png' })
          final2xItem.target_url = URL.createObjectURL(blob)
          message({
            content: `${final2xItem.name} 处理完成`
          })
        } else {
          message({
            type: 'error',
            content: `${final2xItem.name} 处理失败`
          })
        }
      })
      .finally(() => {
        tasks.splice(tasks.indexOf(task), 1)
      })
    if (tasks.length >= maxSize) {
      await Promise.race(tasks)
    }
    index++
  }
  await Promise.all(tasks)
  isProcessing.value = false
  return message({
    content: '所有任务处理完毕'
  })
}

// 开始拖拽
const startDrag = (e: MouseEvent) => {
  e.preventDefault()
  isDragging.value = true
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
}

// 拖拽中
const onDrag = (e: MouseEvent) => {
  if (!isDragging.value || !previewContainer.value) return

  const containerRect = previewContainer.value.getBoundingClientRect()
  const containerWidth = containerRect.width
  if (originImageContainer.value) {
    originImageContainer.value.style.width = `${containerWidth}px`
  }
  const offsetX = e.clientX - containerRect.left

  // 计算滑块位置（百分比）
  let newPosition = (offsetX / containerWidth) * 100

  // 限制滑块在容器内
  newPosition = Math.max(0, Math.min(100, newPosition))
  sliderPosition.value = newPosition
}

const updatePreviewSize = () => {
  if (previewContainer.value) {
    const containerRect = previewContainer.value.getBoundingClientRect()
    const containerWidth = containerRect.width
    if (originImageContainer.value) {
      originImageContainer.value.style.width = `${containerWidth}px`
    }
  }
}

// 停止拖拽
const stopDrag = () => {
  isDragging.value = false
  updatePreviewSize()
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}

// 组件挂载和卸载时的事件处理
onMounted(() => {
  // 确保在组件卸载时移除事件监听器
  window.addEventListener('resize', stopDrag)
})

onUnmounted(() => {
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  window.removeEventListener('resize', stopDrag)
})

const handleImageLoad = () => {
  updatePreviewSize()
}
</script>

<style scoped lang="scss">
.container {
  display: flex;
  gap: 15px;
  background-color: var(--xz-card-bg);
  border-radius: var(--xz-main-radius);
  padding: 10px;
  height: 500px;
  overflow: hidden;

  .image-list-container {
    width: 30%;
    height: 100%;
    overflow: auto;
  }

  .preview-container {
    width: 70%;
    height: 100%;
    background-color: var(--xz-secondbg);
    position: relative;

    .loading {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 999;
    }
  }

  .image-list {
    display: flex;
    flex-direction: column;
    gap: 10px;

    .image-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 10px;
      border: var(--style-border-always);
      border-radius: var(--xz-main-radius);
      transition: all 0.3s ease;

      &.active {
        border: var(--style-border-hover);
      }

      .image-container {
        height: 200px;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;

        img {
          max-width: 100%;
          max-height: 100%;
          object-fit: cover;
        }
      }

      p.name {
        font-weight: bold;
        text-wrap: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        width: 100%;
        text-align: center;
      }
    }
  }

  .target-image,
  .origin-image {
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    overflow: hidden;
    user-select: none;
    transition: width 0.05s ease;

    .image-container {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      user-select: none;
      position: absolute;
      top: 0;
      left: 0;

      img {
        max-width: 100%;
        max-height: 100%;
        width: auto;
        height: auto;
        object-fit: contain;
      }
    }
  }

  .slider {
    position: absolute;
    top: 0;
    left: 50%;
    width: 2px;
    height: 100%;
    background-color: white;
    z-index: 3;
    cursor: ew-resize;
    transform: translateX(-50%);
    user-select: none;
    transition: left 0.05s ease;

    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 40px;
      height: 40px;
      background-color: white;
      border-radius: 50%;
      transform: translate(-50%, -50%);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      user-select: none;
    }

    &::after {
      content: '↔';
      position: absolute;
      user-select: none;
      top: 50%;
      left: 50%;
      color: #333;
      font-size: 20px;
      transform: translate(-50%, -50%);
    }
  }
}

.footer {
  display: flex;
  flex-direction: column;
  background-color: var(--xz-card-bg);
  border-radius: var(--xz-main-radius);
  padding: 10px;
  margin-top: 10px;

  .config {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .row {
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
    align-items: center;

    &.action-row {
      justify-content: space-between;
    }

    .device,
    .model,
    .scale,
    .action {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }
}
</style>
