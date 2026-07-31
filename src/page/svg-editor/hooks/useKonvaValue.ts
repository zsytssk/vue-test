import type Konva from 'konva/lib/_CoreInternals'
import { onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'

export function useKonvaValue<T extends Konva.Node>(
  model: Ref<T | undefined>,
  keys: string,
) {
  const localValueRef = ref()

  onMounted(() => {
    const keyArr = keys.split(/\s+/).filter(Boolean)
    if (keyArr.length < 1) {
      throw new Error(`${keys} is no right!`)
    }
    localValueRef.value = model.value?.getAttr(keyArr[0])
    const stopWatch = watch(
      () => localValueRef.value,
      (val) => {
        for (const key of keyArr) {
          model.value?.setAttr(key, val)
        }
      },
    )

    onBeforeUnmount(() => {
      stopWatch()
    })
  })

  return localValueRef
}
