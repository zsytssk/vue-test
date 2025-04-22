import { ref } from 'vue'

export type UseRequestOptions = {
  manual?: boolean
}

export function useRequest<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  opts: UseRequestOptions = { manual: false },
) {
  type ReturnT = Awaited<ReturnType<T>>
  const data = ref<ReturnT['data']>()
  const loading = ref(false)
  const error = ref('')
  const lastArgs = ref([] as any[] as Parameters<T>)

  const run = (...args: Parameters<T>) => {
    lastArgs.value = args
    loading.value = true
    error.value = ''
    return fn(...args)
      .then((res: ReturnT) => {
        if (res.code === 0) {
          data.value = res.data
          return data.value
        } else {
          error.value = res.msg
          throw new Error(res.msg)
        }
      })
      .finally(() => {
        loading.value = false
      })
  }

  const reload = () => {
    return run(...lastArgs.value)
  }

  if (!opts.manual) {
    run(...([] as unknown as Parameters<T>))
  }

  return { run, loading, data, reload, error }
}
