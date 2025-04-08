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

let html5QrCode: Html5Qrcode
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
export async function scanCodeAutoFocus(elementId: string) {
  const config = {
    fps: 10,
    aspectRatio: 1,
    qrbox: { width: 350, height: 350 },
  }
  const constraints = {
    video: {
      facingMode: 'environment',
      focusMode: 'manual',
      advanced: [{ focusMode: 'continuous' }],
    },
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints as any)

    const videoTrack = stream.getVideoTracks()[0]
    const capabilities = videoTrack.getCapabilities() as any
    if (capabilities.focusMode) {
      alert('支持自动对焦：' + capabilities.focusMode)
    }

    // 获取 video 标签或临时 DOM
    const videoElement = document.createElement('video')
    videoElement.setAttribute('playsinline', true)
    document.getElementById(elementId)?.appendChild(videoElement)

    videoElement.srcObject = stream
    await videoElement.play()

    const qrScanner = new Html5Qrcode(/* elementId */ videoElement)

    await qrScanner.start(
      { videoTrack }, // 使用已有的 videoTrack（绕开默认摄像头选择）
      config,
      (decodedText, decodedResult) => {
        console.log('扫码成功:', decodedText)
      },
      (errorMessage) => {
        console.warn('扫码失败:', errorMessage)
      },
    )
  } catch (err) {
    console.error('摄像头访问失败', err)
  }
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
    await html5QrCode.stop()
    return html5QrCode.clear()
  }
}
