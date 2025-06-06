<template>
  <el-select
    v-model="inputValue"
    placeholder="请选择设备"
    @click="onFocus"
    style="width: 240px"
  />

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
          <el-tree
            default-expand-all
            highlight-current
            node-key="ID"
            :expand-on-click-node="false"
            :current-node-key="currentCategory?.ID"
            ref="treeCategoryRef"
            :data="categoryList"
            :props="categoryProps"
            :height="339"
            @current-change="onCurCategoryChange"
            :filterNodeMethod="filterMethod"
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
          </el-tree>
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
          <el-tree
            highlight-current
            default-expand-all
            ref="treeDeviceRef"
            node-key="ID"
            :current-node-key="currentDevice?.ID"
            :expand-on-click-node="false"
            :data="deviceList"
            :props="deviceProps"
            :height="339"
            @current-change="onCurDeviceChange"
            :filterNodeMethod="filterMethod"
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
          </el-tree>
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
            <el-button link icon="Close" @click="onResetDialog" />
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
import { ref, watch } from 'vue'

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

const { data: deviceList, run: getDeviceList } = useRequest(
  (categoryId?: number) =>
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

const inputValue = ref('')
const inputRef = ref()

const { dialogVisible, closeDialog, openDialog } = useOpenDialog(false)

const onFocus = () => {
  inputRef.value?.blur()
  openDialog()
}

const localClosePlanDialog = () => {
  currentCategory.value = undefined
  currentDevice.value = undefined
  closeDialog()
}
const onConfirm = () => {
  inputValue.value = currentDevice.value?.deviceName || ''
  closeDialog()
}
const currentCategory = ref<CategoryItem>()
const currentDevice = ref<DeviceItem>()
const onCurCategoryChange = (data: CategoryItem, node: Node<CategoryItem>) => {
  console.log(`test:>onCurCategoryChange`, data, node)
  currentCategory.value = { ID: data.ID, categoryName: data.categoryName }
  getDeviceList(data.ID)
}
const onCurDeviceChange = (
  data: DeviceItem,
  node: Node<DeviceItem>,
  event: any,
) => {
  console.log(`test:>onCurDeviceChange`, data, node, event)
  currentDevice.value = { ID: data.ID, deviceName: data.deviceName }
}
const onResetDialog = () => {
  currentCategory.value = undefined
  currentDevice.value = undefined
  getDeviceList()
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

watch(
  () => dialogVisible.value,
  (val) => {
    if (val) {
      getDeviceList()
    } else {
      currentCategory.value = undefined
      currentDevice.value = undefined
    }
  },
)
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
        overflow: hidden;
        flex-direction: column;
        border: 1px solid rgba(0, 0, 34, 0.08);
        height: 100%;
        &:not(:first-child) {
          border-left: none;
        }
        .elc-search-box {
          border-bottom: 1px solid rgba(0, 0, 34, 0.08);
          padding: 10px;
          height: 60px;
          box-sizing: border-box;
        }
        .elc-icon-box {
          margin-right: 8px;
        }
        .elc-panel-main {
          flex: 1;
          overflow: auto;
          scrollbar-color: auto;
          scrollbar-width: unset;
          &:hover {
            &::-webkit-scrollbar-thumb {
              background: rgba(0, 0, 0, 0.3);
            }

            &::-webkit-scrollbar-thumb:hover {
              background: rgba(0, 0, 0, 0.5);
            }
          }
          &::-webkit-scrollbar {
            width: 6px;
          }

          /* Track */
          &::-webkit-scrollbar-track {
            background: transparent;
          }

          /* Handle */
          &::-webkit-scrollbar-thumb {
            border-radius: 5px;
            background: rgba(0, 0, 0, 0);
          }

          /* Handle on hover */
          &::-webkit-scrollbar-thumb:hover {
            background: rgba(0, 0, 0, 0);
          }
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
