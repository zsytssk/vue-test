<template>
  <div ref="divRef" class="svgBox"></div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { parseSvgTexts } from './utils'

const divRef = ref()
async function loadSvgWithDelegation(
  svgUrl: string,
  container: HTMLDivElement,
) {
  const response = await fetch(svgUrl)
  const svgString = await response.text()
  const textInfos = parseSvgTexts(svgString, container)
  // console.log(`test:>textInfos`, textInfos)
}

onMounted(() => {
  loadSvgWithDelegation(
    // 'http://172.18.16.229/glb-files/svg/52a66c64c33832d16ed20d068379686e_20260318141752.svg',
    'http://172.18.16.229/glb-files/svg/03f8442ce9be1b2549a7a8d8c58c6a2c_20260311173624.svg',
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
