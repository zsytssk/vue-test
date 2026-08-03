import * as PIXI from './pixi.min.mjs'

export type PosRange = {
  ID: number
  sx: number
  sy: number
  ex: number
  ey: number
}
export function drawRect(rect: PosRange, fill = false) {
  // ========== 1. 绘制空心圆（圆圈） ==========
  const x = rect.sx
  const y = rect.sy
  const width = rect.ex - rect.sx
  const height = rect.ey - rect.sy

  // 2. 创建一个 Graphics 实例
  const graphics = new PIXI.Graphics()
  let strokeWidth = width / 50
  if (strokeWidth < 10) {
    strokeWidth = 10
  }
  const color = 0xff0000
  const alpha = 0.01
  // 3. 绘制矩形并填充颜色
  graphics
    .rect(x, y, width, height) // 定义矩形 [citation:1][citation:2]
    .fill({ color, alpha }) // 填充颜色 [citation:4]
    .stroke({ width: strokeWidth, color: 0xff0000, alignment: 0 })

  return graphics
}
export function drawGraphicRect(
  graphics: PIXI.Graphics,
  rect: PosRange,
  fill = false,
) {
  graphics.clear()
  const x = rect.sx
  const y = rect.sy
  const width = rect.ex - rect.sx
  const height = rect.ey - rect.sy

  let strokeWidth = width / 50
  if (strokeWidth < 10) {
    strokeWidth = 10
  }

  const color = 0xff0000
  const alpha = fill ? 0.2 : 0.01
  // 3. 绘制矩形并填充颜色
  graphics
    .rect(x, y, width, height) // 定义矩形 [citation:1][citation:2]
    .fill({ color, alpha }) // 填充颜色 [citation:4]
    .stroke({ width: strokeWidth, color: 0xff0000, alignment: 0 })
}

export function sleep(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time * 1000))
}
