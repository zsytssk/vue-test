<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { getCameraId, scanCode, stopScan } from '../utils/html5-qrcode'

const resultRef = ref<HTMLDivElement>()
defineProps<{}>()

const videoRef = ref<HTMLVideoElement>()
const start = async () => {
  const [err, cameraId] = await getCameraId()

  if (err) {
    console.error(cameraId)
    return
  }
  const [err2, str2] = await scanCode(cameraId, 'reader')
  if (err2) {
    console.error(str2)
    return
  }
  if (resultRef.value) {
    resultRef.value.innerHTML = str2
  }
}
const stop = () => {
  stopScan()
}

onMounted(() => {
  if (!videoRef.value) {
    return
  }
})
</script>

<template>
  <div id="reader"></div>
  <div ref="resultRef"></div>
  <div class="card">
    <button
      type="button"
      @click="start">
      start
    </button>
    <button
      type="button"
      @click="stop">
      stop
    </button>
  </div>
</template>

<style scoped>
#reader {
  background: #fff;
  width: 600px;
  height: 600px;
}
.card {
  display: flex;
  justify-content: center;
  gap: 10px;
}
</style>
