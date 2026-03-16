<template>
  <button @click="panzoom.zoomIn()">+</button>
  <button @click="panzoom.zoomOut()">-</button>
  <button @click="panzoom.reset()">reset</button>
  <div :style="{ height: '100vh', background: `#fff` }">
    <div id="panzoom-element">
      <canvas></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import Panzoom from '@panzoom/panzoom'
import { onMounted, ref } from 'vue'
const url =
  'http://172.18.16.229/glb-files/svg/f18bca8a111f99ac086c89ec64aa0dcb_20260313094818.svg'
const panzoom = ref<any>()
onMounted(() => {
  const elem = document.getElementById('panzoom-element')
  const canvas = elem!.querySelector('canvas')
  if (!elem || !canvas) {
    return
  }

  const img = new Image()
  const ctx = canvas!.getContext('2d')

  img.onload = () => {
    canvas.width = img.width
    canvas.height = img.height
    ctx!.drawImage(img, 0, 0)
    console.log(`test:>`, img)
    panzoom.value = Panzoom(elem!, {
      canvas: true,
      maxScale: 100,
      contain: 'outside',
      startScale: 1.5,
    })
  }
  img.src = url
})
</script>
<style lang="scss" scoped>
img {
  transform: translateZ(0);
}
</style>
