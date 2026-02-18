import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/Home.vue'),
      meta: { title: '首页' }
    },
    {
      path: '/download',
      name: 'download',
      component: () => import('../views/Download.vue'),
      meta: { title: '小偶像音乐 APP' }
    },
    {
      path: '/clip',
      name: 'clip',
      component: () => import('../views/Clip.vue'),
      meta: { title: '批量剪切' }
    },
    {
      path: '/transcode',
      name: 'transcode',
      component: () => import('../views/Transcode.vue'),
      meta: { title: '批量转码' }
    },
    {
      path: '/merge',
      name: 'merge',
      component: () => import('../views/Merge.vue'),
      meta: { title: '合并媒体' }
    },
    {
      path: '/member-archive',
      name: 'member-archive',
      component: () => import('../views/MemberArchive.vue'),
      meta: { title: '成员档案 APP' }
    },
    {
      path: '/about',
      name: 'about',
      // 你后面自己去复制内容到这个文件
      component: () => import('../views/About.vue'),
      meta: { title: '关于' }
    }
  ]
})

// --- 核心：全局前置守卫控制浏览器标签页标题 ---
router.beforeEach((to, from, next) => {
  // 格式：工具箱 ✽ 首页
  const subTitle = to.meta.title || '首页'
  document.title = `工具箱 ✽ ${subTitle}`
  next()
})

export default router