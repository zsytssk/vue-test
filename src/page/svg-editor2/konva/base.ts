import Konva from 'konva/lib/_CoreInternals'
import type { RectRange } from '.'

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

export function useBase(layer: Konva.Layer) {
  const groupNode = new Konva.Group({
    x: 0,
    y: 0,
    draggable: false, // 不直接拖动 Group，而是通过矩形拖动
  })
  const transLocalClientRect = (globalRect: RectRange) => {
    // 2. 获取 Layer 的变换矩阵并反转
    const transform = layer.getTransform().copy()
    const inverted = transform.invert()

    // 3. 将四个角转换为 Layer 本地坐标
    const topLeft = inverted.point({ x: globalRect.x, y: globalRect.y })
    const bottomRight = inverted.point({
      x: globalRect.x + globalRect.width,
      y: globalRect.y + globalRect.height,
    })

    // 4. 计算本地边界
    return {
      x: topLeft.x,
      y: topLeft.y,
      width: bottomRight.x - topLeft.x,
      height: bottomRight.y - topLeft.y,
    }
  }

  const setIndex = (index: number) => {
    groupNode.zIndex(index)
  }

  const getIndex = () => {
    return groupNode.zIndex()
  }

  return {
    id: generateId(),
    setIndex,
    getIndex,
    groupNode,
    transLocalClientRect,
  }
}
