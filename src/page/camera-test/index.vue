<template>
  <div class="camera-list">enumerateDevices:{{ scanText }}</div>
  <el-button @click="startScan">click</el-button>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { ref } from 'vue'
const scanText = ref('')
const ready = ref(false)

function setupWebViewJavascriptBridge(callback: (bridge: any) => void) {
  if ((window as any).WebViewJavascriptBridge) {
    return callback((window as any).WebViewJavascriptBridge)
  }

  if ((window as any).WVJBCallbacks) {
    console.log('WVJBCallbacks 已存在，添加到队列')
    return (window as any).WVJBCallbacks.push(callback)
  }

  ;(window as any).WVJBCallbacks = [callback]
}

// 开始扫描
function startScan() {
  // 如果bridgeReady为false但WebViewJavascriptBridge存在，尝试使用
  if (!(window as any).WebViewJavascriptBridge) {
    console.log('Bridge存在但状态未更新，尝试直接使用')
    return
  }

  // 调用App扫一扫功能
  ;(window as any).WebViewJavascriptBridge.callHandler(
    'startScan',
    function (response: any) {
      ElMessage.success(JSON.stringify(response))
      console.log('收到扫描结果:', response)
      console.log('响应类型:', typeof response)
      scanText.value = response
    },
  )
}
setupWebViewJavascriptBridge(() => {
  ready.value = true
})
</script>
<style lang="scss" scoped>
.camera-list {
  width: 100%;
  margin-top: 10px;
  word-break: break-all;
}
</style>
