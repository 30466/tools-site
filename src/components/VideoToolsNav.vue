<template>
  <div class="video-tools-nav">
    <el-radio-group v-model="currentTab" size="large" @change="handleTabChange">
      <el-radio-button label="/clip">
        <el-icon><Scissor /></el-icon> 批量剪切
      </el-radio-button>
      <el-radio-button label="/transcode">
        <el-icon><Refresh /></el-icon> 批量转码
      </el-radio-button>
      <el-radio-button label="/merge">
        <el-icon><Connection /></el-icon> 合并媒体
      </el-radio-button>
    </el-radio-group>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Scissor, Refresh, Connection } from '@element-plus/icons-vue';

const router = useRouter();
const route = useRoute();
const currentTab = ref('/clip');

// Sync state with current route
const syncTab = () => {
  if (['/clip', '/transcode', '/merge'].includes(route.path)) {
    currentTab.value = route.path;
  }
};

onMounted(syncTab);
watch(() => route.path, syncTab);

const handleTabChange = (val) => {
  router.push(val);
};
</script>

<style scoped>
.video-tools-nav {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}
</style>
