<template>
  <button class="upload-but btn primary" @click="handleUpload">
    <IconUpload></IconUpload>
    <span class="ml5">{{ props.text }}</span>
    <input :accept="props.accept" class="upload-input" type="file" ref="uploadInputRef" multiple />
  </button>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const uploadInputRef = ref()

const props = defineProps({
  accept: {
    type: String,
    default: '*/*'
  },
  text: {
    type: String,
    default: '点击上传'
  },
  multiple: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['uploadFile'])

const handleUpload = async () => {
  uploadInputRef.value && uploadInputRef.value.click()
}

onMounted(() => {
  uploadInputRef.value.addEventListener('change', (e: Event) => {
    const target = e.target as HTMLInputElement
    emit('uploadFile', target.files)
  })
})
</script>

<style scoped>
.upload-input {
  display: none;
}

.btn {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
