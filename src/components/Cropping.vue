<template>
  <div class="tool cropping">
    <div class="content">
      <ToolDesc :tool-desc="toolDesc"></ToolDesc>
      <div class="cropper-container">
        <div class="cropper-area">
          <VueCropper
            :canScale="true"
            :autoCrop="true"
            :infoTrue="true"
            :canMove="false"
            :centerBox="true"
            :outputType="cropperConfig.format"
            @realTime="handleRealTime"
            :img="cropperConfig.img"
            ref="cropper"
          ></VueCropper>
        </div>
        <div class="cropper-preview">
          <p class="title">裁剪预览</p>
          <div class="preview-container">
            <div class="cropper-preview-box">
              <img :src="cropperData" class="cropper-preview-img" alt="" />
            </div>
          </div>
        </div>
      </div>
      <div class="action">
        <div class="row">
          <div class="select-path">
            <span class="text">输出路径: </span>
            <a-input
              readonly
              v-model="cropperConfig.outputPath"
              placeholder="请选择输出路径"
            ></a-input>
            <icon-folder class="icon" @click="handleSelectOutputPath"></icon-folder>
          </div>
          <div class="btns">
            <xz-upload-button @uploadFile="handleUpload" :text="'上传图片'"></xz-upload-button>
            <xz-button @click="handleDownload" :type="'danger'" :text="'下载图片'">
              <template #default>
                <IconDownload></IconDownload>
              </template>
            </xz-button>
          </div>
        </div>
        <div class="row">
          <div class="select-format">
            <span class="text">输出格式: </span>
            <a-select
              v-model="cropperConfig.format"
              default-active-first-option
              placeholder="请选择输出格式"
              style="width: 200px"
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
    </div>
  </div>
</template>

<script setup lang="ts">
import ToolDesc from './common/ToolDesc.vue'
import 'vue-cropper/dist/index.css'
import { VueCropper } from 'vue-cropper'
import { reactive, ref } from 'vue'
import { open } from '@tauri-apps/plugin-dialog'
import { path } from '@tauri-apps/api'
import { message, save_file } from '@/utils'

const toolDesc = ['鼠标滑轮控制图片缩放', '裁剪后的图片大小与裁剪框显示的大小一致']

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

const cropper = ref()

const cropperConfig = reactive<{
  outputPath: string
  img: string
  format: string
  raw: File | null
}>({
  outputPath: '',
  img: '',
  format: 'jpeg',
  raw: null
})

path.pictureDir().then((dir) => {
  cropperConfig.outputPath = dir
})

const cropperData = ref<string>('')

const handleRealTime = (_data: any) => {
  cropper.value.getCropData((d: string) => {
    cropperData.value = d
  })
}

const handleSelectOutputPath = async () => {
  const path = await open({
    directory: true
  })
  if (path) {
    cropperConfig.outputPath = path
  }
}

const handleDownload = async () => {
  if (!cropperConfig.raw) {
    return message({
      content: '请先上传图片',
      type: 'warning'
    })
  }
  cropper.value.getCropBlob(async (blob: Blob) => {
    if (blob) {
      const fileName = `${cropperConfig.raw?.name.split('.')[0]}_${Math.floor(
        Math.random() * 10000
      )}.${cropperConfig.format}`
      const output_path = await path.join(cropperConfig.outputPath, 'cropper')
      const res = await save_file(output_path, fileName, blob)
      res
        ? message({
            content: '保存成功'
          })
        : message({
            content: '保存失败',
            type: 'error'
          })
    }
  })
}

const handleUpload = (files: FileList) => {
  if (files.length > 0) {
    const img = files[0]
    if (!img.type.startsWith('image/')) {
      return message({
        content: '必须上传图片嗷~',
        type: 'warning'
      })
    }
    cropperConfig.raw = img
    cropperConfig.img = URL.createObjectURL(img)
  }
}
</script>

<style scoped lang="scss">
.cropper-container {
  width: 100%;
  padding: 10px;
  min-height: 450px;
  max-height: 450px;
  display: flex;
  gap: 20px;
  background-color: var(--xz-card-bg);
  border-radius: var(--xz-main-radius);

  .cropper-area {
    width: 50%;
  }

  .cropper-preview {
    width: 50%;
    display: flex;
    flex-direction: column;
    border: var(--style-border-always);
    padding: 10px;

    .title {
      text-align: center;
      margin-bottom: 20px;
      font-weight: bold;
      font-size: 1.1rem;
    }

    .preview-container {
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 300px;

      .cropper-preview-box {
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;

        img {
          display: block;
          max-width: 100%;
          max-height: 100%;
          object-fit: cover;
        }
      }
    }
  }
}

.action {
  padding: 10px;
  margin-top: 12px;
  background-color: var(--xz-card-bg);
  border-radius: var(--xz-main-radius);
  display: flex;
  flex-direction: column;
  gap: 10px;

  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .select-format,
  .select-path,
  .cropper-size {
    display: flex;
    align-items: center;
    gap: 5px;

    .text {
      text-wrap: nowrap;
    }
  }

  .btns {
    display: flex;
    align-items: center;
    gap: 10px;
  }
}
</style>
