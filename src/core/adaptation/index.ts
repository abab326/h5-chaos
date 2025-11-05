/**
 * 适配系统主入口
 * 整合视口适配、安全区域适配和设备检测功能
 */

import * as viewport from "./viewport";
import * as safeArea from "./safe-area";
import * as device from "./device";

/**
 * 初始化整个适配系统
 */
export const initAdaptation = (): (() => void) => {
  // 初始化各个模块
  const cleanupViewport = viewport.initViewport();
  const cleanupSafeArea = safeArea.initSafeArea();
  const cleanupDeviceDetection = device.initDeviceDetection();

  // 合并清理函数
  const cleanup = (): void => {
    if (cleanupViewport) cleanupViewport();
    if (cleanupSafeArea) cleanupSafeArea();
    if (cleanupDeviceDetection) cleanupDeviceDetection();
  };

  return cleanup;
};

// 导出所有模块的功能
export { viewport, safeArea, device };

export default {
  initAdaptation,
  viewport,
  safeArea,
  device,
};
