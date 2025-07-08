<template>
  <div :class="['status-icon', uiState]">
    <img
      v-if="state === 'occupied'"
      src="@/assets/location-icons/status-occupied.png"
      alt=""
    />
    <img
      v-else-if="state === 'empty'"
      src="@/assets/location-icons/status-empty.png"
      alt=""
    />
    <img
      v-else-if="state === 'enter'"
      src="@/assets/location-icons/status-enter.png"
      alt=""
    />
    <img
      v-else-if="state === 'out'"
      src="@/assets/location-icons/status-out.png"
      alt=""
    />
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
type GridState = 'occupied' | 'empty' | 'enter' | 'out'
export type UiState = 'normal' | 'hidden' | 'disabled'
const props = defineProps<{ state: GridState; uiState?: UiState }>()
</script>

<style lang="scss" scoped>
.status-icon {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 400;
  font-size: 14px;
  &.hidden {
    img {
      opacity: 0;
    }
  }
  &.disabled {
    color: #c0c4cc;
    img {
      border-color: #c0c4cc;
    }
  }
  img {
    width: 32px;
    height: 32px;
    box-sizing: border-box;
    border: 1px solid rgba(0, 255, 255, 1);
    padding: 2px;
  }
}
</style>
