<template>
  <el-dialog
    v-model="dialogVisible"
    align-center
    :fullscreen="fullscreen"
    :class="$style.dialog"
    :show-close="false"
    @before-close="() => localCloseDialog()"
  >
    <template #header="{ close, titleId, titleClass }">
      <div class="my-header">
        <h4 :id="titleId" :class="titleClass">设备数据录入</h4>
        <div class="btn-list">
          <el-button link @click="fullscreen = !fullscreen">
            <el-icon :size="24"><FullScreen /></el-icon>
          </el-button>
          <el-button link class="btn-close">
            <el-icon :size="24" color="#999" @click="close">
              <Close />
            </el-icon>
          </el-button>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="testFn()">测试</el-button>
        <el-button @click="exportData()">导出数据</el-button>
        <el-button @click="localCloseDialog()">取 消</el-button>
        <el-button type="primary" :disabled="!changed" @click="onConfirm">
          确 定
        </el-button>
      </div>
    </template>
    <div class="btn-box">
      <el-button link icon="plus" @click="addRecord()">新增行1</el-button>
      <el-button
        v-if="selectedCount > 0"
        link
        icon="delete"
        @click="deleteRows()"
      >
        删除行
      </el-button>
    </div>
    <div class="excel-box">
      <vue-excel-editor
        ref="excelEditorRef"
        v-model="localModel"
        v-model:selected-count="selectedCount"
        no-footer
        no-header-edit
        disable-panel-filter
        disable-panel-setting
        class="excel-editor"
        @delete="onDelete"
        @update="onUpdate"
        @select="onSelect"
      >
        <vue-excel-column
          field="user"
          label="用户ID"
          type="string"
          width="80px"
          auto-fill-width
          readonly
        />
        <vue-excel-column
          field="name"
          label="用户名"
          type="string"
          width="150px"
          auto-fill-width
        />
        <vue-excel-column
          field="phone"
          label="联系方式"
          type="string"
          width="130px"
          auto-fill-width
        />
        <vue-excel-column
          field="gender"
          label="性别"
          type="select"
          width="50px"
          :options="['男', '女', '其他']"
          auto-fill-width
        />
        <vue-excel-column
          field="age"
          label="年纪"
          type="number"
          width="70px"
          auto-fill-width
        />
        <vue-excel-column
          field="birth"
          label="生日"
          type="date"
          width="80px"
          auto-fill-width
        />
      </vue-excel-editor>
    </div>
  </el-dialog>
</template>
<script setup lang="ts">
import { useOpenDialog } from '@/hooks/useOpenDialog'
import { ref, toRef, watch } from 'vue'
import { useExcelModelChnage } from './EnterExcelDataUtils'

defineExpose({
  openDialog: localOpenDialog,
})

const props = defineProps<{ modelValue: any }>()
const excelEditorRef = ref()

const { openDialog, dialogVisible, closeDialog } = useOpenDialog(true)

const localModel = toRef(props, 'modelValue')
const selectedCount = ref(0)
const changed = useExcelModelChnage(localModel)
const fullscreen = ref(false)
function localOpenDialog(parentId = 0) {
  return openDialog()
}

function localCloseDialog(data?: any) {
  closeDialog(data)
}

const onConfirm = () => {
  const list = localModel.value
  list.forEach((item: any) => {
    delete item.$id
  })
  localCloseDialog(list)
}

const onDelete = (records: any) => {
  // records = records.map((rec: any) => ['del', rec.keys.join()])
  console.log(`test:>onDelete`, records)
}
const onUpdate = (records: any) => {
  const data = records.map((rec: any) => [
    'hset',
    rec.keys.join(),
    rec.name,
    rec.newVal,
  ])
  excelEditorRef.value.getKeys(records[0].keys)
  console.log(
    `test:>onUpdate`,
    records,
    data,
    localModel.value,
    excelEditorRef.value,
  )
}
const onSelect = (records: any) => {
  console.log(`test:>onSelect`, records)
}

const addRecord = () => {
  const rec = {
    user: 'nm',
    name: 'Norman Morris',
    phone: '1-222-3333333',
    gender: 'M',
    age: 28,
    birth: '1993-05-16',
  }
  // Call this to new record
  excelEditorRef.value.newRecord(rec)
}
const deleteRows = () => {
  excelEditorRef.value.deleteSelectedRecords(0)
}
const exportData = () => {
  const format = 'csv'
  const exportSelectedOnly = false
  const filename = 'test'
  excelEditorRef.value.exportTable(format, exportSelectedOnly, filename)
}

const testFn = () => {
  console.log('testFn:>', excelEditorRef.value)
}
</script>
<style lang="scss" module>
.dialog {
  &:global(:not(.is-fullscreen)) {
    width: 1000px;
    max-width: 80%;
    max-height: 80%;
    height: 600px;
  }
  overflow: hidden;
  display: flex;
  flex-direction: column;
  :global {
    .my-header {
      margin-top: -10px;
      h4 {
        margin: 0;
        font-size: 16px;
      }
      height: 54px;
      border-bottom: 1px solid #ddd;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-left: 10px;
      .btn-list {
        height: 100%;
        display: flex;
        gap: 0;
        .el-button + .el-button {
          margin-left: 0;
        }
      }
      .el-button {
        height: 100%;
        padding: 0 10px;
        cursor: pointer;
      }
    }
    .el-dialog__body {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      .btn-box {
        margin-bottom: 8px;
      }
      .excel-box {
        flex: 1;
        overflow: hidden;
        .excel-editor {
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
      }
    }
  }
}
</style>
