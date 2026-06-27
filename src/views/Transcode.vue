<template>
  <div class="transcode-page">
    <VideoToolsNav />
    
    <el-card class="transcode-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span class="header-title">🔄 批量转码 (Web版)</span>
            <el-tag type="warning" effect="plain" round size="small" style="margin-left: 10px">Beta</el-tag>
          </div>
    
          <div class="header-right">
            <a href="/VideoEditingToolkit-Lite.zip" class="project-link">
              <el-button type="primary" link>
                <el-icon style="margin-right: 4px"><Download /></el-icon>
                桌面版下载
              </el-button>
            </a>
            <a href="https://gitee.com/albert-chen04/video-editing-toolkit" target="_blank" class="project-link">
              <el-button type="primary" link>
                <el-icon style="margin-right: 4px"><Link /></el-icon>
                剪辑软件项目地址
              </el-button>
            </a>
          </div>
        </div>
      </template>

      <!-- 1. 文件选择区 -->
      <div class="section file-section">
        <div class="upload-box full-width">
          <div class="label">1. 添加待转码文件 (支持多选)</div>
          <input 
            type="file" 
            id="transcode-uploader" 
            accept=".mp4,.mkv,.ts,.flv,.mov,.avi,.webm,.mp3,.wav,.aac,.flac,.m4a,.opus" 
            multiple
            @change="handleFileSelect" 
            style="display: none"
          />
          <el-button type="primary" plain size="large" @click="triggerFileUpload">
            <el-icon><FolderAdd /></el-icon> 
            添加文件...
          </el-button>
          <span class="tip" style="margin-left: 10px">已添加 {{ fileList.length }} 个文件</span>
        </div>
      </div>

      <el-divider />

      <!-- 2. 文件列表区 -->
      <div class="section list-section">
        <div class="list-header">
          <div class="label">待处理文件列表</div>
          <div class="list-actions">
            <el-button size="small" type="danger" plain @click="clearList" :disabled="fileList.length === 0 || isProcessing">🗑️ 清空列表</el-button>
          </div>
        </div>

        <el-table :data="fileList" style="width: 100%" border stripe max-height="300">
          <el-table-column label="文件名" prop="name" min-width="200" show-overflow-tooltip />
          <el-table-column label="大小" width="100">
            <template #default="scope">
              {{ (scope.row.size / 1024 / 1024).toFixed(2) }} MB
            </template>
          </el-table-column>
          <el-table-column label="状态" width="120">
            <template #default="scope">
              <el-tag :type="scope.row.status === 'done' ? 'success' : (scope.row.status === 'error' ? 'danger' : 'info')">
                {{ scope.row.statusText || '等待中' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80" align="center">
            <template #default="scope">
              <el-button type="danger" link @click="removeFile(scope.$index)" :disabled="isProcessing">
                <el-icon><Delete /></el-icon>
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <el-divider />

      <!-- 3. 设置与控制区 -->
      <div class="section control-section">
        <div class="settings">
          <div class="setting-item">
            <span class="label">目标格式:</span>
            <el-select v-model="targetFormat" placeholder="选择格式" style="width: 140px" size="large">
              <el-option label="MP4" value="mp4" />
              <el-option label="M4A (推荐)" value="m4a" />
              <el-option label="MP3 (音频)" value="mp3" />
              <el-option label="WAV (无损)" value="wav" />
              <el-option label="AAC (音频)" value="aac" />
              <el-option label="FLAC (无损)" value="flac" />
              <el-option label="MKV" value="mkv" />
              <el-option label="TS" value="ts" />
            </el-select>
          </div>

          <div class="setting-item">
            <span class="label">模式:</span>
            <el-radio-group v-model="transcodeMode">
              <el-radio label="copy" border>🚀 极速 (Copy流)</el-radio>
              <el-radio label="encode" border :disabled="!isAudioTarget">兼容 (重编码)</el-radio>
            </el-radio-group>
            <div class="tip" v-if="transcodeMode === 'copy'" style="margin-left: 10px; font-size: 12px; color: #E6A23C">
              注意: Copy模式要求源编码与目标容器兼容
            </div>
          </div>
        </div>

        <!-- FFmpeg 核心加载区 -->
        <div class="ffmpeg-status">
          <template v-if="!isFFmpegLoaded">
            <el-button
              type="warning"
              size="large"
              :loading="isFFmpegLoading"
              @click="loadFFmpeg"
              style="width: 100%"
            >
              <template v-if="isFFmpegLoading">
                ⏳ 正在加载 FFmpeg 核心 (约 30MB，首次需等待)...
              </template>
              <template v-else>
                🚀 先点击加载 FFmpeg 核心（转码引擎）
              </template>
            </el-button>
          </template>
          <el-alert
            v-else
            title="✅ FFmpeg 核心已就绪，可以进行转码操作"
            type="success"
            show-icon
            :closable="false"
          />
        </div>

        <div class="action-btn">
          <el-button 
            type="primary" 
            size="large" 
            class="start-btn" 
            :loading="isProcessing"
            :disabled="!readyToStart"
            @click="startBatchTranscode"
          >
            <el-icon class="el-icon--left"><Refresh /></el-icon>
            {{ isProcessing ? `处理中 (${progress}%)` : '开始批量转换并下载' }}
          </el-button>
        </div>
      </div>

      <!-- 4. 日志输出区 -->
      <div class="section log-section">
        <div class="label">运行日志</div>
        <div class="log-box" ref="logBoxRef">
          <div v-for="(log, index) in logs" :key="index" class="log-line">{{ log }}</div>
        </div>
      </div>

    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch, watchEffect } from 'vue';
import { fetchFile } from '@ffmpeg/util';
import JSZip from 'jszip';
import { ElMessage, ElMessageBox } from 'element-plus';
import { FolderAdd, Delete, Refresh, Link, Download } from '@element-plus/icons-vue';
import VideoToolsNav from '@/components/VideoToolsNav.vue';
import { FFmpegManager } from '@/composables/useFFmpeg';

// --- 状态变量 ---
const crossOriginIsolated = window.crossOriginIsolated;
const fileList = ref([]);
const transcodeMode = ref('copy');
const targetFormat = ref('mp4');
const isProcessing = ref(false);
const progress = ref(0);
const logs = ref(['⏳ 等待加载 FFmpeg 核心组件...']);
const logBoxRef = ref(null);

const addLog = (msg) => {
  logs.value.push(msg);
  nextTick(() => {
    if (logBoxRef.value) logBoxRef.value.scrollTop = logBoxRef.value.scrollHeight;
  });
};

const ffmpegMgr = new FFmpegManager(addLog);
const isFFmpegLoaded = ref(false);
const isFFmpegLoading = ref(false);
watchEffect(() => {
  isFFmpegLoaded.value = ffmpegMgr.isLoaded.value;
  isFFmpegLoading.value = ffmpegMgr.isLoading.value;
});

// --- 计算属性 ---
const isAudioTarget = computed(() => {
  return ['mp3', 'wav', 'aac', 'flac', 'opus', 'm4a'].includes(targetFormat.value);
});

const readyToStart = computed(() => {
  return isFFmpegLoaded.value && fileList.value.length > 0;
});

// --- 监听器 ---
// 当目标格式变化时，自动调整模式以避免错误配置
watch(targetFormat, (newVal) => {
  // 需要重编码的格式 (通常源视频不是这些格式)
  if (['mp3', 'wav', 'flac', 'opus', 'aac'].includes(newVal)) {
    transcodeMode.value = 'encode';
  } else {
    // 容器格式 (mp4, mkv, ts, m4a) 通常支持 copy 流
    transcodeMode.value = 'copy';
  }
});

// --- 初始化 FFmpeg ---
onMounted(() => {
  if (!crossOriginIsolated) {
    addLog('ℹ️ 跨域隔离未完全生效（不影响基本功能，FFmpeg 仍可正常工作）');
  }
});

function loadFFmpeg() {
  ffmpegMgr.load()
}

function isFFmpegAlive() {
  return ffmpegMgr.isAlive()
}

async function restartFFmpeg() {
  await ffmpegMgr.restart()
}

// --- 文件操作 ---
const triggerFileUpload = () => document.getElementById('transcode-uploader').click();

const handleFileSelect = (event) => {
  const files = event.target.files;
  if (!files.length) return;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    // 简单的去重检查
    if (!fileList.value.some(f => f.name === file.name && f.size === file.size)) {
      // 包装一下文件对象，加入状态字段
      fileList.value.push({
        file: file, // 原始 File 对象
        name: file.name,
        size: file.size,
        status: 'pending', // pending, processing, done, error
        statusText: '准备就绪'
      });
      addLog(`📂 已添加: ${file.name}`);
    }
  }
  
  if (files.length > 0) {
    addLog('👉 请点击页面底部的“开始批量转换”按钮以开始处理。');
  }

  // 清空 input value 允许重复选择
  event.target.value = '';
};

