<template>
  <div ref="viewerContainer" class="pdfjs-viewer">
    <div v-for="n in pageCount" :key="n" class="page-wrapper">
      <!-- 使用动态的 ref 绑定 -->
      <canvas :ref="(el) => setCanvasRef(el, n)"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as pdfjsLib from 'pdfjs-dist'
import { onMounted, ref } from 'vue'
import pdfFile from './pdflatex-4-pages.pdf'
import 'pdfjs-dist/web/pdf_viewer.css'

// Map the worker to the CDN or your local node_modules path
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url,
).toString()
const pageCount = ref(0)
const canvasRefs = ref<Map<number, HTMLCanvasElement>>(new Map())
const viewerContainer = ref<HTMLElement | null>(null)

// 设置 ref 的函数
function setCanvasRef(el: Element | null, pageNum: number) {
  if (el) {
    canvasRefs.value.set(pageNum, el as HTMLCanvasElement)
  } else {
    canvasRefs.value.delete(pageNum)
  }
}

async function loadAndRenderPdf(url: string) {
  try {
    const loadingTask = pdfjsLib.getDocument({ url })
    const pdf = await loadingTask.promise
    pageCount.value = pdf.numPages

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)

      // 直接从 Map 中获取 canvas
      const canvas = canvasRefs.value.get(i)
      if (!canvas) continue

      const containerWidth = viewerContainer.value?.clientWidth || 800
      const viewport = page.getViewport({ scale: 1 })
      const scale = Math.min(containerWidth / viewport.width, 2)
      const scaledViewport = page.getViewport({ scale })

      const context = canvas.getContext('2d')!
      canvas.width = scaledViewport.width
      canvas.height = scaledViewport.height
      canvas.style.width = '100%'

      await page.render({
        canvasContext: context,
        viewport: scaledViewport,
      }).promise
    }
  } catch (error) {
    console.error('PDF 加载失败:', error)
  }
}

onMounted(() => {
  const url = new URL(pdfFile, import.meta.url).href

  loadAndRenderPdf(url)
})
</script>
<style lang="scss" scoped>
.pdfjs-viewer {
  width: 100%;
  height: 100%;
  overflow: auto;
  position: relative;
  canvas {
    display: block;
    margin: 0 auto;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-radius: 4px;
  }
}
</style>
