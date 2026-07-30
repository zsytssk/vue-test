import Konva from 'konva/lib/Core'
import { Text } from 'konva/lib/shapes/Text'
import { Transformer } from 'konva/lib/shapes/Transformer'
import type { KonvaCom } from '.'
import { Config } from './config'
import { EmEvent } from './emEvent'

export function useText(layer: Konva.Layer) {
  // 创建文字
  let text: Text
  let transformer: Transformer
  const { emit, on, once, clear: EmEventClear } = EmEvent()

  const init = () => {
    // 创建文字
    text = new Text({
      x: 100,
      y: 100,
      text: '我是文字',
      fontSize: 24,
      fontFamily: 'Arial, sans-serif',
      fill: '#333333',
      draggable: true, // 允许拖动
    })

    transformer = new Transformer({
      nodes: [text],
      enabledAnchors: [],
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

    layer.add(text)
    layer.add(transformer)
    initEvent()
  }

  const initEvent = () => {
    transformer.on('click pointerdown', () => {
      emit('focus')
    })

    text.on('click pointerdown', () => {
      emit('focus')
    })
  }

  const destroy = () => {
    if (!text) {
      return
    }
    text.destroy()
    transformer.destroy()
    EmEventClear()
  }

  const onSelect = () => {
    transformer.borderStroke(Config.strokeColorActive)
    transformer.anchorStroke(Config.strokeColorActive)
  }
  const unSelect = () => {
    transformer.borderStroke(Config.strokeColor)
    transformer.anchorStroke(Config.strokeColor)
  }

  return {
    on,
    once,
    init,
    destroy,
    onSelect,
    unSelect,
  } as KonvaCom
}
