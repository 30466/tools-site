<template>
  <div class="clip-page">
    <VideoToolsNav />
    
    <el-card class="clip-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span class="header-title">✂️ 导入切片本批量剪切 (Web版)</span>
            <el-tag type="warning" effect="plain" round size="small" style="margin-left: 10px">Beta</el-tag>
          </div>
    
          <!-- 新增：右侧的外链按钮 -->
          <div class="header-right">
            <a href="https://gitee.com/albert-chen04/video-editing-toolkit" target="_blank" class="project-link">
              <el-button type="primary" link>
                <el-icon style="margin-right: 4px"><Link /></el-icon>
                剪辑软件项目地址 (功能更多)
              </el-button>
            </a>
          </div>
        </div>
      </template>

      <!-- 1. 文件选择区 -->
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

      <!-- 2. 剪辑列表区 -->
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

      <!-- 3. 设置与控制区 -->
      <div class="section control-section">
        <div class="settings">
    
          <!-- 【新增】输出格式选择 -->
          <div class="setting-item">
            <span class="label">输出格式:</span>
            <el-select v-model="targetFormat" placeholder="选择格式" style="width: 120px" size="large">
              <el-option label="MP4" value="mp4" />
              <el-option label="M4A (推荐)" value="m4a" />
              <el-option label="MP3 (音频)" value="mp3" />
              <el-option label="WAV (无损音频)" value="wav" />
              <el-option label="AAC (音频)" value="aac" />
              <el-option label="FLAC (无损音频)" value="flac" />
              <el-option label="MKV" value="mkv" />
              <el-option label="TS" value="ts" />
            </el-select>
          </div>

          <!-- 剪辑模式 (根据格式自动调整，用户选了音频格式就不用管这个了) -->
          <div class="setting-item">
            <span class="label">处理模式:</span>
            <el-radio-group v-model="clipMode">
              <el-radio label="copy" border>🚀 极速 (Copy流)</el-radio>
              <el-radio label="encode" border :disabled="!isAudioTarget">兼容 (重编码)</el-radio>
            </el-radio-group>
          </div>
        </div>

        <div class="action-btn">
          <el-button 
            type="primary" 
            size="large" 
            class="start-btn" 
            :loading="isProcessing"
            :disabled="!readyToClip"
            @click="startBatchClip"
          >
            <el-icon class="el-icon--left"><Scissor /></el-icon>
            {{ isProcessing ? `处理中 (${progress}%)` : '开始批量处理并下载' }}
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
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import JSZip from 'jszip';
import { ElMessage, ElMessageBox } from 'element-plus';
import { VideoPlay, Document, Delete, Scissor, Link } from '@element-plus/icons-vue';
import VideoToolsNav from '@/components/VideoToolsNav.vue';

// --- 状态变量 ---
const ffmpeg = new FFmpeg();
const videoFile = ref(null);
const clipList = ref([]);
const clipMode = ref('copy');
const isProcessing = ref(false);
const progress = ref(0);
const logs = ref(['⏳ 等待加载 FFmpeg 核心组件...']);
const logBoxRef = ref(null);
const isFFmpegLoaded = ref(false);
const targetFormat = ref('mp4');

// --- 计算属性 ---
// 【新增】判断目标是否为音频格式
const isAudioTarget = computed(() => {
  return ['mp3', 'wav', 'aac', 'flac', 'opus', 'm4a'].includes(targetFormat.value);
});

const readyToClip = computed(() => {
  return isFFmpegLoaded.value && videoFile.value && clipList.value.length > 0;
});

// --- 监听器 ---
// 当目标格式变化时，自动调整模式以避免错误配置
watch(targetFormat, (newVal) => {
  // 需要重编码的格式
  if (['mp3', 'wav', 'flac', 'opus', 'aac'].includes(newVal)) {
    clipMode.value = 'encode';
  } else {
    // 容器格式
    clipMode.value = 'copy';
  }
});

