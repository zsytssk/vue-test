import { computed, ref, type Ref, watch } from 'vue'

export function useExcelModelChnage(model: Ref<any>) {
  const changeTime = ref(0)

  watch(
    model,
    () => {
      changeTime.value++
    },
    { deep: true },
  )

  return computed(() => changeTime.value > 1)
}
