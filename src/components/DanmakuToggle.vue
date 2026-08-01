<template>
  <div class="danmaku-settings">
    <div class="danmaku-toggle">
      <el-switch
        v-model="model"
        :disabled="disabled"
        size="large"
        active-text="嵌入弹幕"
        inactive-text="嵌入弹幕"
      />
      <span class="toggle-desc">将录播弹幕滚动烧录到视频画面中（会增加处理时间）</span>
    </div>

    <div v-if="model && !disabled" class="danmaku-options">
      <div class="option-row duration-slider">
        <span class="label">弹幕时长:</span>
        <el-slider
          v-model="durationModel"
          :min="8"
          :max="15"
          :step="1"
          show-stops
          class="duration-control"
        />
        <span class="slider-tip">{{ durationModel }}s (值小速度快)</span>
      </div>

      <div class="option-row">
        <span class="label">弹幕数量:</span>
        <el-segmented v-model="limitModel" :options="limitOptions" size="small" />
      </div>

      <div class="option-row">
        <span class="label">编码速度:</span>
        <el-select v-model="presetModel" size="small" class="preset-select">
          <el-option label="时间快文件大 (ultrafast)" value="ultrafast" />
          <el-option label="时间慢文件小 (superfast)" value="superfast" />
        </el-select>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  duration: { type: Number, default: 12 },
  maxCount: { type: [String, Number], default: 'all' },
  preset: { type: String, default: 'ultrafast' },
  disabled: { type: Boolean, default: false }
})

const emit = defineEmits([
  'update:modelValue',
  'update:duration',
  'update:maxCount',
  'update:preset'
])

const limitOptions = [
  { label: '50', value: 50 },
  { label: '100', value: 100 },
  { label: '全部', value: 'all' }
]

const model = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const durationModel = computed({
  get: () => props.duration,
  set: (v) => emit('update:duration', v)
})

const limitModel = computed({
  get: () => props.maxCount,
  set: (v) => emit('update:maxCount', v)
})

const presetModel = computed({
  get: () => props.preset,
  set: (v) => emit('update:preset', v)
})
</script>

<style scoped>
.danmaku-settings {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}
.danmaku-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.toggle-desc {
  font-size: 12px;
  color: #909399;
}
.danmaku-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-left: 5px;
}
.option-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.label {
  font-weight: bold;
  font-size: 14px;
  white-space: nowrap;
}
.duration-control {
  width: 140px;
}
.slider-tip {
  font-size: 12px;
  color: #909399;
}
.preset-select {
  width: 220px;
}
@media (max-width: 600px) {
  .option-row {
    align-items: flex-start;
  }
  .preset-select {
    width: 100%;
  }
}
</style>
