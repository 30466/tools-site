<template>
  <div class="tools-home">
    <el-card class="welcome-card">
      <h2>欢迎使用 abm48 工具箱 🧰</h2>
      <p>这里集合了一些用于应援、剪辑和数据处理的小工具，旨在提高效率。</p>
    </el-card>

    <!-- 推荐网站 -->
    <h2 class="section-title" id="section-websites">📌 推荐网站</h2>
    <div class="tools-grid">
      <el-card class="tool-card" shadow="hover" @click="openExternal('https://abm48.com/')">
        <div class="card-content">
          <div class="icon-box">🎵</div>
          <div class="info">
            <h3>小偶像音乐网站</h3>
            <p>写给小偶像的音乐网站，收录在团、退团、毕业成员的歌曲。</p>
          </div>
        </div>
      </el-card>

      <el-card class="tool-card" shadow="hover" @click="openExternal('https://snh48wiki.top/')">
        <div class="card-content">
          <div class="icon-box">📂</div>
          <div class="info">
            <h3>成员档案</h3>
            <p>塞纳河成员档案查询网站。</p>
          </div>
        </div>
      </el-card>

      <el-card class="tool-card" shadow="hover" @click="openExternal('https://msg48.org/')">
        <div class="card-content">
          <div class="icon-box">💬</div>
          <div class="info">
            <h3>口袋48历史记录查询</h3>
            <p>查询口袋48房间消息、直播电台回放、口袋48 ID查成分、翻牌字数。</p>
          </div>
        </div>
      </el-card>

      <el-card class="tool-card" shadow="hover" @click="openExternal('https://glx48call.dpdns.org/')">
        <div class="card-content">
          <div class="icon-box">🎵</div>
          <div class="info">
            <h3>河曲应援Call本查询站</h3>
            <p>支持歌词搜索，查询河曲应援Call本。</p>
          </div>
        </div>
      </el-card>
    </div>

    <!-- APP 下载 -->
    <h2 class="section-title" id="section-apps">📌 APP 下载</h2>
    <div class="tools-grid">
      <el-card class="tool-card" shadow="hover" @click="$router.push('/download')">
        <div class="card-content">
          <div class="icon-box">🎵</div>
          <div class="info">
            <h3>abm48 APP 下载</h3>
            <p>写给小偶像的音乐APP，包括在团，退团，毕业等。</p>
          </div>
        </div>
      </el-card>

      <el-card class="tool-card" shadow="hover" @click="$router.push('/member-archive')">
        <div class="card-content">
          <div class="icon-box">📂</div>
          <div class="info">
            <h3>SNH48 GROUP 档案</h3>
            <p>塞纳河档案 APP 下载，方便查询成员资料。</p>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 剪辑工具 -->
    <h2 class="section-title" id="section-tools">📌 剪辑工具</h2>
    <div class="tools-grid">
      <el-card class="tool-card" shadow="hover" @click="openExternal('https://github.com/duan602728596/48tools/releases')">
        <div class="card-content">
          <div class="icon-box">🔧</div>
          <div class="info">
            <h3>48tools</h3>
            <p>口袋48工具，提供公演、口袋48直播录源，公演、口袋48录播下载，封面下载，口袋48的pc版，可以看成员的直播、弹幕和录播等功能</p>
          </div>
        </div>
      </el-card>

      <el-card class="tool-card" shadow="hover" @click="$router.push('/clip')">
        <div class="card-content">
          <div class="icon-box">✂️</div>
          <div class="info">
            <h3>Web 批量剪切</h3>
            <p>导入视频和切片本(TXT)，在浏览器内直接完成批量裁剪并打包下载。</p>
          </div>
        </div>
      </el-card>

      <el-card class="tool-card" shadow="hover" @click="$router.push('/transcode')">
        <div class="card-content">
          <div class="icon-box">🔄</div>
          <div class="info">
            <h3>Web 批量转码</h3>
            <p>支持多文件批量转格式、提取音频 (MP3/AAC/WAV)，支持 Copy 流极速模式。</p>
          </div>
        </div>
      </el-card>

      <el-card class="tool-card" shadow="hover" @click="$router.push('/merge')">
        <div class="card-content">
          <div class="icon-box">🔗</div>
          <div class="info">
            <h3>Web 媒体合并</h3>
            <p>无损极速合并多个视频/音频片段 (Concat)，要求所有文件格式参数一致。</p>
          </div>
        </div>
      </el-card>

      <el-card class="tool-card" shadow="hover" @click="openExternal('https://sd.abm48.com/')">
        <div class="card-content">
          <div class="icon-box">🎤</div>
          <div class="info">
            <h3>字幕/弹幕唱歌检测</h3>
            <p>根据字幕文件或弹幕文件判断并检测唱歌时间段。</p>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 应援站 -->
    <h2 class="section-title" id="section-support">📌 应援站</h2>
    <p class="section-hint">可找我做同款或者定制应援站</p>
    <div class="tools-grid">
      <el-card class="tool-card" shadow="hover" @click="openExternal('https://tsh.abm48.com/')">
        <div class="card-content">
          <div class="icon-box">🎤</div>
          <div class="info">
            <h3>🎤 CGT48 谭思慧</h3>
            <p>谭思慧应援站，唱歌记录网站。</p>
          </div>
        </div>
      </el-card>

      <el-card class="tool-card" shadow="hover" @click="openExternal('https://wrs.abm48.com/')">
        <div class="card-content">
          <div class="icon-box">🎤</div>
          <div class="info">
            <h3>🎤 BEJ48 吴睿莎</h3>
            <p>吴睿莎应援站，唱歌记录网站。</p>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 联系我 -->
    <div class="contact-section" id="section-contact">
      <h3 class="contact-subtitle">如果你想与我交流，可以通过以下方式联系我</h3>
      <div class="contact-buttons">
        <a href="mailto:your-email@example.com" class="contact-btn email-btn">
          <el-icon><Message /></el-icon> 发送邮件
        </a>
        <div class="contact-btn wechat-btn" @click="showQrCode('wechat')">
          <el-icon><ChatDotRound /></el-icon> 添加微信
        </div>
        <div class="contact-btn qq-btn" @click="showQrCode('qq')">
          <el-icon><Bell /></el-icon> 添加QQ
        </div>
        <a href="https://me.abm48.com/" target="_blank" class="contact-btn homepage-btn">
          🏠 我的个人主页
        </a>
      </div>
    </div>

    <!-- 二维码弹窗 -->
    <el-dialog
      v-model="qrVisible"
      :title="qrTitle"
      width="300px"
      center
      class="qr-dialog"
    >
      <div class="qr-container">
        <img :src="currentQrImg" alt="QR Code" class="qr-image" />
        <p class="qr-desc">扫一扫上面二维码图案，加我为朋友。</p>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Message, ChatDotRound, Bell } from '@element-plus/icons-vue'
