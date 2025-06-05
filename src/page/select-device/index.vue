<template>
  <el-dialog
    v-model="dialogVisible"
    title="选择设备"
    width="800px"
    :class="$style.dialog"
    @before-close="localClosePlanDialog"
  >
    <div class="elc-panel-box">
      <div class="elc-panel">
        <div class="elc-search-box">
          <el-input
            v-model="queryCategory"
            clearable
            placeholder="请搜索设备分类"
            @input="onQueryCategoryChanged"
          />
        </div>
        <div class="elc-panel-main">
          <el-tree-v2
            highlight-current
            ref="treeCategoryRef"
            :data="categoryList"
            :props="categoryProps"
            :height="339"
            @current-change="onCurCategoryChange"
            :filter-method="filterMethod"
          >
            <template #default="{ data, node }">
              <show-tooltip
                :content="node.label + node.label + node.label"
                width="100%"
              />
              <span class="elc-icon-box">
                <el-icon v-if="currentCategory?.ID === data.ID">
                  <Check />
                </el-icon>
              </span>
            </template>
            <template #empty>
              <el-empty description="暂无数据" />
            </template>
          </el-tree-v2>
        </div>
      </div>
      <div class="elc-panel">
        <div class="elc-search-box">
          <el-input
            clearable
            v-model="queryDevice"
            placeholder="请搜索设备"
            @input="onQueryDeviceChanged"
          />
        </div>
        <div class="elc-panel-main">
          <el-tree-v2
            ref="treeDeviceRef"
            highlight-current
            :data="deviceList"
            :props="deviceProps"
            :height="339"
            @current-change="onCurDeviceChange"
            :filter-method="filterMethod"
          >
            <template #default="{ data, node }">
              <show-tooltip :content="node.label" width="100%" />
              <span class="elc-icon-box">
                <el-icon v-if="currentDevice?.ID === data.ID">
                  <Check />
                </el-icon>
              </span>
            </template>
            <template #empty>
              <el-empty description="暂无数据" />
            </template>
          </el-tree-v2>
        </div>
      </div>
    </div>
    <template #footer>
      <div class="elc-footer-box">
        <div class="elc-tag-list">
          <el-tag v-if="currentDevice">
            <show-tooltip :content="currentDevice.deviceName" width="100%" />
          </el-tag>
          <el-tooltip v-if="currentDevice" content="删除" placement="top">
            <el-button link icon="Close" @click="onClearDevice" />
          </el-tooltip>
        </div>
        <div>
          <el-button @click="localClosePlanDialog">取 消</el-button>
          <el-button type="primary" @click="onConfirm">确 定</el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import type { ElTreeV2 } from 'element-plus'
import { ref } from 'vue'

import ShowTooltip from '@/components/show-tooltip/show-tooltip.vue'
import { useOpenDialog } from '@/components/useOpenDialog'
import { useRequest } from '@/hooks/useRequest'
import { request } from '@/utils/request'

const { data: categoryList } = useRequest(() =>
  request({
    url: '/deviceCategory/getDeviceCategoryAllList',
    method: 'get',
  }).then((res: any) => ({
    ...res,
    data: res.data.list,
  })),
)
const { data: deviceList, run } = useRequest((categoryId: number) =>
  request({
    url: '/device/getDeviceList',
    method: 'get',
    params: {
      categoryId,
    },
  }).then((res: any) => ({
    ...res,
    data: res.data.list,
  })),
)

const { dialogVisible, closeDialog, openDialog } = useOpenDialog(true)

const localClosePlanDialog = () => {
  closeDialog()
}
const onConfirm = () => {
  console.log('点击了确定')
}
const currentCategory = ref<CategoryItem>()
const currentDevice = ref<DeviceItem>()
const onCurCategoryChange = (data: CategoryItem, node: Node<CategoryItem>) => {
  console.log(`test:>onCurCategoryChange`, data, node)
  currentCategory.value = { ID: data.ID, categoryName: data.categoryName }
  run(data.ID)
}
const onCurDeviceChange = (
  data: DeviceItem,
  node: Node<DeviceItem>,
  event: any,
) => {
  console.log(`test:>onCurDeviceChange`, data, node, event)
  currentDevice.value = { ID: data.ID, deviceName: data.deviceName }
  //   radios.value = row.id
}
const onClearDevice = () => {
  currentDevice.value = undefined
}

type CategoryItem = {
  ID: number
  categoryName: string
  children?: CategoryItem[]
}
type DeviceItem = {
  ID: number
  deviceName: string
  children?: DeviceItem[]
}

type Node<T> = {
  data: T
  children?: Node<T>[]
  disabled?: boolean
  isLeaf: boolean
  key: string
  label: string
  level: number
}

const queryCategory = ref('')
const queryDevice = ref('')
const treeCategoryRef = ref<InstanceType<typeof ElTreeV2>>()
const treeDeviceRef = ref<InstanceType<typeof ElTreeV2>>()
const categoryProps = {
  value: 'ID',
  label: 'categoryName',
  children: 'children',
}
const deviceProps = {
  value: 'ID',
  label: 'deviceName',
  children: 'children',
}

const onQueryCategoryChanged = (query: string) => {
  treeCategoryRef.value!.filter(query)
}
const onQueryDeviceChanged = (query: string) => {
  treeDeviceRef.value!.filter(query)
}
const filterMethod = (query: string, _data: any, node: Node<any>) => {
  return node.label!.includes(query)
}
</script>

<style lang="scss" module>
.dialog {
  :global {
    .elc-panel-box {
      display: flex;
      //   gap: 20px;
      height: 400px;
      .elc-panel {
        display: flex;
        flex: 1;
        flex-direction: column;
        border: 1px solid rgba(0, 0, 34, 0.08);
        height: 100%;
        &:not(:first-child) {
          border-left: none;
        }
        .elc-search-box {
          border-bottom: 1px solid rgba(0, 0, 34, 0.08);
          padding: 10px;
          height: 40px;
        }
        .elc-icon-box {
          margin-right: 8px;
        }
      }
    }
    .elc-footer-box {
      display: flex;
      justify-content: space-between;
      .elc-tag-list {
        display: flex;
        gap: 2px 8px;
        align-items: center;
        .el-tag {
          display: block;
          max-width: 100px;
          line-height: 24px;
        }
      }
    }
  }
}
</style>
