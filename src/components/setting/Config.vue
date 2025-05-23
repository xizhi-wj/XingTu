<template>
  <div class="config">
    <div class="box">
      <div class="title">主题</div>
      <div class="theme-list config-item">
        <div
          :class="theme === item.value ? 'theme-item active' : 'theme-item'"
          class="theme-item"
          v-for="item in themeList"
          :key="item.value"
          @click="handleChangeTheme(item.value)"
        >
          <div class="theme-name">{{ item.label }}</div>
          <div
            :style="{
              backgroundImage: item.background
            }"
            class="card"
          >
            <div class="card__chip"></div>
            <div class="card__content">
              <div class="card__text">
                <div class="text__row">
                  <div class="text__loader"></div>
                  <div class="text__loader"></div>
                </div>
                <div class="text__row">
                  <div class="text__loader"></div>
                  <div class="text__loader"></div>
                </div>
              </div>
              <div class="card__symbol">
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="box">
      <div class="title">XingTu-core</div>
      <div class="config-item xingtu-core">
        <div class="row">
          <span class="text">位置: </span>
          <a-input readonly v-model="settingConfig.xingtuCorePath"></a-input>
        </div>
        <div class="row">
          <span class="text">模型: </span>
          <a-input readonly v-model="settingConfig.xingtuModelPath"></a-input>
        </div>
      </div>
    </div>
    <div class="box">
      <div class="title">u2net模型</div>
      <div class="config-item u2net-model">
        <div class="row">
          <span class="text">位置: </span>
          <a-input readonly v-model="settingConfig.u2netPath"></a-input>
        </div>
      </div>
    </div>

    <!-- <div class="title">Final2x-core下载源</div>
    <div class="config-item final2x-core">
      <div class="row">
        <span class="text">地址: </span>
        <a-tooltip
          content="final2x-core的下载源，默认使用Github，在Github下载速度较慢时可切换到国内源"
        >
          <a-select v-model="settingConfig.final2xCorePath">
            <a-option value="github" label="github"></a-option>
            <a-option value="cdn" label="cdn"></a-option>
          </a-select>
        </a-tooltip>
      </div>
    </div> -->
    <div class="box">
      <div class="title">应用</div>
      <div class="config-item">
        <div class="row">
          <a-tooltip
            content="重新安装XingTu-Core和Final2x-Core，一般在应用出了问题的时候使用，在重新初始化过程中再次点击按钮会弹出当前初始化进度框"
          >
            <xz-button @click="handleReset" type="danger" text="环境初始化"></xz-button>
          </a-tooltip>
        </div>
      </div>
    </div>
    <a-modal hide-cancel v-model:visible="visible">
      <template #title> 正在重置环境，请勿关闭当前窗口 </template>
      <div class="log-list">
        <div class="log-item" v-for="item in store.log" :key="item">{{ item }}</div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import appStore from '@/store'
import { message, resetEnv } from '@/utils'
import { path } from '@tauri-apps/api'
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow'
import { reactive, ref } from 'vue'

const store = appStore()

const theme = ref(localStorage.getItem('theme') || 'light')

const visible = ref(false)

const isResetting = ref(false)

const themeList = [
  {
    label: '日间',
    value: 'light',
    background: 'linear-gradient(45deg, #425aef, #4259ef23)'
  },
  {
    label: '夜间',
    value: 'dark',
    background: 'linear-gradient(45deg, #ffc848, #f2b94b23)'
  }
]

const settingConfig = reactive<{
  envPath: string
  u2netPath: string
  xingtuCorePath: string
  xingtuModelPath: string
}>({
  envPath: '',
  u2netPath: '',
  xingtuCorePath: '',
  xingtuModelPath: ''
})

path.appLocalDataDir().then((dir: string) => {
  settingConfig.envPath = `${dir}/.venv`
})

path.resourceDir().then(async (dir: string) => {
  settingConfig.xingtuCorePath = await path.join(dir, 'resources', 'XingTu-core')
  settingConfig.xingtuModelPath = await path.join(dir, 'resources', 'XingTu-core', 'cache_models')
})

path.homeDir().then((dir: string) => {
  settingConfig.u2netPath = `${dir}/.u2net`
})

const handleChangeTheme = (value: string) => {
  localStorage.setItem('theme', value)
  theme.value = value
  // 通知主窗口切换主题
  const win = getCurrentWebviewWindow()
  win.emit('change-theme', value)
}

