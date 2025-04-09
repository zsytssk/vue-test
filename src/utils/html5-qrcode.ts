import {
  Html5Qrcode,
  type Html5QrcodeCameraScanConfig,
  type Html5QrcodeResult,
  Html5QrcodeSupportedFormats,
} from 'html5-qrcode'

/** 类型：1=全部， 2=二维码， 3=条形码 */
export type ExtraInputWay = '1' | '2' | '3'
/** https://github.com/mebjas/html5-qrcode?tab=readme-ov-file#supported-code-formats */
function getSupportType(type: ExtraInputWay) {
  if (type === '1') {
    return undefined
  }
  if (type === '2') {
    return [
      Html5QrcodeSupportedFormats.QR_CODE,
      Html5QrcodeSupportedFormats.AZTEC,
      Html5QrcodeSupportedFormats.DATA_MATRIX,
      Html5QrcodeSupportedFormats.MAXICODE,
      Html5QrcodeSupportedFormats.PDF_417,
    ]
  }
  return [
    Html5QrcodeSupportedFormats.CODE_39,
    Html5QrcodeSupportedFormats.CODE_93,
    Html5QrcodeSupportedFormats.CODE_128,
    Html5QrcodeSupportedFormats.ITF,
    Html5QrcodeSupportedFormats.EAN_13,
    Html5QrcodeSupportedFormats.EAN_8,
    Html5QrcodeSupportedFormats.UPC_A,
    Html5QrcodeSupportedFormats.UPC_E,
    Html5QrcodeSupportedFormats.RSS_14,
    Html5QrcodeSupportedFormats.RSS_EXPANDED,
  ]
}

export function getCameras() {
  return Html5Qrcode.getCameras()
    .then((devices) => {
      if (!devices?.length) {
        return [true, '没有找到相机'] as const
      }
      return [false, devices] as const
    })
    .catch((err) => {
      const msg = err.message ? err.message : err
      return [true, msg] as const
    })
}

export function getCameraId() {
  return Html5Qrcode.getCameras()
    .then((devices) => {
      if (!devices?.length) {
        return [true, '没有找到相机'] as const
      }
      for (const device of devices) {
        if (/back|rear/i.test(device.label)) {
          return [false, device.id] as const
        }
      }
      return [false, devices[0].id] as const
    })
    .catch((err) => {
      const msg = err.message ? err.message : err
      return [true, msg] as const
    })
}

let html5QrCode: Html5Qrcode | undefined
export async function scanCode(
  type: ExtraInputWay,
  cameraId: string,
  elementId: string,
  onReadSuc: (text: string, result: Html5QrcodeResult) => void,
  onReadErr?: (msg: string) => void,
) {
  const ele = document.getElementById(elementId)
  if (!ele) {
    return [true, `$can't find element id=${elementId}`] as const
  }
  const bounds = ele.getBoundingClientRect()
  const width = Math.floor(bounds.width * 0.8)
  const height = Math.floor(bounds.height * 0.8)
  const size = Math.min(width, height)

  const config = {
    fps: 25,
    aspectRatio: 1,
    qrbox: { width: size, height: size },
    disableFlip: true,
  } as Html5QrcodeCameraScanConfig

  html5QrCode = new Html5Qrcode(elementId, {
    verbose: false,
    formatsToSupport: getSupportType(type),
  })

  return new Promise<[boolean, string, any?]>((resolve) => {
    html5QrCode
      ?.start(
        cameraId,
        config,
        (decodedText, decodedResult) => {
          html5QrCode?.pause()
          ele.querySelector('video')?.pause()
          onReadSuc(decodedText, decodedResult)
        },
        (errMsg) => {
          onReadErr?.(errMsg)
        },
      )
      .catch((err) => {
        const msg = err.message ? err.message : err

        resolve([true, msg])
      })
  })
}

export function scanFile(
  type: ExtraInputWay,
  elementId: string,
  imageFile: File,
) {
  html5QrCode = new Html5Qrcode(elementId, {
    formatsToSupport: getSupportType(type),
    verbose: false,
  })
  return html5QrCode
    .scanFile(imageFile, true)
    .then((decodedText) => {
      return [false, decodedText]
    })
    .catch((err) => {
      const msg = err.message ? err.message : err
      return [true, msg]
    })
}

export async function stopScan() {
  if (html5QrCode?.isScanning) {
    await html5QrCode.stop()
    html5QrCode.clear()
  }
  if (html5QrCode) {
    html5QrCode = undefined
  }
}

export function getVideoImgData(ele?: HTMLDivElement) {
  const video = ele?.querySelector('video')
  if (!video) {
    return
  }
  // 创建一个 canvas 元素
  const canvas = document.createElement('canvas')
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight

  // 获取 canvas 的 2D 上下文
  const ctx = canvas.getContext('2d')

  // 将视频的当前帧绘制到 canvas 上
  ctx?.drawImage(video, 0, 0, canvas.width, canvas.height)

  return canvas
}
