<template>
  <div class="model-box">
    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
      <span>{{ loadingText }}</span>
    </div>
    <div v-if="error" class="error-overlay">
      <span>⚠️ {{ error }}</span>
    </div>
    <div ref="containerRef" class="model-viewer"></div>

    <div v-if="showDebug" class="debug-info">
      <div>📍 位置: {{ formatVec3(modelPos) }}</div>
      <div>🔄 旋转: {{ formatVec3(modelRot) }}</div>
      <div>📐 缩放: {{ formatVec3(modelScale) }}</div>
      <div>🔢 网格数: {{ meshCount }}</div>
    </div>
    <!-- 调试信息 -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'

interface Props {
  modelUrl: string
  autoRotate?: boolean
  backgroundColor?: string
  scale?: number
  cameraDistance?: number
  showDebug?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  autoRotate: true,
  backgroundColor: '#1a1a2e',
  scale: 1,
  cameraDistance: 0.9,
  showDebug: true,
})

const emit = defineEmits<{
  (e: 'loaded', gltf: any): void
  (e: 'error', error: Error): void
  (e: 'progress', percent: number): void
}>()

// ==================== Refs ====================
const containerRef = ref<HTMLDivElement | null>(null)
const loading = ref(false)
const loadingText = ref('加载中...')
const error = ref<string | null>(null)

// 调试状态
const modelPos = ref<number[]>([0, 0, 0])
const modelRot = ref<number[]>([0, 0, 0])
const modelScale = ref<number[]>([1, 1, 1])
const meshCount = ref(0)

// ==================== Three.js 对象 ====================
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let renderer: THREE.WebGLRenderer | null = null
let controls: OrbitControls | null = null
let modelGroup: THREE.Group | null = null
let animationId: number | null = null
let loader: GLTFLoader | null = null

// ==================== 工具函数 ====================
function formatVec3(arr: number[]): string {
  if (!arr || arr.length < 3) return '0.000, 0.000, 0.000'
  return arr.map((v) => (typeof v === 'number' ? v.toFixed(3) : '0')).join(', ')
}

function safeToFixed(v: any, digits: number = 3): string {
  return typeof v === 'number' && isFinite(v) ? v.toFixed(digits) : '0'
}

// ==================== 暴露全局调试 ====================
declare global {
  interface Window {
    __model__: THREE.Group | null
    __scene__: THREE.Scene | null
    __camera__: THREE.PerspectiveCamera | null
    __controls__: OrbitControls | null
    __printModelInfo__: () => void
    __resetModel__: () => void
    __setModelPos__: (x: number, y: number, z: number) => void
    __setModelRot__: (x: number, y: number, z: number) => void
    __setModelScale__: (x: number, y: number, z: number) => void
    __fitCamera__: () => void
    __getModelCenter__: () => { center: number[]; size: number[] }
  }
}

// ==================== 更新调试信息 ====================
function updateDebugInfo(): void {
  if (!modelGroup) return

  const pos = modelGroup.position
  const rot = modelGroup.rotation
  const scale = modelGroup.scale

  modelPos.value = [
    safeToFixed(pos.x),
    safeToFixed(pos.y),
    safeToFixed(pos.z),
  ].map(Number)

  modelRot.value = [
    safeToFixed(rot.x),
    safeToFixed(rot.y),
    safeToFixed(rot.z),
  ].map(Number)

  modelScale.value = [
    safeToFixed(scale.x),
    safeToFixed(scale.y),
    safeToFixed(scale.z),
  ].map(Number)

  let count = 0
  modelGroup.traverse((child) => {
    if (child.isMesh) count++
  })
  meshCount.value = count
}

