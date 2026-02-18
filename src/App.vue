<template>
  <el-config-provider :locale="zhCn">
    <div class="app-wrapper" :style="{ backgroundImage: `url(${bgImage})` }">
      
      <nav class="nav-bar">
        <div class="nav-content">
          <!-- 这里的 Logo 文字不需要动，保持之前的逻辑即可 -->
          <span class="logo">abm48工具箱 🛠️</span>
          
          <div class="links">
            <!-- 1. 站内导航 -->
            <router-link to="/">首页</router-link>
            <!-- 新增：小偶像音乐网站 -->
            <a href="https://abm48.com/" target="_blank">小偶像音乐网站</a>
            <!-- 新增：成员档案 -->
            <a href="https://snh48wiki.top/" target="_blank">成员档案</a>
            <!-- 新增：关于页面 -->
            <router-link to="/about">关于</router-link>
            
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

      <div class="main-container">
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
import { useRoute } from 'vue-router'
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import { HomeFilled, ArrowDown } from '@element-plus/icons-vue'

// 引入背景图
import bgImage from './assets/bg.jpg'

const route = useRoute()

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