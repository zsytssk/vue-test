import type { KonvaCom } from '../konva'

export function calcGroupRect(comList: KonvaCom[]) {
  let sx, sy, ex, ey
  for (const item of comList) {
    const { x, y, width, height } = item.getBounds()
    const x2 = x + width
    const y2 = y + height
    if (
      sx === undefined ||
      sy === undefined ||
      ex === undefined ||
      ey === undefined
    ) {
      sx = x
      sy = y
      ex = x + width
      ey = y + height
      continue
    }
    if (sx > x) {
      sx = x
    }
    if (sy > y) {
      sy = y
    }
    if (ex < x2) {
      ex = x2
    }
    if (ey < y2) {
      ey = y2
    }
  }

  return {
    x: sx!,
    y: sy!,
    width: ex! - sx!,
    height: ey! - sy!,
  }
}

export type TreeNode = {
  children?: TreeNode[]
}
export function flatTreeData<T extends TreeNode>(treeList: T[]): T[] {
  const result: T[] = []
  for (const item of treeList) {
    result.push(item)
    if (item.children) {
      result.push(...flatTreeData(item.children as T[]))
    }
  }
  return result
}
