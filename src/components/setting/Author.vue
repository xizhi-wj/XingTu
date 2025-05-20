<template>
  <div class="author">
    <div class="card">
      <div class="app-info">
        <div class="logo">
          <img src="../../assets/logo.png" alt="" />
        </div>
        <div class="info">
          <div class="name">{{ store.name }}</div>
          <div class="version">版本: v{{ store.version }}</div>
        </div>
      </div>
      <div class="action">
        <xz-button text="检查更新" type="primary" @click="handleCheckUpdate"></xz-button>
      </div>
    </div>
    <div class="card">
      <div class="opensource-info">
        <div class="opensource-title">开源地址 (✨如果对你有用，请给项目点个star✨)</div>
        <a href="https://github.com/xizhi-wj/XingTu" target="_blank"
          >https://github.com/xizhi-wj/XingTu</a
        >
      </div>
      <div class="action">
        <a href="https://github.com/xizhi-wj/XingTu/issues/new" target="_blank">
          <xz-button type="warning" text="反馈问题"></xz-button>
        </a>
      </div>
    </div>
    <!-- <div class="author-info">
      <div class="card">
        <div class="title">环境要求</div>
        <code>python 3.10 ~ 3.12</code>
      </div>
    </div> -->
    <div class="card">
      <div class="title">社交媒体</div>
      <div class="social-links">
        <a-tooltip content="b站">
          <a href="https://space.bilibili.com/627574560" target="_blank">
            <i class="ri-bilibili-line"></i>
          </a>
        </a-tooltip>
        <a-tooltip content="作者主页">
          <a href="https://hoshinagi.top" target="_blank">
            <i class="ri-home-4-line"></i>
          </a>
        </a-tooltip>
        <a-tooltip content="github">
          <a href="https://github.com/xizhi-wj/XingTu" target="_blank">
            <i class="ri-github-line"></i>
          </a>
        </a-tooltip>
      </div>
    </div>
    <div class="card">
      <div class="update-info">
        <div class="title">更新计划</div>
        <div class="update-list" id="checklist">
          <a-checkbox indeterminate :model-value="false">图片像素化</a-checkbox>
          <a-checkbox indeterminate :model-value="false">图片尺寸修改</a-checkbox>
          <a-checkbox indeterminate :model-value="false">完善图片压缩算法</a-checkbox>
          <a-checkbox indeterminate :model-value="false">使用ai实现图片动漫化</a-checkbox>
          <a-checkbox indeterminate :model-value="false">图片格式转换支持相机raw格式</a-checkbox>
        </div>
      </div>
    </div>
    <a-modal class="update-modal" v-model:visible="state.open">
      <template #title> 发现新版本🥳 </template>
      <div class="update-content">
        <div class="update-version">
          <span>更新版本: </span>
          <span>
            <span>{{ state.update?.currentVersion }} 👉</span>
            <a href="">{{ state.update?.version }}</a>
          </span>
        </div>
        <div class="update-date">
          <span>更新时间: </span>
          <span>{{ state.update?.date }}</span>
        </div>
        <div class="update-log">
          <span>更新日志: </span>
          <VueMarkdown
            class="update-note max-h-40 overflow-auto"
            :source="state.update?.body ?? ''"
          />
        </div>
      </div>
      <template #footer>
        <div class="action">
          <xz-button type="danger" text="稍后更新" @click="state.open = false"></xz-button>
          <xz-button
            type="primary"
            :text="state.downloading ? downloadProgress : '立即更新'"
            @click="handleUpdate"
          ></xz-button>
        </div>
      </template>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import appStore from '@/store'
import { message } from '@/utils'
import { Message } from '@arco-design/web-vue'
import { relaunch } from '@tauri-apps/plugin-process'
import { check, Update } from '@tauri-apps/plugin-updater'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { computed, reactive } from 'vue'
import VueMarkdown from 'vue-markdown-render'

dayjs.extend(utc)

