<template>
  <el-dialog
    align-center
    v-model="dialogVisible"
    :class="$style.dialog"
    title="库位选择"
  >
    <div class="search-box">
      <el-form
        ref="elFormRef"
        :model="formData"
        label-position="left"
        :inline="true"
      >
        <el-form-item label="所属仓库:" :prop="formData.houseCode">
          <el-select
            v-model="formData.houseCode"
            style="width: 200px"
            placeholder="请选择仓库"
          >
            <el-option
              v-for="(sonItem, sonIndex) in [
                { label: '请选择仓库', value: '' },
              ]"
              :key="sonIndex"
              :label="sonItem.label"
              :value="sonItem.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="所属库区:" :prop="formData.areaCode">
          <el-select
            v-model="formData.areaCode"
            style="width: 200px"
            placeholder="请选择库区"
          >
            <el-option
              v-for="(sonItem, sonIndex) in [
                { label: '请选择库区', value: '' },
              ]"
              :key="sonIndex"
              :label="sonItem.label"
              :value="sonItem.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="物料查询:" :prop="formData.materialQuery">
          <el-input
            v-model="formData.materialQuery"
            style="width: 250px"
            placeholder="请输入物料编号或名称"
          />
        </el-form-item>
      </el-form>
    </div>
    <div class="location-box">
      <div class="statistic-bar">
        <div class="statistic-item" @click="toggleState('occupied')">
          <StatusIcon state="occupied" :ui-state="stateMap.occupied">
            已存储
          </StatusIcon>
        </div>
        <div class="statistic-item" @click="toggleState('empty')">
          <StatusIcon state="empty" :ui-state="stateMap.empty">
            空库位
          </StatusIcon>
        </div>
        <div class="statistic-item" @click="toggleState('enter')">
          <StatusIcon state="enter" :ui-state="stateMap.enter">
            已分配入库库位
          </StatusIcon>
        </div>
        <div class="statistic-item" @click="toggleState('out')">
          <StatusIcon state="out" :ui-state="stateMap.out">
            已分配出库库位
          </StatusIcon>
        </div>
      </div>
      <div class="location-list">
        <div class="location-inner">
          <div class="location-collection">
            <div
              class="location-column"
              v-for="(item, index) in locationList"
              :key="index"
            >
              <StatusIcon
                v-for="inItem in item"
                :key="inItem.id"
                :state="inItem.status"
                :ui-state="getStatusIconState(inItem.status)"
              />
            </div>
          </div>
          <div class="location-collection">
            <div
              class="location-column"
              v-for="(item, index) in locationList"
              :key="index"
            >
              <StatusIcon
                v-for="inItem in item"
                :key="inItem.id"
                :state="inItem.status"
                :ui-state="getStatusIconState(inItem.status)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { useOpenDialog } from '@/hooks/useOpenDialog'
import { useSearchParams } from '@/hooks/useSearchParams'
import { onMounted, ref } from 'vue'
import { ElForm } from 'element-plus/es'
import StatusIcon, { type UiState } from './status-icon.vue'
defineProps<{}>()
defineExpose({ openDialog: localOpenDialog })

const { dialogVisible, openDialog } = useOpenDialog()
const { searchFormData: formData } = useSearchParams<{
  houseCode: number
  areaCode: number
  materialQuery: string
}>()
const elFormRef = ref<InstanceType<typeof ElForm>>()
const locationList = ref<any>([])
const stateMap = ref({
  occupied: 'normal' as UiState,
  empty: 'normal' as UiState,
  enter: 'normal' as UiState,
  out: 'normal' as UiState,
})

const toggleState = (type: 'occupied' | 'empty' | 'enter' | 'out') => {
  const new_state = stateMap.value[type] === 'normal' ? 'disabled' : 'normal'
  stateMap.value[type] = new_state
}

const getStatusIconState = (type: 'occupied' | 'empty' | 'enter' | 'out') => {
  return stateMap.value[type] === 'normal' ? 'normal' : 'hidden'
}

onMounted(() => {
  for (let i = 0; i < 30; i++) {
    const columnList = [] as any[]
    for (let j = 0; j < 4; j++) {
      columnList.push({
        id: i * 4 + j,
        status: getRandomState(),
      })
    }
    locationList.value.push(columnList)
  }
})

function getRandomState() {
  const random = Math.random()
  if (random > 0.75) {
    return 'occupied'
  }
  if (random > 0.5) {
    return 'empty'
  }
  if (random > 0.25) {
    return 'enter'
  }
  return 'out'
}

function localOpenDialog() {
  openDialog()
}
</script>

<style lang="scss" module>
.dialog {
  width: 1200px;
  :global {
    .location-box {
      display: flex;
      margin-top: 16px;
      .statistic-bar {
        width: 180px;
        display: flex;
        flex-direction: column;
        gap: 24px;
        padding-top: 50px;
      }
      .location-list {
        .location-inner {
          display: flex;
          flex-direction: column;
          gap: 8%;
          .location-collection {
            flex: 1;
            display: flex;
            flex-direction: row;
            gap: 16px;
            padding: 20px;
            overflow-x: auto;
            /* 自定义滚动条样式 */
            scrollbar-color: auto;
            scrollbar-width: unset;
            &::-webkit-scrollbar {
              height: 6px;
            }

            /* Track */
            &::-webkit-scrollbar-track {
              background: transparent;
            }

            /* Handle */
            &::-webkit-scrollbar-thumb {
              border-radius: 5px;
              background: transparent;
              // background: rgba(0, 0, 0, 0.3);
            }
            &:hover::-webkit-scrollbar-thumb {
              background: rgba(0, 0, 0, 0.3);
            }

            /* Handle on hover */
            &::-webkit-scrollbar-thumb:hover {
              background: rgba(0, 0, 0, 0.5);
            }
            .location-column {
              display: flex;
              flex-direction: column;
              width: 32px;
              gap: 24px;
            }
          }
        }
      }
      .location-list {
        flex: 1;
        height: 590px;
        border-radius: 20px;
        padding: 22px;
        background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Crect x='0' y='0' width='100%25' height='100%25' rx='20' ry='20' fill='none' stroke='rgba(100, 100, 100, 0.6)' stroke-width='2' stroke-dasharray='8,4'/%3E%3C/svg%3E")
          center/100% 100% no-repeat;
        position: relative;
        &::before,
        &::after {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          top: 48%;
          border-top: 1px solid;
          border-image: repeating-linear-gradient(
            45deg,
            rgba(100, 100, 100, 0.6) 0 8px,
            transparent 8px 12px
          );
          border-image-slice: 1;
        }
        &::after {
          top: 52%;
        }
        & > .location-inner {
          content: '';
          position: absolute;
          left: 24px;
          right: 24px;
          top: 24px;
          bottom: 24px;
          border-radius: 18px;
          background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Crect x='0' y='0' width='100%25' height='100%25' rx='18' ry='18' fill='none' stroke='rgba(100, 100, 100, 0.6)' stroke-width='2' stroke-dasharray='8,4'/%3E%3C/svg%3E")
            center/100% 100% no-repeat;
        }
      }
    }
  }
}
</style>
