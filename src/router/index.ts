import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: () => import('@/views/Home.vue'),
      redirect: '/koutu',
      children: [
        {
          path: '/koutu',
          name: 'koutu',
          component: () => import('@/components/KouTu.vue')
        },
        {
          path: '/compress',
          name: 'compress',
          component: () => import('@/components/Compress.vue')
        },
        {
          path: '/format',
          name: 'format',
          component: () => import('@/components/Format.vue')
        },
        {
          path: '/cropping',
          name: 'cropping',
          component: () => import('@/components/Cropping.vue')
        },
        {
          path: '/final2x',
          name: 'final2x',
          component: () => import('@/components/Final2x.vue')
        },
        {
          path: '/compress',
          name: 'compress',
          component: () => import('@/components/Compress.vue')
        },
        {
          path: '/split',
          name: 'split',
          component: () => import('@/components/Split.vue')
        }
      ]
    },
    {
      path: '/setting',
      name: 'setting',
      component: () => import('@/components/Setting.vue'),
      redirect: '/setting/config',
      children: [
        {
          path: '/setting/config',
          name: 'config',
          component: () => import('@/components/setting/Config.vue')
        },
        {
          path: '/setting/author',
          name: 'author',
          component: () => import('@/components/setting/Author.vue')
        }
      ]
    }
  ]
})

export default router
