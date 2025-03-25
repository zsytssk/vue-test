export default function WaPosition() {
  return {
    name: 'wa-position',
    apply: 'serve',
    transform(code: string, id:string) {
      const index = id.lastIndexOf('.')
      const ext = id.slice(index + 1)
      if (ext.toLowerCase() === 'vue') {
        return codeLineTrack(code, id)
      }
    },
  }
}

const codeLineTrack = (code:string, id:string) => {
  const lineList = code.split('\n')
  const newList: string[] = []
  lineList.forEach((item, index) => {
    newList.push(addLineAttr(item, index + 1, id)) // 添加位置属性，index+1为具体的代码行号
  })
  return newList.join('\n')
}

const addLineAttr = (lineStr: string, line: number, id: string) => {
  if (!/^\s+</.test(lineStr)) {
    return lineStr
  }

  const reg = /((((^(\s)+\<))|(^\<))[\w-]+)|(<\/template)/g
  const leftTagList = lineStr.match(reg)
  if (leftTagList) {
    const  tagList = Array.from(new Set(leftTagList))
    tagList.forEach((item) => {
      const skip = [
        'KeepAlive',
        'template',
        'keep-alive',
        'transition',
        'router-view',
      ]
      if (item && !skip.some((i) => item.indexOf(i) > -1)) {
        const reg = new RegExp(`${item}`)
        const location = `${item} code-location="${id}:${line}"`
        lineStr = lineStr.replace(reg, location)
      }
    })
  }
  return lineStr
}
