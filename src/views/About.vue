<template>
  <div class="about-page">
    <el-card class="about-card">
      <h2>关于本站 🎶</h2>
      <p>其他家需要唱歌记录网站可以来找我，换个背景图和个别字，然后部署到abm48.com的二级域名而已，10分钟就能弄完。</p>
      
      <el-divider />
      
      <h3>🔗 友情链接</h3>
      <p>
        <a href="https://gitee.com/albert-chen04/albert-music-frontend" target="_blank">Albert Music （小偶像音乐网站）</a>
      </p>
      <p>
        <a href="https://github.com/duan602728596/48tools/releases" target="_blank">48tools下载主页，用于下载口袋48录播与各平台直播抓取（需要要科学上网）</a>
      </p>
      <p>
        <a href="https://tsh.abm48.com/" target="_blank">谭思慧唱歌记录网站</a>
      </p>      
      <p>
        <a href="https://sd.abm48.com" target="_blank">弹幕唱歌检测网站</a>
      </p>
      <p>
        <a href="https://msg48.org" target="_blank">口袋48历史记录搜索网站</a>
      </p>
      <p>
        <a href="https://gitee.com/albert-chen04/snh48-fansite" target="_blank">唱歌记录网站地址</a>
      </p>
      <p>
        <a href="https://gitee.com/albert-chen04/video-editing-toolkit" target="_blank">我写的视频剪辑软件，可批量裁剪切片并得出切片本，本网站提供下载的就是这个切片本，软件支持切片本的一键导入剪切。除此，还有更多功能</a>
      </p>
      <p>
        <a href="https://gitee.com/albert-chen04/personal-homepage" target="_blank">我的个人主页</a>
      </p>

      <el-divider />
      
      <!-- 核心修改：联系我模块 (模仿你的个人网站) -->
      <div class="contact-section">

      <h3 class="contact-subtitle-new">如果你想与我交流，可以通过以下方式联系我</h3>
        
        <div class="contact-buttons">
          <!-- 发送邮件 -->
          <a href="mailto:your-email@example.com" class="contact-btn email-btn">
            <el-icon><Message /></el-icon> 发送邮件
          </a>
          
          <!-- 添加微信 -->
          <div class="contact-btn wechat-btn" @click="showQrCode('wechat')">
            <el-icon><ChatDotRound /></el-icon> 添加微信
          </div>
          
          <!-- 添加QQ -->
          <div class="contact-btn qq-btn" @click="showQrCode('qq')">
            <el-icon><Bell /></el-icon> 添加QQ
          </div>
        </div>
      </div>
    </el-card>

    <!-- 二维码弹窗 -->
    <el-dialog
      v-model="qrVisible"
      :title="qrTitle"
      width="300px"
      center
      class="qr-dialog"
    >
      <div class="qr-container">
        <!-- 这里的图片需要你在 assets 里放入 qq.jpg 和 wechat.jpg -->
        <img :src="currentQrImg" alt="QR Code" class="qr-image" />
        <p class="qr-desc">扫一扫上面二维码图案，加我为朋友。</p>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// 引入图标
import { Message, ChatDotRound, Bell } from '@element-plus/icons-vue';

// 引入二维码图片 (请确保 src/assets 下有这两张图)
import wechatImg from '../assets/wechat.png';
import qqImg from '../assets/qq.png';

const qrVisible = ref(false);
const qrType = ref('wechat'); // 'wechat' or 'qq'

const qrTitle = computed(() => qrType.value === 'wechat' ? '微信二维码' : 'QQ二维码');
const currentQrImg = computed(() => qrType.value === 'wechat' ? wechatImg : qqImg);

const showQrCode = (type) => {
  qrType.value = type;
  qrVisible.value = true;
};
</script>

<style scoped>
.about-card {
  background: rgba(255, 255, 255, 0.95);
  padding: 20px;
  line-height: 1.8;
}
a { color: #409EFF; text-decoration: none; }

/* --- 联系我模块样式 --- */
.contact-section {
  margin-top: 50px;
  text-align: center;
  padding: 40px 0;
  /* 稍微加个背景区分一下，或者直接用透明 */
}

.contact-title {
  font-size: 32px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.contact-title::after {
  content: '';
  display: block;
  width: 60px;
  height: 4px;
  background-color: #007bff; /* 蓝色下划线 */
  margin: 10px auto 0;
  border-radius: 2px;
}

.contact-subtitle {
  color: #666;
  margin-bottom: 30px;
}

.contact-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.contact-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 180px;
  height: 50px;
  border-radius: 8px;
  color: #fff;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  text-decoration: none; /* 针对 <a> 标签 */
}

.contact-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

.contact-btn .el-icon { font-size: 20px; }

/* 按钮颜色 (模仿你网站的蓝色系) */
.email-btn { background-color: #007bff; }
.wechat-btn { background-color: #007bff; }
.qq-btn { background-color: #007bff; }

/* 二维码弹窗样式 */
.qr-container {
  text-align: center;
  background-color: #4caf50; /* 微信绿背景，或者你想要的背景 */
  padding: 20px;
  border-radius: 8px;
  color: white;
}

.qr-image {
  width: 100%;
  max-width: 150px;
  border-radius: 4px;
  border: 4px solid rgba(255,255,255,0.2);
}

.qr-desc {
  margin-top: 15px;
  font-size: 12px;
  opacity: 0.9;
}
</style>