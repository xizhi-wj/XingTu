<template>
  <div class="format container tool">
    <div class="content">
      <ToolDesc :toolDesc="toolDesc"></ToolDesc>
      <UploadArea
        v-show="!formatItems.length"
        :accept="'image'"
        @upload="handleUpload"
      ></UploadArea>
      <a-table
        :data="formatItems"
        :pagination="false"
        :virtual-list-props="{ height: 450 }"
        v-show="formatItems.length"
        :bordered="false"
      >
        <template #columns>
          <!-- <a-table-column align="center" title="图片预览">
              <template #cell="{ record }">
                <div class="image_container">
                  <img :src="record.url" alt="" />
                </div>
              </template>
            </a-table-column> -->
          <a-table-column align="center" title="图片名称" data-index="name"></a-table-column>
          <a-table-column align="center" title="输出格式" data-index="format">
            <template #cell="{ record }">
              <a-select
                v-model="record.format"
                default-active-first-option
                :style="{ width: '150px' }"
                placeholder="请选择输出格式"
              >
                <a-option
                  v-for="option in formatOptions"
                  :value="option.value"
                  :key="option.value"
                  :label="option.label"
                >
                </a-option>
              </a-select>
            </template>
          </a-table-column>
          <a-table-column align="center" title="当前状态">
            <template #cell="{ record }">
              <a-tag size="large" :color="getTagColor(record.status)">{{ record.status }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column align="center" title="操作">
            <template #cell="{ record }">
              <div
                class="action"
                style="display: flex; gap: 10px; align-items: center; justify-content: center"
              >
                <button
                  :disabled="record.complete_status"
                  @click="handleformat(record)"
                  class="btn primary"
                >
                  开始
                </button>
                <button
                  @click="formatItems.splice(formatItems.indexOf(record), 1)"
                  class="btn danger"
                  :disabled="record.complete_status === 1"
                >
                  删除
                </button>
              </div>
            </template>
          </a-table-column>
        </template>
      </a-table>
      <div class="footer" v-show="formatItems.length">
        <div class="config">
          <div class="row">
            <div class="config-item">
              <span>统一输出格式: </span>
              <a-select
                v-model="formatConfig.format"
                default-active-first-option
                :style="{ width: '200px' }"
                placeholder="请选择要使用的模型"
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
          <div class="config-item">
            <span>输出路径: </span>
            <a-input
              readonly
              v-model="formatConfig.output_path"
              placeholder="请选择输出路径"
            ></a-input>
            <icon-folder class="icon" @click="handleSelectOutputPath"></icon-folder>
          </div>
        </div>
        <div class="action">
          <button :disabled="processingAllDisabeld" @click="handleformatAll" class="btn primary">
            全部开始
          </button>
          <button @click="handleReset" class="btn danger">重置任务</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import ToolDesc from './common/ToolDesc.vue'
import UploadArea from './common/UploadArea.vue'
import { open } from '@tauri-apps/plugin-dialog'
import { path } from '@tauri-apps/api'
import { getFileInputPath, getTagColor, message, run_xingtu_script } from '@/utils'

const toolDesc = [
  '支持的输入格式有：jpg、jpeg、png、bmp、webp、gif、avif、tiff、ico、heic、raw(下次更新添加)',
  '支持的输出格式有：jpg、png、webp、bmp、tiff、gif、avif、ico、heic'
]

const formatConfig = reactive<{
  output_path: string
  format: ImageFormat
}>({
  output_path: '',
  format: 'png'
})

path.pictureDir().then((dir) => {
  formatConfig.output_path = dir
})

const formatItems = ref<FormatItem[]>([])

const isProcessingAll = ref(false)

const processingAllDisabeld = computed(() => {
  if (isProcessingAll.value || !formatItems.value.some((item) => item.complete_status === 0)) {
    return true
  }
  return false
})

const tasks: Promise<boolean>[] = []
type ImageFormat = 'jpg' | 'png' | 'webp' | 'bmp' | 'tiff' | 'gif' | 'heic' | 'avif'
const formatOptions = [
  {
    value: 'jpg',
    label: 'jpg'
  },
  {
    value: 'png',
    label: 'png'
  },
  {
    value: 'webp',
    label: 'webp'
  },
  {
    value: 'avif',
    label: 'avif'
  },
  {
    value: 'bmp',
    label: 'bmp'
  },
  {
    value: 'tiff',
    label: 'tiff'
  },
  {
    value: 'gif',
    label: 'gif'
  },
  {
    value: 'ico',
    label: 'ico'
  },
  {
    value: 'heic',
    label: 'heic'
  }
]

watch(
  () => formatConfig.output_path,
  (newVal) => {
    formatItems.value.forEach((item) => {
      item.output_path = newVal
    })
  }
)

watch(
  () => formatConfig.format,
  (newVal) => {
    formatItems.value.forEach((item) => {
      item.format = newVal
    })
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

const mapToformatItem = (files: File[]) => {
  for (const file of files) {
    formatItems.value.push({
      name: file.name,
      size: file.size,
      type: file.type,
      status: '未完成',
      url: URL.createObjectURL(file),
      path: '',
      is_completed: false,
      id: `${Date.now()}${Math.floor(Math.random() * 10000)}`,
      raw: file,
      output_path: formatConfig.output_path,
      complete_status: 0,
      format: 'png'
    })
  }
}

const handleReset = () => {
  formatItems.value = []
  isProcessingAll.value = false
}

const handleSelectOutputPath = async () => {
  const path = await open({
    directory: true
  })
  if (path) {
    formatConfig.output_path = path
  }
}

const handleformat = async (item: FormatItem) => {
  if (item.complete_status !== 0) {
    return message({ content: '当前任务正在处理或已经完成', type: 'warning' })
  }
  if (tasks.length >= 5) {
    return message({ content: '处理队列已经满了，请等待处理完成', type: 'warning' })
  }
  const task = run_xingtu_script(item, {
    command: 'format',
    formatConfig: {
      target_format: item.format,
      input_path: [await getFileInputPath(item.raw)],
      output_path: formatConfig.output_path
    }
  })
  tasks.push(task)
  task.finally(() => {
    tasks.splice(tasks.indexOf(task), 1)
  })
}

const handleformatAll = async () => {
  const unProcessedList = formatItems.value.filter((item) => item.complete_status === 0)
  if (!unProcessedList.length) {
    return message({ content: '当前没有需要处理的任务' })
  }
  message({ content: '开始处理全部任务', type: 'success' })
  isProcessingAll.value = true
  let index = 0
  while (index < unProcessedList.length) {
    const task = run_xingtu_script(unProcessedList[index], {
      command: 'format',
      formatConfig: {
        target_format: unProcessedList[index].format,
        input_path: [await getFileInputPath(unProcessedList[index].raw)],
        output_path: formatConfig.output_path
      }
    })
    tasks.push(task)
    task.finally(() => {
      tasks.splice(tasks.indexOf(task), 1)
    })
    if (tasks.length >= 5) {
      await Promise.race(tasks)
    }
    index++
  }
  await Promise.all(tasks)
  isProcessingAll.value = false
  return message({ content: '全部任务处理完成' })
}
</script>

<style scoped lang="scss">
.format {
  overflow: auto;

  .content {
    display: flex;
    flex-direction: column;
    padding: 10px 15px;

    .title {
      font-size: 1.3rem;
      font-weight: bold;
      margin-bottom: 20px;
    }

    .format-table {
      width: 100%;
      border: var(--style-border-always);

      th {
        padding: 5px 10px;
      }
    }

    .footer {
      margin-top: 20px;
      display: flex;
      justify-content: space-between;
      background-color: var(--xz-card-bg);
      border-radius: var(--xz-main-radius);
      padding: 10px 15px;

      .config {
        display: flex;
        flex-direction: column;
        gap: 5px;

        .row {
          display: flex;
          gap: 12px;
        }

        .config-item {
          display: flex;
          align-items: center;
          gap: 5px;

          span {
            text-wrap: nowrap;
          }
        }
      }

      .action {
        display: flex;
        align-items: center;
        gap: 15px;
      }
    }
  }
}

.image_container {
  width: 100%;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    object-fit: cover;
    max-width: 100%;
    max-height: 100%;
  }
}

.processing-info {
  margin-right: 10px;
  color: var(--color-text-2);
  font-size: 14px;

  span {
    color: var(--color-text-3);
  }
}
</style>
