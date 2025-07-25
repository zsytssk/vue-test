<template>
  sdfsfsdfsd
  <el-button @click="files.push({ name: '1.png' })">上传</el-button>
  <UploadFile :model-value="files" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import UploadFile from './uploadFile/index.vue'
const files = ref([])
</script>

<style lang="scss" scoped></style>
