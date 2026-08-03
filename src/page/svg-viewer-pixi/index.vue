<template>
  <SvgViewer ref="innerRef" hideToolBar :dxfUrl="url" />
</template>
<script setup lang="ts">
import SvgViewer from './svgViewer.vue'
const url =
  'http://172.18.16.229/glb-files/svg/52a66c64c33832d16ed20d068379686e_20260318141752.svg'
</script>

<style lang="scss" scoped></style>
