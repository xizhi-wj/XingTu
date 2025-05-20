<template>
  <div id="left-sidebar">
    <div class="container">
      <div class="sidebar-nav">
        <div
          v-for="(item, index) in navList"
          :class="index === currentIndex ? 'sidebar-nav-item active' : 'sidebar-nav-item'"
          :key="item.name"
          @click="handleNavTo(item.path, index)"
        >
          <i :class="item.icon"></i>
          <span class="nav-name">{{ item.name }}</span>
        </div>
      </div>
      <div class="sidebar-setting">
        <div
          :class="
            currentIndex === index + navList.length
              ? 'sidebar-setting-item active'
              : 'sidebar-setting-item'
          "
          v-for="(item, index) in settingList"
          @click="handleSettingItemClick(item)"
          :key="item.name"
        >
          <i :class="item.icon"></i>
          <span class="nav-name">{{ item.name }}</span>
        </div>
      </div>
    </div>
    <a-modal width="auto" fullscreen hide-cancel v-model:visible="runLogModalVisible">
      <template #title> 运行日志 </template>
      <template #footer>
        <div class="action">
          <xz-button text="置底" type="warning" @click="handleScrollToBottom"></xz-button>
          <xz-button text="确定" type="primary" @click="runLogModalVisible = false"></xz-button>
          <xz-button text="清空" type="danger" @click="store.log = []"></xz-button>
        </div>
      </template>
      <div ref="logListRef" class="log-list">
        <div class="log-item" v-for="log in store.log">
          {{ log }}
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import appStore from '@/store'
import { getAllWebviewWindows, WebviewWindow } from '@tauri-apps/api/webviewWindow'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const store = appStore()

const currentIndex = ref(0)

const router = useRouter()

const logListRef = ref<HTMLDivElement | null>(null)

const runLogModalVisible = ref(false)

const navList = [
  {
    icon: 'ri-eraser-fill',
    name: '背景去除',
    path: '/koutu'
  },
  {
    name: '图片增强',
    path: '/final2x',
    icon: 'ri-image-ai-fill'
  },
  {
    name: '图片裁剪',
    path: '/cropping',
    icon: 'ri-crop-line'
  },
  {
    name: '图片拆分',
    path: '/split',
    icon: 'ri-image-edit-fill'
  },
  {
    icon: 'ri-image-line',
    name: '格式转换',
    path: '/format'
  },
  {
    icon: 'ri-gallery-fill',
    name: '图片压缩',
    path: '/compress'
  }
]

const settingList = [
  {
    icon: 'ri-information-line',
    name: '运行日志',
    path: '/log'
  },
  {
    icon: 'ri-settings-line',
    name: '应用设置',
    path: '/setting'
  }
]

const handleNavTo = (path: string, index: number) => {
  currentIndex.value = index
  router.push(path)
}

const handleScrollToBottom = () => {
  console.log(logListRef.value?.scrollHeight)
  logListRef.value?.scrollTo({ top: logListRef.value.scrollHeight, behavior: 'smooth' })
}

const handleSettingItemClick = (item: any) => {
  if (item.path === '/log') {
    return (runLogModalVisible.value = true)
  }
  handleCreateWindow()
}

const handleCreateWindow = async () => {
  const wins = await getAllWebviewWindows()
  for (const win of wins) {
    if (win.label === 'setting') {
      return win.show()
    }
  }
  const webView = new WebviewWindow('setting', {
    url: 'index.html/#/setting',
    transparent: true,
    hiddenTitle: true,
    resizable: false,
    maximizable: false,
    titleBarStyle: 'overlay',
    height: 600,
    width: 800,
    title: '应用设置'
  })
  // 监听窗口创建事件
  webView.once('tauri://created', function () {
    console.log('窗口创建成功')
  })

  // 监听窗口错误事件
  webView.once('tauri://error', function (e) {
    console.error('窗口创建失败:', e)
  })
}
</script>

<style scoped lang="scss">
#left-sidebar {
  width: 120px;
  height: 100%;
  background-color: var(--xz-secondbg);
  border-right: 1px solid var(--xz-card-border);

  .container {
    display: flex;
    flex-direction: column;
    height: 100%;

    .sidebar-nav {
      margin-top: 20px;
    }

    .sidebar-nav,
    .sidebar-setting {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 10px;
      gap: 5px;

      .sidebar-nav-item,
      .sidebar-setting-item {
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        gap: 5px;
        padding: 5px;
        border-radius: var(--xz-main-radius);
        width: 100%;
        border: 1px solid transparent;
        transition: border-color 0.3s ease;
        cursor: pointer;

        &:hover {
          border: var(--style-border-hover);
        }

        &.active {
          border: var(--style-border-hover);

          i {
            color: var(--xz-theme);
          }
        }

        i {
          font-size: 1.3rem;
        }

        .nav-name {
          font-size: 0.9rem;
        }
      }
    }

    .sidebar-setting {
      flex-direction: column;
      margin-top: auto;
      height: fit-content;
      padding-bottom: 20px;
    }
  }
}

.log-list {
  display: flex;
  flex-direction: column;
  overflow: auto;
  height: 100%;
  gap: 5px;
}

.log-item {
  font-size: 1rem;
  line-height: 1.7;
  font-weight: 400;
  letter-spacing: 0.6px;
}

.action {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
