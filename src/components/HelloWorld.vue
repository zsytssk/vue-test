<script setup lang="ts">
import { onMounted, ref } from 'vue'

defineProps<{}>()

const videoRef = ref<HTMLVideoElement>()
const start = () => {}
const stop = () => {}

onMounted(() => {
  if (!videoRef.value) {
    return
  }
})
</script>

<template>
  <div id="reader"></div>
  <div id="result"></div>
  <div class="card">
    <button
      type="button"
      @click="start">
      start
    </button>
    <button
      type="button"
      @click="stop">
      stop
    </button>
  </div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
video {
  /* background-color: red; */
}
</style>
