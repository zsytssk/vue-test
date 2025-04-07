<script setup lang="ts">
import { onMounted, ref } from 'vue'

import {
  getCameraId,
  scanCode,
  scanFile,
  stopScan,
} from '../utils/html5-qrcode'

defineProps<{}>()
defineOptions({ name: 'HTML5-Qrcode' })

const resultRef = ref<HTMLDivElement>()
const inputFile = ref<HTMLVideoElement>()
const startScanCamera = async () => {
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

const uploadFile = () => {
  return new Promise<[boolean, string | File]>((resolve) => {
    const inputEle = inputFile.value
    if (!inputEle) {
      return resolve([true, 'cant find input ele for upload!'] as const)
    }
    const fn = (event: any) => {
      const files = event.target?.files

      if (files.length > 0) {
        inputEle.removeEventListener('change', fn)
        return resolve([false, files[0]] as const)
      } else {
        console.log('没有文件被选择')
      }
    }

    inputEle.addEventListener('change', fn)
    inputEle?.click()
  })
}

const startScanFile = async () => {
  const [err, file] = await uploadFile()
  if (err) {
    console.error(file)
    return
  }

  const [err2, str2] = await scanFile('reader', file as File)
  console.log('test:>startScanFile:>2', { err2, str2 })

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
  stopScan()
})
</script>

<template>
  <div id="reader"></div>
  <div ref="resultRef"></div>
  <div style="opacity: 0">
    <input
      ref="inputFile"
      type="file" />
  </div>
  <div class="card">
    <button
      type="button"
      @click="startScanCamera">
      startScanCamera
    </button>
    <button
      type="button"
      @click="startScanFile">
      startScanCamera
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
