<template>
  <div class="output-path">
    <a-tooltip content="文件的保存路径，一般是保存在用户的图片目录下">
      <div class="text">输出路径</div>
    </a-tooltip>
    <a-input readonly v-model="props.path" placeholder="请选择输出路径"></a-input>
    <icon-folder class="icon" @click="handleSelectOutputPath"></icon-folder>
  </div>
</template>

<script setup lang="ts">
import { open } from '@tauri-apps/plugin-dialog'

const emits = defineEmits(['update:path'])

const props = defineProps<{
  path: string
}>()

const handleSelectOutputPath = async () => {
  const path = await open({
    directory: true
  })
  if (path) {
    emits('update:path', path)
  }
}
</script>

<style scoped lang="scss">
.output-path {
  display: flex;
  align-items: center;
  gap: 8px;

  .text {
    text-wrap: nowrap;
  }
}
</style>