import wechatImg from '../assets/wechat.png'
import qqImg from '../assets/qq.png'

const route = useRoute()

const openExternal = (url) => {
  window.open(url, '_blank')
}

const scrollToHash = () => {
  if (route.hash) {
    const el = document.querySelector(route.hash)
    if (el) {
      setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100)
    }
  }
}

onMounted(scrollToHash)
watch(() => route.hash, scrollToHash)

const qrVisible = ref(false)
const qrType = ref('wechat')

const qrTitle = computed(() => qrType.value === 'wechat' ? '微信二维码' : 'QQ二维码')
const currentQrImg = computed(() => qrType.value === 'wechat' ? wechatImg : qqImg)

const showQrCode = (type) => {
  qrType.value = type
  qrVisible.value = true
}
</script>

<style scoped>
.welcome-card {
  margin-bottom: 30px;
  background: rgba(255, 255, 255, 0.95);
}

.section-title {
  margin: 30px 0 15px 0;
  color: #303133;
  font-size: 1.3rem;
}

.section-hint {
  margin: -10px 0 15px 0;
  color: #909399;
  font-size: 14px;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.tool-card {
  cursor: pointer;
  background: rgba(255, 255, 255, 0.95);
  transition: transform 0.2s;
}

.tool-card:hover {
  transform: translateY(-5px);
}

.card-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.icon-box {
  font-size: 3rem;
  background: #f0f2f5;
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  flex-shrink: 0;
}

.info h3 {
  margin: 0 0 5px 0;
  color: #303133;
}

.info p {
  margin: 0;
  color: #909399;
  font-size: 13px;
  line-height: 1.5;
}

/* 联系我 */
.contact-section {
  margin-top: 50px;
  text-align: center;
  padding: 40px 0;
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
  gap: 6px;
  width: 140px;
  height: 44px;
  border-radius: 8px;
  color: #fff;
  font-weight: bold;
  font-size: 14px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  text-decoration: none;
}

.contact-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

.contact-btn .el-icon { font-size: 20px; }

.contact-btn { background-color: #204fa1; }

/* 二维码弹窗 */
.qr-container {
  text-align: center;
  background-color: #4caf50;
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
