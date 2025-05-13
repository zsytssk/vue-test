import G6 from '@antv/g6'
import Item from '@antv/g6/src/item/item'
import deepMix from '@antv/util/lib/deep-mix'

const editorStyle = {
  nodeActivedOutterStyle: { lineWidth: 0 },
  groupSelectedOutterStyle: { stroke: '#E0F0FF', lineWidth: 2 },
  nodeSelectedOutterStyle: { stroke: '#E0F0FF', lineWidth: 2 },
  edgeActivedStyle: { stroke: '#1890FF', strokeOpacity: 0.92 },
  nodeActivedStyle: { fill: '#F3F9FF', stroke: '#1890FF' },
  groupActivedStyle: { stroke: '#1890FF' },
  edgeSelectedStyle: { lineWidth: 2, strokeOpacity: 0.92, stroke: '#A3B1BF' },
  nodeSelectedStyle: { fill: '#F3F9FF', stroke: '#1890FF', fillOpacity: 0.4 },
  groupSelectedStyle: { stroke: '#1890FF', fillOpacity: 0.92 },
  nodeStyle: {
    stroke: '#CED4D9',
    fill: '#FFFFFF',
    shadowOffsetX: 0,
    shadowOffsetY: 4,
    shadowBlur: 10,
    shadowColor: 'rgba(13, 26, 38, 0.08)',
    lineWidth: 1,
    radius: 4,
    strokeOpacity: 0.7,
  },
  edgeStyle: {
    stroke: '#A3B1BF',
    strokeOpacity: 0.92,
    lineWidth: 1,
    lineAppendWidth: 8,
    endArrow: true,
  },
  groupBackgroundPadding: [40, 10, 10, 10],
  groupLabelOffsetX: 10,
  groupLabelOffsetY: 10,
  edgeLabelStyle: { fill: '#666', textAlign: 'center', textBaseline: 'middle' },
  edgeLabelRectPadding: 4,
  edgeLabelRectStyle: { fill: 'white' },
  nodeLabelStyle: { fill: '#666', textAlign: 'center', textBaseline: 'middle' },
  groupStyle: { stroke: '#CED4D9', radius: 4 },
  groupLabelStyle: { fill: '#666', textAlign: 'left', textBaseline: 'top' },
  multiSelectRectStyle: {
    fill: '#1890FF',
    fillOpacity: 0.08,
    stroke: '#1890FF',
    opacity: 0.1,
  },
  dragNodeHoverToGroupStyle: { stroke: '#1890FF', lineWidth: 2 },
  dragNodeLeaveFromGroupStyle: { stroke: '#BAE7FF', lineWidth: 2 },
  anchorPointStyle: {
    radius: 3.5,
    fill: '#fff',
    stroke: '#1890FF',
    lineAppendWidth: 12,
  },
  anchorHotsoptStyle: { radius: 12, fill: '#1890FF', fillOpacity: 0.25 },
  anchorHotsoptActivedStyle: { radius: 14 },
  anchorPointHoverStyle: {
    radius: 4,
    fill: '#1890FF',
    fillOpacity: 1,
    stroke: '#1890FF',
  },
  nodeControlPointStyle: {
    radius: 4,
    fill: '#fff',
    shadowBlur: 4,
    shadowColor: '#666',
  },
  edgeControlPointStyle: {
    radius: 6,
    symbol: 'square',
    lineAppendWidth: 6,
    fillOpacity: 0,
    strokeOpacity: 0,
  },
  nodeSelectedBoxStyle: { stroke: '#C2C2C2' },
  cursor: {
    panningCanvas: '-webkit-grabbing',
    beforePanCanvas: '-webkit-grab',
    hoverNode: 'move',
    hoverEffectiveAnchor: 'crosshair',
    hoverEdge: 'default',
    hoverGroup: 'move',
    hoverUnEffectiveAnchor: 'default',
    hoverEdgeControllPoint: 'crosshair',
    multiSelect: 'crosshair',
  },
  nodeDelegationStyle: {
    stroke: '#1890FF',
    fill: '#1890FF',
    fillOpacity: 0.08,
    lineDash: [4, 4],
    radius: 4,
    lineWidth: 1,
  },
  edgeDelegationStyle: { stroke: '#1890FF', lineDash: [4, 4], lineWidth: 1 },
}

const taskDefaultOptions = {
  icon: null,
  iconStyle: {
    width: 12,
    height: 12,
    left: 2,
    top: 2,
  },
  style: {
    ...editorStyle.nodeStyle,
    fill: '#E7F7FE',
    stroke: '#1890FF',
    cursor: 'default',
  },
  stateStyles: {
    selected: {
      fill: '#95D6FB',
    },
    hover: {
      cursor: editorStyle.cursor.hoverNode,
    },
  },
}

const createAnchor = (index, style, group) => {
  const anchorContainer = group.addGroup()
  const anchor = new Item({
    type: 'anchor',
    group: anchorContainer,
    capture: false,
    index,
    isActived: false,
    model: {
      style: {
        ...style,
        ...editorStyle.anchorPointStyle,
        cursor: editorStyle.cursor.hoverEffectiveAnchor,
      },
    },
  })
  anchor.isAnchor = true
  anchor.toFront()
  let hotpot
  anchor.showHotpot = function () {
    hotpot = anchorContainer.addShape('marker', {
      attrs: {
        ...style,
        ...editorStyle.anchorHotsoptStyle,
      },
    })
    hotpot.toFront()
    anchor.getKeyShape().toFront()
  }
  anchor.setActived = function () {
    anchor.update({ style: { ...editorStyle.anchorPointHoverStyle } })
  }
  anchor.clearActived = function () {
    anchor.update({ style: { ...editorStyle.anchorPointStyle } })
  }
  anchor.setHotspotActived = function (act) {
    hotpot &&
      (act
        ? hotpot.attr(editorStyle.anchorHotsoptActivedStyle)
        : hotpot.attr(editorStyle.anchorHotsoptStyle))
  }
  return anchorContainer
}

