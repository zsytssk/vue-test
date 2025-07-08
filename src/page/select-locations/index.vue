<template>
  <SelectLocationsDialog ref="dialogRef" />
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import SelectLocationsDialog from './select-locations-dialog.vue'

const dialogRef = ref<InstanceType<typeof SelectLocationsDialog>>()
onMounted(() => {
  dialogRef.value?.openDialog()
})
</script>
<style lang="scss" scoped></style>
