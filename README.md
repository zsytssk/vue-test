## 2026-07-30 10:20:23

https://codesandbox.io/embed/github/polotno-project/polotno-site/tree/source/examples/polotno-demo?fontsize=11&hidenavigation=1&theme=dark&view=preview

https://konvajs.org/docs/overview.html

https://github.com/konvajs/konva

- @todo
  - 选中某个组件
  - 编辑大小 | 颜色
  - 生成svg | 渲染svg
  - 在svg渲染层之上渲染
  - 下次再编辑
  - 工具栏
    - 新建 删除
  - 属性侧边栏
  - ***
  - 矩形
  - 箭头
  - 文字

- 箭头的大小不应增大

- @ques borderRect 移动时 方向的问题

## 2025-09-22 15:22:23

- 方案1

```
getUserMedia之后再去请求摄像头
<uses-permission android:name="android.permission.CAMERA"/>
<uses-permission android:name="android.permission.RECORD_AUDIO"/>
```

```
java.lang.SecurityException: validateClientPermissionsLocked:1573: Caller "com.test.demo" (PID 10350, UID 13084) cannot open camera "0" without camera permission
```

```
webView.getSettings().setJavaScriptEnabled(true);
webView.getSettings().setMediaPlaybackRequiresUserGesture(false);
```

## 2025-09-22 15:56:59

顺序+id都不一致,无法匹配id

- java获取的

```json
[
  { "id": "0", "label": "camera2 0, facing front", "facing": "user" },
  { "id": "1", "label": "camera2 1, facing back", "facing": "environment" },
  { "id": "2", "label": "camera2 2, facing front", "facing": "user" },
  { "id": "3", "label": "camera2 3, facing front", "facing": "user" },
  { "id": "4", "label": "camera2 4, facing front", "facing": "user" }
]
```

- js 获取的

```json
[
  {
    "deviceId": "1d3d0bf77c96c4f6f87dff0ce0c33bd2b354b65c27873dbcc3cdeebb6dcdb3b5",
    "kind": "videoinput",
    "label": "",
    "groupId": "ef9741c8a3969b928c4707a7ddcc2f3b9eaeb04c957534aaf0535d82c683b40c"
  },
  {
    "deviceId": "c001da3a1428370d5f89a3a71742cffd7cd6b3249d64d7142ee285eec6760a40",
    "kind": "videoinput",
    "label": "",
    "groupId": "d4c7fb24753f95b8a3f41b8b5b03b64b52ccefecba887f3e5a13d8eb82d9578b"
  },
  {
    "deviceId": "58a6f1e62a14d4a7628a281a6ba81ba82243d69e8aa9523819c7ce93f582fd26",
    "kind": "videoinput",
    "label": "",
    "groupId": "f9fa5eaea82492260e837a30978678a88f14b70c5b332ad9fd7b83fe3a2e90e5"
  },
  {
    "deviceId": "cc0153bb151f3bd80b6856ed8dc87f8ebe156384c48c9e1590ee0a4d1ab6840e",
    "kind": "videoinput",
    "label": "",
    "groupId": "ee462e1f2052c858735433f4569770095dabbfc91963b95281ecb693b9dea4b0"
  },
  {
    "deviceId": "c0b037cfc0d7607d56c91cf1170cda0524e9cdbb0a85401bc4284fdaf1931af8",
    "kind": "videoinput",
    "label": "",
    "groupId": "e5f55dc39745caa07b040aff79afbb7181545350e1751de5e52bce1d3d40a2b1"
  }
]
```

## 2025-09-22 15:07:49

navigator.mediaDevices.enumerateDevices()
怎么写了这么一大堆
id是一致的 顺序不一致

```
import android.webkit.WebViewClient;
wkVBinding.webView.setWebViewClient(new WebViewClient() {
    @Override
    public void onPageFinished(WebView view, String url) {
        super.onPageFinished(view, url);
        android.util.Log.e("WKWebViewActivity", "test:>2");
        injectDeviceLabelEnhancementScript();
    }
});
```

```
AndroidBridge.getCameraRealInfo
```

```
 private void injectDeviceLabelEnhancementScript() {
        Log.d("WebView增强", "注入华为WebView兼容性修复");

        // 注入华为WebView兼容性修复脚本
        executeJavaScript("console.log('🔧 注入华为WebView兼容性修复');");

        wkVBinding.webView.postDelayed(() -> {
            injectHuaweiWebViewFixes();
        }, 1000);

        wkVBinding.webView.postDelayed(() -> {
            injectSimpleCameraFunctions();
        }, 2000);

        wkVBinding.webView.postDelayed(() -> {
            injectHuaweiCompatibleCameraSwitching();
        }, 3000);

        // 5秒后自动测试华为WebView修复效果
        wkVBinding.webView.postDelayed(() -> {
            testHuaweiWebViewFixes();
        }, 5000);
    }

getCameraRealInfo
```

# Vue 3 + TypeScript + Vite

怎么设置required?

- `refine` 可以做一些逻辑判断
