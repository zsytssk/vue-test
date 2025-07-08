import { ref } from 'vue'

export type OpenDialogBase = 'create' | 'edit' | 'view'
export function useOpenDialog<U = any, OpenDialogType = OpenDialogBase>(
  defaultVisible = false,
) {
  /** 弹层打开状态 */
  const dialogVisible = ref(defaultVisible)
  /** 关闭时候调用的返回，用来触发列表列表刷新 */
  const closeResolve = ref<(returnVal?: U) => void>()
  const openType = ref<OpenDialogType>()

  const openDialog = (type?: OpenDialogType) => {
    return new Promise<U | undefined>((resolve) => {
      dialogVisible.value = true
      openType.value = type
      closeResolve.value = resolve
    })
  }

  const closeDialog = (val?: U) => {
    closeResolve.value?.(val)
    dialogVisible.value = false
    closeResolve.value = undefined
    openType.value = undefined
  }

  return {
    dialogVisible,
    openType,
    openDialog,
    closeDialog,
  }
}
