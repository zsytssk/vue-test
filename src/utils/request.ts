export type ServerData<T> = {
  code: number
  message?: string
  data?: T
}

type Param = {
  url: string
  method: string
  params?: Record<string, any>
  data?: Record<string, any>
  headers?: HeadersInit
}

const username = (import.meta as any).env.VITE_USERNAME
const password = (import.meta as any).env.VITE_PASSWORD
const ApiBaseUrl = (import.meta as any).env.VITE_BASE_API

console.log('test:>', { username, password, ApiBaseUrl })
function requestBase<T = any>(param: Param) {
  const { url, headers = {}, method, data = {}, params = {} } = param
  let localUrl = ApiBaseUrl + url
  const token = localStorage.getItem('token') as string
  const userId = localStorage.getItem('userId') as string
  const localParam: RequestInit = {
    method: method.toUpperCase(),
    headers: {
      'Content-Type': 'application/json',
      'x-token': token,
      'x-user-id': userId,
      ...headers,
    },
  }
  for (const key in params) {
    if (params[key] === undefined) {
      delete params[key]
    }
  }
  if (localParam.method === 'GET') {
    for (const key in params) {
      if (params[key] === undefined) {
        delete params[key]
      }
    }
    if (Object.keys(params).length) {
      localUrl = `${localUrl}?${new URLSearchParams(params).toString()}`
    }
  } else {
    for (const key in data) {
      if (data[key] === undefined) {
        delete data[key]
      }
    }
    if (Object.keys(data).length) {
      localParam.body = Object.keys(data).length ? JSON.stringify(data) : null
    }
  }

  return fetch(localUrl, {
    ...localParam,
  }).then((response) => response.json() as Promise<ServerData<T>>)
}

async function login() {
  const ele = await captcha()
  const captchaId = ele.data.captchaId
  const openCaptcha = ele.data.openCaptcha
  return requestBase({
    url: '/base/login',
    method: 'post',
    data: { username, password, captchaId, openCaptcha, captcha: '' },
  })
}
// 获取验证码
export const captcha = () => {
  return requestBase({
    url: '/base/captcha',
    method: 'post',
  })
}

export async function request(param: Param) {
  for (let i = 0; i < 3; i++) {
    const res = await requestBase(param)
    if (res.code === 7 && res.data.reload === true) {
      const res = await login()
      if (res.code === 0) {
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('userId', res.data.user.ID)
      }
      continue
    }
    return res
  }
}
