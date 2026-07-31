export { useText } from './text'
export { useArrow } from './arrow'
export { useRect } from './rect'
import type Konva from 'konva/lib/_CoreInternals'

export type KonvaCom = {
  id: string
  type: string
  getModel: () => Konva.Node
  init: () => void
  destroy: () => void
  onSelect: () => void
  unSelect: () => void
  on: (event: string, callback: (data?: any) => void) => () => boolean
  once: (event: string, callback: (data?: any) => void) => () => boolean
}
