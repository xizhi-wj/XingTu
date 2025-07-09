<template>
  <div class="koutu container tool">
    <div class="content">
      <ToolDesc :toolDesc="toolDesc"></ToolDesc>
      <UploadArea v-show="!koutuItems.length" :accept="'image'" @upload="handleUpload"></UploadArea>
      <a-table
        :data="koutuItems"
        :pagination="false"
        :virtual-list-props="{ height: 450 }"
        v-show="koutuItems.length"
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
          <a-table-column align="center" title="图片背景">
            <template #cell="{ record }">
              <div
                class="color-container"
                style="width: 100%; display: flex; justify-content: center; align-items: center"
              >
                <a-color-picker v-model="record.bg_color" defaultValue="#165DFF" showText />
              </div>
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
                  @click="handleKouTu(record)"
                  class="btn primary"
                >
                  开始
                </button>
                <button
                  @click="koutuItems.splice(koutuItems.indexOf(record), 1)"
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
      <!-- <div class="koutu-list">
        <div class="image-import"></div>
        <div class="list-header"></div>
      </div> -->
      <div class="footer" v-show="koutuItems.length">
        <div class="config">
          <div class="row">
            <div class="config-item">
              <span>统一背景色: </span>
              <a-color-picker v-model="koutuConfig.bg_color" defaultValue="#FFFFFF00" showText />
            </div>
            <div class="config-item">
              <span>模型: </span>
              <a-select
                v-model="koutuConfig.model"
                default-active-first-option
                :style="{ width: '200px' }"
                placeholder="请选择要使用的模型"
              >
                <a-option
                  v-for="option in koutuModels"
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
              v-model="koutuConfig.output_path"
              placeholder="请选择输出路径"
            ></a-input>
            <icon-folder class="icon" @click="handleSelectOutputPath"></icon-folder>
          </div>
        </div>
        <div class="action">
          <button :disabled="processingAllDisabeld" @click="handleKouTuAll" class="btn primary">
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
import { getFileInputPath, message, run_xingtu_script } from '@/utils'
import { exists } from '@tauri-apps/plugin-fs'

const toolDesc = [
  '目前一次性最多同时执行5个任务，不然可能会消耗比较大的性能',
  '第一次使用不同的模型都需要先下载模型，模型会下载到用户目录下的.u2net目录下'
]

const koutuConfig = reactive({
  model: 'u2net',
  bg_color: '#FFFFFF00',
  output_path: ''
})

path.pictureDir().then((dir) => {
  koutuConfig.output_path = dir
})

const koutuItems = ref<KouTuItem[]>([])

const isProcessingAll = ref(false)

const processingAllDisabeld = computed(() => {
  if (isProcessingAll.value || !koutuItems.value.some((item) => item.complete_status === 0)) {
    return true
  }
  return false
})

const tasks: Promise<boolean>[] = []
//  u2net, u2netp, u2net_human_seg, silueta
const koutuModels = [
  {
    label: 'u2net',
    value: 'u2net'
  },
  {
    label: 'u2netp',
    value: 'u2netp'
  },
  {
    label: 'u2net_human_seg',
    value: 'u2net_human_seg'
  },
  {
    label: 'silueta',
    value: 'silueta'
  }
]

watch(
  () => koutuConfig.bg_color,
  (newVal) => {
    koutuItems.value.forEach((item) => {
      item.bg_color = newVal
    })
  }
)

watch(
  () => koutuConfig.output_path,
  (newVal) => {
    koutuItems.value.forEach((item) => {
      item.output_path = newVal
    })
  }
)

watch(
  () => koutuConfig.model,
  (newVal) => {
    koutuItems.value.forEach((item) => {
      item.model = newVal
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
  mapToKouTuItem(fileList)
}

const mapToKouTuItem = (files: File[]) => {
  for (const file of files) {
    koutuItems.value.push({
      name: file.name,
      size: file.size,
      type: file.type,
      status: '未完成',
      url: URL.createObjectURL(file),
      path: '',
      is_completed: false,
      id: `${Date.now()}${Math.floor(Math.random() * 10000)}`,
      bg_color: '#FFFFFF00',
      raw: file,
      output_path: koutuConfig.output_path,
      model: koutuConfig.model,
      complete_status: 0
    })
  }
}

const getTagColor = (status: string) => {
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

const handleReset = () => {
  koutuItems.value = []
  isProcessingAll.value = false
}

const handleSelectOutputPath = async () => {
  const path = await open({
    directory: true
  })
  if (path) {
    koutuConfig.output_path = path
  }
}

const handleKouTu = async (item: KouTuItem) => {
  if (item.complete_status !== 0) {
    return message({ content: '当前任务正在处理或已经完成', type: 'warning' })
  }
  if (tasks.length >= 5) {
    return message({ content: '处理队列已经满了，请等待处理完成', type: 'warning' })
  }
  const task = run_xingtu_script(item, {
    command: 'remove_bg',
    removeBgConfig: {
      model: item.model,
      bg_color: item.bg_color,
      output_path: koutuConfig.output_path,
      input_path: [await getFileInputPath(item.raw)]
    }
  })
  tasks.push(task)
  task.finally(() => {
    tasks.splice(tasks.indexOf(task), 1)
  })
}

let taskMaxSize = 5

const handleKouTuAll = async () => {
  const unProcessedList = koutuItems.value.filter((item) => item.complete_status === 0)
  if (!unProcessedList.length) {
    return message({ content: '当前没有需要处理的任务' })
  }
  message({ content: '开始处理全部任务', type: 'success' })
  if (await exists(await path.join(await path.homeDir(), '.u2net', `${koutuConfig.model}.onnx`))) {
    taskMaxSize = 5
  } else {
    taskMaxSize = 1
  }
  isProcessingAll.value = true
  let index = 0
  while (index < unProcessedList.length) {
    const task = run_xingtu_script(unProcessedList[index], {
      command: 'remove_bg',
      removeBgConfig: {
        model: unProcessedList[index].model,
        bg_color: unProcessedList[index].bg_color,
        output_path: koutuConfig.output_path,
        input_path: [await getFileInputPath(unProcessedList[index].raw)]
      }
    })
    tasks.push(task)
    task.finally(() => {
      tasks.splice(tasks.indexOf(task), 1)
    })
    if (tasks.length >= taskMaxSize) {
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
.koutu {
  display: flex;
  flex-direction: column;
  overflow: auto;
  height: 100%;

  .content {
    display: flex;
    flex-direction: column;
    padding: 10px 15px;

    .title {
      font-size: 1.3rem;
      font-weight: bold;
      margin-bottom: 20px;
    }

    .koutu-table {
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
