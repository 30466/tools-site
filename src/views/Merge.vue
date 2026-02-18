<template>
  <div class="merge-page">
    <VideoToolsNav />
    
    <el-card class="merge-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span class="header-title">🔗 媒体文件合并 (Concat)</span>
            <el-tag type="warning" effect="plain" round size="small" style="margin-left: 10px">Beta</el-tag>
          </div>
    
          <div class="header-right">
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
          <div class="label">1. 添加要合并的文件 (需相同格式)</div>
          <input 
            type="file" 
            id="merge-uploader" 
            accept=".mp4,.mkv,.ts,.flv,.mov,.avi,.webm,.mp3,.wav,.aac,.flac,.m4a,.opus" 
            multiple
            @change="handleFileSelect" 
            style="display: none"
          />
          <el-button type="primary" plain size="large" @click="triggerFileUpload">
            <el-icon><Plus /></el-icon> 
            添加文件到列表
          </el-button>
          <span class="tip" style="margin-left: 10px">
            已添加 {{ fileList.length }} 个文件 
            <span :style="{ color: totalSize > 2 * 1024 * 1024 * 1024 ? '#F56C6C' : (totalSize > 1.5 * 1024 * 1024 * 1024 ? '#E6A23C' : '#67C23A') }">
              (总大小: {{ (totalSize / 1024 / 1024).toFixed(2) }} MB)
            </span>
          </span>
        </div>
      </div>

      <el-divider />

      <!-- 2. 文件列表区 (支持排序) -->
      <div class="section list-section">
        <div class="list-header">
          <div class="label">合并顺序 (拖拽调整)</div>
          <div class="list-actions">
            <el-button size="small" type="danger" plain @click="clearList" :disabled="fileList.length === 0">🗑️ 清空列表</el-button>
          </div>
        </div>

        <el-table 
          :data="fileList" 
          style="width: 100%" 
          border 
          stripe 
          max-height="400"
          row-key="name"
          class="merge-table"
        >
          <el-table-column width="50" align="center">
            <template #default>
              <el-icon class="drag-handle" style="cursor: move; font-size: 18px; color: #909399;"><Rank /></el-icon>
            </template>
          </el-table-column>
          
          <el-table-column label="文件名" prop="name" min-width="200" show-overflow-tooltip />
          <el-table-column label="大小" width="100">
            <template #default="scope">
              {{ (scope.row.size / 1024 / 1024).toFixed(2) }} MB
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80" align="center">
            <template #default="scope">
              <el-button type="danger" link @click="removeFile(scope.$index)">
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
            <span class="label">输出文件名:</span>
            <el-input v-model="outputName" placeholder="merged" style="width: 200px">
              <template #append>.{{ targetExt }}</template>
            </el-input>
          </div>

          <div class="setting-item">
            <span class="label">模式:</span>
            <el-tag type="success">Copy Stream (极速/无损)</el-tag>
            <div class="tip" style="margin-left: 10px; font-size: 12px; color: #E6A23C">
              注意: 要求所有输入文件的分辨率、编码、帧率完全一致！
            </div>
          </div>
        </div>

        <div class="action-btn">
          <el-button 
            type="primary" 
            size="large" 
            class="start-btn" 
            :loading="isProcessing"
            :disabled="!readyToStart"
            @click="startMerge"
          >
            <el-icon class="el-icon--left"><Connection /></el-icon>
            {{ isProcessing ? `合并中...` : '开始合并并下载' }}
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
import { ref, computed, onMounted, nextTick, onBeforeUnmount } from 'vue';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Delete, Connection, Link, Rank } from '@element-plus/icons-vue';
import VideoToolsNav from '@/components/VideoToolsNav.vue';
import Sortable from 'sortablejs';

// --- 状态变量 ---
const ffmpeg = new FFmpeg();
const fileList = ref([]);
const outputName = ref('merged_output');
const isProcessing = ref(false);
const logs = ref(['⏳ 等待加载 FFmpeg 核心组件...']);
const logBoxRef = ref(null);
const isFFmpegLoaded = ref(false);
const selectedRow = ref(null);

// --- 计算属性 ---
const totalSize = computed(() => {
  return fileList.value.reduce((acc, item) => acc + item.size, 0);
});

const targetExt = computed(() => {
  if (fileList.value.length > 0) {
    const firstName = fileList.value[0].name;
    const ext = firstName.slice((firstName.lastIndexOf(".") - 1 >>> 0) + 2) || 'mp4';
    // 如果是 aac，建议显示为 m4a 容器
    return ext.toLowerCase() === 'aac' ? 'm4a' : ext;
  }
  return 'mp4';
});

const readyToStart = computed(() => {
  return isFFmpegLoaded.value && fileList.value.length >= 2;
});

// --- 初始化 FFmpeg ---
onMounted(async () => {
  // 1. 初始化拖拽排序
  initSortable();

  try {
    if (!window.crossOriginIsolated) {
      addLog('⚠️ 警告: 浏览器“跨域隔离”未生效！(SharedArrayBuffer 不可用)');
    }

    const baseURL = '/ffmpeg';
    addLog(`🔍 正在加载核心文件...`);

    ffmpeg.on('log', ({ message }) => {
      // addLog(`[FFmpeg] ${message}`);
    });

    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    isFFmpegLoaded.value = true;
    addLog('✅ FFmpeg 组件加载完成！准备就绪。');
    
  } catch (error) {
    console.error(error);
    addLog(`❌ FFmpeg 加载失败: ${error.message}`);
  }
});

