import Konva from 'konva/lib/Core'
import { Arrow } from 'konva/lib/shapes/Arrow'
import { Circle } from 'konva/lib/shapes/Circle'
import { Rect } from 'konva/lib/shapes/Rect'
import type { KonvaCom } from '.'
import { Config } from './config'
import { EmEvent } from './emEvent'
import { useBase } from './base'

export function useArrow(layer: Konva.Layer, editable = true) {
  const { emit, on, once, clear: EmEventClear } = EmEvent()
  const base = useBase()
  const arrowGroup = new Konva.Group({
    x: 0,
    y: 0,
    draggable: false, // 不直接拖动 Group，而是通过矩形拖动
  })
  let arrow: Arrow
  let borderRect: Rect
  let startHandle: Circle
  let endHandle: Circle

  // 初始坐标定义（在组内的相对坐标）
  let x1 = 50,
    y1 = 50,
    x2 = 200,
    y2 = 150
  const rectWidth = 20

  const init = () => {
    arrow = new Arrow({
      points: [x1, y1, x2, y2],
      pointerLength: 15,
      pointerWidth: 15,
      fill: 'red',
      stroke: 'red',
      strokeWidth: 4,
      draggable: true,
      strokeScaleEnabled: false,
    })
    arrowGroup.add(arrow)

    if (editable) {
      // ========== 4. 创建起点控制柄 ==========
      startHandle = new Circle({
        x: x1,
        y: y1,
        radius: 6,
        fill: '#ffffff',
        stroke: '#3b82f6',
        strokeWidth: 2,
        draggable: true,
        strokeScaleEnabled: false,
      })
      arrowGroup.add(startHandle)

      // ========== 5. 创建终点控制柄 ==========
      endHandle = new Circle({
        x: x2,
        y: y2,
        radius: 6,
        fill: '#ffffff',
        stroke: '#3b82f6',
        strokeWidth: 2,
        draggable: true,
        strokeScaleEnabled: false,
      })
      arrowGroup.add(endHandle)

      // 计算角度
      const angle = Math.atan2(y2 - y1, x2 - x1)
      const degrees = angle * (180 / Math.PI)
      const width = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
      borderRect = new Rect({
        x: x1,
        y: y1,
        width: width,
        height: rectWidth,
        offsetY: rectWidth / 2,
        stroke: Config.strokeColor,
        rotation: degrees,
        strokeWidth: 2,
        dash: [4, 2],
        draggable: true,
        strokeScaleEnabled: false,
      })

      layer.add(borderRect)
    }

    layer.add(arrowGroup)
    if (editable) {
      initEvent()
    }
  }

  function initEvent() {
    arrow?.on('click pointerdown', () => {
      emit('focus')
    })
    borderRect?.on('click pointerdown', () => {
      emit('focus')
    })

    startHandle?.on('click pointerdown', () => {
      emit('focus')
    })
    endHandle?.on('click pointerdown', () => {
      emit('focus')
    })
    // ========== 8. 控制点拖拽事件 ==========
    startHandle!.on('dragmove', () => {
      x1 = startHandle!.x()
      y1 = startHandle!.y()
      updateArrowAndGroup()
      layer.batchDraw()
    })

    endHandle!.on('dragmove', () => {
      x2 = endHandle!.x()
      y2 = endHandle!.y()
      updateArrowAndGroup()
      layer.batchDraw()
    })

    arrow!.on('dragmove', (e) => {
      const dx = e.evt.movementX || 0
      const dy = e.evt.movementY || 0

      // // 如果 movementX/movementY 不可用，使用方案一
      if (dx === 0 && dy === 0) return

      x1 += dx
      y1 += dy
      x2 += dx
      y2 += dy

      updateArrowAndGroup()
    })
    // ========== 9. 矩形拖拽事件：整个箭头组跟随移动 ==========
    borderRect.on('dragmove', (e) => {
      const dx = e.evt.movementX || 0
      const dy = e.evt.movementY || 0

      // 如果 movementX/movementY 不可用，使用方案一
      if (dx === 0 && dy === 0) return

      x1 += dx
      y1 += dy
      x2 += dx
      y2 += dy
      updateArrowAndGroup()
    })
  }

  function updateArrowAndGroup() {
    // 更新 Group 的位置（保持在原地）
    // Group 的位置是 (0,0)，所有坐标都是相对 Group 的

    // 更新箭头
    arrow.points([x1, y1, x2, y2])
    arrow?.x(0)
    arrow?.y(0)
    const angle = Math.atan2(y2 - y1, x2 - x1)
    const degrees = angle * (180 / Math.PI)

    // 更新控制点
    startHandle!.x(x1)
    startHandle!.y(y1)
    endHandle!.x(x2)
    endHandle!.y(y2)

    // 计算中心点
    const width = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
    borderRect.x(x1)
    borderRect.y(y1)
    borderRect.width(width)
    borderRect.rotation(degrees) // 旋转到箭头方向
  }

  const destroy = () => {
    if (!arrowGroup) {
      return
    }
    emit('destroy')
    arrowGroup.destroy()
    borderRect?.destroy()
    EmEventClear()
  }

  const onSelect = () => {
    borderRect.stroke(Config.strokeColorActive)
  }
  const unSelect = () => {
    borderRect.stroke(Config.strokeColor)
  }

  return {
    ...base,
    type: 'arrow',
    getModel: () => arrow,
    on,
    once,
    init,
    destroy,
    onSelect,
    unSelect,
  } as KonvaCom
}
