<template>
  <div ref="editorRef" class="editor" />
  <el-button @click="click">load</el-button>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'

const editorRef = ref<HTMLDivElement>()
const editorViewRef = ref()
// 动态加载组件
async function loadComponent() {
  const { basicSetup, EditorView } = await import('codemirror')
  const { javascript } = await import('@codemirror/lang-javascript')
  const { placeholder } = await import('@codemirror/view')
  return { basicSetup, EditorView, javascript, placeholder }
}

const click = () => {
  const content = editorViewRef.value?.state.doc.toString()
  console.log(content)
}
onMounted(async () => {
  const { basicSetup, EditorView, javascript, placeholder } =
    await loadComponent()
  let myWhiteTheme = EditorView.baseTheme({
    '&': {
      backgroundColor: 'white',
      color: '#333', // Dark gray text for contrast
      height: '100px', // 设置最大高度
      overflow: 'auto', // 内容超出时滚动
    },
    '.cm-wrap': { height: `100px`, border: `1px solid silver` },
    '.cm-scroller ': { overflow: 'auto' },
  })
  const updateFn = EditorView.updateListener.of((update) => {
    if (update.docChanged) {
      // The document content has changed
      const newContent = update.state.doc.toString()
      console.log('Editor content updated:', newContent)
      // Perform your desired actions based on the updated content
    }
  })
  editorViewRef.value = new EditorView({
    doc: '() => {}\n',
    extensions: [
      basicSetup,
      updateFn,
      myWhiteTheme,
      placeholder(`代码示例：
(orderInfo, curNodeInfo, tplInfo) => {
  console.log(orderInfo, curNodeInfo, tplInfo)
  return false
}`),
      javascript(),
    ],
    parent: editorRef.value,
  })

  console.log(editorViewRef.value)
})
</script>

<style lang="scss" scoped>
.editor {
  background-color: #fff;
}
</style>
