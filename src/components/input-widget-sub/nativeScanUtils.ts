export function isOnAndroidWebview() {
  return Boolean((window as any).WebViewJavascriptBridge)
}
export function startScan() {
  return new Promise<string>((resolve, reject) => {
    // 全局函数：处理扫描结果
    ;(window as any).handleScanResult = function (result: any) {
      delete (window as any).handleScanResult
      if (typeof result === 'string') {
        result = JSON.parse(result)
        if (result.success) {
          resolve(result.result)
          return
        }
      } else if (typeof result === 'object') {
        if (result.success) {
          resolve(result.result)
          return
        }
      }
      reject()
    }

    // 调用App扫一扫功能
    ;(window as any).WebViewJavascriptBridge.callHandler('startScan')
  })
}
