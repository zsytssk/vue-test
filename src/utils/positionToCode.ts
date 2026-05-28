export const initDom = (app) => {
  if (import.meta.env.MODE === 'development') {
    app.config.warnHandler = (msg: any, instance: any, trace: any) => {
      // 过滤包含 code-location 的非 props 属性警告
      if (msg.includes('Extraneous non-props attributes (code-location)')) {
        return // 不输出这个警告
      }
      // 其他警告正常打印
      console.warn(`Vue warn: ${msg}\n${trace}`)
    }

    document.onmousedown = function (e) {
      if (e.shiftKey && e.altKey && e.button === 0) {
        e.preventDefault()
        sendRequestToOpenFileInEditor(getFilePath(e))
      }
    }
  }
}

const getFilePath = (e: any) => {
  let element = e
  if (e.target) {
    element = e.target
  }
  if (!element || !element.getAttribute) return null
  if (element.getAttribute('code-location')) {
    return element.getAttribute('code-location')
  }
  return getFilePath(element.parentNode)
}

const sendRequestToOpenFileInEditor = (filePath: any) => {
  const protocol = window.location.protocol ? window.location.protocol : 'http:'
  const hostname = window.location.hostname
    ? window.location.hostname
    : 'localhost'
  const port = window.location.port ? window.location.port : '80'
  fetch(
    `${protocol}//${hostname}:${port}/waPositionCode?filePath=${filePath}`,
  ).catch((error) => {
    console.log(error)
  })
}
