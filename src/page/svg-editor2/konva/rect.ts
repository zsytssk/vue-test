import Konva from 'konva/lib/Core'
import { Rect } from 'konva/lib/shapes/Rect'
import { Transformer } from 'konva/lib/shapes/Transformer'
import type { KonvaCom } from '.'
import { Config } from './config'
import { EmEvent } from './emEvent'
import { useBase } from './base'
import type { Position } from '@vueuse/core'

export function useRect(layer: Konva.Layer, pos: Position, editable = true) {
  // 创建文字
  let rect: Rect
  let transformer: Transformer
  const { emit, on, once, clear: EmEventClear } = EmEvent()
  const { id, transLocalClientRect } = useBase(layer)
  const init = () => {
    // 创建文字
    rect = new Rect({
      x: pos.x,
      y: pos.y,
      width: 100,
      height: 50,
      stroke: 'red',
      strokeWidth: 4,
      draggable: editable,
      strokeScaleEnabled: false,
    })
    if (editable) {
      transformer = new Transformer({
        nodes: [rect],
        borderDash: [4, 2],
        padding: 5,
        // enabledAnchors: [],
        rotateEnabled: false,
        borderStroke: Config.strokeColor,
        anchorStroke: Config.strokeColor,
        boundBoxFunc: (_oldBox, newBox) => {
          // 限制宽高最小为 30 像素
          newBox.width = Math.max(30, newBox.width)
          newBox.height = Math.max(30, newBox.height)
          return newBox
        },
      })
      layer.add(transformer)
    }

    layer.add(rect)
    initEvent()
  }

  const initEvent = () => {
    rect.on('mouseover', function () {
      document.body.style.cursor = 'pointer'
    })
    rect.on('mouseout', function () {
      document.body.style.cursor = 'default'
    })
    transformer?.on('click pointerdown', () => {
      emit('focus')
    })

    rect.on('click pointerdown', () => {
      emit('focus')
    })
  }

  const destroy = () => {
    if (!rect) {
      return
    }
    emit('destroy')
    rect.destroy()
    transformer?.destroy()
    EmEventClear()
  }

  const getBounds = () => {
    return transLocalClientRect(rect.getClientRect())
  }

  const onSelect = () => {
    transformer?.borderStroke(Config.strokeColorActive)
    transformer?.anchorStroke(Config.strokeColorActive)
    layer.batchDraw()
  }

  const unSelect = () => {
    transformer?.borderStroke(Config.strokeColor)
    transformer?.anchorStroke(Config.strokeColor)
    layer.batchDraw()
  }

  return {
    id,
    type: 'rect',
    getModel: () => rect,
    on,
    once,
    init,
    destroy,
    onSelect,
    unSelect,
    getBounds,
  } as KonvaCom
}
