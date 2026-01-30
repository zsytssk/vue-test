<template>
  <div>
    <div class="camera">
      <video id="video" ref="videoRef">Video stream not available.</video>
      <div></div>
      <div class="btn-box">
        <button id="start-button" @click="getCameras">Camera list</button>
        <button id="start-button" @click="openCamera">Capture photo</button>
        <button id="start-button" @click="takePicture">Take Picture</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const videoRef = ref<HTMLVideoElement>()
const openCamera = () => {
  navigator.mediaDevices
    .getUserMedia({
      video: {
        facingMode: { ideal: 'environment' }, // 后置摄像头
      },
      audio: false,
    })
    .then((stream) => {
      if (!videoRef.value) {
        return
      }
      videoRef.value.srcObject = stream
      videoRef.value.play()
    })
    .catch((err) => {
      console.error(`An error occurred: ${err}`)
    })
}
const takePicture = () => {
  if (!videoRef.value) {
    return
  }
  const width = videoRef.value.videoWidth || 0
  const height = videoRef.value.videoHeight || 0
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return
  }
  ctx.drawImage(videoRef.value, 0, 0, width, height)
  const dataURL = canvas.toDataURL('image/jpeg', 0.7)

  const link = document.createElement('a')
  link.href = dataURL
  link.download = `test.jpg`
  link.click()
  URL.revokeObjectURL(link.href)
}

const getCameras = async () => {
  const cameras = await getCameraList()
  console.log(`test:>cameras`, cameras)
}

async function getCameraList() {
  try {
    // 1. 检查浏览器兼容性
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      return []
    }

    await navigator.mediaDevices.getUserMedia({ video: true })
    const devices = await navigator.mediaDevices.enumerateDevices()
    const cameras = devices.filter((device) => device.kind === 'videoinput')
    // 5. 格式化返回数据（便于使用）
    return cameras.map((camera) => ({
      deviceId: camera.deviceId, // 设备唯一ID（可用于指定摄像头采集）
      label: camera.label || `摄像头 ${cameras.indexOf(camera) + 1}`, // 设备名（无权限时显示默认名）
      kind: camera.kind, // 固定为 "videoinput"
    }))
  } catch (err) {
    // 处理权限拒绝/设备无摄像头等异常
    if ((err as any).name === 'NotAllowedError') {
      console.error('用户拒绝了摄像头权限，无法获取摄像头列表')
    } else if ((err as any).name === 'NotFoundError') {
      console.error('当前设备未检测到摄像头')
    } else {
      console.error('获取摄像头列表失败：', (err as any).message)
    }
    return []
  }
}
</script>

<style lang="scss" scoped>
.camera {
  width: 100%;
  display: flex;
  flex-direction: column;
  #video {
    width: 100%;
    height: 400px;
  }
  .btn-box {
    display: flex;
    justify-content: center;
    gap: 16px;
  }
}
</style>
