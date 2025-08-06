<template>
  <div>
    <el-button type="primary" @click="selectFolder">点击</el-button>
    <EnterExcelData ref="dialogRef" v-model="data" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import EnterExcelData from './EnterExcelData/EnterExcelData.vue'

const dialogRef = ref<InstanceType<typeof EnterExcelData>>()
const data = ref(
  Array.from({ length: 50 }, (_, i) => i + 1).map((number) => {
    return {
      user: number,
      name: `User Mustersträböüß ${number}`,
      phone: `${number}${number}${number}${number}-${number}${number}${number}${number}`,
      gender: `${number & 1 ? 'M' : 'F'}`,
      age: number * 2,
      birth: `2020-07-01`,
      name2: `User ${number}`,
      phone2: `${number}${number}${number}${number}-${number}${number}${number}${number}`,
      gender2: `${number & 1 ? 'M' : 'F'}`,
      age2: number * 2,
      birth2: `${number * 100}-07-01`,
      name3: `User ${number}`,
      phone3: `${number}${number}${number}${number}-${number}${number}${number}${number}`,
      gender3: `${number & 1 ? 'M' : 'F'}`,
      age3: number * 2,
      birth3: `${number * 100}-07-01`,
    }
  }),
)

// 打开文件夹选择
function selectFolder() {
  dialogRef.value?.openDialog().then((data) => {
    console.log(data)
  })
}
</script>

<style lang="scss" scoped></style>
