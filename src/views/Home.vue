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
            <p>ABM48 写给小偶像的音乐网站，收录在团、退团、毕业成员的歌曲。</p>
          </div>
        </div>
      </el-card>

      <el-card class="tool-card" shadow="hover" @click="$router.push('/pocket48-replay')">
        <div class="card-content">
          <div class="icon-box">📺</div>
          <div class="info">
            <h3>口袋48录播回放在线播放 查询 剪切</h3>
            <p>ABM48 在线播放、查询、批量剪切口袋48成员直播回放。</p>
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
            <p>MSG48 查询口袋48房间消息、直播电台回放、口袋48 ID查成分、翻牌字数。</p>
          </div>
        </div>
      </el-card>

      <el-card class="tool-card" shadow="hover" @click="openExternal('https://glx48call.dpdns.org/')">
        <div class="card-content">
          <div class="icon-box">🎵</div>
          <div class="info">
            <h3>河曲应援Call本查询站</h3>
            <p>GLX48 支持歌词搜索，查询河曲应援Call本。</p>
          </div>
        </div>
      </el-card>

      <el-card class="tool-card" shadow="hover" @click="openExternal('https://www.snh48.com/')">
        <div class="card-content">
          <div class="icon-box">🏠</div>
          <div class="info">
            <h3>SNH48官网</h3>
            <p>SNH48 GROUP官方网站，包含成员介绍、公演信息、新闻动态、口袋48 APP下载、历届总选排名及周边商品等。</p>
          </div>
        </div>
      </el-card>

      <el-card class="tool-card" shadow="hover" @click="openExternal('https://www.snh48.com/member_list.html#SNH')">
        <div class="card-content">
          <div class="icon-box">👤</div>
          <div class="info">
            <h3>官方成员简介</h3>
            <p>SNH48 GROUP官方成员索引，可按分队查询在团成员详细资料。</p>
          </div>
        </div>
      </el-card>

      <el-card class="tool-card" shadow="hover" @click="openExternal('https://xox48.top/')">
        <div class="card-content">
          <div class="icon-box">📊</div>
          <div class="info">
            <h3>明票榜</h3>
            <p>SNH48 GROUP明票投票榜单，查看成员实时排名数据。</p>
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
            <h3>ABM48 APP 下载</h3>
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

      <el-card class="tool-card" shadow="hover" @click="openExternal('https://h5.48.cn/pocket48/index_pc.html')">
        <div class="card-content">
          <div class="icon-box">📱</div>
          <div class="info">
            <h3>口袋48 APP 官网下载</h3>
            <p>SNH48 GROUP官方APP下载页，支持观看成员直播、公演直播及互动。</p>
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
            <p>浏览器端批量剪切：支持本地视频导入 + 口袋48直播回放在线剪切。</p>
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

    </div>

    <!-- Skills -->
    <h2 class="section-title" id="section-skills">📌 Skills</h2>
    <p class="section-hint">终端 AI Agent skill，纯语言解决以下问题：</p>
    <div class="tools-grid">
      <el-card class="tool-card" shadow="hover" @click="openExternal('https://gitee.com/albert-chen04/pocket48-replays-skills')">
        <div class="card-content">
          <div class="icon-box">💾</div>
          <div class="info">
            <h3>口袋48录播下载</h3>
            <p>口袋48录播回放相关下载与查询</p>
          </div>
        </div>
      </el-card>

      <el-card class="tool-card" shadow="hover" @click="openExternal('https://gitee.com/albert-chen04/media-batch-clip-skills')">
        <div class="card-content">
          <div class="icon-box">✂️</div>
          <div class="info">
            <h3>批量剪切</h3>
            <p>批量剪切（包括口袋48录播批量剪切，无需下载录播文件）</p>
          </div>
        </div>
      </el-card>

      <el-card class="tool-card" shadow="hover" @click="openExternal('https://gitee.com/albert-chen04/pocket48-danmaku-analysis-skills')">
        <div class="card-content">
          <div class="icon-box">🎤</div>
          <div class="info">
            <h3>弹幕唱歌检测</h3>
            <p>口袋48弹幕文件检测唱歌片段</p>
          </div>
        </div>
      </el-card>

      <el-card class="tool-card" shadow="hover" @click="openExternal('https://gitee.com/albert-chen04/albert-music-upload-skills')">
        <div class="card-content">
          <div class="icon-box">🎵</div>
          <div class="info">
            <h3>音乐批量上传</h3>
            <p>批量上传音频到小偶像音乐网站</p>
          </div>
        </div>
      </el-card>

      <el-card class="tool-card" shadow="hover" @click="openExternal('https://gitee.com/albert-chen04/clip-record-upload-skills')">
        <div class="card-content">
          <div class="icon-box">📋</div>
          <div class="info">
            <h3>切片本上传</h3>
            <p>批量上传唱歌切片本到切片本网站</p>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 应援站 -->
    <h2 class="section-title" id="section-support">📌 应援站</h2>
    <p class="section-hint">可找我做同款（换个背景图和成员名称部署，5分钟的事）或者定制应援站</p>
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
          ✉️ 发送邮件
        </a>
        <div class="contact-btn wechat-btn" @click="showQrCode('wechat')">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M8.667 11.511a1.276 1.276 0 0 1-1.285-1.285c0-.718.567-1.286 1.285-1.286.717 0 1.285.568 1.285 1.286 0 .717-.568 1.285-1.285 1.285zm6.666 0a1.276 1.276 0 0 1-1.285-1.285c0-.718.568-1.286 1.285-1.286.718 0 1.285.568 1.285 1.286 0 .717-.567 1.285-1.285 1.285zm-8.51 7.704l.715-.436a4 4 0 0 1 2.705-.536c.212.033.386.059.52.076.406.054.82.081 1.237.081 4.42 0 7.9-3.022 7.9-6.6S16.42 5.2 12 5.2s-7.9 3.022-7.9 6.6c0 1.366.5 2.673 1.432 3.781.048.057.12.137.214.235a4 4 0 0 1 1.101 3.102l-.025.297zm-.63 2.727a1 1 0 0 1-1.527-.93l.188-2.26a2 2 0 0 0-.55-1.551A6.993 6.993 0 0 1 4 16.868C2.806 15.447 2.1 13.695 2.1 11.8c0-4.75 4.432-8.6 9.9-8.6s9.9 3.85 9.9 8.6-4.432 8.6-9.9 8.6c-.51 0-1.01-.033-1.499-.098a23.61 23.61 0 0 1-.569-.084 2 2 0 0 0-1.353.268l-2.387 1.456z"/></svg>
          添加微信
        </div>
        <div class="contact-btn qq-btn" @click="showQrCode('qq')">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M21.395 15.035a39.548 39.548 0 0 0-.803-2.264l-1.079-2.695c.001-.032.014-.562.014-.836C19.526 4.632 17.351 0 12 0S4.474 4.632 4.474 9.241c0 .274.013.804.014.836l-1.08 2.695a38.97 38.97 0 0 0-.802 2.264c-1.021 3.283-.69 4.643-.438 4.673.54.065 2.103-2.472 2.103-2.472 0 1.469.756 3.387 2.394 4.771-.612.188-1.363.479-1.845.835-.434.32-.379.646-.301.778.343.578 5.883.369 7.482.189 1.6.18 7.14.389 7.483-.189.078-.132.132-.458-.301-.778-.483-.356-1.233-.646-1.846-.836 1.637-1.384 2.393-3.302 2.393-4.771 0 0 1.563 2.537 2.103 2.472.251-.03.581-1.39-.438-4.673zM12.662 4.846c.039-1.052.659-1.878 1.385-1.846s1.281.912 1.242 1.964c-.039 1.051-.659 1.878-1.385 1.846s-1.282-.912-1.242-1.964zM9.954 3c.725-.033 1.345.794 1.384 1.846.04 1.052-.517 1.931-1.242 1.963-.726.033-1.346-.794-1.385-1.845C8.672 3.912 9.228 3.033 9.954 3zM7.421 8.294c.194-.43 2.147-.908 4.566-.908h.026c2.418 0 4.372.479 4.566.908a.14.14 0 0 1 .014.061c0 .031-.01.059-.026.083-.163.238-2.333 1.416-4.553 1.416h-.026c-2.221 0-4.39-1.178-4.553-1.416a.136.136 0 0 1-.014-.144zm10.422 8.622c-.22 3.676-2.403 5.987-5.774 6.021h-.137c-3.37-.033-5.554-2.345-5.773-6.021-.081-1.35.001-2.496.147-3.43.318.063.638.122.958.176v3.506s1.658.334 3.318.103v-3.225c.488.027.96.04 1.406.034h.025c1.678.021 3.714-.204 5.683-.594.146.934.227 2.08.147 3.43zM10.48 5.804c.313-.041.542-.409.508-.825-.033-.415-.314-.72-.629-.679-.313.04-.541.409-.508.824.034.417.315.72.629.68zM14.479 5.156c.078.037.221.042.289-.146.035-.095.025-.165-.009-.214-.023-.033-.133-.118-.371-.176-.904-.22-1.341.384-1.405.499-.04.072-.012.176.056.227.067.051.139.037.179-.006.58-.628 1.21-.208 1.261-.184z"/></svg>
          添加QQ
        </div>
        <a href="https://me.abm48.com/" target="_blank" class="contact-btn homepage-btn">
          🏠 我的个人主页
        </a>
      </div>
    </div>

    <!-- 二维码弹窗 -->
    <el-dialog
      v-model="qrVisible"
      width="340px"
      center
      class="qr-dialog"
    >
      <template #header>
        <span class="dialog-title">{{ qrTitle }}</span>
      </template>
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

/* 弹窗标题居中加粗 */
:deep(.el-dialog__header) {
  text-align: center;
}
.dialog-title {
  font-weight: bold;
  font-size: 18px;
}

/* 二维码弹窗 */
.qr-container {
  text-align: center;
  padding: 12px 0;
  color: #606266;
}

.qr-image {
  width: 280px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.qr-desc {
  margin: 10px 0 0;
  font-size: 13px;
  color: #6b7280;
}
</style>