// ==================== 打印模型信息 ====================
function printModelInfo(): void {
  if (!modelGroup) {
    console.log('❌ 模型未加载')
    return
  }

  console.log('═══════════════════════════════════════')
  console.log('📦 模型信息')
  console.log('═══════════════════════════════════════')

  // 安全获取值
  const getVal = (v: any) => (typeof v === 'number' && isFinite(v) ? v : 0)

  // 1. 整体变换
  const pos = modelGroup.position
  const rot = modelGroup.rotation
  const scale = modelGroup.scale
  console.log(
    `📍 位置: [${getVal(pos.x).toFixed(4)}, ${getVal(pos.y).toFixed(4)}, ${getVal(pos.z).toFixed(4)}]`,
  )
  console.log(
    `🔄 旋转 (弧度): [${getVal(rot.x).toFixed(4)}, ${getVal(rot.y).toFixed(4)}, ${getVal(rot.z).toFixed(4)}]`,
  )
  console.log(
    `🔄 旋转 (角度): [${((getVal(rot.x) * 180) / Math.PI).toFixed(2)}, ${((getVal(rot.y) * 180) / Math.PI).toFixed(2)}, ${((getVal(rot.z) * 180) / Math.PI).toFixed(2)}]`,
  )
  console.log(
    `📐 缩放: [${getVal(scale.x).toFixed(4)}, ${getVal(scale.y).toFixed(4)}, ${getVal(scale.z).toFixed(4)}]`,
  )

  // 2. 包围盒
  try {
    const box = new THREE.Box3().setFromObject(modelGroup)
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())
    console.log(
      `📦 包围盒中心: [${getVal(center.x).toFixed(4)}, ${getVal(center.y).toFixed(4)}, ${getVal(center.z).toFixed(4)}]`,
    )
    console.log(
      `📦 包围盒尺寸: [${getVal(size.x).toFixed(4)}, ${getVal(size.y).toFixed(4)}, ${getVal(size.z).toFixed(4)}]`,
    )
    console.log(
      `📦 包围盒最小: [${getVal(box.min.x).toFixed(4)}, ${getVal(box.min.y).toFixed(4)}, ${getVal(box.min.z).toFixed(4)}]`,
    )
    console.log(
      `📦 包围盒最大: [${getVal(box.max.x).toFixed(4)}, ${getVal(box.max.y).toFixed(4)}, ${getVal(box.max.z).toFixed(4)}]`,
    )
  } catch (e) {
    console.log('⚠️ 无法计算包围盒:', e)
  }

  // 3. 子对象统计
  let meshCount2 = 0
  const childrenInfo: any[] = []
  modelGroup.traverse((child) => {
    if (child.isMesh) {
      meshCount2++
      if (childrenInfo.length < 20) {
        childrenInfo.push({
          name: child.name || 'unnamed',
          type: child.type,
          position: [
            getVal(child.position.x).toFixed(3),
            getVal(child.position.y).toFixed(3),
            getVal(child.position.z).toFixed(3),
          ],
          visible: child.visible,
        })
      }
    }
  })
  console.log(`🔢 网格数: ${meshCount2}`)
  console.log(`📋 子对象 (前20个):`, childrenInfo)

  console.log('═══════════════════════════════════════')
  console.log('')
  console.log('💡 调试命令:')
  console.log('  __setModelPos__(x, y, z)   - 设置位置')
  console.log('  __setModelRot__(x, y, z)   - 设置旋转 (弧度)')
  console.log('  __setModelScale__(x, y, z) - 设置缩放')
  console.log('  __resetModel__()           - 重置到原点')
  console.log('  __fitCamera__()            - 重新适配相机')
  console.log('  __printModelInfo__()       - 再次打印信息')
  console.log('  __getModelCenter__()       - 获取包围盒中心和尺寸')
  console.log('═══════════════════════════════════════')
}

// ==================== 获取模型中心 ====================
function getModelCenter(): { center: number[]; size: number[] } {
  if (!modelGroup) {
    return { center: [0, 0, 0], size: [0, 0, 0] }
  }
  try {
    const box = new THREE.Box3().setFromObject(modelGroup)
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())
    return {
      center: [center.x, center.y, center.z],
      size: [size.x, size.y, size.z],
    }
  } catch (e) {
    return { center: [0, 0, 0], size: [0, 0, 0] }
  }
}

