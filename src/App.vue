<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow'
import appStore from './store'
import { getName, getVersion } from '@tauri-apps/api/app'

const store = appStore()

const win = getCurrentWebviewWindow()
win.listen('change-theme', (e) => {
  const theme = e.payload as string
  theme === 'dark'
    ? document.body.setAttribute('arco-theme', 'dark')
    : document.body.removeAttribute('arco-theme')
  document.documentElement.setAttribute('data-theme', theme)
})

// 阻止默认拖拽行为的函数
const preventDefault = (e: Event) => {
  e.preventDefault()
  e.stopPropagation()
}

// 禁止右键菜单

onMounted(async () => {
  // 添加全局事件监听器
  document.addEventListener('dragover', preventDefault)
  document.addEventListener('drop', preventDefault)
  document.addEventListener('contextmenu', preventDefault)
  const theme = localStorage.getItem('theme') || 'light'
  document.documentElement.setAttribute('data-theme', theme)
  theme === 'dark'
    ? document.body.setAttribute('arco-theme', 'dark')
    : document.body.removeAttribute('arco-theme')
  store.name = await getName()
  store.version = await getVersion()
})

onUnmounted(() => {
  // 移除事件监听器以防止内存泄漏
  document.removeEventListener('dragover', preventDefault)
  document.removeEventListener('drop', preventDefault)
  document.removeEventListener('contextmenu', preventDefault)
})
</script>

<template>
  <main class="container">
    <router-view> </router-view>
  </main>
</template>

<style scoped>
.container {
  width: 100%;
  height: 100%;
}
</style>
