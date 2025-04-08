import { Html5Qrcode } from 'html5-qrcode'

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

let html5QrCode: Html5Qrcode | undefined
export async function scanCode(cameraId: string, elementId: string) {
  const config = {
    fps: 30,
    aspectRatio: 1,
    qrbox: { width: 450, height: 450 },
    videoConstraints: {
      advanced: [
        {
          facingMode: 'environment',
          focusMode: 'continuous',
          zoom: 1.8,
          frameRate: {
            min: 30,
            ideal: 60,
          },
        },
      ],
    },
  }
  html5QrCode = new Html5Qrcode(elementId, {
    verbose: false,
  })

  return new Promise<[boolean, string, any?]>((resolve) => {
    html5QrCode
      ?.start(
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
  if (html5QrCode?.isScanning) {
    await html5QrCode.stop()
    html5QrCode.clear()
  }
  if (html5QrCode) {
    html5QrCode = undefined
  }
}
