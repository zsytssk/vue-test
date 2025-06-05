<template>
  <el-tooltip
    effect="dark"
    v-bind="$attrs"
    :content="props.tooltipContent ? props.tooltipContent : props.content"
    placement="top"
    :disabled="isShow"
    :popper-class="finalPopperClass"
  >
    <template #content>
      <slot name="tooltipContent">{{
        props.tooltipContent ? props.tooltipContent : props.content
      }}</slot>
    </template>
    <div
      class="content"
      :style="{ width: props.width }"
      @mouseover="isShowTooltip"
    >
      <span ref="contentRef">
        <!-- 给一个没有写插槽的默认值，兼容纯文本的情况 -->
        <slot name="content">{{ props.content }}</slot>
      </span>
    </div>
  </el-tooltip>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'

defineOptions({ name: 'show-tooltip' })
// 定义props的类型
interface Props {
  content?: string
  width?: string
  tooltipContent?: string
  popperClass?: string
}
// 使用withDefaults来给props赋默认值
const props = withDefaults(defineProps<Props>(), {
  content: '',
  width: '',
  tooltipContent: '',
  popperClass: '',
})
// 使用isShow来控制tooltip是否显示
let isShow = ref<boolean>(true)
// 在span标签上定义一个ref
const contentRef = ref()
const isShowTooltip = function (): void {
  // 计算span标签的offsetWidth与盒子元素的offsetWidth，给isShow赋值
  if (contentRef.value.parentNode.offsetWidth >= contentRef.value.offsetWidth) {
    isShow.value = true
  } else {
    isShow.value = false
  }
}

// 如果外部有popper-class 则用外部样式
const finalPopperClass = computed(() => {
  return props.popperClass || 'tooltip-pop'
})
</script>
<style>
.content {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.tooltip-pop {
  max-width: 500px;
  text-align: center;
}
</style>
