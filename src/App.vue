<script setup lang="ts">
import HelloWorld from './components/html5QrCode.vue'
</script>

<template>
  <HelloWorld />
</template>

<style scoped>
.logo {
  transition: filter 300ms;
  will-change: filter;
  padding: 1.5em;
  height: 6em;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
