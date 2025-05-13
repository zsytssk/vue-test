import { Edge, Graph, Node } from '@antv/g6'

type LocalNode = {
  id: string
}
type LocalEdge = {
  sourceAnchor: string
  targetAnchor: string
  target: string
  source: string
}
export function findItem(graph: Graph, itemModel: LocalEdge | LocalNode): Node {
  if ((itemModel as LocalEdge).source && (itemModel as LocalEdge).target) {
    return graph.find('edge', (edge: any) => {
      const edgeModel = edge.getModel()
      return (
        edgeModel.source === (itemModel as LocalEdge).source &&
        edgeModel.sourceAnchor === (itemModel as LocalEdge).sourceAnchor &&
        edgeModel.target === (itemModel as LocalEdge).target &&
        edgeModel.targetAnchor === (itemModel as LocalEdge).targetAnchor
      )
    })
  }
  return graph.findById((itemModel as LocalNode).id)
}
