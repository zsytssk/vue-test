<template>
  <div class="w-full h-full flex flex-col font-sans">
    <!-- 顶部导航栏 -->
    <header
      class="bg-blue-600 text-white p-2 flex justify-between items-center shadow-md"
    >
      <h1 class="text-lg font-bold">库存图形化展示</h1>
      <div class="flex gap-2">
        <button
          class="bg-transparent border border-white text-white hover:bg-white hover:text-blue-600 h-8 px-3 rounded flex items-center"
          @click="handleRefresh"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="mr-1"
          >
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M3 21v-5h5" />
          </svg>
          刷新
        </button>
        <button
          class="bg-transparent border border-white text-white hover:bg-white hover:text-blue-600 h-8 px-3 rounded flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="mr-1"
          >
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          返回
        </button>
      </div>
    </header>

    <!-- 主内容区域 -->
    <main class="flex-grow p-4" style="background-color: #2c4056">
      <!-- 筛选区域 -->
      <div class="flex items-center gap-3 mb-4">
        <div class="text-white text-sm">所属仓库:</div>
        <select
          class="bg-gray-700 text-white border-0 rounded px-3 py-1 text-sm"
        >
          <option>===== 请选择 =====</option>
          <option>仓库A</option>
          <option>仓库B</option>
        </select>

        <div class="text-white text-sm ml-4">所属库区:</div>
        <select
          class="bg-gray-700 text-white border-0 rounded px-3 py-1 text-sm"
        >
          <option>===== 请选择 =====</option>
          <option>A区</option>
          <option>B区</option>
        </select>

        <div class="relative ml-4">
          <input
            v-model="searchTerm"
            placeholder="请输入物料编号或名称"
            class="bg-gray-700 border-gray-600 text-white h-8 pl-3 pr-8 w-60 text-sm rounded"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>
      </div>

      <!-- 库位可视化区域 -->
      <div class="flex">
        <!-- 左侧图例 -->
        <div class="w-24 mr-4">
          <div class="flex flex-col gap-4">
            <div class="flex flex-col items-center">
              <div class="w-10 h-10 mb-1">
                <LocationIcon status="stored" />
              </div>
              <span class="text-white text-xs">已存储</span>
            </div>

            <div class="flex flex-col items-center">
              <div
                class="w-10 h-10 bg-gray-700 rounded flex items-center justify-center mb-1"
              >
                <LocationIcon status="empty" />
              </div>
              <span class="text-white text-xs">空库位</span>
            </div>

            <div class="flex flex-col items-center">
              <div class="w-10 h-10 mb-1">
                <LocationIcon status="inbound" />
              </div>
              <span class="text-white text-xs">待入库</span>
            </div>

            <div class="flex flex-col items-center">
              <div class="w-10 h-10 mb-1">
                <LocationIcon status="outbound" />
              </div>
              <span class="text-white text-xs">待出库</span>
            </div>
          </div>
        </div>

        <!-- 右侧库位网格 -->
        <div class="flex-grow border border-dashed border-gray-500 rounded p-4">
          <div class="flex flex-col gap-2">
            <template
              v-for="(section, sectionIndex) in warehouseData"
              :key="`section-${sectionIndex}`"
            >
              <!-- 中间分隔区域 -->
              <div
                v-if="sectionIndex === 1"
                class="h-4 border-t border-b border-dashed border-orange-400 my-2"
              ></div>

              <!-- 正常库位区域 -->
              <div v-else class="flex flex-col gap-2">
                <div
                  v-for="(row, rowIndex) in section"
                  :key="`row-${sectionIndex}-${rowIndex}`"
                  class="flex gap-1"
                >
                  <div
                    v-for="(location, colIndex) in row"
                    :key="`location-${location.id}`"
                    class="w-6 h-6 bg-gray-700 rounded flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
                    :title="`ID: ${location.id}\n状态: ${STATUS_CONFIG[location.status].label}${location.sku ? '\nSKU: ' + location.sku : ''}`"
                  >
                    <LocationIcon :status="location.status" />
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// --- 1. 定义数据结构和类型 ---
/**
 * @typedef {'stored' | 'empty' | 'inbound' | 'outbound'} LocationStatus
 *
 * @typedef {Object} Location
 * @property {string} id - 库位唯一ID
 * @property {LocationStatus} status - 库位状态
 * @property {string} [sku] - SKU编号（可选）
 *
 * @typedef {Location[][]} WarehouseSection - 仓库区域（二维数组）
 * @typedef {WarehouseSection[]} WarehouseLayout - 整个仓库布局（多个区域）
 */

