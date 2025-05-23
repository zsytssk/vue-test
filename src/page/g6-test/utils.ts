import { Rect } from '@antv/g6'

export class IconNode extends Rect {
  get data() {
    return this.context.graph.getNodeData(this.id).data
  }

  getCustomIconStyle(attributes) {
    const [width, height] = this.getSize(attributes)
    const { icon } = this.data
    return {
      x: -width / 2 + 4, // 左侧15px处
      y: -height / 2 + 4,
      width: 20,
      height: 20,
      src: icon,
    }
  }

  drawCustomIconShape(attributes, container) {
    const iconStyle = this.getCustomIconStyle(attributes)

    this.upsert('custom-icon', 'image', iconStyle, container)
  }

  getCustomLabelStyle(attributes) {
    const [width, height] = this.getSize(attributes)
    const { label } = this.data
    return {
      x: -width / 2 + 26, // 图标右侧10px处
      y: -height / 2 + 14,
      text: label || '',
      fontSize: 10,
      fill: '#333',
      textAlign: 'left',
      textBaseline: 'middle',
    }
  }

  drawCustomLabelShape(attributes, container) {
    const labelStyle = this.getCustomLabelStyle(attributes)

    this.upsert('custom-label', 'text', labelStyle, container)
  }

  render(attributes, container) {
    // 渲染基础矩形
    super.render(attributes, container)

    // 添加图标
    this.drawCustomIconShape(attributes, container)

    // 添加标签(在图标右侧)
    this.drawCustomLabelShape(attributes, container)
  }
}
