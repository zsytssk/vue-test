import { getSvgBBox } from '@svg-fns/info'

// ============ 类型定义 ============
interface TextInfo {
  content: string
  x: number
  y: number
  fontSize: number
  rotation: number
  scaleX: number
  scaleY: number
  element: Element
}

// ============ 主函数 ============
export function parseSvgTexts(svgString: string): TextInfo[] {
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgString, 'image/svg+xml')
  const textElements = doc.querySelectorAll(
    'Text',
  ) as NodeListOf<SVGTextElement>
  const results: TextInfo[] = []

  // 获取根 SVG 元素的 viewBox 信息
  const svgElement = doc.querySelector('svg')
  const viewBoxInfo = svgElement ? getViewBoxInfo(svgElement) : null

  textElements.forEach((textEl) => {
    // 1. 获取文字内容
    const content = textEl.textContent?.trim() || ''
    if (!content) return

    // 2. 获取原始坐标（x, y）
    let svgBox = getSvgBBox(textEl)
    const { x, y } = svgBox
    console.log(`test:>`, svgBox)
    if (x !== 0 || y !== 0) {
    }

    // 3. 获取字体大小
    let fontSize = getFontSize(textEl)

    // 4. 计算累积变换矩阵（包含所有祖先）
    const matrix = getCumulativeMatrix(textEl, viewBoxInfo)

    // 5. 应用变换到坐标
    const point = new DOMPoint(x, y)
    const transformedPoint = point.matrixTransform(matrix)

    // 6. 提取变换参数
    const rotation = Math.atan2(matrix.b, matrix.a)
    const scaleX = Math.sqrt(matrix.a * matrix.a + matrix.b * matrix.b)
    const scaleY = Math.sqrt(matrix.c * matrix.c + matrix.d * matrix.d)

    // 7. 字体大小也需要应用缩放
    const finalFontSize = fontSize * scaleX

    results.push({
      content,
      x: transformedPoint.x,
      y: transformedPoint.y,
      fontSize: finalFontSize,
      rotation,
      scaleX,
      scaleY,
      element: textEl,
    })
  })

  return results
}

// ============ 获取文本位置 ============
function getTextPosition(textEl: SVGTextElement): { x: number; y: number } {
  // 处理 x 属性可能包含多个值（如 "10 20 30"）
  const xAttr = textEl.getAttribute('x')
  const yAttr = textEl.getAttribute('y')

  let x = 0
  let y = 0

  if (xAttr) {
    const xValues = xAttr.split(/[ ,]+/).map(Number)
    x = xValues[0] || 0
  }

  if (yAttr) {
    const yValues = yAttr.split(/[ ,]+/).map(Number)
    y = yValues[0] || 0
  }

  // 如果当前元素没有 x/y，尝试从父级 text 获取
  if (x === 0 && y === 0) {
    const parentText = textEl.closest('text')
    if (parentText && parentText !== textEl) {
      const parentX = parentText.getAttribute('x')
      const parentY = parentText.getAttribute('y')

      if (parentX) {
        const xValues = parentX.split(/[ ,]+/).map(Number)
        x = xValues[0] || 0
      }
      if (parentY) {
        const yValues = parentY.split(/[ ,]+/).map(Number)
        y = yValues[0] || 0
      }
    }
  }

  return { x, y }
}

// ============ 获取字体大小 ============
function getFontSize(textEl: SVGTextElement): number {
  // 1. 尝试从属性获取
  let fontSize = parseFloat(textEl.getAttribute('font-size') || '')

  // 2. 如果属性没有，尝试从 style 获取
  if (isNaN(fontSize) || fontSize === 0) {
    const style = textEl.getAttribute('style') || ''
    const match = style.match(/font-size\s*:\s*([\d.]+)/)
    if (match) {
      fontSize = parseFloat(match[1])
    }
  }

  // 3. 如果还是没有，使用默认值
  if (isNaN(fontSize) || fontSize === 0) {
    fontSize = 16
  }

  return fontSize
}

// ============ 获取 ViewBox 信息 ============
interface ViewBoxInfo {
  minX: number
  minY: number
  width: number
  height: number
  scaleX: number
  scaleY: number
}

function getViewBoxInfo(svgElement: Element): ViewBoxInfo | null {
  const viewBox = svgElement.getAttribute('viewBox')
  if (!viewBox) return null

  const [minX, minY, width, height] = viewBox.split(/[ ,]+/).map(Number)

  // 获取实际显示尺寸
  const svgWidth = parseFloat(svgElement.getAttribute('width') || '0')
  const svgHeight = parseFloat(svgElement.getAttribute('height') || '0')

  // 如果 width/height 是百分比或没有设置，使用 viewBox 的尺寸
  const displayWidth = svgWidth > 0 ? svgWidth : width
  const displayHeight = svgHeight > 0 ? svgHeight : height

  return {
    minX,
    minY,
    width,
    height,
    scaleX: displayWidth / width,
    scaleY: displayHeight / height,
  }
}

