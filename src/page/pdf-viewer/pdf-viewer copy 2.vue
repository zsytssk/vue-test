<template>
  <div class="pdf-viewer-wrapper">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <button @click="prevPage" :disabled="currentPage <= 1">上一页</button>
      <span>第 {{ currentPage }} / {{ totalPages }} 页</span>
      <button @click="nextPage" :disabled="currentPage >= totalPages">
        下一页
      </button>
      <input
        type="number"
        v-model.number="inputPage"
        @keydown.enter="jumpToPage(inputPage)"
        min="1"
        :max="totalPages"
        placeholder="页码"
      />
      <button @click="jumpToPage(inputPage)">跳转</button>
      <span>缩放：</span>
      <button @click="zoomOut">-</button>
      <span>{{ Math.round(scale * 100) }}%</span>
      <button @click="zoomIn">+</button>
      <button @click="resetZoom">重置</button>
    </div>
    <!-- PDF 查看器容器 -->
    <div id="viewerContainer" ref="viewerContainer"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import * as pdfjsLib from 'pdfjs-dist'
import {
  PDFViewer,
  PDFLinkService,
  EventBus,
} from 'pdfjs-dist/web/pdf_viewer.mjs'
import 'pdfjs-dist/web/pdf_viewer.css'
import pdfFile from './pdflatex-4-pages.pdf'

// 配置 Worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url,
).toString()

// 响应式数据
const viewerContainer = ref<HTMLDivElement | null>(null)
let pdfViewer: PDFViewer | null = null
let pdfLinkService: PDFLinkService | null = null
let pdfDocument: pdfjsLib.PDFDocumentProxy | null = null

const currentPage = ref(1)
const totalPages = ref(0)
const scale = ref(1.0)
const inputPage = ref(1)

// 加载 PDF
async function loadPDF(url: string) {
  if (!viewerContainer.value) return

  console.log(`test:>`, viewerContainer.value)
  try {
    const loadingTask = pdfjsLib.getDocument({ url })
    pdfDocument = await loadingTask.promise
    totalPages.value = pdfDocument.numPages

    // 初始化 PDFViewer
    const eventBus = new EventBus()
    pdfLinkService = new PDFLinkService({ eventBus })
    pdfViewer = new PDFViewer({
      container: viewerContainer.value,
      eventBus,
      linkService: pdfLinkService,
      removePageBorders: true,
    })
    pdfLinkService.setViewer(pdfViewer)

    pdfViewer.setDocument(pdfDocument)
    pdfLinkService.setDocument(pdfDocument, null)

    // 监听页面变化事件
    eventBus.on('pagechanging', (evt: { pageNumber: number }) => {
      currentPage.value = evt.pageNumber
    })

    // 监听缩放变化
    eventBus.on('scalechanging', (evt: { scale: number }) => {
      scale.value = evt.scale
    })

    // 等待 DOM 渲染完成后更新布局
    await nextTick()
    pdfViewer.update()

    // 跳转初始页面
    jumpToPage(1)
  } catch (error) {
    console.error('PDF 加载失败:', error)
  }
}

// 跳转到指定页
function jumpToPage(page: number) {
  if (!pdfViewer) return
  const target = Math.min(Math.max(page, 1), totalPages.value)
  pdfViewer.currentPageNumber = target
  inputPage.value = target
  pdfViewer.update()
}

// 上一页
function prevPage() {
  if (currentPage.value > 1) {
    jumpToPage(currentPage.value - 1)
  }
}

// 下一页
function nextPage() {
  if (currentPage.value < totalPages.value) {
    jumpToPage(currentPage.value + 1)
  }
}

// 放大
function zoomIn() {
  if (!pdfViewer) return
  const newScale = Math.min(scale.value + 0.1, 3.0)
  pdfViewer.currentScaleValue = newScale.toString()
  pdfViewer.update()
}

// 缩小
function zoomOut() {
  if (!pdfViewer) return
  const newScale = Math.max(scale.value - 0.1, 0.3)
  pdfViewer.currentScaleValue = newScale.toString()
  pdfViewer.update()
}

// 重置缩放
function resetZoom() {
  if (!pdfViewer) return
  pdfViewer.currentScaleValue = '1.0'
  pdfViewer.update()
}

// 监听 container 变化重新渲染
watch(viewerContainer, (newVal) => {
  if (newVal && pdfDocument) {
    pdfViewer?.update()
  }
})

// 组件挂载时加载 PDF
onMounted(() => {
  // 加载同目录下的 PDF 文件
  const url = new URL(pdfFile, import.meta.url).href
  loadPDF(url)
})
</script>

<style scoped>
.pdf-viewer-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f0f0f0;
}

.toolbar {
  padding: 10px 16px;
  background: white;
  border-bottom: 1px solid #ddd;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  flex-shrink: 0;
  z-index: 10;
}

.toolbar button {
  padding: 4px 12px;
  border: 1px solid #ccc;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.toolbar button:hover:not(:disabled) {
  background: #f5f5f5;
}

.toolbar button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toolbar input {
  width: 60px;
  padding: 4px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  text-align: center;
}

.toolbar span {
  font-size: 14px;
  color: #333;
}

/* PDF 查看器容器 */
#viewerContainer {
  flex: 1;
  overflow: auto;
  background: #e0e0e0;
  padding: 20px;
}

/* 覆盖 PDFViewer 默认样式，适配深色背景 */
:deep(.pdfViewer) {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

:deep(.page) {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

:deep(.page .canvasWrapper) {
  display: block;
}

:deep(.page .textLayer) {
  user-select: text;
  cursor: text;
}
</style>
