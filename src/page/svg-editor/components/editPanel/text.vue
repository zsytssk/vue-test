<template>
  <Node name="Text" :com="com">
    <div class="panelRow">
      <div>
        <span style="color: red">*</span>
        内容
      </div>
      <el-input
        v-model="text"
        style="width: 90%; font-size: 12px"
        :disabled="readOnly"
        size="small"
      />
    </div>
    <div class="panelRow">
      <div>
        <span style="color: red">*</span>
        字体大小
      </div>
      <el-input-number
        v-model="fontSize"
        style="width: 90%; font-size: 12px"
        :disabled="readOnly"
        size="small"
      />
    </div>
    <div class="panelRow">
      <div>
        <span style="color: red">*</span>
        字体颜色
      </div>
      <el-color-picker v-model="color" />
    </div>
    <div class="panelRow">
      <div>
        <span style="color: red">*</span>
        字体
      </div>
      <el-input
        v-model="fontFamily"
        style="width: 90%; font-size: 12px"
        :disabled="readOnly"
        size="small"
      />
    </div>
    <div class="panelRow">
      <div>
        <span style="color: red">*</span>
        字体粗细
      </div>
      <el-select
        size="small"
        v-model="fontWeight"
        style="width: 90%; font-size: 12px"
      >
        <el-option
          v-for="item in fontWeightOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        ></el-option>
      </el-select>
    </div>
    <div class="panelRow">
      <div>
        <span style="color: red">*</span>
        水平对齐
      </div>
      <el-select
        size="small"
        v-model="align"
        style="width: 90%; font-size: 12px"
      >
        <el-option
          v-for="item in alignOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        ></el-option>
      </el-select>
    </div>
  </Node>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKonvaValue } from '../../hooks/useKonvaValue'
import type { KonvaCom } from '../../konva'
import Node from './node.vue'
const props = defineProps<{ com?: KonvaCom; readOnly?: boolean }>()

const model = computed(() => props.com?.getModel())
const text = useKonvaValue(model, 'text')
const fontSize = useKonvaValue(model, 'fontSize')
const color = useKonvaValue(model, 'fill')
const fontFamily = useKonvaValue(model, 'fontFamily')
const fontWeight = useKonvaValue(model, 'fontStyle')
const align = useKonvaValue(model, 'align')
const fontWeightOptions = [
  { label: 'Lighter', value: 'lighter' },
  { label: 'Normal', value: 'normal' },
  { label: 'Medium', value: 'bold' },
  { label: 'Bold', value: 'bolder' },
]
const alignOptions = [
  { label: 'Left', value: 'left' },
  { label: 'Center', value: 'center' },
  { label: 'Right', value: 'right' },
]
</script>
<style lang="scss" scoped></style>
