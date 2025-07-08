import { ref } from 'vue'

export type OpenDialogBase = 'create' | 'edit' | 'view'
export function useSearchParams<SearchInfo extends {}>(
  defaultValue = {} as SearchInfo,
) {
  const searchFormData = ref({ ...defaultValue })
  const searchParams = ref({ ...defaultValue })
  const reset = () => {
    searchParams.value = {}
    searchFormData.value = {}
  }
  const confirm = () => {
    searchParams.value = {}
    for (const key in searchFormData.value) {
      if (searchFormData.value[key]) {
        searchParams.value[key] = searchFormData.value[key]
      }
    }
  }

  return {
    searchParams,
    searchFormData,
    reset,
    confirm,
  }
}
