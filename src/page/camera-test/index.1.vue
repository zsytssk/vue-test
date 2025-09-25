<template>
  <div class="camera-list">{{ JSON.stringify(cameraId) }}</div>
  <div class="camera-list">{{ JSON.stringify(cameraList) }}</div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
const cameraList = ref<any[]>([])
const cameraId = ref({})
async function getCameraDetails(deviceId: any) {
  // 请求特定摄像头
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { deviceId: { exact: deviceId } },
  })

  const track = stream.getVideoTracks()[0]

  // 支持的参数范围（能力）
  const capabilities = track.getCapabilities()

  // 当前正在使用的参数
  const settings = track.getSettings()
  cameraId.value = {
    capabilities,
    settings,
    label: track.label,
  }
  console.log('能力 (capabilities):', capabilities)
  console.log('当前设置 (settings):', settings)

  // 结束使用
  track.stop()
}

onMounted(async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()

    const cameras = devices.filter((device) => device.kind === 'videoinput')
    cameras.forEach((camera, index) => {
      console.log(`摄像头 ${index + 1}:`)
      console.log('  设备ID:', camera.deviceId)
      console.log('  标签:', camera.label || '权限未授权前不可见')
      console.log('  类型:', camera.kind)
      console.log('  分组ID:', camera.groupId)
      cameraList.value.push({
        deviceId: camera.deviceId,
        label: camera.label,
        kind: camera.kind,
        groupId: camera.groupId,
      })
    })
    getCameraDetails(cameras[0]?.deviceId)
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
