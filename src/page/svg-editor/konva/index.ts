export { useText } from './text'
export { useArrow } from './arrow'
export { useRect } from './rect'

export type KonvaCom = {
  init: () => void
  destroy: () => void
  onSelect: () => void
  unSelect: () => void
  on: (event: string, callback: (data?: any) => void) => () => boolean
  once: (event: string, callback: (data?: any) => void) => () => boolean
}
