export { useText } from './text'
export { useArrow } from './arrow'
export { useRect } from './rect'
import type Konva from 'konva/lib/_CoreInternals'

export type RectRange = {
  width: number
  height: number
  x: number
  y: number
}
export type KonvaCom = {
  id: string
  type: string
  getModel: () => Konva.Node
  init: () => void
  destroy: () => void
  getBounds: () => RectRange
  onSelect: () => void
  unSelect: () => void
  on: (event: string, callback: (data?: any) => void) => () => boolean
  once: (event: string, callback: (data?: any) => void) => () => boolean
}

export type Position = {
  x: number
  y: number
}