// ============ 计算累积变换矩阵（包含所有祖先） ============
function getCumulativeMatrix(
  element: Element,
  viewBoxInfo: ViewBoxInfo | null,
): DOMMatrix {
  const matrices: DOMMatrix[] = []
  let current: Element | null = element

  // 1. 收集所有祖先的 transform
  while (current) {
    const transform = current.getAttribute('transform')
    if (transform) {
      matrices.push(parseTransformString(transform))
    }
    current = current.parentElement
  }

  // 2. 如果有 viewBox，添加 viewBox 变换（作为最外层的变换）
  if (viewBoxInfo) {
    const viewBoxMatrix = new DOMMatrix()
    // 先平移使 viewBox 原点对齐
    viewBoxMatrix.translateSelf(-viewBoxInfo.minX, -viewBoxInfo.minY)
    // 再缩放到显示尺寸
    viewBoxMatrix.scaleSelf(viewBoxInfo.scaleX, viewBoxInfo.scaleY)
    matrices.push(viewBoxMatrix)
  }

  // 3. 从外到内相乘（先应用外层变换）
  let finalMatrix = new DOMMatrix()
  for (let i = matrices.length - 1; i >= 0; i--) {
    finalMatrix = finalMatrix.multiply(matrices[i])
  }

  return finalMatrix
}

// ============ 解析 transform 字符串 ============
function parseTransformString(transformStr: string): DOMMatrix {
  const matrix = new DOMMatrix()
  if (!transformStr) return matrix

  // 匹配所有变换函数：translate(10,20) scale(2) rotate(45) ...
  const transforms = transformStr.match(/[a-zA-Z]+\([^)]*\)/g) || []

  transforms.forEach((transform) => {
    const match = transform.match(/([a-zA-Z]+)\(([^)]*)\)/)
    if (!match) return

    const [, name, argsStr] = match
    const args = argsStr
      .split(/[, ]+/)
      .map(Number)
      .filter((v) => !isNaN(v))

    switch (name.toLowerCase()) {
      case 'matrix': {
        // matrix(a, b, c, d, e, f)
        if (args.length >= 6) {
          matrix.a = args[0]
          matrix.b = args[1]
          matrix.c = args[2]
          matrix.d = args[3]
          matrix.e = args[4]
          matrix.f = args[5]
        }
        break
      }

      case 'translate': {
        const tx = args[0] || 0
        const ty = args[1] || 0
        matrix.translateSelf(tx, ty)
        break
      }

      case 'scale': {
        const sx = args[0] || 1
        const sy = args[1] || sx
        matrix.scaleSelf(sx, sy)
        break
      }

      case 'rotate': {
        const angle = args[0] || 0
        const cx = args[1] || 0
        const cy = args[2] || 0

        // 旋转围绕指定中心点
        if (cx !== 0 || cy !== 0) {
          matrix.translateSelf(cx, cy)
          matrix.rotateSelf(angle)
          matrix.translateSelf(-cx, -cy)
        } else {
          matrix.rotateSelf(angle)
        }
        break
      }

      case 'skewx': {
        matrix.skewXSelf(args[0] || 0)
        break
      }

      case 'skewy': {
        matrix.skewYSelf(args[0] || 0)
        break
      }
    }
  })

  return matrix
}

// ============ 可选：如果是在浏览器环境中，可以获取屏幕坐标 ============
export function parseSvgTextsWithScreenCTM(svgString: string): TextInfo[] {
  // 创建临时容器并插入 DOM
  const container = document.createElement('div')
  container.innerHTML = svgString
  document.body.appendChild(container)

  const svgElement = container.querySelector('svg')
  if (!svgElement) {
    document.body.removeChild(container)
    return []
  }

  const textElements = svgElement.querySelectorAll('text')
  const results: TextInfo[] = []

  textElements.forEach((textEl) => {
    const content = textEl.textContent?.trim() || ''
    if (!content) return

    // 使用 getScreenCTM（包含所有变换，包括 CSS）
    const ctm = textEl.getScreenCTM()
    if (!ctm) {
      // 如果 getScreenCTM 失败，使用 getBoundingClientRect
      const rect = textEl.getBoundingClientRect()
      const fontSize = getFontSize(textEl)
      results.push({
        content,
        x: rect.left,
        y: rect.top,
        fontSize,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        element: textEl,
      })
      return
    }

    // 获取原始坐标
    const { x, y } = getTextPosition(textEl)
    const point = new DOMPoint(x, y)
    const transformedPoint = point.matrixTransform(ctm)

    const rotation = Math.atan2(ctm.b, ctm.a)
    const scaleX = Math.sqrt(ctm.a * ctm.a + ctm.b * ctm.b)
    const scaleY = Math.sqrt(ctm.c * ctm.c + ctm.d * ctm.d)
    const fontSize = getFontSize(textEl) * scaleX

    results.push({
      content,
      x: transformedPoint.x,
      y: transformedPoint.y,
      fontSize,
      rotation,
      scaleX,
      scaleY,
      element: textEl,
    })
  })

  // 清理
  document.body.removeChild(container)
  return results
}
