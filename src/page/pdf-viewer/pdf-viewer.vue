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
    <div class="viewer-container-wrapper">
      <div id="viewerContainer" ref="viewerContainer">
        <div class="pdfViewer"></div>
      </div>
    </div>
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
import pdfFile from './pdflatex-4-pages.pdf'
import 'pdfjs-dist/web/pdf_viewer.css'

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

    eventBus.on('pagesinit', () => {
      console.log('PDF 页面结构初始化完成，可以安全跳转了！')
      jumpToPageAndPosition(2, 1.5, 100, 100) // 此时调用绝对安全，不会报错
    })

    // 等待 DOM 渲染完成后更新布局
    await nextTick()
    pdfViewer.update()
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

async function jumpToPageAndPosition(
  page: number,
  zoom: number | string = 1.5,
  x = 0,
  y = 0,
) {
  if (!pdfViewer || !pdfDocument) return

  // 1. 设置缩放比例
  if (typeof zoom === 'number') {
    pdfViewer.currentScaleValue = zoom.toString() // 例如 "1.5"
  } else {
    pdfViewer.currentScaleValue = zoom // 例如 'page-fit' 适应页面
  }

  // 2. 确保页码在合法范围内
  const targetPage = Math.min(Math.max(page, 1), totalPages.value)

  // 3. 获取对应的页面对象并利用 scrollPageIntoView 实现精准定位
  // pdfjs 的 scrollPageIntoView 支持传入坐标参数
  pdfViewer.scrollPageIntoView({
    pageNumber: targetPage,
    destArray: [
      null, // pageRef
      { name: 'XYZ' }, // 坐标类型：XYZ 表示带坐标的绝对定位
      x,
      y,
      null, // 缩放，如果前面设置了 currentScaleValue 这里可以传 null
    ],
  })

  // 4. 同步输入框和当前页状态
  inputPage.value = targetPage
  pdfViewer.update()
}

// 组件挂载时加载 PDF
onMounted(() => {
  // 加载同目录下的 PDF 文件
  const url = new URL(pdfFile, import.meta.url).href
  console.log(`test:>url`, url)
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
  overflow: hidden;
}

/* 优化后的现代工具栏 */
.toolbar {
  padding: 8px 16px;
  background: #ffffff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  gap: 8px; /* 减小组件间距 */
  flex-wrap: wrap;
  flex-shrink: 0;
  z-index: 10;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

/* 优雅的小型按钮样式 */
.toolbar button {
  padding: 4px 10px;
  border: 1px solid #dcdfe6;
  background: #ffffff;
  color: #606266;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  line-height: 1.5;
  transition: all 0.2s ease;
}

/* 悬停微调 */
.toolbar button:hover:not(:disabled) {
  color: #409eff;
  border-color: #c6e2ff;
  background: #ecf5ff;
}

/* 点击反馈 */
.toolbar button:active:not(:disabled) {
  color: #3a8ee6;
  border-color: #3a8ee6;
}

/* 禁用状态 */
.toolbar button:disabled {
  color: #c0c4cc;
  background: #f5f7fa;
  border-color: #e4e7ed;
  cursor: not-allowed;
}

/* 优化输入框样式，保持与按钮等高 */
.toolbar input {
  width: 50px;
  height: 28px;
  padding: 0 4px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  text-align: center;
  font-size: 13px;
  color: #606266;
  outline: none;
  transition: border-color 0.2s;
}

.toolbar input:focus {
  border-color: #409eff;
}

.toolbar span {
  font-size: 13px;
  color: #606266;
  user-select: none;
}

/* 外层定位壳，用于占满剩余空间 */
.viewer-container-wrapper {
  flex: 1;
  position: relative;
  overflow: hidden;
}

/* 核心：pdfjs 强制要求 container 必须是绝对定位 */
#viewerContainer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: auto;
  background: #e0e0e0;
  padding: 20px;
}

/* 覆盖 PDFViewer 默认样式 */
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

.toolbar input {
  width: 50px;
  height: 28px;
  padding: 0 4px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  text-align: center;
  font-size: 13px;
  color: #606266;
  background-color: #ffffff !important; /* 强制指定白色背景，防止被暗黑模式或浏览器填充污染 */
  outline: none;
  transition: border-color 0.2s;

  /* 针对 WebKit 内核浏览器（Chrome, Safari）由于自动填充导致的黑底白字问题 */
  -webkit-text-fill-color: #606266 !important;
  -webkit-box-shadow: 0 0 0 1000px #ffffff inset !important;
}

.toolbar input:focus {
  border-color: #409eff;
}
</style>
