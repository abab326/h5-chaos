/**
 * 安全区域适配模块
 * 处理刘海屏、底部手势区域和状态栏高度适配
 */

/**
 * 获取安全区域信息
 */
export const getSafeAreaInsets = (): {
  top: number;
  bottom: number;
  left: number;
  right: number;
} => {
  // 优先使用env(safe-area-inset-*)变量
  if (typeof window !== "undefined" && window.screen) {
    // 通过CSS变量获取或计算安全区域
    const style = window.getComputedStyle(document.documentElement);

    // 尝试从CSS变量获取
    const safeAreaTop = parseFloat(
      style.getPropertyValue("--safe-area-inset-top") || "0"
    );
    const safeAreaBottom = parseFloat(
      style.getPropertyValue("--safe-area-inset-bottom") || "0"
    );
    const safeAreaLeft = parseFloat(
      style.getPropertyValue("--safe-area-inset-left") || "0"
    );
    const safeAreaRight = parseFloat(
      style.getPropertyValue("--safe-area-inset-right") || "0"
    );

    // 如果CSS变量有值，直接返回
    if (safeAreaTop > 0 || safeAreaBottom > 0) {
      return {
        top: safeAreaTop,
        bottom: safeAreaBottom,
        left: safeAreaLeft,
        right: safeAreaRight,
      };
    }
  }

  // 降级方案：通过UA和屏幕尺寸判断
  const isIPhoneWithNotch =
    /iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

  // 默认安全区域值
  let top = 0;
  let bottom = 0;

  // iPhone X及以上设备的安全区域估算
  if (isIPhoneWithNotch) {
    // 顶部安全区域通常为44px或48px
    top = 48;
    // 底部安全区域通常为34px
    bottom = 34;
  } else if (isIOS) {
    // 普通iOS设备的状态栏高度
    top = 20;
  }

  return {
    top,
    bottom,
    left: 0,
    right: 0,
  };
};

/**
 * 设置安全区域CSS变量
 */
export const setupSafeAreaCSSVars = (): void => {
  const insets = getSafeAreaInsets();
  const root = document.documentElement;

  // 设置CSS变量
  root.style.setProperty("--safe-area-inset-top", `${insets.top}px`);
  root.style.setProperty("--safe-area-inset-bottom", `${insets.bottom}px`);
  root.style.setProperty("--safe-area-inset-left", `${insets.left}px`);
  root.style.setProperty("--safe-area-inset-right", `${insets.right}px`);

  // 设置状态栏高度变量（通常等于顶部安全区域）
  root.style.setProperty("--status-bar-height", `${insets.top}px`);

  // 设置底部安全区域padding变量
  root.style.setProperty("--bottom-safe-padding", `${insets.bottom + 16}px`); // 额外增加16px的padding
};

/**
 * 创建安全区域样式类
 * 可以在组件中直接使用这些类来适配安全区域
 */
export const createSafeAreaClasses = (): void => {
  const style = document.createElement("style");
  style.textContent = `
    /* 安全区域容器 */
    .safe-area-container {
      padding-top: env(safe-area-inset-top, var(--safe-area-inset-top, 0px));
      padding-bottom: env(safe-area-inset-bottom, var(--safe-area-inset-bottom, 0px));
      padding-left: env(safe-area-inset-left, var(--safe-area-inset-left, 0px));
      padding-right: env(safe-area-inset-right, var(--safe-area-inset-right, 0px));
      box-sizing: border-box;
    }
    
    /* 顶部安全区域 */
    .safe-area-top {
      padding-top: env(safe-area-inset-top, var(--safe-area-inset-top, 0px));
    }
    
    /* 底部安全区域 */
    .safe-area-bottom {
      padding-bottom: env(safe-area-inset-bottom, var(--safe-area-inset-bottom, 0px));
    }
    
    /* 左右安全区域 */
    .safe-area-horizontal {
      padding-left: env(safe-area-inset-left, var(--safe-area-inset-left, 0px));
      padding-right: env(safe-area-inset-right, var(--safe-area-inset-right, 0px));
    }
    
    /* 固定在底部的元素 */
    .fixed-bottom-safe {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      padding-bottom: env(safe-area-inset-bottom, var(--safe-area-inset-bottom, 0px));
      transform: translateZ(0); /* 启用硬件加速 */
    }
    
    /* 固定在顶部的元素 */
    .fixed-top-safe {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      padding-top: env(safe-area-inset-top, var(--safe-area-inset-top, 0px));
      transform: translateZ(0); /* 启用硬件加速 */
    }
  `;
  document.head.appendChild(style);
};

/**
 * 初始化安全区域适配
 */
export const initSafeArea = (): (() => void) => {
  // 设置安全区域CSS变量
  setupSafeAreaCSSVars();

  // 创建安全区域样式类
  createSafeAreaClasses();

  // 监听窗口大小变化，重新计算安全区域
  const handleResize = () => {
    setupSafeAreaCSSVars();
  };

  window.addEventListener("resize", handleResize);
  window.addEventListener("orientationchange", handleResize);

  // 清理函数
  return () => {
    window.removeEventListener("resize", handleResize);
    window.removeEventListener("orientationchange", handleResize);
  };
};

export default {
  getSafeAreaInsets,
  setupSafeAreaCSSVars,
  createSafeAreaClasses,
  initSafeArea,
};
