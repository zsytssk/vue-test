<template>
  <div
    id="container"
    style="
      width: 500px;
      height: 500px;
      background-color: #fff;
      margin: auto;
    "></div>
</template>

<script setup lang="ts">
import { Graph } from '@antv/g6'
import { onMounted } from 'vue'

onMounted(() => {
  // 创建图实例
  const graph = new Graph({
    // 基础配置
    container: 'container',
    width: 500,
    height: 500,
    padding: 30,
    autoResize: true,

    // 视口配置
    zoom: 0.8,
    autoFit: 'view',

    // 主题配置
    theme: 'dark',

    // 节点配置
    node: {
      type: 'circle', // 节点类型
      style: {
        fill: '#e6f7ff', // 填充色
        stroke: '#91d5ff', // 边框色
        lineWidth: 1, // 边框宽度
        r: 20, // 半径
        labelText: (d) => d.id, // 标签文本
        labelFill: 'red',
      },
      // 节点状态样式
      state: {
        hover: {
          lineWidth: 4,
          stroke: 'red',
        },
        selected: {
          fill: '#bae7ff',
          stroke: '#1890ff',
          lineWidth: 2,
        },
      },
    },

    // 边配置
    edge: {
      style: {
        stroke: '#A4D3EE',
        lineWidth: 1.5,
        endArrow: true,
      },
    },

    // 布局配置
    layout: {
      type: 'force',
      preventOverlap: true,
      linkDistance: 100,
    },

    // 交互行为
    behaviors: [
      'click-select',
      'drag-canvas',
      'hover-activate',
      'zoom-canvas',
      'drag-node',
    ],

    // 初始数据
    plugins: ['timebar', 'grid-line', 'tooltip'],
  })
  graph.setData({
    nodes: [
      { id: 'root', depth: 0, children: ['child1', 'child2'] },
      { id: 'child1', depth: 1, children: ['grandchild1'] },
      { id: 'grandchild1', depth: 2 },
      { id: 'child2', depth: 1, children: ['grandchild2'] },
      { id: 'grandchild2', depth: 2 },
    ],
    edges: [
      { source: 'root', target: 'child1', style: { stroke: 'orange' } },
      { source: 'root', target: 'child2' },
      { source: 'child1', target: 'grandchild1' },
      { source: 'child2', target: 'grandchild2' },
    ],
  })

  graph.setEdge({
    style: {
      type: 'polyline',
      style: {
        stroke: 'red', // 边颜色
        lineWidth: 2, // 边的宽度
        label: true, // 开启边标签展示
        labelText: 'labelText', // 边标签文字
        labelPlacement: 'center', // 边标签相对于边的位置
        labelFill: '#FF0000', // 边标签文字颜色
        labelOffsetY: 20, // 边标签在y轴方向上的偏移量
        halo: true, // 边光晕开启
        haloStroke: 'red', // 边光晕颜色
        haloStrokeOpacity: 0.2, // 边光晕透明度
      },
    },
  })
  // dfs
  graph.render()
})
</script>

<style lang="scss" scoped></style>
