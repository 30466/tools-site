<template>
  <div class="tools-home">
    <el-card class="welcome-card">
      <h2>欢迎使用 abm48 工具箱 🧰</h2>
      <p>这里集合了一些用于应援、剪辑和数据处理的小工具，旨在提高效率。</p>
    </el-card>

    <div class="tools-grid">
      <!-- 工具卡片 0: APP 下载 -->
      <el-card class="tool-card" shadow="hover" @click="$router.push('/download')">
        <div class="card-content">
          <div class="icon-box">🎵</div>
          <div class="info">
            <h3>abm48 APP 下载</h3>
            <p>写给小偶像的音乐APP，包括在团，退团，毕业等。</p>
          </div>
        </div>
      </el-card>

      <!-- 工具卡片 1: 成员档案 -->
      <el-card class="tool-card" shadow="hover" @click="$router.push('/member-archive')">
        <div class="card-content">
          <div class="icon-box">📂</div>
          <div class="info">
            <h3>SNH48 GROUP 档案</h3>
            <p>塞纳河档案 APP 下载，方便查询成员资料。</p>
          </div>
        </div>
      </el-card>

      <!-- 工具卡片 2: 批量剪切 -->
      <el-card class="tool-card" shadow="hover" @click="$router.push('/clip')">
        <div class="card-content">
          <div class="icon-box">✂️</div>
          <div class="info">
            <h3>Web 批量剪切 (Clip)</h3>
            <p>导入视频和切片本(TXT)，在浏览器内直接完成批量裁剪并打包下载。</p>
          </div>
        </div>
      </el-card>

      <!-- 占位卡片：未来添加 -->
      <el-card class="tool-card disabled" shadow="none">
        <div class="card-content">
          <div class="icon-box" style="filter: grayscale(1);">🚧</div>
          <div class="info">
            <h3>更多工具开发中...</h3>
            <p>敬请期待 ffmpeg 格式转换、音频提取等功能。</p>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.welcome-card {
  margin-bottom: 30px;
  background: rgba(255, 255, 255, 0.95);
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

.disabled {
  cursor: not-allowed;
  opacity: 0.7;
}
</style>