// --- 初始化 FFmpeg ---
onMounted(async () => {
  try {
    // 1. 先在日志里检测一下环境
    if (!window.crossOriginIsolated) {
      addLog('⚠️ 警告: 浏览器“跨域隔离”未生效！(SharedArrayBuffer 不可用)');
      addLog('这会导致 FFmpeg 无法启动。请检查 Nginx 配置是否生效。');
    } else {
      addLog('✅ 浏览器“跨域隔离”已生效。');
    }

    // 2. 检查文件路径 (这一步是为了排查 404)
    const baseURL = '/ffmpeg'; // 对应服务器上的 /www/wwwroot/tools.abm48.com/ffmpeg
    addLog(`🔍 正在尝试加载核心文件，路径: ${baseURL}/ffmpeg-core.js`);

    // 监听日志
    ffmpeg.on('log', ({ message }) => {
      if (!message.startsWith('frame=')) {
        addLog(`[FFmpeg内核] ${message}`);
      }
    });

    ffmpeg.on('progress', ({ progress: p }) => {
      // 进度条逻辑
    });

    // 3. 加载核心文件
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    isFFmpegLoaded.value = true;
    addLog('✅ FFmpeg 组件加载完成！准备就绪。');
    
  } catch (error) {
    console.error(error); // 依然在控制台打印一份，以防万一
    
    // 【核心修改】把错误详情显示在网页上
    addLog('❌ FFmpeg 加载致命错误！');
    
    if (error.message) {
      addLog(`错误信息: ${error.message}`);
    } else {
      addLog(`错误对象: ${JSON.stringify(error)}`);
    }

    // 针对 failed to import 的专项提示
    if (error.message && error.message.includes('failed to import')) {
      addLog('💡 推测原因: 找不到 ffmpeg-core.js 文件 (404) 或者文件内容损坏。');
      addLog('请尝试在浏览器直接访问: https://tools.abm48.com/ffmpeg/ffmpeg-core.js 看能否打开。');
    }
  }
});

// --- 文件操作 ---
const triggerVideoUpload = () => document.getElementById('video-uploader').click();
const triggerTxtUpload = () => document.getElementById('txt-uploader').click();

const handleVideoSelect = (event) => {
  const file = event.target.files[0];
  if (file) {
    videoFile.value = file;
    addLog(`📂 已选择视频: ${file.name} (${(file.size/1024/1024).toFixed(1)} MB)`);
  }
};

// --- 修改后的 handleTxtSelect ---
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

      // 【核心修改】
      // 不再使用 split(':')，而是手动查找第一个冒号的位置
      // 这样可以完美支持 "4:18" 或 "01:20:30" 这种带多个冒号的时间格式
      if (line.startsWith('名称:')) {
        temp.name = line.substring(line.indexOf(':') + 1).trim();
      } 
      else if (line.startsWith('开始:')) {
        temp.start = line.substring(line.indexOf(':') + 1).trim();
      } 
      else if (line.startsWith('结束:')) {
        temp.end = line.substring(line.indexOf(':') + 1).trim();
      }

      // 当收集齐三个要素时，添加到列表
      if (temp.name && temp.start && temp.end) {
        // 做一个深拷贝，防止引用问题
        clipList.value.push({ ...temp });
        // 清空 temp 准备读取下一组
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
    
    event.target.value = ''; // 重置 input，允许重复选择同一个文件
  };
  reader.readAsText(file);
};

// --- 列表操作 ---
const addEmptyRow = () => clipList.value.push({ name: '', start: '', end: '' });
const removeRow = (index) => clipList.value.splice(index, 1);
const clearList = () => clipList.value = [];

