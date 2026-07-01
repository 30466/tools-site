<template>
  <div class="clip-page">
    <VideoToolsNav />

    <el-card class="clip-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span class="header-title">✂️ 导入切片本批量剪切</span>
            <el-tag type="warning" effect="plain" round size="small" style="margin-left: 10px">Beta</el-tag>
          </div>
          <div class="header-right">
            <a href="https://gitee.com/albert-chen04/media-batch-clip-skills" target="_blank" class="project-link">
              <el-button type="success" link>
                <el-icon style="margin-right: 4px"><MagicStick /></el-icon>批量剪切 Skills (48模式·无需下载录播)
              </el-button>
            </a>
            <router-link to="/pocket48-replay" class="project-link">
              <el-button type="primary" link>
                <el-icon style="margin-right: 4px"><Cpu /></el-icon>口袋48模式 →
              </el-button>
            </router-link>
          </div>
        </div>
      </template>

      <!-- FFmpeg 核心加载区 -->
      <div class="ffmpeg-status">
        <template v-if="!isFFmpegLoaded">
          <el-alert
            v-if="!crossOriginIsolated"
            title="⚠️ 跨域隔离未完全生效（不影响使用，但 Safari 下非关键功能可能受限）"
            type="warning"
            show-icon
            :closable="false"
          />
          <el-button
            type="warning"
            size="large"
            :loading="isFFmpegLoading"
            @click="loadFFmpeg"
            style="width: 100%; margin-bottom: 12px"
          >
            <template v-if="isFFmpegLoading">
              ⏳ 正在加载 FFmpeg 核心 (约 30MB，首次需等待)...
            </template>
            <template v-else>
              🚀 1. 点击加载 FFmpeg 核心（剪切/转码引擎）
            </template>
          </el-button>
        </template>
        <template v-else>
          <el-alert
            title="✅ FFmpeg 核心已就绪，可以进行剪切操作"
            type="success"
            show-icon
            :closable="false"
            style="margin-bottom: 12px"
          />
        </template>
      </div>

      <!-- Local Mode -->
      <div class="section file-section">
          <div class="upload-box">
            <div class="label">1. 选择源视频/音频文件</div>
            <input
              type="file"
              id="video-uploader"
              accept=".mp4,.mkv,.ts,.flv,.mov,.avi,.webm,.mp3,.wav,.aac,.flac,.m4a,.opus"
              @change="handleVideoSelect"
              style="display: none"
            />
            <el-button type="primary" plain size="large" @click="triggerVideoUpload">
              <el-icon><VideoPlay /></el-icon>
              {{ videoFile ? `已选: ${videoFile.name}` : '点击选择本地视频 (MP4/MKV/TS...)' }}
            </el-button>
            <div class="tip" v-if="videoFile">文件大小: {{ (videoFile.size / 1024 / 1024).toFixed(2) }} MB</div>
            <el-alert
              v-if="fileSizeWarning"
              :title="fileSizeWarning"
              type="warning"
              show-icon
              :closable="false"
              style="margin-top: 8px"
            />
          </div>

          <div class="upload-box">
            <div class="label">2. 导入切片记录 (TXT)</div>
            <input
              type="file"
              id="txt-uploader"
              accept=".txt"
              @change="handleTxtSelect"
              style="display: none"
            />
            <el-button type="success" plain size="large" @click="triggerTxtUpload">
              <el-icon><Document /></el-icon> 导入 TXT 切片本
            </el-button>
          </div>
        </div>

        <el-divider />

        <div class="section list-section">
          <div class="list-header">
            <div class="label">待剪辑片段列表 ({{ clipList.length }})</div>
            <div class="list-actions">
              <el-button size="small" @click="addEmptyRow">➕ 手动添加</el-button>
              <el-button size="small" type="danger" plain @click="clearList">🗑️ 清空</el-button>
            </div>
          </div>
          <el-table :data="clipList" style="width: 100%" border stripe max-height="400">
            <el-table-column label="片段名称" min-width="150">
              <template #default="scope">
                <el-input v-model="scope.row.name" placeholder="片段名" size="small" />
              </template>
            </el-table-column>
            <el-table-column label="开始时间" width="120">
              <template #default="scope">
                <el-input v-model="scope.row.start" placeholder="00:00:00" size="small" />
              </template>
            </el-table-column>
            <el-table-column label="结束时间" width="120">
              <template #default="scope">
                <el-input v-model="scope.row.end" placeholder="00:00:00" size="small" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80" align="center">
              <template #default="scope">
                <el-button type="danger" link @click="removeRow(scope.$index)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <el-divider />

        <div class="section control-section">
          <div class="settings">
            <div class="setting-item">
              <span class="label">类别:</span>
              <el-radio-group v-model="outputCategory">
                <el-radio label="video" border>🎬 视频</el-radio>
                <el-radio label="audio" border>🎵 音频</el-radio>
              </el-radio-group>
            </div>
            <div class="setting-item">
              <span class="label">格式:</span>
              <el-select v-model="targetFormat" style="width: 120px" size="large">
                <el-option v-if="outputCategory === 'video'" label="TS (默认)" value="ts" />
                <el-option v-if="outputCategory === 'video'" label="MP4" value="mp4" />
                <el-option v-if="outputCategory === 'video'" label="MKV" value="mkv" />
                <el-option v-if="outputCategory === 'video'" label="AVI" value="avi" />
                <el-option v-if="outputCategory === 'video'" label="MOV" value="mov" />
                <el-option v-if="outputCategory === 'video'" label="WEBM" value="webm" />
                <el-option v-if="outputCategory === 'video'" label="GIF" value="gif" />
                <el-option v-if="outputCategory === 'audio'" label="M4A (默认)" value="m4a" />
                <el-option v-if="outputCategory === 'audio'" label="MP3" value="mp3" />
                <el-option v-if="outputCategory === 'audio'" label="FLAC" value="flac" />
                <el-option v-if="outputCategory === 'audio'" label="WAV" value="wav" />
                <el-option v-if="outputCategory === 'audio'" label="AAC" value="aac" />
                <el-option v-if="outputCategory === 'audio'" label="OPUS" value="opus" />
                <el-option v-if="outputCategory === 'audio'" label="OGG" value="ogg" />
              </el-select>
            </div>
          </div>
          <div class="action-btn">
            <el-button
              type="primary"
              size="large"
              class="start-btn"
              :loading="isProcessing"
              :disabled="!readyToClip || !!fileSizeWarning"
              @click="startBatchClip"
            >
              <el-icon class="el-icon--left"><Scissor /></el-icon>
              {{ isProcessing ? `处理中 (${progress}%)` : '开始批量处理并下载' }}
            </el-button>
          </div>
        </div>

      <!-- Log -->
      <el-divider />

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
import { ElMessage } from 'element-plus';
import { VideoPlay, Document, Delete, Scissor, MagicStick, Cpu } from '@element-plus/icons-vue';

