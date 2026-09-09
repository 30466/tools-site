<template>
  <div class="tools-home">
    <el-card class="welcome-card">
      <h2>欢迎使用 abm48 工具箱 🧰</h2>
      <p>这里集合了一些用于应援、剪辑和数据处理的小工具，旨在提高效率。</p>
      <a href="https://github.com/30466/tools-site" target="_blank" rel="noopener noreferrer" class="source-link">
        查看网站源代码（GitHub）
      </a>
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

      <el-card class="tool-card" shadow="hover" @click="openExternal('https://gnz.hk/')">
        <div class="card-content">
          <div class="icon-box">💬</div>
          <div class="info">
            <h3>牙牙消息</h3>
            <p>SNH48 成员房间消息抓取与检索，支持口袋48直播回放、翻牌、成员资料、上麦及音乐电台等功能。</p>
          </div>
        </div>
      </el-card>

      <el-card class="tool-card" shadow="hover" @click="openExternal('https://www.48archive.top/')">
        <div class="card-content">
          <div class="icon-box">📚</div>
          <div class="info">
            <h3>48 数据平台</h3>
            <p>收录公演、成员、歌曲等 48 相关数据，方便查询和了解。</p>
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

      <el-card class="tool-card" shadow="hover" @click="openExternal('https://p48.ruokezhang.com/')">
        <div class="card-content">
          <div class="icon-box">📝</div>
          <div class="info">
            <h3>口袋48直播总结</h3>
            <p>整理口袋48直播回放的字幕、弹幕、总结和精彩片段。</p>
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
    <p class="section-hint">终端 AI Agent skill，点击下方按钮复制安装命令到剪贴板，用AI纯语言解决以下问题：</p>
    <div class="tools-grid">
      <el-card class="tool-card" shadow="hover" @click="openExternal('https://github.com/30466/pocket48-replays-skills')">
        <div class="card-content">
          <div class="icon-box">💾</div>
          <div class="info">
            <h3>口袋48录播下载</h3>
            <p>口袋48录播回放相关下载与查询</p>
            <el-button size="small" type="primary" plain @click.stop="copyCmd('npx skills add 30466/pocket48-replays-skills')">复制安装命令</el-button>
          </div>
        </div>
      </el-card>

      <el-card class="tool-card" shadow="hover" @click="openExternal('https://github.com/30466/media-batch-clip-skills')">
        <div class="card-content">
          <div class="icon-box">✂️</div>
          <div class="info">
            <h3>批量剪切</h3>
            <p>批量剪切（包括口袋48录播批量剪切，无需下载录播文件）</p>
            <el-button size="small" type="primary" plain @click.stop="copyCmd('npx skills add 30466/media-batch-clip-skills')">复制安装命令</el-button>
          </div>
        </div>
      </el-card>

      <el-card class="tool-card" shadow="hover" @click="openExternal('https://github.com/30466/pocket48-danmaku-analysis-skills')">
        <div class="card-content">
          <div class="icon-box">🎤</div>
          <div class="info">
            <h3>弹幕唱歌检测</h3>
            <p>口袋48弹幕文件检测唱歌片段</p>
            <el-button size="small" type="primary" plain @click.stop="copyCmd('npx skills add 30466/pocket48-danmaku-analysis-skills')">复制安装命令</el-button>
          </div>
        </div>
      </el-card>

      <el-card class="tool-card" shadow="hover" @click="openExternal('https://github.com/30466/albert-music-upload-skills')">
        <div class="card-content">
          <div class="icon-box">🎵</div>
          <div class="info">
            <h3>音乐批量上传</h3>
            <p>批量上传音频到小偶像音乐网站</p>
            <el-button size="small" type="primary" plain @click.stop="copyCmd('npx skills add 30466/albert-music-upload-skills')">复制安装命令</el-button>
          </div>
        </div>
      </el-card>

      <el-card class="tool-card" shadow="hover" @click="openExternal('https://github.com/30466/clip-record-upload-skills')">
        <div class="card-content">
          <div class="icon-box">📋</div>
          <div class="info">
            <h3>切片本上传</h3>
            <p>批量上传唱歌切片本到切片本网站</p>
            <el-button size="small" type="primary" plain @click.stop="copyCmd('npx skills add 30466/clip-record-upload-skills')">复制安装命令</el-button>
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

      <el-card class="tool-card" shadow="hover" @click="openExternal('https://xzzy.abm48.com/')">
        <div class="card-content">
          <div class="icon-box">🎤</div>
          <div class="info">
            <h3>🎤 GNZ48 徐郑子滢</h3>
            <p>徐郑子滢应援站，唱歌记录网站。</p>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 数据采集 -->
    <h2 class="section-title" id="section-data-collection">📌 数据采集</h2>
    <p class="section-hint">本地运行的数据采集与导出 CLI 工具，源代码托管在 GitHub。</p>
    <div class="tools-grid">
      <el-card class="tool-card" shadow="hover" @click="openExternal('https://github.com/30466/bili-core')">
        <div class="card-content">
          <div class="icon-box bilibili-icon"><i class="fab fa-bilibili"></i></div>
          <div class="info">
            <h3>bili-core</h3>
            <p>Bilibili UP 主视频列表抓取、元数据导出与音视频下载 CLI 工具。</p>
          </div>
        </div>
      </el-card>

      <el-card class="tool-card" shadow="hover" @click="openExternal('https://github.com/30466/weibo-core')">
        <div class="card-content">
          <div class="icon-box weibo-icon"><i class="fab fa-weibo"></i></div>
          <div class="info">
            <h3>weibo-core</h3>
            <p>微博账号帖子数据采集与 JSON、CSV 导出 CLI 工具，批量下载图文与音视频功能。</p>
          </div>
        </div>
      </el-card>

      <el-card class="tool-card" shadow="hover" @click="openExternal('https://github.com/30466/douyin-downloader')">
        <div class="card-content">
          <div class="icon-box douyin-icon"><i class="fab fa-tiktok"></i></div>
          <div class="info">
            <h3>douyin-downloader</h3>
            <p>抖音账号主页作品数据爬取导出和批量下载。</p>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 联系我 -->
    <div class="contact-section" id="section-contact">
      <h3 class="contact-subtitle">如果你想与我交流，可以通过以下方式联系我</h3>
      <div class="contact-buttons">
        <a href="mailto:chenbojun04@gmail.com" class="contact-btn">✉️ 发送邮件</a>
        <button class="contact-btn" type="button" @click="showQrCode('wechat')"><i class="fab fa-weixin"></i> 添加微信</button>
        <button class="contact-btn" type="button" @click="showQrCode('qq')"><i class="fab fa-qq"></i> 添加QQ</button>
        <a href="https://me.abm48.com/" target="_blank" rel="noopener noreferrer" class="contact-btn">🏠 我的个人主页</a>
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
import { ElMessage } from 'element-plus'
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

const copyCmd = (cmd) => {
  navigator.clipboard.writeText(cmd)
  ElMessage.success('已复制安装命令')
}
</script>

<style scoped>
.welcome-card {
  margin-bottom: 30px;
  background: rgba(255, 255, 255, 0.95);
}

.source-link {
  display: inline-block;
  margin-top: 8px;
  color: #409eff;
  font-size: 14px;
  text-decoration: none;
}

.source-link:hover {
  text-decoration: underline;
}

.section-title {
  margin: 30px 0 15px 0;
  color: #303133;
  font-size: 1.3rem;
  scroll-margin-top: 80px;
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

.bilibili-icon {
  color: #00a1d6;
}

.weibo-icon {
  color: #e6162d;
}

.douyin-icon {
  color: #161823;
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
  width: 140px;
  height: 44px;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 0;
  border-radius: 4px;
  background: #204fa1;
  color: #fff;
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  text-decoration: none;
}

.contact-btn:hover {
  color: #fff;
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

/* 弹窗标题居中加粗 */
:deep(.qr-dialog .el-dialog__header) {
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
