<template>
  <el-dialog
    v-model="dialogVisible"
    size="800"
    :show-close="false"
    :before-close="() => closeDialog(undefined)"
    title="选择其他输入方式"
    :class="$style.extraInputDialog">
    <div class="">
      <div
        id="scanFileBox"
        ref="scanFileBox"
        class="imgBox"></div>
      <div class="textBox">
        <el-tag
          size="small"
          class="text-tag"
          >识别文字：{{ resultText ? resultText : '空' }}</el-tag
        >
      </div>
      <div style="opacity: 0; height: 0">
        <input
          ref="inputFile"
          type="file"
          accept="image/*"
          style="pointer-events: none" />
      </div>
      <div class="btnBox">
        <el-button
          icon="el-icon-camera"
          @click="openScanCamera"
          >相机扫描识别</el-button
        >
        <el-button
          icon="el-icon-upload"
          @click="startScanFile"
          >上传图片识别</el-button
        >
      </div>
      <div class="tip">
        如果相机扫描识别失败，可以尝试调整二维码和相机的位置，然后重新点击"相机扫描识别"按钮，或者用"上传图片识别"。
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <!-- <el-button @click="stop">重置</el-button> -->
        <el-button @click="closeDialog(undefined)">取消</el-button>
        <el-button
          type="primary"
          :disabled="!resultText"
          @click="closeDialog(resultText)">
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
  <el-dialog
    v-model="scanVisible"
    :class="$style.scanDialog"
    :show-close="false">
    <div
      id="qrReader"
      ref="qrReader"
      class="videoBox"></div>
    <template #footer>
      <div class="dialog-footer">
        <div class="select-box">
          <div class="select-label">切换相机：</div>
          <el-select
            v-model="selectCamera"
            :popper-class="$style['el-select-dropdown']">
            <el-option
              v-for="(item, index) in cameraList"
              :key="index"
              :value="item.id"
              :label="item.label" />
          </el-select>
        </div>
        <div class="textBox">
          <el-tag
            size="small"
            class="text-tag"
            >识别文字：{{ scanText ? scanText : '空' }}</el-tag
          >
        </div>

        <div class="btnBox">
          <el-button @click="closeScanCamera"> 取消 </el-button>
          <el-button @click="resetScanCamera"> 重置 </el-button>
          <el-button
            type="primary"
            :disabled="!scanText"
            @click="confirmScanCamera">
            确定
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ElMessage } from 'element-plus'
import { type CameraDevice } from 'html5-qrcode'
import { ref, watch } from 'vue'

import {
  type ExtraInputWay,
  getCameraId,
  getCameras,
  getVideoImgData,
  scanCode,
  scanFile,
  stopScan,
} from '@/utils/html5-qrcode'

defineOptions({
  name: 'input-widget-scan',
})
defineExpose({ openDialog })

const selectCamera = ref<string>()
const cameraList = ref<CameraDevice[]>([])
const scanText = ref('')
const inputFile = ref<HTMLInputElement>()
const qrReader = ref<HTMLDivElement>()
const scanFileBox = ref<HTMLDivElement>()

const resultText = ref('')
const dialogVisible = ref(false)
const scanVisible = ref(false)
const closeResolve = ref<(returnVal?: string) => void>()
const inputType = ref<ExtraInputWay>()

function openDialog(type: ExtraInputWay) {
  return new Promise<string | undefined>((resolve) => {
    inputType.value = type
    dialogVisible.value = true
    closeResolve.value = resolve
  })
}

const closeDialog = (val?: string) => {
  closeResolve.value?.(val)
  dialogVisible.value = false
  closeResolve.value = undefined
}

const uploadFile = () => {
  return new Promise<[boolean, string | File]>((resolve) => {
    const inputEle = inputFile.value
    if (!inputEle) {
      return resolve([true, 'cant find input ele for upload!'] as const)
    }
    const fn = (event: any) => {
      const files = event.target?.files

      if (files.length > 0) {
        inputEle.removeEventListener('change', fn)
        return resolve([false, files[0]] as const)
      } else {
        console.log('没有文件被选择')
      }
    }
    inputEle.addEventListener('change', fn)
    inputEle?.click()
  })
}

const startScanFile = async () => {
  await clearTop()
  const [err, file] = await uploadFile()
  if (err) {
    ElMessage.error(file as string)
    return
  }

  const [err2, str2] = await scanFile(
    inputType.value as ExtraInputWay,
    'scanFileBox',
    file as File,
  )

  if (err2) {
    ElMessage.error(str2)
    return
  }
  resultText.value = str2
}

