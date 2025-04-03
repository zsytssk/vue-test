<script setup lang="ts">
import {
  Html5Qrcode,
  Html5QrcodeScanType,
  Html5QrcodeScanner,
} from 'html5-qrcode'
import { onMounted, ref } from 'vue'

defineProps<{}>()

const videoRef = ref<HTMLVideoElement>()
const start = () => {
  const scanner = new Html5QrcodeScanner('reader', {
    qrbox: {
      width: 250,
      height: 250,
    },
    fps: 20,
  })
  scanner.render(success, error)
  function success(result: any) {
    document.getElementById('result').innerHTML = `
<h2>Success!</h2>
<p><a href="${result}">${result}</a></p>
`
    scanner.clear()
    document.getElementById('reader').remove()
  }
  function error(err) {
    console.error(err)
  }
}
const stop = () => {
  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => {
      console.log('访问相机失败: ', stream, document.querySelector('#reader'))
      document.querySelector('#reader').srcObject = stream
    })
    .catch((err) => {
      console.error('访问相机失败: ', err)
    })
}

onMounted(() => {
  if (!videoRef.value) {
    return
  }
})
</script>

<template>
  <div id="reader"></div>
  <div id="result"></div>
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
.read-the-docs {
  color: #888;
}
video {
  /* background-color: red; */
}
</style>
