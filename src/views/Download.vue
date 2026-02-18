<template>
  <div class="download-page">
    <div class="upload-section">
      <el-card class="admin-card" shadow="hover">
        <el-collapse>
          <el-collapse-item name="1">
            <template #title>
              <div class="collapse-title">
                <el-icon><Setting /></el-icon> 管理员上传
              </div>
            </template>
            
            <div class="upload-container">
              <!-- 1. 验证区 -->
              <div class="section">
                <div class="section-header">
                  <el-icon><Lock /></el-icon> <span class="label">验证信息</span>
                </div>
                <div class="form-row">
                  <el-input 
                    v-model="uploadForm.password" 
                    type="password" 
                    placeholder="请输入管理员密码" 
                    show-password 
                    size="large"
                    prefix-icon="Key"
                    class="input-field"
                  />
                  <el-input 
                    v-model="uploadForm.version" 
                    placeholder="版本号 (例如: v1.5)" 
                    size="large"
                    prefix-icon="CollectionTag"
                    class="input-field"
                  />
                </div>
              </div>

              <el-divider border-style="dashed" />

              <!-- 2. 内容区 -->
              <div class="section">
                <div class="section-header">
                  <el-icon><EditPen /></el-icon> <span class="label">更新日志</span>
                </div>
                <el-input 
                  v-model="uploadForm.notes" 
                  type="textarea" 
                  :rows="4" 
                  placeholder="请输入更新内容，多条内容请用分号隔开(中英文均可)&#10;例如：新增功能A；修复问题B" 
                  class="textarea-field"
                />
              </div>

              <el-divider border-style="dashed" />

              <!-- 3. 文件区 -->
              <div class="section">
                <div class="section-header">
                  <el-icon><FolderOpened /></el-icon> <span class="label">APK 文件</span>
                </div>
                
                <div class="file-upload-area">
                  <input 
                    type="file" 
                    ref="fileInput" 
                    accept=".apk" 
                    @change="handleFileChange" 
                    style="display: none" 
                  />
                  
                  <el-button type="primary" plain size="large" @click="$refs.fileInput.click()" class="select-btn">
                    <el-icon><FolderAdd /></el-icon> 选择文件
                  </el-button>

                  <transition name="el-fade-in">
                    <el-tag 
                      v-if="uploadForm.file" 
                      class="file-tag" 
                      closable 
                      @close="clearFile"
                      size="large"
                      type="success"
                    >
                      <el-icon><Document /></el-icon> {{ uploadForm.file.name }}
                    </el-tag>
                  </transition>
                </div>
              </div>

              <!-- 4. 提交按钮 -->
              <div class="actions">
                <el-button 
                  type="success" 
                  size="large" 
                  :loading="uploading" 
                  @click="submitUpload"
                  class="submit-btn"
                  :disabled="!isFormValid"
                >
                  <el-icon><UploadFilled /></el-icon> 
                  {{ uploading ? '正在上传...' : '发布新版本' }}
                </el-button>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </el-card>
    </div>

    <el-card class="info-card">
      <template #header>
        <div class="header-content">
          <span class="title">abm48 APP 下载中心</span>
          <div class="version-tags">
            <el-tag type="info" effect="plain" v-if="totalDownloads !== null" style="margin-right: 10px">
              总下载量: {{ totalDownloads }}
            </el-tag>
            <el-tag type="success" effect="dark" v-if="latestVersion">最新版本: {{ latestVersion.name }}</el-tag>
          </div>
        </div>
      </template>
      
      <div class="intro">
        <p>在这里下载 abm48 的官方安卓客户端(暂时无苹果系统版)。部分成员有显示歌曲切片时间，详情请看导航条的应援站。</p>
      </div>

      <el-timeline v-if="apkList.length > 0">
        <el-timeline-item
          v-for="(apk, index) in apkList"
          :key="index"
          :timestamp="apk.date"
          placement="top"
          :type="index === 0 ? 'primary' : ''"
        >
          <el-card shadow="hover" class="apk-version-card">
            <div class="apk-header">
              <h3 class="apk-name">{{ apk.filename }}</h3>
              <el-button type="primary" :icon="Download" @click="downloadApk(apk.url)">
                点击下载
              </el-button>
            </div>
            
            <div class="apk-notes" v-if="apk.notes && apk.notes.length">
              <div class="note-title">更新说明：</div>
              <ul class="note-list">
                <li v-for="(note, nIdx) in apk.notes" :key="nIdx">{{ note }}</li>
              </ul>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
      <div v-else class="loading-text">
        正在加载版本列表...
      </div>
    </el-card>

    <div class="tips-box">
      <h4>💡 提示</h4>
      <ul>
        <li>如果下载缓慢，请尝试使用浏览器单线程下载或更换网络环境。</li>
        <li>安装时若提示“来源不明”，请在设置中允许通过此来源安装应用。</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  Download, Setting, Lock, Key, CollectionTag, 
  EditPen, FolderOpened, FolderAdd, Document, UploadFilled 
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const apkList = ref([])
const latestVersion = computed(() => apkList.value[0] || null)
const totalDownloads = ref(null)
const uploading = ref(false)
const fileInput = ref(null)
const uploadForm = ref({
  password: '',
  version: '',
  notes: '',
  file: null
})

