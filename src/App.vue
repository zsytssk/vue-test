<script setup lang="ts">
// import RxingWasm from './components/rxing-wasm.vue'
// import Test from './page/g6-test/index.vue'
// import Test from './page/select-device/index.vue'
// import Test from './page/zod-test/index.vue'
// import Test from './page/excel-editor-test/test.vue'
// import Test from './page/code-editor/index.vue'
// import Test from './page/html5-qrcode/index.vue'
// import Test from './page/camera-test/index.vue'
// import Test from './page/camera-picture/index.vue'
// import Test from './page/svg-viewer2/index.vue'
// import Test from './page/svg-viewer3/index.vue'
// import Test from './page/svg-editor2/svg-editor.vue'
import Test from './page/threejs-test/threejs-test.vue'
// import Test from './page/svg-viewer/index.vue'
// import Test from './page/svg-viewer-konva/index.vue'
// import Test from './page/i18n-test/index.vue'
</script>

<template>
  <!-- <RxingWasm /> -->
  <!-- <HTML5Qrcode /> -->
  <div class="app-container">
    <Test
      showDebug
      :autoRotate="false"
      :cameraDistance="1"
      modelUrl="http://172.18.40.57/glb-files/glb/7a03bac2692f8d17e2cda1b0721ffd0e_20260819091648.glb"
    />
  </div>
  <!-- <div>
    <i class="fa-regular fa-user test keepPX"></i>
    sdfsdfs
  </div> -->
</template>

<style scoped>
.test.keepPX {
  font-size: 20px;
}
.app-container {
  width: 100vw;
  height: 100vh;
}
</style>
