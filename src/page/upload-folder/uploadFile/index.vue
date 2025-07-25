<template>
  <el-upload
    :file-list="localModel"
    :http-request="customUpload"
    :on-success="uploadSuccess"
    :on-remove="handleRemove"
    :on-error="uploadError"
    v-bind="$attrs"
  >
    <slot></slot>
  </el-upload>
</template>

<script setup lang="ts">
import { request } from '@/utils/request'
import { ElMessage, type UploadProps } from 'element-plus'
import { computed } from 'vue'

type FileItem = { url: string; name: string; tag?: string }
const props = defineProps<{
  modelValue: FileItem[]
}>()
const emit = defineEmits(['update:modelValue', 'change'])

const localModel = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    // 不接受上传过程的各种状态改变, 只通过uploadSuccess添加文件
    if (val.find((item) => !item.url)) {
      return
    }
    let newVal = val.map((item) => ({
      name: item.name,
      tag: item.tag,
      url: item.url,
    }))
    emit('update:modelValue', newVal)
    emit('change', newVal)
  },
})

const handleRemove: UploadProps['onRemove'] = (delFile, delFiles) => {
  const newVal = localModel.value.filter((item) => item.url !== delFile.url)
  console.log(`test:>UploadCom:>onRemove`, delFile, delFiles)
  localModel.value = [...newVal]
}
const uploadSuccess: UploadProps['onSuccess'] = (response) => {
  console.log(`test:>UploadCom:>onSuccess`, response.data.file)
  localModel.value = [...localModel.value, response.data.file]
}

const uploadError = (res: any) => {
  ElMessage.error(JSON.parse(res.message)?.msg)
}

const customUpload = (param: any) => {
  const formData = new FormData()
  formData.append('file', param.file)

  // service
  //   .post(`/fileUploadAndDownload/upload`, formData, {
  //     onUploadProgress: (progressEvent) => {
  //       if (!progressEvent.total) {
  //         return
  //       }
  //       if (progressEvent.total > 0) {
  //         const percent = Math.round(progressEvent.loaded / progressEvent.total)
  //         param.onProgress({
  //           ...progressEvent,
  //           percent: percent,
  //         })
  //       }
  //     },
  //   })
  //   .then((res) => {
  //     param.onSuccess(res)
  //   })
  //   .catch((err) => {
  //     param.onError(err)
  //   })
}
</script>

<style lang="scss" scoped></style>