const clearTop = async () => {
  await stopScan()
  resultText.value = ''
  if (scanFileBox.value) {
    scanFileBox.value.innerHTML = ''
  }
  if (inputFile.value) {
    inputFile.value.value = ''
  }
}
const clearScan = async () => {
  await stopScan()
  scanText.value = ''
  if (qrReader.value) {
    qrReader.value.innerHTML = ''
  }
}

const closeScanCamera = () => {
  scanVisible.value = false
}
const confirmScanCamera = () => {
  const canvas = getVideoImgData(qrReader.value)
  console.log(`test:.canvas`, qrReader.value, canvas)
  if (scanFileBox.value && canvas) {
    canvas.style = 'width: 100%; height:100%'
    scanFileBox.value.innerHTML = ''
    scanFileBox.value?.appendChild(canvas)
  }

  resultText.value = scanText.value
  scanVisible.value = false
}
const resetScanCamera = async () => {
  scanText.value = ''
  await stopScan()
  startScanCamera()
}
const openScanCamera = () => {
  scanVisible.value = true
}

const startScanCamera = async () => {
  await clearTop()
  if (!selectCamera.value) {
    return
  }
  const [err2, str2] = await scanCode(
    inputType.value as ExtraInputWay,
    selectCamera.value,
    'qrReader',
    (text, _result) => {
      ElMessage.success(`识别文字：${text}`)
      scanText.value = text
    },
  )
  if (err2) {
    ElMessage.error(str2)
    return
  }
}

watch(
  () => selectCamera.value,
  () => {
    startScanCamera()
  },
)
let init = false
watch(
  () => scanVisible.value,
  (val) => {
    if (!val) {
      clearScan()
      return
    }
    startScanCamera()
    if (init) {
      return
    }
    init = true
    getCameras().then(([err, list]) => {
      if (err) {
        return
      }
      cameraList.value = list as CameraDevice[]
    })
    getCameraId().then(([err, cameraId]) => {
      if (err) {
        return
      }
      selectCamera.value = cameraId
    })
  },
)

watch(
  () => dialogVisible.value,
  (visible) => {
    if (!visible) {
      clearTop()
      return
    }
  },
)
</script>

<style lang="scss" module>
.extraInputDialog {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin: 0 !important;
  min-width: 340px;

  :global {
    .imgBox {
      margin: 0 auto;
      background-color: #ddd;
      width: 300px;
      height: 300px;
      overflow: hidden;
    }
    .textBox,
    .btnBox {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 10px;
      margin-top: 10px;
    }
    .text-tag {
      padding: 3px 7px;
      max-width: 100%;
      height: auto;
      overflow: hidden;
      line-height: 1.2;
      white-space: normal;
      word-break: break-all;
    }
    .dialog-footer {
      display: flex;
      justify-content: end;
    }
    .tip {
      margin: 10px 20px;
      color: #999;
      font-size: 12px;
      line-height: 1.2;
      text-align: center;
    }
  }
}

.el-select-dropdown {
  :global {
    .el-select-dropdown__item {
      height: 60px;
      font-size: 24px;
      line-height: 60px; /* 让文字垂直居中 */
    }
  }
}
.scanDialog {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  margin: 0 !important;
  background: #fff;
  padding: 0 !important;
  width: 100% !important;
  height: 100% !important;
  // height: 700px !important;
  overflow: hidden;
  :global {
    .el-dialog__body {
      display: flex;
      flex: 1;
      justify-content: center;
      align-items: center;
      background-color: #000;
      width: 100%;
      overflow: hidden;
    }
    .videoBox {
      position: relative;
      aspect-ratio: 1 / 1;
      width: 100%;
      overflow: hidden;
    }
    .el-dialog__header {
      display: none;
    }
    .dialog-footer {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 0 20px 20px;
      .textBox {
        display: flex;
        justify-content: center;
        gap: 10px;
      }
      .text-tag {
        padding: 3px 7px;
        max-width: 100%;
        height: auto;
        overflow: hidden;
        font-size: 24px;
        line-height: 1.2;
        white-space: normal;
        word-break: break-all;
      }
      .select-box {
        display: flex;
        flex: 1;
        align-items: center;
        gap: 10;
        .select-label {
          color: #666;
          font-size: 24px;
          white-space: nowrap;
        }
        .el-select {
          .el-tooltip__trigger {
            height: 60px !important;
          }
          .el-select__wrapper {
            font-size: 24px;
          }
        }
      }
      .btnBox {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 20px;

        .el-button {
          flex: 1;
          padding: 0 20px;
          height: 60px;
          font-size: 24px;
        }
      }
      .el-button + .el-button {
        margin-left: 0;
      }
    }
  }
}
</style>
