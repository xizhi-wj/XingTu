<template>
  <div class="setting">
    <div class="left-side">
      <div class="nav-list">
        <div
          :class="currentIndex === index ? 'nav-list-item active' : 'nav-list-item'"
          class="nav-list-item"
          v-for="(item, index) in settingList"
          :key="item.name"
          @click="handleNavTo(item.path, index)"
        >
          <i :class="item.icon" class="icon"></i>
          <div class="nav-name">{{ item.name }}</div>
        </div>
      </div>
    </div>
    <div class="setting-content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const currentIndex = ref(0)

const router = useRouter()

const settingList = [
  {
    name: '应用配置',
    icon: 'ri-user-settings-fill',
    content: '应用配置',
    path: '/setting/config'
  },
  {
    name: '关于应用',
    icon: 'ri-magic-fill',
    content: '关于应用',
    path: '/setting/author'
  }
]

const handleNavTo = (path: string, index: number) => {
  currentIndex.value = index
  router.push(path)
}

onMounted(() => {
  const theme = localStorage.getItem('theme') || 'light'
  document.documentElement.setAttribute('data-theme', theme)
})
</script>

<style scoped lang="scss">
.setting {
  width: 100%;
  height: 100%;
  background-color: var(--xz-background);
  display: flex;

  .left-side {
    width: 100px;
    height: 100%;
    background-color: var(--xz-secondbg);
    border-right: 1px solid var(--xz-card-border);
    padding-top: 20px;

    .nav-list {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      height: 100%;
      gap: 5px;
      padding: 10px;

      .nav-list-item {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 8px;
        width: 100%;
        border-radius: var(--xz-main-radius);
        cursor: pointer;
        border: 1px solid transparent;
        transition: border-color 0.3s ease-in-out;

        &:hover {
          border-color: var(--xz-card-border);
        }

        &.active {
          border: var(--style-border-hover);
          .icon,
          .nav-name {
            color: var(--xz-theme);
          }
        }

        .icon {
          font-size: 1.2rem;
        }

        .nav-name {
          font-size: 0.9rem;
        }
      }
    }
  }

  .setting-content {
    height: 100%;
    padding: 20px;
    width: calc(100% - 100px);
  }
}
</style>
