<script setup lang="ts">
// import RxingWasm from './components/rxing-wasm.vue'
// import Test from './page/g6-test/index.vue'
// import Test from './page/select-device/index.vue'
// import Test from './page/zod-test/index.vue'
// import Test from './page/excel-editor-test/test.vue'
// import Test from './page/code-editor/index.vue'
// import Test from './page/html5-qrcode/index.vue'
import Test from './page/camera-test/index.vue'
</script>

<template>
  <!-- <RxingWasm /> -->
  <!-- <HTML5Qrcode /> -->
  <Test />
</template>

<style scoped>
.logo {
  transition: filter 300ms;
  will-change: filter;
  padding: 1.5em;
  height: 6em;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