export function registerNode(g6: typeof G6) {
  g6.registerNode(
    'base-node',
    {
      options: {
        icon: null,
        iconStyle: {
          width: 14,
          height: 14,
          left: 0,
          top: 0,
        },
        style: {
          fill: '#f9f9f9',
          stroke: '#bbb',
          cursor: 'default',
        },
        stateStyles: {
          selected: {
            fill: '#eee',
          },
          hover: {
            cursor: editorStyle.cursor.hoverNode,
          },
        },
      },
      drawAnchor(group) {
        const bbox = group.get('children')[0].getBBox()
        this.getAnchorPoints().forEach((p, i) => {
          const anchor = createAnchor(
            i,
            {
              x: bbox.minX + bbox.width * p[0],
              y: bbox.minY + bbox.height * p[1],
            },
            group,
          )
          group.anchorShapes.push(anchor)
          group.getAllAnchors = () => {
            return group.anchorShapes.map((c) => {
              c.filter((a) => a.isAnchor)
            })
          }
          group.getAnchor = (i) => {
            return group.anchorShapes.filter((a) => a.get('index') === i)
          }
        })
      },
      drawShape(cfg, group) {
        const shapeType = this.shapeType
        const style = this.getShapeStyle(cfg)
        const shape = group.addShape(shapeType, {
          attrs: {
            ...style,
          },
        })
        if (this.options.icon) {
          let attrs = {
            x: style.x + this.options.iconStyle.left,
            y: style.y + this.options.iconStyle.top,
            width: this.options.iconStyle.width,
            height: this.options.iconStyle.height,
          }
          if (shapeType === 'circle') {
            attrs = {
              x: style.x - style.r + this.options.iconStyle.left,
              y: style.y - style.r + this.options.iconStyle.top,
              width: this.options.iconStyle.width,
              height: this.options.iconStyle.height,
            }
          } else if (shapeType === 'path') {
            attrs = {
              x: this.options.iconStyle.left,
              y: this.options.iconStyle.top,
              width: this.options.iconStyle.width,
              height: this.options.iconStyle.height,
            }
          }
          group.icon = group.addShape('image', {
            attrs: {
              img: this.options.icon,
              ...attrs,
            },
          })
          if (cfg.hideIcon) {
            group.icon.hide()
          }
        }
        group.anchorShapes = []
        group.showAnchor = (group) => {
          this.drawAnchor(group)
        }
        group.clearAnchor = (group) => {
          group.anchorShapes && group.anchorShapes.forEach((a) => a.remove())
          group.anchorShapes = []
        }
        group.clearHotpotActived = (group) => {
          group.anchorShapes &&
            group.anchorShapes.forEach((a) => {
              if (a.isAnchor) {
                a.setHotspotActived(false)
              }
            })
        }
        return shape
      },
      setState(name, value, item) {
        const group = item.getContainer()
        if (name === 'show-anchor') {
          if (value) {
            group.showAnchor(group)
          } else {
            group.clearAnchor(group)
          }
        } else if (name === 'selected') {
          const rect = group.getChildByIndex(0)
          if (value) {
            rect.attr('fill', this.options.stateStyles.selected.fill)
          } else {
            rect.attr('fill', this.options.style.fill)
          }
        } else if (name === 'hover') {
          const rect = group.getChildByIndex(0)
          const text = group.getChildByIndex(1)
          if (value) {
            rect.attr('cursor', this.options.stateStyles.hover.cursor)
            if (text) {
              text.attr('cursor', this.options.stateStyles.hover.cursor)
            }
          } else {
            rect.attr('cursor', this.options.style.cursor)
            if (text) {
              text.attr('cursor', this.options.style.cursor)
            }
          }
        }
      },
      getAnchorPoints() {
        return [
          [0.5, 0], // top
          [1, 0.5], // right
          [0.5, 1], // bottom
          [0, 0.5], // left
        ]
      },
      runAnimate(cfg, group) {
        if (cfg.active) {
          let totalArray = []
          let index = 0
          const shape = group.getFirst()
          shape.animate(
            {
              onFrame(ratio) {
                for (let i = 0; i < 9; i += interval) {
                  totalArray = totalArray.concat(lineDash)
                }
                const cfg = {
                  lineDash: dashArray[index].concat(totalArray),
                }
                index = (index + 1) % interval
                return cfg
              },
              repeat: true,
            },
            5000,
          )
        }
      },
      afterDraw(cfg, group) {
        this.runAnimate(cfg, group)
      },
      afterUpdate(cfg, group) {
        const icon = group.get('group').icon
        if (cfg.hideIcon && icon && icon.get('visible')) {
          icon.hide()
        } else if (!cfg.hideIcon && icon && !icon.get('visible')) {
          icon.show()
        }
      },
    },
    'single-shape',
  )

  g6.registerNode(
    'task-node',
    {
      shapeType: 'rect',
      options: {
        ...taskDefaultOptions,
      },
      getShapeStyle(cfg: any) {
        cfg.size = [80, 44]
        const width = cfg.size[0]
        const height = cfg.size[1]
        const style = {
          ...this.options.style,
          ...cfg.style,
          x: 0 - width / 2,
          y: 0 - height / 2,
          width,
          height,
        }
        return style
      },
    },
    'base-node',
  )
}