import VideoToolsNav from '@/components/VideoToolsNav.vue';
import { FFmpegManager } from '@/composables/useFFmpeg';

const crossOriginIsolated = window.crossOriginIsolated;
const videoFile = ref(null);
const clipList = ref([]);
const isProcessing = ref(false);
const progress = ref(0);
const logs = ref(['⏳ 等待加载 FFmpeg 核心组件...']);
const logBoxRef = ref(null);
const targetFormat = ref('ts');
const outputCategory = ref('video');
const fileSizeWarning = ref('');

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

const readyToClip = computed(() => {
  return isFFmpegLoaded.value && videoFile.value && clipList.value.length > 0;
});

watch(outputCategory, (cat) => {
  targetFormat.value = cat === 'video' ? 'ts' : 'm4a';
});

onMounted(() => {
  if (crossOriginIsolated) {
    addLog('✅ 浏览器"跨域隔离"已生效。');
  } else {
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

function downloadBlob(data, filename) {
  const blob = new Blob([data], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const triggerVideoUpload = () => document.getElementById('video-uploader').click();
const triggerTxtUpload = () => document.getElementById('txt-uploader').click();

const handleVideoSelect = (event) => {
  const file = event.target.files[0];
  if (file) {
    videoFile.value = file;
    const sizeMB = file.size / 1024 / 1024;
    addLog(`📂 已选择视频: ${file.name} (${sizeMB.toFixed(1)} MB)`);

    if (sizeMB > 1500) {
      fileSizeWarning.value = `⚠️ 文件 ${sizeMB.toFixed(1)} MB 超过浏览器 WASM 内存上限 (~1.5GB)。建议切换到"口袋48模式"直接拉取直播回放剪切，或使用桌面版软件处理大文件。`;
    } else if (sizeMB > 1400) {
      fileSizeWarning.value = `⚠️ 文件 ${sizeMB.toFixed(1)} MB 接近浏览器内存上限，可能处理失败。建议切换到"口袋48模式"或使用桌面版。`;
    } else {
      fileSizeWarning.value = '';
    }
  }
};

const handleTxtSelect = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target.result;
    const lines = content.split(/\r?\n/);
    let temp = {};
    let count = 0;
    lines.forEach(line => {
      line = line.trim();
      if (!line) return;
      if (line.startsWith('名称:')) {
        temp.name = line.substring(line.indexOf(':') + 1).trim();
      }
      else if (line.startsWith('开始:')) {
        temp.start = line.substring(line.indexOf(':') + 1).trim();
      }
      else if (line.startsWith('结束:')) {
        temp.end = line.substring(line.indexOf(':') + 1).trim();
      }
      if (temp.name && temp.start && temp.end) {
        clipList.value.push({ ...temp });
        temp = {};
        count++;
      }
    });
    if (count > 0) {
        addLog(`📄 成功导入 ${count} 条切片记录。`);
        ElMessage.success(`成功导入 ${count} 条记录！`);
    } else {
        addLog(`⚠️ 文件中未找到有效的切片记录。请检查格式。`);
        ElMessage.warning('未识别到有效记录');
    }
    event.target.value = '';
  };
  reader.readAsText(file);
};

const addEmptyRow = () => clipList.value.push({ name: '', start: '', end: '' });
const removeRow = (index) => clipList.value.splice(index, 1);
const clearList = () => clipList.value = [];

// --- Local Batch Clip ---
const startBatchClip = async () => {
  if (!videoFile.value) return;

  isProcessing.value = true;
  progress.value = 0;

  try {
    addLog('🔄 正在将源文件载入内存...');
    const videoData = await fetchFile(videoFile.value);
    const inputExt = getFileExtension(videoFile.value.name);
    const inputName = 'input' + inputExt;
    await ffmpegMgr.ffmpeg.writeFile(inputName, videoData);
    addLog('✅ 载入完成，开始处理...');

    let completedCount = 0;
    const failedClips = [];

    let recordContent = `--- 批量裁剪记录 ---\n`;
    recordContent += `源文件: ${videoFile.value.name}\n\n`;
    clipList.value.forEach(clip => {
      recordContent += `名称: ${clip.name}\n`;
      recordContent += `开始: ${clip.start}\n`;
      recordContent += `结束: ${clip.end}\n\n`;
    });

    for (let i = 0; i < clipList.value.length; i++) {
      try {
        const clip = clipList.value[i];
        const safeName = clip.name || `clip_${i}`;
        const outExt = '.' + targetFormat.value;
        const outputName = `output_${i}${outExt}`;

        addLog(`✂️ [${i+1}/${clipList.value.length}] 处理: ${safeName} -> ${targetFormat.value.toUpperCase()}`);

        const baseCmd = ['-ss', clip.start, '-i', inputName, '-to', clip.end];
        const isAudio = ['mp3', 'm4a', 'flac', 'wav', 'aac', 'opus', 'ogg'].includes(targetFormat.value);
        const copyable = ['ts', 'mp4', 'mkv', 'avi', 'mov', 'webm', 'm4a'];

        if (copyable.includes(targetFormat.value)) {
          try {
            const copyCmd = isAudio
              ? [...baseCmd, '-vn', '-c:a', 'copy', outputName]
              : [...baseCmd, '-c', 'copy', outputName];
            await ffmpegMgr.ffmpeg.exec(copyCmd);
            await ffmpegMgr.ffmpeg.readFile(outputName);
          } catch {
            addLog(`  ⚠️ copy 失败，回退重编码...`);
            const encArgs = isAudio ? ['-vn', ...getAudioEncoder(targetFormat.value)] : ['-c:v', 'libx264', '-c:a', 'aac'];
            await ffmpegMgr.ffmpeg.exec([...baseCmd, ...encArgs, outputName]);
          }
        } else {
          addLog(`  ⚡ 直接重编码...`);
          const encArgs = isAudio ? ['-vn', ...getAudioEncoder(targetFormat.value)] : ['-c:v', 'libx264', '-c:a', 'aac'];
          await ffmpegMgr.ffmpeg.exec([...baseCmd, ...encArgs, outputName]);
        }

        const data = await ffmpegMgr.ffmpeg.readFile(outputName);
        downloadBlob(data, safeName + outExt);
        await ffmpegMgr.ffmpeg.deleteFile(outputName);
        completedCount++;

        progress.value = Math.round(((i + 1) / clipList.value.length) * 100);
      } catch (e) {
        addLog(`  ❌ 跳过该片段: ${e.message}`);
        failedClips.push({ name: clipList.value[i].name || `clip_${i}`, error: e.message });
        try { await ffmpegMgr.ffmpeg.deleteFile(`output_${i}.${targetFormat.value}`); } catch {}
      }
    }

    await ffmpegMgr.ffmpeg.deleteFile(inputName);

    // ─── 汇总 ───
    if (failedClips.length > 0) {
      addLog(`⚠️ ${failedClips.length} 个片段失败: ${failedClips.map(c => c.name).join(', ')}`);
    }

    if (completedCount === 0) {
      addLog('❌ 没有成功处理的片段');
      ElMessage.error('所有片段处理失败');
    } else {
      downloadBlob(new Blob([recordContent], { type: 'text/plain;charset=utf-8' }), '_clip_record.txt');
      const summary = `🎉 完成！成功 ${completedCount}/${clipList.value.length}`;
      addLog(summary);
      ElMessage.success(summary);
    }

  } catch (err) {
    console.error(err);
    addLog(`❌ 错误: ${err.message}`);
    ElMessage.error('处理出错，报错请看下方日志');
  } finally {
    isProcessing.value = false;
  }
};

// --- Helpers ---
const getFileExtension = (filename) => {
  const idx = filename.lastIndexOf('.');
  return idx >= 0 ? filename.slice(idx) : '';
};

const getAudioEncoder = (format) => {
  switch (format) {
    case 'mp3': return ['-c:a', 'libmp3lame'];
    case 'm4a': case 'aac': return ['-c:a', 'aac'];
    case 'flac': return ['-c:a', 'flac'];
    case 'wav': return ['-c:a', 'pcm_s16le'];
    case 'opus': return ['-c:a', 'libopus'];
    case 'ogg': return ['-c:a', 'libvorbis'];
    default: return ['-c:a', 'aac'];
  }
};
</script>

<style scoped>
.clip-page {
  max-width: 900px;
  margin: 0 auto;
  padding-bottom: 50px;
}
.clip-card {
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
.mode-toggle {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}
.section {
  margin-bottom: 25px;
}
.file-section {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}
.upload-box {
  flex: 1;
  min-width: 300px;
}
.label {
  font-weight: bold;
  margin-bottom: 10px;
  color: #606266;
  display: block;
}
.tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
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