const isFormValid = computed(() => {
  return uploadForm.value.password && 
         uploadForm.value.version && 
         uploadForm.value.file
})

// 加载版本列表
const fetchVersions = async () => {
  try {
    const response = await fetch(`/apks/abm48/version.json?t=${Date.now()}`)
    if (response.ok) {
      apkList.value = await response.json()
    }
    
    // 加载下载统计
    const statsRes = await fetch(`/apks/abm48/stats.json?t=${Date.now()}`)
    if (statsRes.ok) {
      const stats = await statsRes.json()
      totalDownloads.value = stats.total_downloads || 0
    }
  } catch (error) {
    console.error('Failed to load version list:', error)
  }
}

onMounted(() => {
  fetchVersions()
})

const downloadApk = (url) => {
  // 1. 前端手动 +1 (即时反馈)
  if (totalDownloads.value !== null) {
    totalDownloads.value++
  }
  
  // 2. 后台请求计数
  fetch('/apks/abm48/count.php', { method: 'POST' }).catch(err => console.error(err))
  
  // 3. 开始下载
  window.open(url, '_blank')
}

const handleFileChange = (event) => {
  if (event.target.files.length > 0) {
    uploadForm.value.file = event.target.files[0]
  }
}

const clearFile = () => {
  uploadForm.value.file = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const submitUpload = async () => {
  if (!uploadForm.value.password || !uploadForm.value.version || !uploadForm.value.file) {
    ElMessage.warning('请填写完整信息')
    return
  }

  const formData = new FormData()
  formData.append('password', uploadForm.value.password)
  formData.append('version', uploadForm.value.version)
  formData.append('notes', uploadForm.value.notes)
  formData.append('file', uploadForm.value.file)

  uploading.value = true
  try {
    const response = await fetch('/apks/abm48/upload.php', {
      method: 'POST',
      body: formData
    })
    
    const result = await response.json()
    if (response.ok && result.success) {
      ElMessage.success('上传成功')
      // 重置表单
      uploadForm.value.version = ''
      uploadForm.value.notes = ''
      clearFile()
      // 刷新列表
      await fetchVersions()
    } else {
      ElMessage.error(result.error || '上传失败')
    }
  } catch (error) {
    ElMessage.error('网络错误或服务器异常')
    console.error(error)
  } finally {
    uploading.value = false
  }
}
</script>

<style scoped>
.download-page {
  animation: fadeIn 0.5s ease-out;
}

.info-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #303133;
}

.intro {
  margin-bottom: 30px;
  color: #606266;
  line-height: 1.6;
}

.apk-version-card {
  margin-bottom: 20px;
  border-left: 4px solid #409EFF;
}

.apk-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 10px;
}

.apk-name {
  margin: 0;
  font-size: 1.2rem;
  color: #303133;
}

.apk-notes {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
}

.note-title {
  font-weight: bold;
  margin-bottom: 8px;
  color: #409EFF;
}

.note-list {
  margin: 0;
  padding-left: 20px;
  color: #606266;
}

.note-list li {
  margin-bottom: 5px;
}

.loading-text {
  text-align: center;
  color: #909399;
  padding: 20px;
}

.upload-section {
  margin-bottom: 30px;
}

.admin-card {
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #e4e7ed;
}

.admin-card :deep(.el-collapse-item__header) {
  padding: 10px;
  font-size: 16px;
  border-bottom-color: #ebeef5;
}

.collapse-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
  font-size: 16px;
  color: #303133;
}

.upload-container {
  padding: 10px;
}

.section {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: #606266;
  font-weight: 600;
  font-size: 15px;
}

.form-row {
  display: flex;
  gap: 15px;
}

.input-field {
  flex: 1;
}

.textarea-field :deep(.el-textarea__inner) {
  font-family: monospace;
}

.file-upload-area {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.select-btn {
  font-weight: 500;
}

.file-tag {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 12px;
  height: auto;
}

.actions {
  margin-top: 30px;
  text-align: center;
}

.submit-btn {
  width: 100%;
  max-width: 300px;
  font-weight: bold;
  height: 44px;
  font-size: 16px;
  letter-spacing: 1px;
}

.tips-box {
  margin-top: 30px;
  padding: 20px;
  background: rgba(255, 244, 224, 0.8);
  border-radius: 12px;
  border: 1px solid #ffd04b;
}

.tips-box h4 {
  margin-top: 0;
  color: #e6a23c;
}

.tips-box ul {
  margin: 0;
  padding-left: 20px;
  color: #8a6d3b;
}

/* 手机端响应式样式 */
@media (max-width: 768px) {
  .apk-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .apk-name {
    margin-bottom: 10px;
    width: 100%;
  }
  
  .el-button {
    width: 100%;
    justify-content: center;
  }

  .form-row {
    flex-direction: column;
    gap: 15px;
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>