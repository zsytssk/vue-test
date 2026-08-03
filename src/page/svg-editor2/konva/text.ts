import Konva from 'konva/lib/Core'
import { Text } from 'konva/lib/shapes/Text'
import { Transformer } from 'konva/lib/shapes/Transformer'
import type { KonvaCom, Position } from '.'
import { Config } from './config'
import { EmEvent } from './emEvent'
import { useBase } from './base'

export function useText(layer: Konva.Layer, pos: Position, editable = true) {
  // 创建文字
  let transformer: Transformer
  const { emit, on, once, clear: EmEventClear } = EmEvent()
  const base = useBase(layer)
  const { groupNode, transLocalClientRect } = base
  let text: Text

  const init = () => {
    text = new Text({
      x: pos.x,
      y: pos.y,
      text: '我是文字',
      fontSize: 24,
      fontFamily: 'Arial, sans-serif',
      fill: '#333333',
      draggable: editable, // 允许拖动
    })
    groupNode.add(text)

    if (editable) {
      transformer = new Transformer({
        nodes: [text],
        padding: 5,
        borderDash: [4, 2],
        enabledAnchors: ['middle-left', 'middle-right'],
        rotateEnabled: false,
        borderStroke: Config.strokeColor,
        anchorStroke: Config.strokeColor,
        boundBoxFunc: (_oldBox, newBox) => {
          // 限制宽高最小为 30 像素
          const newWidth = text.width() * text.scaleX()
          const fontSize = text.fontSize() + 1
          text.setAttrs({
            width: Math.max(fontSize, newWidth),
            scaleX: 1,
          })
          return newBox
        },
      })

      groupNode.add(transformer)
      initEvent()
    }
    layer.add(groupNode)
  }

  const initEvent = () => {
    transformer.on('click pointerdown', () => {
      emit('focus')
    })

    text.on('click pointerdown', () => {
      emit('focus')
    })
    text.on('fontSizeChange', (e) => {
      if (text.width() <= (e as any).newVal) {
        text.setAttr('width', (e as any).newVal + 1)
      }
    })
  }

  const destroy = () => {
    if (!text) {
      return
    }
    emit('destroy')
    text.destroy()
    transformer?.destroy()
    EmEventClear()
  }

  const getBounds = () => {
    return transLocalClientRect(text.getClientRect())
  }

  const onSelect = () => {
    transformer?.borderStroke(Config.strokeColorActive)
    transformer?.anchorStroke(Config.strokeColorActive)
  }
  const unSelect = () => {
    transformer?.borderStroke(Config.strokeColor)
    transformer?.anchorStroke(Config.strokeColor)
  }

  return {
    ...base,
    type: 'text',
    getModel: () => text,
    on,
    once,
    init,
    destroy,
    onSelect,
    unSelect,
    getBounds,
  } as KonvaCom
}