// --- 2. 状态与颜色的映射 ---
const STATUS_CONFIG = {
  stored: { color: 'bg-green-500', label: '已存储', icon: 'cube' },
  empty: { color: 'bg-gray-400', label: '空库位', icon: 'shelf' },
  inbound: { color: 'bg-blue-500', label: '待入库', icon: 'arrow-down' },
  outbound: { color: 'bg-yellow-500', label: '待出库', icon: 'arrow-up' },
}

// --- 3. 响应式状态 ---
const searchTerm = ref('')
const warehouseData = ref(generateMockWarehouseData())

// --- 4. 方法 ---
/**
 * 生成模拟仓库数据
 * @returns {WarehouseLayout} 仓库布局数据
 */
function generateMockWarehouseData() {
  // 创建一个随机状态的库位
  const createLocation = (row, col) => {
    const statuses = ['stored', 'empty', 'inbound', 'outbound']
    const weights = [0.7, 0.1, 0.1, 0.1] // 70% 已存储, 10% 其他状态

    let rand = Math.random()
    let statusIndex = 0
    let sum = 0

    for (let i = 0; i < weights.length; i++) {
      sum += weights[i]
      if (rand <= sum) {
        statusIndex = i
        break
      }
    }

    return {
      id: `R${row}-C${col}`,
      status: statuses[statusIndex],
      sku: statuses[statusIndex] === 'stored' ? `SKU-${row}-${col}` : undefined,
    }
  }

  // 创建一个 n行m列 的区域
  const createSection = (rows, cols) => {
    return Array(rows)
      .fill(0)
      .map((_, rowIndex) =>
        Array(cols)
          .fill(0)
          .map((_, colIndex) => createLocation(rowIndex, colIndex)),
      )
  }

  // 创建3个区域，模拟图片中的布局
  return [
    createSection(4, 22), // 上部区域 - 4行22列
    createSection(1, 22), // 中间分隔区 - 1行22列 (会被渲染为分隔线)
    createSection(3, 22), // 下部区域 - 3行22列
  ]
}

// 刷新数据
function handleRefresh() {
  console.log('Refreshing warehouse data...')
  warehouseData.value = generateMockWarehouseData()
}
</script>

<script>
// 库位图标组件
import { defineComponent, h } from 'vue'

export const LocationIcon = defineComponent({
  name: 'LocationIcon',
  props: {
    status: {
      type: String,
      required: true,
      validator: (value) =>
        ['stored', 'empty', 'inbound', 'outbound'].includes(value),
    },
  },
  setup(props) {
    return () => {
      switch (props.status) {
        case 'stored':
          return h(
            'div',
            {
              class:
                'w-full h-full bg-green-500 rounded flex items-center justify-center',
            },
            [h('div', { class: 'w-5 h-5 bg-green-600 rounded' })],
          )

        case 'empty':
          return h(
            'div',
            {
              class: 'w-full h-full flex items-center justify-center',
            },
            [
              h('div', { class: 'w-full h-1 bg-gray-400' }),
              h('div', { class: 'w-full h-1 bg-gray-400 absolute mt-3' }),
              h('div', { class: 'w-full h-1 bg-gray-400 absolute mb-3' }),
            ],
          )

        case 'inbound':
          return h(
            'div',
            {
              class:
                'w-full h-full bg-blue-500 rounded flex items-center justify-center',
            },
            [h('div', { class: 'w-3 h-3 border-2 border-white rounded-full' })],
          )

        case 'outbound':
          return h(
            'div',
            {
              class:
                'w-full h-full bg-yellow-500 rounded flex items-center justify-center',
            },
            [h('div', { class: 'w-3 h-3 border-2 border-white rounded-full' })],
          )

        default:
          return null
      }
    }
  },
})
</script>

<style scoped>
/* 可以添加额外的样式，但大部分已通过 Tailwind 类实现 */
</style>