// ==================== 设置全局调试 ====================
function setupGlobalDebug(): void {
  window.__model__ = modelGroup
  window.__scene__ = scene
  window.__camera__ = camera
  window.__controls__ = controls
  window.__printModelInfo__ = printModelInfo
  window.__getModelCenter__ = getModelCenter

  window.__resetModel__ = () => {
    if (!modelGroup) return
    modelGroup.position.set(0, 0, 0)
    modelGroup.rotation.set(0, 0, 0)
    modelGroup.scale.set(1, 1, 1)
    modelGroup.updateWorldMatrix(true, true)
    updateDebugInfo()
    const box = new THREE.Box3().setFromObject(modelGroup)
    fitCamera(box)
    console.log('✅ 模型已重置到原点')
  }

  window.__setModelPos__ = (x: number, y: number, z: number) => {
    if (!modelGroup) return
    modelGroup.position.set(x, y, z)
    modelGroup.updateWorldMatrix(true, true)
    updateDebugInfo()
    console.log(
      `✅ 位置已设置为: (${x.toFixed(3)}, ${y.toFixed(3)}, ${z.toFixed(3)})`,
    )
  }

  window.__setModelRot__ = (x: number, y: number, z: number) => {
    if (!modelGroup) return
    modelGroup.rotation.set(x, y, z)
    modelGroup.updateWorldMatrix(true, true)
    updateDebugInfo()
    console.log(
      `✅ 旋转已设置为: (${x.toFixed(3)}, ${y.toFixed(3)}, ${z.toFixed(3)}) 弧度`,
    )
  }

  window.__setModelScale__ = (x: number, y: number, z: number) => {
    if (!modelGroup) return
    modelGroup.scale.set(x, y, z)
    modelGroup.updateWorldMatrix(true, true)
    updateDebugInfo()
    console.log(
      `✅ 缩放已设置为: (${x.toFixed(3)}, ${y.toFixed(3)}, ${z.toFixed(3)})`,
    )
  }

  window.__fitCamera__ = () => {
    if (!modelGroup) return
    const box = new THREE.Box3().setFromObject(modelGroup)
    fitCamera(box)
    console.log('✅ 相机已重新适配')
  }

  console.log('✅ 调试工具已就绪！')
  console.log('💡 输入 __printModelInfo__() 查看模型信息')
}

// ==================== 初始化加载器 ====================
function initLoader(): void {
  if (loader) return
  loader = new GLTFLoader()
  loader.setMeshoptDecoder(MeshoptDecoder)
}

// ==================== 加载模型 ====================
async function loadModel(url: string): Promise<void> {
  if (!scene) return
  if (!loader) initLoader()

  loading.value = true
  loadingText.value = '加载中...'
  error.value = null

  if (modelGroup) {
    scene.remove(modelGroup)
    disposeGroup(modelGroup)
    modelGroup = null
  }

  try {
    const gltf = await loader!.loadAsync(url, (xhr) => {
      const pct = Math.round((xhr.loaded / xhr.total) * 100)
      loadingText.value = `加载中 ${pct}%`
      emit('progress', pct)
    })

    modelGroup = gltf.scene
    window.__model__ = modelGroup

    // 重置变换
    modelGroup.position.set(0, 0, 0)
    modelGroup.rotation.set(0, 0, 0)
    modelGroup.scale.set(1, 1, 1)
    modelGroup.updateWorldMatrix(true, true)

    // 计算包围盒并居中
    const box = new THREE.Box3()
    let hasMesh = false

    modelGroup.traverse((child) => {
      if (child.isMesh) {
        hasMesh = true
        try {
          const meshBox = new THREE.Box3().setFromObject(child)
          box.union(meshBox)
        } catch (e) {
          // 忽略单个 mesh 的包围盒计算错误
        }
      }
    })

    if (hasMesh && !box.isEmpty()) {
      const center = box.getCenter(new THREE.Vector3())
      console.log(
        '📍 模型原始中心偏移:',
        [center.x, center.y, center.z].map((v) => v.toFixed(4)),
      )
      modelGroup.position.sub(center)
    }

    // 缩放
    const finalBox = new THREE.Box3().setFromObject(modelGroup)
    const size = finalBox.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z, 0.1)
    const targetSize = 2.5
    const scaleFactor = (targetSize / maxDim) * props.scale
    modelGroup.scale.set(scaleFactor, scaleFactor, scaleFactor)

    modelGroup.updateWorldMatrix(true, true)
    ;(window as any).test = modelGroup

    // 阴影
    modelGroup.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })

    scene.add(modelGroup)

    // 相机适配
    const finalBox2 = new THREE.Box3().setFromObject(modelGroup)
    fitCamera(finalBox2)

    // 更新调试信息
    updateDebugInfo()
    setupGlobalDebug()

    loading.value = false
    emit('loaded', gltf)

    setTimeout(() => {
      console.log('📦 模型加载完成！输入 __printModelInfo__() 查看详细信息')
    }, 500)
  } catch (err) {
    const errorObj = err instanceof Error ? err : new Error(String(err))
    console.error('❌ 加载失败:', errorObj)
    error.value = `加载失败: ${errorObj.message}`
    loading.value = false
    emit('error', errorObj)
  }
}

