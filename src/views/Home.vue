<template>
  <div class="home">
    <LeftSide></LeftSide>
    <router-view v-slot="{ Component }">
      <KeepAlive>
        <component :is="Component" />
      </KeepAlive>
    </router-view>
    <a-modal hide-cancel v-model:visible="visible">
      <template #title>正在下载核心文件，可关闭此窗口在运行日志中查看下载进度 </template>
      <div class="log-list not-fullscreen">
        <div class="log-item" v-for="item in store.log" :key="item">{{ item }}</div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import LeftSide from '@/components/LeftSide.vue'
import appStore from '@/store'
import { checkEnv, initEnv } from '@/utils'
import { onMounted, ref } from 'vue'

const store = appStore()

const visible = ref(false)

onMounted(async () => {
  const check = await checkEnv()
  if (!check) {
    visible.value = true
    await initEnv()
    visible.value = false
  }
})
</script>

<style>
.home {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
}

.tool,
.setting {
  width: calc(100% - 120px);
  background-color: var(--xz-background);
  height: 100%;
  border-radius: 0;
  overflow: auto;
}

.log-list.not-fullscreen {
  display: flex;
  flex-direction: column;
  gap: 5px;
  overflow: auto;
  max-height: 50vh;
}
</style>
