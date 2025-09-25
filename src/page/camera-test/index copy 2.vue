<template>
  <div class="camera-list">{{ JSON.stringify(cameraList) }}</div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getCameraLabel, getCameras } from '../../utils/html5-qrcode'
import { ElMessage } from 'element-plus'
const cameraList = ref<any[]>([])

onMounted(async () => {
  try {
    let [err, list] = await getCameras()
    if (err) {
      ElMessage.error(list)
      return
    }
    ElMessage.success(JSON.stringify(list))
    if (!list[0].label) {
      const labels = await Promise.all(
        list.map((item: any) => getCameraLabel(item.id)),
      )
      list = list.map((item: any, index: any) => ({
        ...item,
        label: labels[index],
      }))
    }
    cameraList.value = list
  } catch (err) {
    console.error('获取设备信息失败:', err)
  }
})
</script>
<style lang="scss" scoped>
.camera-list {
  width: 100%;
  margin-top: 10px;
  word-break: break-all;
}
</style>