const removeFile = (index) => {
  fileList.value.splice(index, 1);
};

const clearList = () => {
  fileList.value = [];
  addLog('🗑️ 列表已清空');
};

// --- 核心转码逻辑 ---
const startBatchTranscode = async () => {
  if (fileList.value.length === 0) return;
  
  isProcessing.value = true;
  progress.value = 0;
  const zip = new JSZip();
  const outputFolder = zip.folder("transcoded");
  let successCount = 0;

  try {
    addLog('🚀 开始批量处理...');

    for (let i = 0; i < fileList.value.length; i++) {
      const item = fileList.value[i];
      item.status = 'processing';
      item.statusText = '处理中...';
      
      // const safeName = item.name.replace(/[\\/*?:"<>|]/g, "_");
      // 使用纯 ASCII 文件名避免 FFmpeg 内部编码问题
      const inputExt = item.name.slice((item.name.lastIndexOf(".") - 1 >>> 0) + 2);
      const inputName = `input_${i}.${inputExt || 'dat'}`;
      
      const outExt = '.' + targetFormat.value;
      // 输出文件名：原名_transcoded.ext
      const outputName = `out_${i}${outExt}`;
      const finalFileName = item.name.substring(0, item.name.lastIndexOf('.')) + outExt;

      addLog(`🔄 [${i+1}/${fileList.value.length}]正在处理: ${item.name} -> ${targetFormat.value.toUpperCase()}`);

      try {
        // 1. 写入文件
        const fileData = await fetchFile(item.file);
        await ffmpegMgr.ffmpeg.writeFile(inputName, fileData);

        // 2. 构建命令
        let cmd = ['-i', inputName];

        if (isAudioTarget.value) {
          cmd.push('-vn'); // 去除视频
          
          // 如果用户强制选了 copy 模式，直接 copy
          if (transcodeMode.value === 'copy') {
             cmd.push('-c:a', 'copy');
          } else {
             // 否则走重编码逻辑
             switch (targetFormat.value) {
                case 'mp3': cmd.push('-c:a', 'libmp3lame'); break;
                case 'm4a': cmd.push('-c:a', 'aac'); break; // M4A 容器通常用 AAC 编码
                case 'aac': cmd.push('-c:a', 'aac'); break;
                case 'wav': cmd.push('-c:a', 'pcm_s16le'); break;
                case 'flac': cmd.push('-c:a', 'flac'); break;
                default: cmd.push('-c:a', 'copy'); break;
             }
          }
        } else {
          // 视频模式
          cmd.push('-c', 'copy'); // 默认使用 copy 模式，浏览器端转码太慢
          // 如果是 TS 转 MP4，copy 是安全的 remux
        }

        cmd.push(outputName);

        // 3. 执行
        await ffmpegMgr.ffmpeg.exec(cmd);

        // 4. 读取结果
        const data = await ffmpegMgr.ffmpeg.readFile(outputName);
        outputFolder.file(finalFileName, data);
        
        // 5. 清理
        await ffmpegMgr.ffmpeg.deleteFile(inputName);
        await ffmpegMgr.ffmpeg.deleteFile(outputName);

        if (!(await isFFmpegAlive())) {
          await restartFFmpeg();
        }

        item.status = 'done';
        item.statusText = '完成';
        successCount++;

      } catch (err) {
        console.error(err);
        item.status = 'error';
        item.statusText = '失败';
        addLog(`❌ 处理失败 ${item.name}: ${err.message}`);
        // 尝试清理 input，防止内存泄漏
        try { await ffmpegMgr.ffmpeg.deleteFile(inputName); } catch (e) {}
      }

      progress.value = Math.round(((i + 1) / fileList.value.length) * 100);
    }

    if (successCount > 0) {
      addLog('📦 正在打包 ZIP 文件...');
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const downloadUrl = URL.createObjectURL(zipBlob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `Transcoded_${new Date().toISOString().slice(0,10)}.zip`;
      link.click();
      
      addLog('🎉 全部完成！已开始下载。');
      ElMessage.success(`成功处理 ${successCount} 个文件`);
    } else {
      addLog('⚠️ 没有文件被成功处理。');
      ElMessageBox.alert('所有文件处理失败，请检查日志。', '失败', { type: 'error' });
    }

  } catch (err) {
    addLog(`❌ 致命错误: ${err.message}`);
    ElMessageBox.alert('处理过程发生错误', '错误', { type: 'error' });
  } finally {
    isProcessing.value = false;
  }
};

</script>

<style scoped>
.transcode-page {
  max-width: 900px;
  margin: 0 auto;
  padding-bottom: 50px;
}

.transcode-card {
  background: rgba(255, 255, 255, 0.95);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-right {
  margin-left: auto;
}

.project-link {
  text-decoration: none;
}

.header-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.section {
  margin-bottom: 25px;
}

.file-section {
  display: flex;
}

.upload-box.full-width {
  width: 100%;
  text-align: center;
  padding: 20px;
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  transition: border-color 0.3s;
}

.upload-box:hover {
  border-color: #409eff;
}

.label {
  font-weight: bold;
  margin-bottom: 10px;
  color: #606266;
  display: block;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.control-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.start-btn {
  font-weight: bold;
  width: 250px;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
}

.log-box {
  background: #1e1e1e;
  color: #00ff00;
  font-family: 'Consolas', monospace;
  padding: 15px;
  border-radius: 8px;
  height: 200px;
  overflow-y: auto;
  font-size: 12px;
  line-height: 1.5;
}

.log-line {
  margin-bottom: 2px;
  word-break: break-all;
}

.settings {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
