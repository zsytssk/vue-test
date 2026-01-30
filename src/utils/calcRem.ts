;(function () {
  // 配置项：可根据自己的设计稿调整
  const config = {
    designWidth: 375, // 设计稿宽度（常用750px/375px）
    baseFontSize: 100, // 基准字体大小（1rem对应的px值，建议设为100方便计算）
    maxWidth: 750, // 最大适配宽度（超过该宽度后不再放大）
    minWidth: 320, // 最小适配宽度（低于该宽度后不再缩小）
  }

  // 计算并设置html字体大小的核心函数
  function setRootFontSize() {
    // 获取页面可视宽度（兼容移动端横屏/竖屏）
    let clientWidth = document.documentElement.clientWidth || window.innerWidth

    // 限制宽度范围，避免极端屏幕尺寸导致字体过大/过小
    if (clientWidth > config.maxWidth) {
      clientWidth = config.maxWidth
    } else if (clientWidth < config.minWidth) {
      clientWidth = config.minWidth
    }

    // 计算当前屏幕下的font-size = (当前宽度 / 设计稿宽度) * 基准字体大小
    const fontSize = (clientWidth / config.designWidth) * config.baseFontSize

    // 设置html的font-size
    document.documentElement.style.fontSize = `${fontSize}px`
  }

  // 初始化：页面加载完成后立即执行一次
  setRootFontSize()

  // 监听窗口大小变化（防抖处理，避免频繁触发）
  let resizeTimer: any
  window.addEventListener('resize', function () {
    // 清除之前的定时器，避免短时间内多次执行
    clearTimeout(resizeTimer)
    // 延迟200ms执行，降低性能消耗
    resizeTimer = setTimeout(setRootFontSize, 200)
  })

  // 监听屏幕旋转（移动端横屏/竖屏切换）
  window.addEventListener('orientationchange', setRootFontSize)
})()