const handleReset = async () => {
  if (isResetting.value) {
    visible.value = true
    return
  }
  isResetting.value = true
  visible.value = true
  store.log.push('正在重置环境...')
  const isReset = await resetEnv()
  console.log(isReset)
  if (isReset) {
    store.log.push('环境重置成功')
  }
  isResetting.value = false
  message({
    content: '环境重置成功'
  })
  setTimeout(() => {
    visible.value = false
  }, 3000)
}
</script>

<style scoped lang="scss">
.config {
  display: flex;
  flex-direction: column;
  gap: 10px;

  .box {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .title {
    font-weight: bold;
    font-size: 1rem;
  }

  .theme-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;

    .theme-item {
      border-radius: var(--xz-main-radius);
      padding: 10px;
      border: var(--style-border-always);
      display: flex;
      align-items: center;
      cursor: pointer;
      position: relative;
      width: 200px;
      transition: all 0.3s ease-in-out;

      &.active {
        border: var(--style-border-hover);
      }

      .theme-name {
        font-weight: bold;
        font-size: 1.2rem;
      }
    }
  }

  .xingtu-core,
  .u2net-model,
  .final2x-core {
    display: flex;
    flex-direction: column;
    gap: 10px;

    .row {
      display: flex;
      align-items: center;

      .text {
        text-wrap: nowrap;
        margin-right: 8px;
      }
    }
  }
}

.log-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
  overflow: auto;
  max-height: 50vh;
}

$color-chip: linear-gradient(90deg, #d0a963, #ffe6ba);
$color-card--white: linear-gradient(45deg, #fff, #cdcdcd);
$color-card--blue: linear-gradient(45deg, #748dfb, #3859e8);
$color-card--dark: linear-gradient(45deg, #616161, #484848);

.theme-item.active {
  .card {
    will-change: box-shadow;
    animation: card 500ms ease-in-out forwards;

    &:after {
      will-change: transform;
      animation: shine 500ms ease-in forwards;
      animation-delay: 100ms;
    }
  }
}

.card {
  position: relative;
  width: 243px;
  height: 152px;
  padding: 22px 24px;
  border-radius: 16px;
  box-shadow: 0 1px 0 0 rgba(#fff, 0.25);
  background-image: linear-gradient(45deg, var(--xz-theme), var(--xz-theme-op));
  overflow: hidden;
  position: absolute;
  right: -76px;
  transform: scale(0.24);

  &:before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-repeat: no-repeat;
  }

  &:after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    width: 40px;
    transform: translateX(-70px);
    background-image: linear-gradient(to right, rgba(#fff, 0), rgba(#fff, 0.2), rgba(#fff, 0));
  }

  &--blue {
    background-image: $color-card--blue;
  }

  &--dark {
    background-image: $color-card--dark;
  }

  &__chip {
    width: 39px;
    height: 28px;
    border-radius: 7px;
    border: 1px solid rgba(#665432, 0.5);
    box-shadow: inset 1px 1px 0px rgba(#b39256, 0.5);
    background-image: $color-chip;
  }

  &__content {
    display: flex;
    justify-content: space-between;
    margin-top: 46px;
  }

  &__symbol {
    display: flex;

    span {
      display: block;
      width: 30px;
      height: 30px;
      border-radius: 30px;
      background-color: #fb4646;

      &:last-child {
        background-color: rgba(#ffa337, 0.75);
        margin-left: -13px;
      }
    }
  }
}

.text {
  &__row {
    display: grid;
    grid-template-columns: 54px 64px;
    grid-gap: 6px;

    &:last-of-type {
      grid-template-columns: 45px 54px;
      margin-top: 7px;
    }
  }

  &__loader {
    height: 13px;
    border-radius: 2px;
    background-color: rgba(#000, 0.4);
  }
}

@keyframes card {
  0% {
    box-shadow: 0 1px 0 0 rgba(#fff, 0.25);
    transform: scale(0.24);
  }
  45% {
    box-shadow: 0 12px 32px 0 rgba(#000, 0.5);
    transform: scale(0.25);
  }
  100% {
    box-shadow: 0 4px 12px 0 rgba(#000, 0.4);
    transform: scale(0.24);
  }
}

@keyframes shine {
  from {
    transform: translateX(-70px) rotate(10deg);
  }
  to {
    transform: translateX(300px) rotate(10deg);
  }
}
</style>
