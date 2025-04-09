<script setup lang="ts">
import { convert_js_image_to_luma, decode_barcode } from 'rxing-wasm'
import { ref } from 'vue'

defineProps<{}>()
defineOptions({ name: 'rxing-wasm' })

const resultText = ref('')
const inputFile = ref<HTMLInputElement>()

const uploadFile = (inputEle?: HTMLInputElement) => {
  return new Promise<[boolean, string | File]>((resolve) => {
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

function decodeBarcode(canvas: HTMLCanvasElement) {
  let context = canvas.getContext('2d')
  let height = canvas.height
  let width = canvas.width
  let imageData = context?.getImageData(0, 0, width, height)

  let data = imageData?.data
  let luma8Data = convert_js_image_to_luma(data as any)
  let parsedBarcode = decode_barcode(luma8Data, width, height)

  console.log(`test:>`, parsedBarcode)
  return parsedBarcode
}

const startScanFile = async () => {
  const [err, file] = await uploadFile(inputFile.value)
  if (err) {
    console.error(file)
    return
  }

  const reader = new FileReader()

  reader.onload = function (e) {
    const img = new Image()

    // 当图片加载完成时，将其绘制到 canvas 上
    img.onload = function () {
      const canvas = document.getElementById('myCanvas') as HTMLCanvasElement
      const ctx = canvas.getContext('2d')

      // 清空画布，防止每次上传新图像时覆盖上一个图像
      ctx?.clearRect(0, 0, canvas.width, canvas.height)

      // 绘制上传的图片
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height) // 可以调整宽高，适应 canvas
      decodeBarcode(canvas)
    }

    // 设置图片的源为上传的文件
    img.src = e.target?.result as string
  }

  // 读取文件内容为 DataURL
  reader.readAsDataURL(file as File)

  // const [err2, str2] = await scanFile('reader', file as File)

  // if (err2) {
  //   console.error(str2)
  //   return
  // }
  // resultText.value = str2
}

const stop = () => {
  resultText.value = ''
}
</script>

<template>
  <div class="box">
    <div class="inner">
      <div id="reader">
        <canvas
          id="myCanvas"
          width="600"
          height="600"></canvas>
      </div>
      <div class="allText">{{ resultText ? resultText : '~' }}</div>
      <div style="opacity: 0">
        <input
          ref="inputFile"
          type="file"
          accept="image/*"
          style="pointer-events: none" />
      </div>
      <div class="card">
        <button
          type="button"
          @click="startScanFile">
          startScanFile
        </button>
        <button
          type="button"
          @click="stop">
          stop
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.box {
  display: flex;
  align-items: center;
  margin: 0;
  background-color: #242424;
  min-height: 100vh;
  .inner {
    margin: 0 auto;
    width: 600px;
    .allText {
      width: 100%;
      overflow: hidden;
      color: #fff;
      text-align: center;
      word-break: break-all;
    }
    #reader {
      margin: 0 auto;
      background: #fff;
      width: 600px;
      height: 600px;
      overflow: hidden;
    }
    .card {
      display: flex;
      justify-content: center;
      gap: 10px;
    }
  }
}
</style>