// --- 核心剪辑逻辑 (更新版) ---
const startBatchClip = async () => {
  if (!videoFile.value) return;
  
  isProcessing.value = true;
  progress.value = 0;
  const zip = new JSZip();
  const outputFolder = zip.folder("clips");

  try {
    addLog('🔄 正在将源文件载入内存...');
    const videoData = await fetchFile(videoFile.value);
    const inputExt = getFileExtension(videoFile.value.name);
    const inputName = 'input' + inputExt;
    await ffmpeg.writeFile(inputName, videoData);
    addLog('✅ 载入完成，开始处理...');

    // 循环处理
    for (let i = 0; i < clipList.value.length; i++) {
      const clip = clipList.value[i];
      // const safeName = clip.name.replace(/[\\/*?:"<>|]/g, "_") || `clip_${i}`;
      // 这里 safeName 仅用于最终 ZIP 里的文件名，不影响 FFmpeg 内部命令，因此可以使用 utf-8
      const safeName = clip.name || `clip_${i}`;
      
      // 使用用户选择的后缀名
      const outExt = '.' + targetFormat.value;
      // FFmpeg 内部输出使用纯 ASCII
      const outputName = `output_${i}${outExt}`;
      
      addLog(`✂️ [${i+1}/${clipList.value.length}] 处理: ${safeName} -> ${targetFormat.value.toUpperCase()}`);
      
      // --- 构建 FFmpeg 命令 ---
      let cmd = [
        '-ss', clip.start,
        '-to', clip.end,
        '-i', inputName
      ];

      // 根据目标格式决定参数
      if (isAudioTarget.value) {
        // === 导出音频 ===
        cmd.push('-vn'); // 去除视频流
        
        // 如果用户强制选了 copy 模式，直接 copy
        if (clipMode.value === 'copy') {
             cmd.push('-c:a', 'copy');
        } else {
            // 简单的音频编码映射
            switch (targetFormat.value) {
              case 'mp3': cmd.push('-c:a', 'libmp3lame'); break; // MP3编码器
              case 'm4a': cmd.push('-c:a', 'aac'); break;        // M4A编码器
              case 'aac': cmd.push('-c:a', 'aac'); break;        // AAC编码器
              case 'wav': cmd.push('-c:a', 'pcm_s16le'); break;  // WAV无损
              case 'flac': cmd.push('-c:a', 'flac'); break;      // FLAC无损
              default: cmd.push('-c:a', 'copy'); break; // 尝试直接复制
            }
        }
      } else {
        // === 导出视频 ===
        // 浏览器端强烈建议使用 copy，否则非常慢
        cmd.push('-c', 'copy'); 
        
        // 特殊情况：如果是 ts 转 mp4，copy 也就是重新封装(remux)，速度很快且兼容性好
      }

      cmd.push(outputName);

      // 执行命令
      await ffmpeg.exec(cmd);

      // 读取并存入 ZIP
      try {
        const data = await ffmpeg.readFile(outputName);
        outputFolder.file(`${safeName}${outExt}`, data);
        await ffmpeg.deleteFile(outputName);
      } catch (readErr) {
        addLog(`❌ 读取输出文件失败: ${readErr.message}`);
        // 如果失败可能是时间范围不对导致没生成文件
        continue;
      }
      
      progress.value = Math.round(((i + 1) / clipList.value.length) * 100);
    }


    // --- 【新增】生成和 Python 软件一模一样的 TXT 记录文件 ---
    addLog('📝 正在生成切片记录文件...');
    let recordContent = `--- 批量裁剪记录 ---\n`;
    recordContent += `源文件: ${videoFile.value.name}\n\n`;
    
    clipList.value.forEach(clip => {
      recordContent += `名称: ${clip.name}\n`;
      recordContent += `开始: ${clip.start}\n`;
      recordContent += `结束: ${clip.end}\n\n`;
    });
    
    // 将 TXT 文件加入到 ZIP 的根目录 (或者 outputFolder 里，看你喜好)
    // 这里放入 clips 文件夹同级，或者放入 clips 文件夹内部
    outputFolder.file("_clip_record.txt", recordContent);

    // --- 打包下载 ---
    addLog('📦 正在打包 ZIP 文件...');
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const downloadUrl = URL.createObjectURL(zipBlob);
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `Clips_${new Date().toISOString().slice(0,10)}.zip`;
    link.click();

    addLog('🎉 全部完成！');
    ElMessage.success('处理完成，已开始下载！');

    await ffmpeg.deleteFile(inputName);

  } catch (err) {
    console.error(err);
    addLog(`❌ 错误: ${err.message}`);
    ElMessageBox.alert('处理出错，请检查日志。', '错误', { type: 'error' });
  } finally {
    isProcessing.value = false;
  }
};

// --- 辅助函数 ---
const addLog = (msg) => {
  logs.value.push(msg);
  nextTick(() => {
    if (logBoxRef.value) logBoxRef.value.scrollTop = logBoxRef.value.scrollHeight;
  });
};

const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2) ? "." + filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2) : "";
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
  flex-wrap: wrap; /* 防止手机端挤压 */
}

.header-left {
  display: flex;
  align-items: center;
}

.header-right {
  margin-left: auto; /* 靠右对齐 */
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
  gap: 20px; /* 增加间距 */
  flex-wrap: wrap;
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>