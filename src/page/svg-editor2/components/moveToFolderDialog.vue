<template>
  <el-dialog
    v-model="dialogVisible"
    align-center
    :class="$style.dialog"
    title="移动到分组中"
    @close="() => localCloseDialog()"
  >
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="localCloseDialog()">取 消</el-button>
        <el-button type="primary" @click="onConfirm">确 定</el-button>
      </div>
    </template>

    <el-form
      ref="formRef"
      label-position="top"
      :model="formData"
      :rules="rules"
    >
      <el-form-item label="" prop="selectGroup">
        <el-select v-model="formData.selectGroup" placeholder="请选择分组">
          <el-option
            v-for="item in groupsRef"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          ></el-option>
        </el-select>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>
<script setup lang="ts">
import { useOpenDialog } from '@/hooks/useOpenDialog'
import { ref } from 'vue'
import type { CompFolder } from '../svg-editor.vue'

type FormData = {
  selectGroup?: string
}
defineExpose({
  openDialog: localOpenDialog,
})

const { openDialog, dialogVisible, closeDialog } = useOpenDialog<string>()
const formRef = ref()
const formData = ref<FormData>({})
const groupsRef = ref<CompFolder[]>([])

function localOpenDialog(groups: CompFolder[]) {
  groupsRef.value = groups
  return openDialog()
}

function localCloseDialog(selectId?: string) {
  formData.value = {}
  groupsRef.value = []
  closeDialog(selectId)
  formRef.value?.resetFields()
}

const onConfirm = async () => {
  await formRef.value?.validate()
  const selectId = formData.value?.selectGroup
  localCloseDialog(selectId)
}
const rules = {
  name: {
    required: true,
    message: '请选择分组',
    trigger: ['change', 'blur'],
  },
}
</script>
<style lang="scss" module>
.dialog {
  :global {
    width: 500px;
  }
}
</style>
