<script setup lang="ts">
import ZTable from '../components/zTable/index.vue'
</script>

<template>
  <div :class="$style.tableBox">
    <ZTable :table-props="{ class: 'test-table' }">
      <el-table-column
        align="center"
        label="小组编号"
        prop="code" />
      <el-table-column
        align="center"
        label="小组名称"
        prop="name" />
      <el-table-column
        align="center"
        label="小组组长"
        prop="leaderName" />
      <el-table-column
        align="center"
        label="小组人数"
        prop="mnCount" />
      <el-table-column
        align="center"
        label="创建时间"
        prop="CreatedAt"></el-table-column>
    </ZTable>
  </div>
</template>

<style lang="scss" module>
.tableBox {
  :global {
    margin: 20px 20px;
    background-color: #fff;
  }
}
</style>
