<template>
  <div ref="divRef" class="svgBox">
    <img :src="imgSrc" alt="" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Resvg, initWasm } from '@resvg/resvg-wasm'

const divRef = ref()
const imgSrc = ref()
async function loadSvgWithDelegation(
  svgUrl: string,
  container: HTMLDivElement,
) {
  await initWasm(fetch('https://unpkg.com/@resvg/resvg-wasm/index_bg.wasm'))

  const response = await fetch(svgUrl)
  const svgString = await response.text()
  const resvg = new Resvg(svgString)
  const pngData = resvg.render()
  const pngBuffer = pngData.asPng()
  const blob = new Blob([pngBuffer], { type: 'image/png' })
  const imageUrl = URL.createObjectURL(blob)

  // 然后赋值给 img 标签显示
  imgSrc.value = imageUrl
}

onMounted(() => {
  loadSvgWithDelegation(
    'http://172.18.16.229/glb-files/svg/52a66c64c33832d16ed20d068379686e_20260318141752.svg',
    // 'http://172.18.16.229/glb-files/svg/03f8442ce9be1b2549a7a8d8c58c6a2c_20260311173624.svg',
    divRef.value,
  )
})
</script>
<style lang="scss" scoped>
.svgBox {
  width: 100vw;
  height: 100vh;
  background: #fff;
}
</style>
