/**
 * 设备检测模块
 * 检测设备类型、浏览器信息、操作系统和特性支持
 */

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isIPhone: boolean;
  isIPad: boolean;
  isWeChat: boolean;
  isWebView: boolean;
  browser: {
    name: string;
    version: string;
    isChrome: boolean;
    isSafari: boolean;
    isFirefox: boolean;
    isEdge: boolean;
  };
  os: {
    name: string;
    version: string;
  };
  screen: {
    width: number;
    height: number;
    dpr: number;
  };
}

/**
 * 解析User Agent
 */
const parseUserAgent = (): {
  browser: { name: string; version: string };
  os: { name: string; version: string };
} => {
  const ua = navigator.userAgent;
  let browser = { name: "unknown", version: "0.0.0" };
  let os = { name: "unknown", version: "0.0.0" };

  // 检测浏览器
  if (/Chrome/.test(ua) && /Google Inc/.test(navigator.vendor)) {
    const match = ua.match(/Chrome\/(\d+\.\d+)/);
    browser = {
      name: "Chrome",
      version: match ? match[1]! : "0.0.0",
    };
  } else if (/Safari/.test(ua) && /Apple Computer/.test(navigator.vendor)) {
    const match = ua.match(/Version\/(\d+\.\d+)/);
    browser = {
      name: "Safari",
      version: match ? match[1]! : "0.0.0",
    };
  } else if (/Firefox/.test(ua)) {
    const match = ua.match(/Firefox\/(\d+\.\d+)/);
    browser = {
      name: "Firefox",
      version: match ? match[1]! : "0.0.0",
    };
  } else if (/Edg\//.test(ua)) {
    const match = ua.match(/Edg\/(\d+\.\d+)/);
    browser = {
      name: "Edge",
      version: match ? match[1]! : "0.0.0",
    };
  }

  // 检测操作系统
  if (/iPhone|iPad|iPod/.test(ua) && !(window as any).MSStream) {
    const match = ua.match(/OS (\d+_\d+)/);
    os = {
      name: "iOS",
      version: match ? match[1]!.replace("_", ".") : "0.0",
    };
  } else if (/Android/.test(ua)) {
    const match = ua.match(/Android (\d+\.\d+)/);
    os = {
      name: "Android",
      version: match ? match[1]! : "0.0",
    };
  } else if (/Windows NT/.test(ua)) {
    const match = ua.match(/Windows NT (\d+\.\d+)/);
    os = {
      name: "Windows",
      version: match ? match[1]! : "0.0",
    };
  } else if (/Macintosh/.test(ua)) {
    const match = ua.match(/Mac OS X (\d+_\d+)/);
    os = {
      name: "macOS",
      version: match ? match[1]!.replace("_", ".") : "0.0",
    };
  }

  return { browser, os };
};

/**
 * 获取设备信息
 */
export const getDeviceInfo = (): DeviceInfo => {
  const ua = navigator.userAgent;
  const { browser, os } = parseUserAgent();
  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;
  const dpr = window.devicePixelRatio || 1;

  // 检测设备类型
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) &&
    screenWidth < 768;
  const isTablet =
    /iPad/i.test(ua) || (screenWidth >= 768 && screenWidth < 1024);
  const isDesktop = screenWidth >= 1024;

  // 检测特定设备
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
  const isAndroid = /Android/.test(ua);
  const isIPhone = /iPhone|iPod/.test(ua) && !(window as any).MSStream;
  const isIPad = /iPad/.test(ua) && !(window as any).MSStream;
  const isWeChat = /MicroMessenger/i.test(ua);
  const isWebView =
    /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(ua) ||
    /Android.*;wv/i.test(ua);

  return {
    isMobile,
    isTablet,
    isDesktop,
    isIOS,
    isAndroid,
    isIPhone,
    isIPad,
    isWeChat,
    isWebView,
    browser: {
      ...browser,
      isChrome: browser.name === "Chrome",
      isSafari: browser.name === "Safari",
      isFirefox: browser.name === "Firefox",
      isEdge: browser.name === "Edge",
    },
    os,
    screen: {
      width: screenWidth,
      height: screenHeight,
      dpr,
    },
  };
};

/**
 * 检测是否支持触摸
 */
export const isTouchSupported = (): boolean => {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
};

/**
 * 检测是否支持特定CSS属性
 */
export const isCSSPropertySupported = (property: string): boolean => {
  const style = document.createElement("div").style;
  return property in style;
};

/**
 * 检测是否支持特定CSS值
 */
export const isCSSValueSupported = (
  property: string,
  value: string
): boolean => {
  const style = document.createElement("div").style;
  style[property as any] = value;
  return style[property as any] === value;
};

/**
 * 设置设备信息CSS变量
 */
export const setupDeviceCSSVars = (): void => {
  const deviceInfo = getDeviceInfo();
  const root = document.documentElement;

  // 设置设备类型变量
  root.style.setProperty("--is-mobile", deviceInfo.isMobile.toString());
  root.style.setProperty("--is-tablet", deviceInfo.isTablet.toString());
  root.style.setProperty("--is-desktop", deviceInfo.isDesktop.toString());
  root.style.setProperty("--is-ios", deviceInfo.isIOS.toString());
  root.style.setProperty("--is-android", deviceInfo.isAndroid.toString());
  root.style.setProperty("--is-wechat", deviceInfo.isWeChat.toString());

  // 设置屏幕信息变量
  root.style.setProperty("--screen-width", deviceInfo.screen.width.toString());
  root.style.setProperty(
    "--screen-height",
    deviceInfo.screen.height.toString()
  );
  root.style.setProperty(
    "--device-pixel-ratio",
    deviceInfo.screen.dpr.toString()
  );

  // 设置触摸支持变量
  root.style.setProperty("--is-touch-supported", isTouchSupported().toString());
};

/**
 * 初始化设备检测
 */
export const initDeviceDetection = (): (() => void) => {
  // 设置设备信息CSS变量
  setupDeviceCSSVars();

  // 监听窗口大小变化，更新设备信息
  const handleResize = () => {
    setupDeviceCSSVars();
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
  getDeviceInfo,
  isTouchSupported,
  isCSSPropertySupported,
  isCSSValueSupported,
  setupDeviceCSSVars,
  initDeviceDetection,
};
