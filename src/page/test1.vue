<template>
  <el-button @click="onclick">click</el-button>
  <div ref="mountNodeRef"></div>
</template>

<script lang="ts" setup>
import G6 from '@antv/g6'
import { onMounted, ref } from 'vue'

import { registerNode } from './style'
import { findItem } from './utils'

const mountNodeRef = ref()
const graphRef = ref()

// const defaultThemeConfig = G6.Util.deepClone(G6.Global.defaultTheme.defaultNode);
// console.log('默认样式:', defaultThemeConfig.style);
// 注册节点如何使用？

registerNode(G6)
onMounted(() => {
  const data = {
    nodes: [
      {
        id: 'node1',
        shape: 'task-node',
        label: 'Node 1',
      },
      {
        id: 'node2',
        // shape: 'task-node',
        label: 'Node 2',
      },
    ],
    edges: [{ source: 'node1', target: 'node2' }],
  }

  const graph = new G6.Graph({
    container: mountNodeRef.value,
    width: 400,
    height: 400,
    // defaultNode: {
    //   shape: 'rect',
    // },
    // defaultEdge: {
    //   shape: 'flow-polyline-round',
    // },
  })

  graph.data(data)
  graph.render()
  graphRef.value = graph
})

const errorRef = ref(false)
const onclick = () => {
  const item = findItem(graphRef.value, { id: 'node1' })
  errorRef.value = !errorRef.value
  console.log(`test:>`, item)
  if (errorRef.value) {
    graphRef.value.updateItem(item, {
      style: {
        stroke: 'red',
        lineWidth: 3,
      },
      labelCfg: {
        // 修改节点label样式
        style: {
          fill: 'red', // 字体颜色
        },
      },
    })
  } else {
    graphRef.value.updateItem(item, {
      style: { stroke: undefined, lineWidth: undefined },
      labelCfg: {
        fill: undefined, // 字体颜色
      },
    })
    graphRef.value.refresh()
  }
}
</script>

<style scoped>
.demo-datetime-picker {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: stretch;
  padding: 0;
  width: 100%;
}
.demo-datetime-picker .block {
  padding: 30px 0;
  text-align: center;
}
.line {
  background-color: var(--el-border-color);
  width: 1px;
}
</style>
