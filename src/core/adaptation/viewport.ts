/**
 * 视口适配模块
 * 处理vw单位转换、设计稿基准配置和最大宽度限制
 */

// 设计稿基准宽度
const DESIGN_WIDTH = 375;
// 最大宽度限制
const MAX_WIDTH = 768;

/**
 * 获取当前设备的视口宽度
 */
export const getViewportWidth = (): number => {
  return Math.min(
    window.innerWidth ||
      document.documentElement.clientWidth ||
      document.body.clientWidth,
    MAX_WIDTH
  );
};

/**
 * 获取当前设备的视口高度
 */
export const getViewportHeight = (): number => {
  return (
    window.innerHeight ||
    document.documentElement.clientHeight ||
    document.body.clientHeight
  );
};

/**
 * 将像素单位转换为vw单位
 * @param px 像素值
 * @returns vw值
 */
export const pxToVw = (px: number): number => {
  return (px / DESIGN_WIDTH) * 100;
};

/**
 * 将vw单位转换为像素单位
 * @param vw vw值
 * @returns 像素值
 */
export const vwToPx = (vw: number): number => {
  return (vw / 100) * getViewportWidth();
};

/**
 * 设置HTML根元素的font-size（用于REM降级方案）
 */
export const setupRootFontSize = (): void => {
  const viewportWidth = getViewportWidth();
  // 设置根元素font-size为视口宽度的1/10
  document.documentElement.style.fontSize = `${viewportWidth / 10}px`;
};

/**
 * 初始化视口适配
 */
export const initViewport = (): (() => void) => {
  // 设置根元素的CSS变量
  document.documentElement.style.setProperty(
    "--design-width",
    DESIGN_WIDTH.toString()
  );
  document.documentElement.style.setProperty(
    "--max-width",
    MAX_WIDTH.toString()
  );

  // 处理横竖屏切换
  const handleOrientationChange = (): void => {
    const viewportWidth = getViewportWidth();

    // 更新CSS变量
    document.documentElement.style.setProperty(
      "--viewport-width",
      viewportWidth.toString()
    );

    // 横竖屏检测
    const isLandscape = window.innerWidth > window.innerHeight;
    document.documentElement.style.setProperty(
      "--is-landscape",
      isLandscape.toString()
    );

    // 如果是横屏且高度小于500px，调整设计稿宽度
    if (isLandscape && window.innerHeight < 500) {
      document.documentElement.style.setProperty("--design-width", "667");
    } else {
      document.documentElement.style.setProperty(
        "--design-width",
        DESIGN_WIDTH.toString()
      );
    }
  };

  // 初始执行一次
  handleOrientationChange();

  // 监听窗口大小变化
  window.addEventListener("resize", handleOrientationChange);
  // 监听横竖屏变化
  window.addEventListener("orientationchange", handleOrientationChange);

  // 清理函数
  return () => {
    window.removeEventListener("resize", handleOrientationChange);
    window.removeEventListener("orientationchange", handleOrientationChange);
  };
};

export default {
  getViewportWidth,
  getViewportHeight,
  pxToVw,
  vwToPx,
  setupRootFontSize,
  initViewport,
};