// ==================== 相机适配 ====================
function fitCamera(box: THREE.Box3): void {
  if (!camera || !controls || box.isEmpty()) return

  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())

  controls.target.copy(center)

  const maxDim = Math.max(size.x, size.y, size.z, 0.1)
  const fovRad = THREE.MathUtils.degToRad(camera.fov)
  const distance = (maxDim / 2 / Math.tan(fovRad / 2)) * props.cameraDistance

  const dir = new THREE.Vector3(0.8, 0.5, 0.8).normalize()
  camera.position.copy(center).addScaledVector(dir, distance)

  const margin = maxDim * 1.5
  camera.near = Math.max(distance - margin, 0.01)
  camera.far = distance + margin + 10

  camera.updateProjectionMatrix()
  controls.update()
}

// ==================== 释放资源 ====================
function disposeGroup(group: THREE.Group): void {
  group.traverse((child) => {
    if (child.isMesh) {
      child.geometry?.dispose()
      if (Array.isArray(child.material)) {
        child.material.forEach((m) => m.dispose())
      } else {
        child.material?.dispose()
      }
    }
  })
}

// ==================== 初始化场景 ====================
function initScene(): void {
  const container = containerRef.value
  if (!container) return

  const w = container.clientWidth
  const h = container.clientHeight

  scene = new THREE.Scene()
  scene.background = new THREE.Color(props.backgroundColor)

  camera = new THREE.PerspectiveCamera(45, w / h, 0.01, 1000)
  camera.position.set(3, 2, 5)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(w, h)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.2
  container.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.autoRotate = props.autoRotate
  controls.autoRotateSpeed = 2.0
  controls.minDistance = 0.01
  controls.maxDistance = 500
  controls.target.set(0, 0, 0)

  // 灯光
  const ambient = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambient)

  const hemi = new THREE.HemisphereLight(0x87ceeb, 0x3a3a5a, 0.8)
  scene.add(hemi)

  const dirLight = new THREE.DirectionalLight(0xffffff, 2.0)
  dirLight.position.set(5, 12, 8)
  dirLight.castShadow = true
  scene.add(dirLight)

  const fillLight = new THREE.DirectionalLight(0x4488ff, 0.5)
  fillLight.position.set(-5, 3, -5)
  scene.add(fillLight)

  // 网格辅助
  const grid = new THREE.GridHelper(10, 20, 0x444466, 0x222244)
  grid.position.y = -1
  scene.add(grid)

  window.addEventListener('resize', handleResize)
  animate()
}

function animate(): void {
  animationId = requestAnimationFrame(animate)
  controls?.update()
  if (renderer && scene && camera) {
    renderer.render(scene, camera)
  }
}

function handleResize(): void {
  const container = containerRef.value
  if (!container || !camera || !renderer) return
  const w = container.clientWidth
  const h = container.clientHeight
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)
}

// ==================== 生命周期 ====================
watch(
  () => props.modelUrl,
  (newUrl) => {
    if (newUrl) loadModel(newUrl)
  },
)

onMounted(() => {
  initLoader()
  initScene()
  if (props.modelUrl) {
    setTimeout(() => loadModel(props.modelUrl), 100)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }
  controls?.dispose()
  if (renderer) {
    renderer.dispose()
    renderer.domElement.remove()
  }
})

defineExpose({
  reload: () => props.modelUrl && loadModel(props.modelUrl),
  printInfo: printModelInfo,
  resetModel: window.__resetModel__,
  setPosition: window.__setModelPos__,
  setRotation: window.__setModelRot__,
  setScale: window.__setModelScale__,
})
</script>

<style scoped>
.model-box,
.model-viewer {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 300px;
  overflow: hidden;
  background: #1a1a2e;
  border-radius: 12px;
}

.model-viewer :deep(canvas) {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background: rgba(26, 26, 46, 0.85);
  color: #fff;
  font-family: system-ui, sans-serif;
  z-index: 10;
  backdrop-filter: blur(6px);
  border-radius: 12px;
}

.loading-overlay .spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top-color: #6c63ff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(26, 26, 46, 0.8);
  color: #ff6b6b;
  font-family: system-ui, sans-serif;
  font-size: 14px;
  z-index: 10;
  backdrop-filter: blur(4px);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
}

.debug-info {
  position: absolute;
  bottom: 12px;
  left: 12px;
  background: rgba(0, 0, 0, 0.8);
  color: #00ff88;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  padding: 8px 12px;
  border-radius: 6px;
  z-index: 10000;
  line-height: 1.6;
  border: 1px solid rgba(0, 255, 136, 0.2);
  max-width: 280px;
}
</style>
