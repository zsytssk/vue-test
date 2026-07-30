import Konva from 'konva/lib/Core'
import { Rect } from 'konva/lib/shapes/Rect'
import { Transformer } from 'konva/lib/shapes/Transformer'
import type { KonvaCom } from '.'
import { Config } from './config'
import { EmEvent } from './emEvent'

export function useRect(layer: Konva.Layer) {
  // 创建文字
  let rect: Rect
  let transformer: Transformer
  const { emit, on, once, clear: EmEventClear } = EmEvent()

  const init = () => {
    // 创建文字
    rect = new Rect({
      x: 50,
      y: 50,
      width: 100,
      height: 50,
      stroke: 'red',
      strokeWidth: 4,
      draggable: true,
      strokeScaleEnabled: false,
    })

    transformer = new Transformer({
      nodes: [rect],
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

    layer.add(rect)
    layer.add(transformer)
    initEvent()
  }

  const initEvent = () => {
    rect.on('mouseover', function () {
      document.body.style.cursor = 'pointer'
    })
    rect.on('mouseout', function () {
      document.body.style.cursor = 'default'
    })
    transformer.on('click pointerdown', () => {
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
    rect.destroy()
    transformer.destroy()
    EmEventClear()
  }

  const onSelect = () => {
    transformer.borderStroke(Config.strokeColorActive)
    transformer.anchorStroke(Config.strokeColorActive)
    layer.batchDraw()
  }
  const unSelect = () => {
    transformer.borderStroke(Config.strokeColor)
    transformer.anchorStroke(Config.strokeColor)
    layer.batchDraw()
  }

  return {
    name: 'rect',
    on,
    once,
    init,
    destroy,
    onSelect,
    unSelect,
  } as KonvaCom
}
