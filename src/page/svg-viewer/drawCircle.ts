import * as PIXI from './pixi.min.mjs'

export function drawCircle() {
  // ========== 1. 绘制空心圆（圆圈） ==========
  const circleGraphics = new PIXI.Graphics()

  // v8 新语法：stroke() 设置描边，不调用 fill() 即为空心
  circleGraphics
    .circle(300, 300, 80) // 圆心 x, y, 半径
    .stroke({ width: 10, color: 0xff0000 }) // 红色边框

  // ========== 2. 绘制带箭头的线段 ==========
  const startPoint = { x: 550, y: 150 }
  const circleCenter = { x: 300, y: 300 }
  const radius = 80

  // 计算方向角及圆周上的终点
  const dx = circleCenter.x - startPoint.x
  const dy = circleCenter.y - startPoint.y
  const angle = Math.atan2(dy, dx)
  const endPoint = {
    x: circleCenter.x - radius * Math.cos(angle),
    y: circleCenter.y - radius * Math.sin(angle),
  }

  const arrowGraphics = new PIXI.Graphics()

  // 1. 绘制主线段（v8 链式语法）
  arrowGraphics
    .moveTo(startPoint.x, startPoint.y)
    .lineTo(endPoint.x, endPoint.y)
    .stroke({ width: 10, color: 0xff0000 })

  // 2. 绘制箭头（实心三角形）
  const arrowSize = 22
  const leftAngle = angle + Math.PI * 0.8
  const rightAngle = angle - Math.PI * 0.8

  const arrowLeft = {
    x: endPoint.x + Math.cos(leftAngle) * arrowSize,
    y: endPoint.y + Math.sin(leftAngle) * arrowSize,
  }
  const arrowRight = {
    x: endPoint.x + Math.cos(rightAngle) * arrowSize,
    y: endPoint.y + Math.sin(rightAngle) * arrowSize,
  }

  // v8 绘制填充图形：moveTo + lineTo 构建路径，最后 fill()
  arrowGraphics
    .moveTo(endPoint.x, endPoint.y)
    .lineTo(arrowLeft.x, arrowLeft.y)
    .lineTo(arrowRight.x, arrowRight.y)
    .lineTo(endPoint.x, endPoint.y)
    .fill(0xff0000) // 绿色填充

  // ========== 3. 线段旁添加文字 ==========
  const midPoint = {
    x: (startPoint.x + endPoint.x) / 2,
    y: (startPoint.y + endPoint.y) / 2,
  }

  const text = new PIXI.Text({
    text: '→ 指向圆圈',
    style: {
      fontSize: 22,
      fill: 0xff0000,
      fontFamily: 'Arial',
    },
  })
  text.position.set(midPoint.x + 20, midPoint.y - 15)

  // 可选：标记起点（绿点）
  const startDot = new PIXI.Graphics()
  startDot.circle(startPoint.x, startPoint.y, 10).fill(0xff0000)

  return [arrowGraphics, circleGraphics, text, startDot]
}