// --- 拖拽排序逻辑 ---
const initSortable = () => {
  const table = document.querySelector('.merge-table .el-table__body-wrapper tbody');
  if (table) {
    Sortable.create(table, {
      handle: '.drag-handle', // 指定只有按住这个图标才能拖拽 (如果想整行拖拽，去掉这行即可)
      animation: 150,
      onEnd: ({ newIndex, oldIndex }) => {
        // 同步数据
        const targetRow = fileList.value.splice(oldIndex, 1)[0];
        fileList.value.splice(newIndex, 0, targetRow);
      },
    });
  }
};

// --- 文件操作 ---
const triggerFileUpload = () => document.getElementById('merge-uploader').click();

const handleFileSelect = (event) => {
  const files = event.target.files;
  if (!files.length) return;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    fileList.value.push({
      file: file,
      name: file.name,
      size: file.size
    });
    addLog(`📂 添加文件: ${file.name}`);
  }
  event.target.value = '';
};

const removeFile = (index) => {
  fileList.value.splice(index, 1);
};

const clearList = () => {
  fileList.value = [];
  addLog('🗑️ 列表已清空');
};

// --- 列表排序 (旧逻辑已废弃，Sortable接管) ---
/*
const handleCurrentChange = (val) => {
  selectedRow.value = val;
};

const moveUp = () => { ... };
const moveDown = () => { ... };
*/


// --- 核心合并逻辑 ---
const startMerge = async () => {
  if (fileList.value.length < 2) {
    ElMessage.warning('请至少添加两个文件');
    return;
  }

  // 0. 检查文件后缀一致性
  const getExt = (name) => name.slice((name.lastIndexOf(".") - 1 >>> 0) + 2).toLowerCase();
  const firstExt = getExt(fileList.value[0].name);
  
  const isConsistent = fileList.value.every(file => getExt(file.name) === firstExt);
  
  if (!isConsistent) {
    const msg = '检测到文件后缀不统一！合并模式要求所有文件格式必须完全一致。';
    addLog(`❌ ${msg}`);
    await ElMessageBox.alert(msg, '格式错误', {
      confirmButtonText: '确定',
      type: 'error'
    });
    return;
  }

  // 内存检查
  if (totalSize.value > 2 * 1024 * 1024 * 1024) {
    const msg = '当前文件总大小已超过 2GB，极大概率会导致浏览器崩溃。请务必使用桌面版软件进行合并！';
    addLog(`❌ 内存超限警告: 总大小 ${(totalSize.value / 1024 / 1024 / 1024).toFixed(2)} GB`);
    await ElMessageBox.alert(
      msg, 
      '内存超限警告', 
      { type: 'error', confirmButtonText: '确定' }
    );
    // 强制停止，防止崩愤
    return; 
  }
  
  isProcessing.value = true;
  
  try {
    addLog('🚀 开始合并任务...');
    let concatList = '';

    // 1. 写入所有文件到虚拟内存
    for (let i = 0; i < fileList.value.length; i++) {
      const item = fileList.value[i];
      // 使用纯 ASCII 文件名避免 FFmpeg 内部编码问题
      const inputExt = item.name.slice((item.name.lastIndexOf(".") - 1 >>> 0) + 2);
      const safeName = `input_${i}.${inputExt || 'dat'}`;
      
      addLog(`Writing file: ${item.name} -> ${safeName}`);
      const fileData = await fetchFile(item.file);
      await ffmpeg.writeFile(safeName, fileData);

      // 构建 concat 列表格式: file 'filename'
      concatList += `file '${safeName}'\n`;
    }

    // 2. 写入 concat.txt
    await ffmpeg.writeFile('concat.txt', concatList);
    addLog('📝 生成 concat.txt 列表文件');

    // 3. 执行合并命令 (使用 concat demuxer)
    const outFileName = `${outputName.value}.${targetExt.value}`;
    const cmd = [
      '-f', 'concat',
      '-safe', '0',
      '-i', 'concat.txt',
      '-c', 'copy',
      outFileName
    ];

    addLog(`⚙️ 执行 FFmpeg 命令: ffmpeg ${cmd.join(' ')}`);
    await ffmpeg.exec(cmd);

    // 4. 读取并下载结果
    addLog('📦 读取输出文件...');
    const data = await ffmpeg.readFile(outFileName);
    
    const blob = new Blob([data.buffer], { type: 'video/mp4' }); // 类型其实不重要，浏览器会自动识别
    const downloadUrl = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = outFileName;
    link.click();

    addLog('🎉 合并完成！已开始下载。');
    ElMessage.success('合并成功！');

    // 5. 清理
    await ffmpeg.deleteFile('concat.txt');
    await ffmpeg.deleteFile(outFileName);
    for (let i = 0; i < fileList.value.length; i++) {
        await ffmpeg.deleteFile(`input_${i}.${targetExt.value}`);
    }

  } catch (err) {
    console.error(err);
    addLog(`❌ 合并失败: ${err.message}`);
    ElMessageBox.alert('合并过程发生错误，可能是文件格式不一致导致。', '错误', { type: 'error' });
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
</script>

<style scoped>
.merge-page {
  max-width: 900px;
  margin: 0 auto;
  padding-bottom: 50px;
}

.merge-card {
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
