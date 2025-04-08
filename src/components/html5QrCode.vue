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

const resultText = ref('')
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
  resultText.value = str2
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

  if (err2) {
    console.error(str2)
    return
  }
  resultText.value = str2
}

const stop = () => {
  stopScan()
  resultText.value = ''
}

onMounted(() => {
  stopScan()
})
</script>

<template>
  <div class="box">
    <div class="inner">
      <div id="reader"></div>
      <div class="allText">{{ resultText ? resultText : '~' }}</div>
      <div style="opacity: 0">
        <input
          ref="inputFile"
          type="file"
          accept="image/*"
          style="pointer-events: none" />
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
          startScanFile
        </button>
        <button
          type="button"
          @click="stop">
          stop
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.box {
  display: flex;
  align-items: center;
  margin: 0;
  background-color: #242424;
  min-height: 100vh;
  .inner {
    margin: 0 auto;
    width: 600px;
    .allText {
      width: 100%;
      overflow: hidden;
      color: #fff;
      text-align: center;
      word-break: break-all;
    }
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
  }
}
</style>
