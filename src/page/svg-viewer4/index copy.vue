<template>
  <button @click="panzoom.zoomIn()">+</button>
  <button @click="panzoom.zoomOut()">-</button>
  <button @click="panzoom.reset()">reset</button>
  <div :style="{ height: '100vh', background: `#fff` }">
    <div id="panzoom-element">
      <!-- <img :src="url" alt="" /> -->
      <object :data="url" type="image/svg+xml"></object>
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
  if (!elem) {
    return
  }
  // fetch(url)
  //   .then((r) => r.text())
  //   .then((svg) => {
  //     console.log(`test:>finish`)
  //     elem!.innerHTML = svg
  //   })
  //   .then(() => {
  //     // elem.querySelectorAll('svg').forEach((e) => {
  //     //   // e.setAttribute('vector-effect', 'non-scaling-stroke')
  //     //   // e.setAttribute('shape-rendering', 'crispEdges')
  //     //   e.setAttribute('stroke-width', '0.5px')
  //     // })
  //     // elem.querySelectorAll('g, line, path').forEach((e) => {
  //     //   // e.setAttribute('vector-effect', 'non-scaling-stroke')
  //     //   // e.setAttribute('shape-rendering', 'crispEdges')
  //     //   e.setAttribute('stroke-width', '0.5px')
  //     // })
  //   })

  panzoom.value = Panzoom(elem!, {
    canvas: true,
    maxScale: 100,
    contain: 'outside',
    startScale: 1.5,
  })
  panzoom.value.pan(100, 100)
  //   panzoom.value.zoom(2, { animate: true })

  const parent = elem!.parentElement
  // No function bind needed
  parent!.addEventListener('wheel', panzoom.value.zoomWithWheel)
})
</script>
<style lang="scss" scoped>
img {
  transform: translateZ(0);
}
</style>
