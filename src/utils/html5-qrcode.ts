import { Html5Qrcode } from 'html5-qrcode'

export function getCameraId() {
  return Html5Qrcode.getCameras()
    .then((devices) => {
      if (devices && devices.length) {
        return [false, devices[0].id] as const
      }
      return [true, '没有找到相机'] as const
    })
    .catch((err) => {
      return [true, err.message] as const
    })
}

let html5QrCode: Html5Qrcode
export async function scanCode(cameraId: string, elementId: string) {
  const config = {
    fps: 10,
    aspectRatio: 1,
    qrbox: { width: 350, height: 350 },
  }
  html5QrCode = new Html5Qrcode(elementId, {
    verbose: false,
  })

  return new Promise<[boolean, string, any?]>((resolve) => {
    html5QrCode
      .start(
        cameraId,
        config,
        (decodedText, decodedResult) => {
          resolve([false, decodedText, decodedResult])
        },
        (_errMsg) => {
          //   resolve([true, errorMessage])
        },
      )
      .catch((err) => {
        resolve([true, err.message])
      })
  })
}

export function scanFile(elementId: string, imageFile: File) {
  html5QrCode = new Html5Qrcode(elementId)
  return html5QrCode
    .scanFile(imageFile, true)
    .then((decodedText) => {
      return [false, decodedText]
    })
    .catch((err) => {
      return [true, err]
    })
}

export async function stopScan() {
  if (html5QrCode) {
    html5QrCode.clear()
    return html5QrCode.stop()
  }
}