const store = appStore()

interface State {
  open: boolean
  update?: Update
  downloading: boolean
  totalProgress?: number
  downloadProgress: number
}

const state = reactive<State>({
  open: false,
  downloading: false,
  downloadProgress: 0
})

const downloadProgress = computed(() => {
  const { downloadProgress, totalProgress } = state

  if (!totalProgress) return '0%'

  const progress = ((downloadProgress / totalProgress) * 100).toFixed(2)

  return `${progress}%`
})

const replaceBody = (body: string) => {
  return body
    .replace(/&nbsp;/g, '')
    .split('\n')
    .map((line) => line.replace(/\s*-\s+by\s+@.*/, ''))
    .join('\n')
}

const handleCheckUpdate = async () => {
  Message.loading({ content: '正在检查更新...', id: 'check-update', duration: 0 })
  const update = await check()
  Message.clear()
  if (update) {
    const { version, currentVersion, body = '', date, downloadAndInstall } = update
    state.update = Object.assign(update, {
      version: `v${version}`,
      currentVersion: `v${currentVersion}`,
      body: replaceBody(body),
      date: dayjs.utc(date?.split('.')[0]).local().format('YYYY-MM-DD HH:mm:ss'),
      downloadAndInstall: downloadAndInstall.bind(update)
    })

    state.open = true
  } else {
    message({
      content: '当前已是最新版本🎉'
    })
  }
}

const handleUpdate = async () => {
  try {
    state.downloading = true
    await state.update?.downloadAndInstall((progress) => {
      switch (progress.event) {
        case 'Started':
          state.totalProgress = Number(progress.data.contentLength) || 0
          break
        case 'Progress':
          state.downloadProgress += Number(progress.data.chunkLength)
          break
        case 'Finished':
          message({
            content: '下载成功，正在重启中...'
          })
          break
      }
    })
    await relaunch()
  } catch (error) {
    message({
      type: 'error',
      content: `更新失败: ${String(error)}`
    })
  } finally {
    state.downloading = false
  }
}
</script>

<style scoped lang="scss">
.author {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 12px;

  .card {
    padding: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title {
      font-weight: bold;
    }

    .app-info {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .logo {
        overflow: hidden;
        border-radius: var(--xz-main-radius);
        border: var(--style-border-always);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 16px;

        img {
          width: 64px;
          height: 64px;
        }
      }

      .info {
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        .name {
          font-weight: bold;
          margin-bottom: 5px;
        }
      }
    }

    .opensource-info {
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      .opensource-title {
        font-weight: bold;
        margin-bottom: 5px;
      }

      a {
        font-weight: normal;
        opacity: 0.9;
      }
    }

    .author-index {
      display: flex;

      img {
        width: 64px;
        height: 64px;
      }
    }

    .update-info {
      display: flex;
      flex-direction: column;

      .update-list {
        display: flex;
        flex-direction: column;
        margin-top: 10px;
        padding: 10px;
        gap: 10px;

        .update-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }
      }
    }

    .social-links {
      display: flex;
      align-items: center;
      gap: 10px;

      a {
        text-decoration: none;
        display: block;
        border: none;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 40px;
        height: 40px;
        padding: 8px;
        border: var(--style-border);
        border-radius: 4px;
        font-size: 1.2rem;
      }
    }
  }
}

.update-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow: auto;

  .update-log {
    display: flex;
    flex-direction: column;
  }
}

.action {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;

  a {
    border: none;
    background: none;

    &:hover {
      border: none;
      background: none;
    }
  }
}

.update-note {
  max-height: 40vh;
  overflow: auto;

  :not(a) {
    all: revert;
  }
}

code {
  color: var(--xz-white);
  padding: 0.05rem 0.2rem;
  border-radius: 4px;
  margin: 0 4px;
  background: var(--xz-pink);
  line-height: 2;
  box-shadow: var(--xz-shadow-border);
}
</style>
