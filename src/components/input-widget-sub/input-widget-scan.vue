<template>
  <van-popup
    v-model:show="dialogVisible"
    round
    position="bottom"
    teleport="body"
    :before-close="() => closeDialog(undefined)"
    :class="$style.extraInputDialog"
  >
    <!-- <div class="in-title">选择其他输入方式</div> -->
    <div class="dialog-footer">
      <van-button
        class="round-button"
        round
        plain
        @click="closeDialog(undefined)"
      >
        取消
      </van-button>
      <van-button
        round
        plain
        type="primary"
        :disabled="!resultText"
        @click="closeDialog(resultText)"
      >
        确定
      </van-button>
    </div>
    <div class="">
      <div id="scanFileBox" ref="scanFileBox" class="imgBox"></div>
      <div class="textBox">
        <el-tag size="small" class="text-tag">
          识别文字：{{ resultText ? resultText : '空' }}
        </el-tag>
      </div>
      <div style="opacity: 0; height: 0">
        <input
          ref="inputFile"
          type="file"
          accept="image/*"
          style="pointer-events: none"
        />
      </div>
      <div class="btnBox">
        <el-button icon="el-icon-camera" @click="openScanCamera">
          相机扫描识别
        </el-button>
        <el-button icon="el-icon-upload" @click="startScanFile">
          上传图片识别
        </el-button>
      </div>
      <div class="tip">
        如果相机扫描识别失败，可以尝试调整二维码和相机的位置，然后重新点击"相机扫描识别"按钮，或者用"上传图片识别"。
      </div>
    </div>
  </van-popup>
  <van-popup
    v-model:show="scanVisible"
    round
    position="bottom"
    teleport="body"
    :class="$style.scanDialog"
  >
    <div id="qrReader" ref="qrReader" class="videoBox"></div>
    <div class="dialog-footer">
      <div class="select-box">
        <van-field
          v-model="displayValue"
          is-link
          readonly
          label="切换相机："
          placeholder="请选择相机"
          @click="showPicker = true"
        />
        <van-popup round v-model:show="showPicker" position="bottom">
          <van-picker
            ref="pickerCameraRef"
            :columns="cameraList"
            @confirm="onSelectConfirm"
            @cancel="showPicker = false"
          >
            <template #toolbar>
              <div class="picker-dialog-footer">
                <van-button
                  class="round-button"
                  round
                  plain
                  @click="showPicker = false"
                >
                  取消
                </van-button>
                <van-button round plain type="primary" @click="confirmPicker()">
                  确定
                </van-button>
              </div>
            </template>
            <template v-slot:option="option">
              {{ option.label }}
            </template>
          </van-picker>
        </van-popup>
      </div>
      <div class="textBox">
        <el-tag size="small" class="text-tag">
          识别文字：{{ scanText ? scanText : '空' }}
        </el-tag>
      </div>

      <div class="btnBox">
        <van-button @click="closeScanCamera">取消</van-button>
        <van-button @click="resetScanCamera">重置</van-button>
        <van-button
          type="primary"
          :disabled="!scanText"
          @click="confirmScanCamera"
        >
          确定
        </van-button>
      </div>
    </div>
  </van-popup>
</template>

<script lang="ts" setup>
import {
  type ExtraInputWay,
  getCameraId,
  getCameras,
  getVideoImgData,
  scanCode,
  scanFile,
  stopScan,
} from '@/utils/html5-qrcode'
import { ElMessage } from 'element-plus'
import { computed, ref, watch } from 'vue'

type LocalCameraItem = {
  label: string
  value: string
}

defineOptions({
  name: 'input-widget-scan',
})
defineExpose({ openDialog })

const showPicker = ref(false)
const selectCamera = ref<string>()
const cameraList = ref<LocalCameraItem[]>([])
const scanText = ref('')
const inputFile = ref<HTMLInputElement>()
const qrReader = ref<HTMLDivElement>()
const scanFileBox = ref<HTMLDivElement>()

const pickerCameraRef = ref()
const resultText = ref('')
const dialogVisible = ref(false)
const scanVisible = ref(false)
const closeResolve = ref<(returnVal?: string) => void>()
const inputType = ref<ExtraInputWay>()
const displayValue = computed(() => {
  return cameraList.value.find((item) => item.value === selectCamera.value)
    ?.label
})

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
const onSelectConfirm = (val: { selectedOptions: LocalCameraItem[] }) => {
  showPicker.value = false
  selectCamera.value = val?.selectedOptions?.[0].value
}
const confirmPicker = () => {
  pickerCameraRef.value?.confirm()
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
      cameraList.value = list.map((item) => ({
        label: item.label,
        value: item.id,
      })) as LocalCameraItem[]
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
  :global {
    .in-title {
      padding: 16px;
      font-weight: bold;
      font-size: 1.2rem;
    }
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
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .dialog-footer {
      display: flex;
      justify-content: space-between;
      .van-button {
        border-color: transparent;
        font-size: 20px;
        padding: 16px !important;
      }
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

.scanDialog {
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
      justify-content: space-between;
      gap: 10px;
      padding: 10px 20px 20px;
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
        .van-cell__title {
          color: #666;
          font-size: 20px;
          white-space: nowrap;
        }
      }
      .btnBox {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 20px;

        .van-button {
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

<style lang="scss" scoped>
.picker-dialog-footer {
  display: flex;
  justify-content: space-between;
  flex: 1;
  .van-button {
    border-color: transparent;
    font-size: 20px;
    padding: 16px !important;
  }
}
</style>
