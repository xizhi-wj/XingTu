<template>
  <div
    class="upload_area"
    @click="handleUpload"
    @dragleave="handleDragLeave"
    @dragover="handleDragOver"
    @drop="handleDrop"
  >
    <div class="upload_area_empty">
      <i class="ri-upload-cloud-line"></i>
      <div class="upload_area_empty_text">{{ props.uploadText }}</div>
    </div>
    <input
      webkitdirectory
      multiple
      :accept="props.accept"
      ref="uploadButtonRef"
      type="file"
      hidden
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const emits = defineEmits(['upload'])

const uploadButtonRef = ref<HTMLInputElement | null>(null)

const props = defineProps({
  style: {
    type: Object,
    default: () => ({})
  },
  accept: {
    type: String,
    default: ''
  },
  uploadText: {
    type: String,
    default: '将文件拖拽至此处或者点击上传文件'
  }
})

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
}

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
  if (e.dataTransfer) {
    if (props.accept) {
      return emits(
        'upload',
        [...e.dataTransfer.files].filter((file) => {
          return file.type.includes(props.accept) || file.type.startsWith(props.accept)
        })
      )
    }
    emits('upload', e.dataTransfer.files)
  }
}

const handleUpload = async () => {
  if (uploadButtonRef.value) {
    uploadButtonRef.value.click()
    uploadButtonRef.value.onchange = (e) => {
      const input = e.target as HTMLInputElement
      console.log(input.files)
      emits('upload', input.files)
    }
  }
}
</script>

<style scoped lang="scss">
.upload_area {
  height: 40vh;
  border-radius: var(--xz-main-radius);
  min-height: 40vh;
  border: var(--style-border-dashed);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease-in-out;
  background-color: var(--xz-card-bg);

  &:hover {
    border-style: dashed;
    // border-color: var(--style-border-always);
    border-color: var(--xz-lighttext);
  }

  .upload_area_empty {
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;

    i {
      font-size: 4rem;
    }

    .upload_area_empty_text {
      color: var(--xz-fontcolor);
      font-size: 1.2rem;
    }
  }
}
</style>
