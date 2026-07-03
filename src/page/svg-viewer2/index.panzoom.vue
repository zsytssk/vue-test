<template>
  <div ref="divRef" class="svgBox"></div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Panzoom, { type PanzoomObject } from '@panzoom/panzoom'
const panzoom = ref<PanzoomObject>()

const divRef = ref()
async function loadSvgWithDelegation(svgUrl: string, container: HTMLElement) {
  const response = await fetch(svgUrl)
  const svgString = await response.text()

  // 插入到容器
  container.innerHTML = svgString
  const svgElement = container.querySelector('svg')!
  console.log(`test:>`, svgElement.width, svgElement.height)

  panzoom.value = Panzoom(svgElement!, {
    canvas: true,
    contain: 'inside',
    maxScale: 1,
    startScale: 0.5,
    minScale: 0.1,
  })

  divRef.value!.addEventListener('wheel', panzoom.value.zoomWithWheel)

  // 事件委托：在 svg 根节点上监听 click，通过 target 判断
  svgElement.addEventListener('click', (e) => {
    console.log('click:', e.target)
    const target = e.target as Element
    if (target.tagName === 'text') {
      const content = target.textContent?.trim() || ''
      console.log('点击了文字:', content)
      // 可以进一步通过 class、id 或 data-* 属性区分
    }
    // 如果还要处理 tspan，可以用 target.closest('text')
  })
}

onMounted(() => {
  loadSvgWithDelegation(
    'http://172.18.16.229/glb-files/svg/52a66c64c33832d16ed20d068379686e_20260318141752.svg',
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
