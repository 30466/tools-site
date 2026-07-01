<template>
  <el-config-provider :locale="zhCn">
    <div class="app-wrapper" :class="{ 'is-player-mode': isPlayerMode }" :style="{ backgroundImage: `url(${bgImage})` }">
      
      <nav class="nav-bar">
        <div class="nav-content">
          <!-- 这里的 Logo 文字不需要动，保持之前的逻辑即可 -->
          <span class="logo">abm48工具箱 🛠️</span>
          
          <div class="links">
            <!-- 1. 首页下拉菜单 -->
            <el-dropdown class="site-dropdown" :show-timeout="100">
              <span class="site-dropdown-link" @click="router.push('/')">
                首页
                <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="scrollToSection('section-websites')">📌 推荐网站</el-dropdown-item>
                  <el-dropdown-item @click="scrollToSection('section-apps')">📌 APP 下载</el-dropdown-item>
                  <el-dropdown-item @click="scrollToSection('section-tools')">📌 剪辑工具</el-dropdown-item>
                  <el-dropdown-item @click="scrollToSection('section-support')">📌 应援站</el-dropdown-item>
                  <el-dropdown-item @click="scrollToSection('section-contact')">💬 联系我</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <!-- 2. 修改：返回应援站 (下拉菜单) -->
            <el-dropdown class="site-dropdown" :show-timeout="100">
              <span class="site-dropdown-link">
                <el-icon><HomeFilled /></el-icon> 返回应援站
                <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>
                    <a href="https://tsh.abm48.com" target="_blank" class="dropdown-item-link">
                      🎤 CGT48 谭思慧
                    </a>
                  </el-dropdown-item>
                  <!-- 以后可以在这里加其他的 -->
                  <!-- <el-dropdown-item>...</el-dropdown-item> -->
                  <el-dropdown-item>
                    <a href="https://wrs.abm48.com" target="_blank" class="dropdown-item-link">
                      🎤 BEJ48 吴睿莎
                    </a>
                  </el-dropdown-item>  
                  <el-dropdown-item>
                    <a href="https://xzzy.abm48.com" target="_blank" class="dropdown-item-link">
                      🎤 GNZ48 徐郑子滢
                    </a>
                  </el-dropdown-item>                                    
                </el-dropdown-menu>
              </template>
            </el-dropdown>

          </div>
        </div>
      </nav>

      <div class="main-container" :class="{ 'is-replay': isReplayRoute }">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>

    </div>
  </el-config-provider>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import { HomeFilled, ArrowDown } from '@element-plus/icons-vue'

// 引入背景图
import bgImage from './assets/bg.jpg'

const route = useRoute()
const router = useRouter()

const isReplayRoute = computed(() => route.path === '/pocket48-replay')
const isPlayerMode = computed(() => route.path === '/pocket48-replay' && !!route.query.live)

const scrollToSection = (id) => {
  if (route.path !== '/') {
    router.push({ path: '/', hash: '#' + id })
  } else {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }
}

// 页面内部左上角的 Logo 文字 (和浏览器标签页标题区分开，这里可以保持你喜欢的样式)
const currentLogoTitle = computed(() => {
   return 'abm48工具箱 🛠️'
})

// --- 核心：动态修改浏览器标签页图标 (Favicon) ---
onMounted(() => {
  // 查找现有的 link icon 标签，如果没有就创建一个
  let link = document.querySelector("link[rel*='icon']") || document.createElement('link');
  link.type = 'image/jpeg';
  link.rel = 'icon';
  // 直接指向 assets 里的图片
  link.href = bgImage; 
  document.getElementsByTagName('head')[0].appendChild(link);
})
</script>

<style>
/* 全局重置 */
body { 
  margin: 0; 
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
}

.app-wrapper {
  min-height: 100vh;
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  background-repeat: no-repeat;
  display: flex;
  flex-direction: column;
}

.nav-bar {
  background: rgba(255, 255, 255, 0.9); /* 半透明白底 */
  backdrop-filter: blur(10px);
  padding: 1rem 0;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-content {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.logo {
  font-weight: bold;
  font-size: 1.4rem;
  color: #303133;
  text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.8);
}

.links {
  display: flex;
  gap: 20px;
  align-items: center;
}

.links a {
  text-decoration: none;
  color: #303133;
  font-weight: 600;
  font-size: 15px;
  transition: color 0.3s;
}

.links a:hover, .links a.router-link-active {
  color: #409EFF;
}

.main-container {
  max-width: 1000px;
  margin: 30px auto;
  padding: 0 20px;
  flex: 1;
  width: 100%;
  box-sizing: border-box;
}

/* 口袋48录播回放页：去掉宽度限制 */
.main-container.is-replay {
  max-width: none;
  margin: 0;
  padding: 0;
}

@media (max-width: 768px) {
  .is-player-mode .nav-bar { display: none; }
}

/* 简单的页面切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 下拉菜单触发文字样式 */
.site-dropdown-link {
  cursor: pointer;
  color: #303133;
  font-weight: 600;
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 4px;
  outline: none;
}
.site-dropdown-link:hover {
  color: #409EFF;
}

/* 下拉菜单内部链接样式 */
.dropdown-item-link {
  text-decoration: none;
  color: #606266;
  display: block;
  width: 100%;
  height: 100%;
  padding: 5px 0;
}
.dropdown-item-link:hover {
  color: #409EFF;
}

/* 确保下拉菜单本身不带下划线等奇怪样式 */
.site-dropdown {
  vertical-align: middle;
}
</style>