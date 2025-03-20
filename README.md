# 项目稳定性监控

主要用于实时监控和收集线上项目的各类稳定性指标，包括性能指标、错误日志、用户行为和系统资源等核心监控维度。通过数据采集、清洗、分析和可视化，帮助开发团队快速发现和定位问题，提升项目的稳定性和用户体验。系统支持自动告警、性能分析、用户行为分析等多种数据分析功能，并提供完整的监控数据上报和处理流程。

## 项目目标

- 收集错误信息(资源错误<js、css、img、video、audio>、promise 错误、接口错误<xhr、fetch>、主流框架异常<vue、react、angular>)
- 收集用户行为信息(点击、路由变化、移动、滚动、键盘、主动console)
- 收集页面性能信息(页面性能指标、设备信息、页面性能指标上报、页面性能指标可视化)
- 收集用户访问信息(停留时间、跳转来源、停留页面)
- 数据处理(数据上报、数据清洗、数据持久化、数据可视化)

### 错误信息

#### 接口异常

- xhr 请求异常

```ts
// 重新覆盖监听xhr请求异常 XMLHttpRequest.prototype.open
XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
  this.addEventListener('error', (event) => {
    console.log(event);
  });
  return xhr;
};
```

- fetch 请求异常

```ts
// 重新覆盖监听fetch请求异常 fetch.apply
fetch.apply = function (url, options) {
  this.addEventListener('error', (event) => {
    console.log(event);
  });
  return fetch(url, options);
};
```

#### 资源错误

- 资源错误

```ts
// 资源错误
window.addEventListener('error', (event) => {
  console.log(event);
});
```

#### promise 错误

```ts
// promise 错误
window.addEventListener('unhandledrejection', (event) => {
  console.log(event);
});
```

#### 主流框架异常

- vue

```ts
// vue
Vue.config.errorHandler = function (err, vm, info) {
  console.log(err, vm, info);
};

// 以插件形式 监听vue异常
const vueErrorPlugin = {
  install(Vue) {
    Vue.config.errorHandler = function (err, vm, info) {
      console.log(err, vm, info);
    };
  },
};
Vue.use(vueErrorPlugin);
```

- react

```ts
// react
React.errorBoundary = function (error, info) {
  console.log(error, info);
};

// react componentDidCatch
class ErrorBoundary extends React.Component {
  componentDidCatch(error, info) {
    console.log(error, info);
  }
}
```

- angular

```ts
// angular
window.onerror = function (error, info) {
  console.log(error, info);
};
```

### 行为信息

- 点击(需要使用节流过滤用户点击噪音)

```ts
// 点击
document.addEventListener('click', (event) => {
  // 节流
  if (Date.now() - lastClickTime < 300) return;
  lastClickTime = Date.now();

  // 获取点击元素
  const target = event.target;
  console.log(target);
});
```

- 路由 history 变化

```ts
// 路由 history 变化
window.history.pushState = function (...args) {
  console.log(args);
};

window.history.replaceState = function (...args) {
  console.log(args);
};
```

- 路由 hash 变化

```ts
// 路由 hash 变化
window.onpopstate = (event) => {
  console.log(event);
};
```

- 移动

```ts
// 移动
document.addEventListener('touchmove', (event) => {
  console.log(event);
});
```

- 滚动

```ts
// 滚动
document.addEventListener('scroll', (event) => {
  console.log(event);
});
```

- 键盘

```ts
// 键盘
document.addEventListener('keydown', (event) => {
  console.log(event);
});
```

- 主动 console

```ts
// 主动 console
originalConsoleLog = console.log;
console.log = function (...args) {
  originalConsoleLog.apply(console, args);
  console.log(args);
};
```

### 性能信息

#### 页面性能指标

- FP 首次绘制 (First Paint)

```ts
const getFP = () => {
  return new Promise((resolve) => {
    if (!window.performance || !window.performance.getEntriesByType) {
      console.warn('当前浏览器不支持 Performance API');
      resolve(null);
      return;
    }

    // 如果页面已经加载完成
    if (document.readyState === 'complete') {
      const perfEntries = performance.getEntriesByType('paint');
      const fpEntry = perfEntries.find((entry) => entry.name === 'first-paint');
      resolve(fpEntry ? fpEntry.startTime : null);
      return;
    }

    // 如果页面尚未加载完成，等待加载
    window.addEventListener(
      'load',
      () => {
        const perfEntries = performance.getEntriesByType('paint');
        const fpEntry = perfEntries.find((entry) => entry.name === 'first-paint');
        resolve(fpEntry ? fpEntry.startTime : null);
      },
      { once: true }
    );
  });
};
```

- FPS 帧率 (Frames Per Second)

```ts
const getFPS = () => {
  let lastTime = performance.now();
  let frames = 0;
  let fps = 0;

  return new Promise((resolve) => {
    function calculateFPS(currentTime) {
      frames++;

      const timeElapsed = currentTime - lastTime;

      if (timeElapsed >= 1000) {
        fps = Math.round((frames * 1000) / timeElapsed);
        frames = 0;
        lastTime = currentTime;
        resolve(fps);
        return;
      }

      requestAnimationFrame(calculateFPS);
    }

    requestAnimationFrame(calculateFPS);
  });
};
```

- FCP 首次内容绘制 (First Contentful Paint) ✓

```ts
const getFCP = () => {
  return new Promise((resolve) => {
    if (!window.PerformanceObserver) {
      console.warn('当前浏览器不支持 PerformanceObserver');
      resolve(null);
      return;
    }

    // 创建性能观察器
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      // FCP 通常只有一个条目
      const fcpEntry = entries[entries.length - 1];

      if (fcpEntry) {
        observer.disconnect();
        resolve(fcpEntry.startTime);
      }
    });

    // 观察 paint 类型的性能条目
    observer.observe({
      entryTypes: ['paint'],
      buffered: true, // 包含缓冲的性能条目
    });

    // 设置超时,避免永远等待
    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, 10000); // 10秒超时

    // 如果页面已经加载完成,尝试直接获取
    if (document.readyState === 'complete') {
      const entries = performance.getEntriesByType('paint');
      const fcpEntry = entries.find((entry) => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        observer.disconnect();
        resolve(fcpEntry.startTime);
      }
    }
  });
};
```

- LCP 最大内容绘制 (Largest Contentful Paint) ✓
- FID 首次输入延迟 (First Input Delay) ✓

```ts
const getFID = () => {
  return new Promise((resolve) => {
    if (!window.PerformanceObserver) {
      console.warn('当前浏览器不支持 PerformanceObserver');
      resolve(null);
      return;
    }

    // 创建性能观察器
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      // 我们只关心第一次输入延迟
      const firstInput = entries[0];

      if (firstInput) {
        // 断开观察器
        observer.disconnect();
        // processingStart - startTime 表示从输入事件开始到事件处理程序开始执行的延迟时间
        const fid = firstInput.processingStart - firstInput.startTime;
        resolve(fid);
      }
    });

    // 观察 first-input 类型的性能条目
    observer.observe({
      type: 'first-input',
      buffered: true, // 包含缓冲的性能条目
    });

    // 设置超时,避免永远等待
    setTimeout(() => {
      observer.disconnect();
      // 如果超时未获取到 FID,返回 null
      resolve(null);
    }, 10000); // 10秒超时
  });
};
```

- FMP 首次有效绘制 (First Meaningful Paint)

```ts
const getFMP = () => {
  return new Promise((resolve) => {
    if (!window.PerformanceObserver) {
      console.warn('当前浏览器不支持 PerformanceObserver');
      resolve(null);
      return;
    }

    let maxScore = 0;
    let fmpTime = 0;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // 计算元素得分
        const score = calculateElementScore(entry);

        if (score > maxScore) {
          maxScore = score;
          fmpTime = entry.startTime;
        }
      }
    });

    observer.observe({ entryTypes: ['element'] });

    // 5秒后停止观察并返回结果
    setTimeout(() => {
      observer.disconnect();
      resolve(fmpTime);
    }, 5000);
  });
};

// 计算元素得分的辅助函数
const calculateElementScore = (entry) => {
  const element = entry.element;
  if (!element) return 0;

  // 可视区域内的元素权重更高
  const viewport = window.innerHeight * window.innerWidth;
  const elementSize = entry.contentRect.width * entry.contentRect.height;
  const viewportScore = elementSize / viewport;

  // 特定标签权重
  const tagScore =
    {
      IMG: 2,
      VIDEO: 2,
      CANVAS: 2,
      SVG: 2,
      H1: 1.5,
      H2: 1.3,
    }[element.tagName] || 1;

  return viewportScore * tagScore;
};
```

- CLS 累积布局偏移 (Cumulative Layout Shift) ✓

```ts
const getCLS = () => {
  return new Promise((resolve) => {
    if (!window.PerformanceObserver) {
      console.warn('当前浏览器不支持 PerformanceObserver');
      resolve(null);
      return;
    }

    let clsValue = 0;
    let firstSessionEntry = true;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!firstSessionEntry) {
          clsValue += entry.value;
        }
        firstSessionEntry = false;
      }
    });

    observer.observe({ entryTypes: ['layout-shift'] });

    // 页面卸载时停止观察并返回结果
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        observer.disconnect();
        resolve(clsValue);
      }
    });
  });
};
```

- CCP 累积内容绘制 (Cumulative Content Paint)

```ts
const getCCP = () => {
  return new Promise((resolve) => {
    if (!window.PerformanceObserver) {
      console.warn('当前浏览器不支持 PerformanceObserver');
      resolve(null);
      return;
    }

    let ccpValue = 0;
    const paintEntries = new Set();

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!paintEntries.has(entry.id)) {
          ccpValue++;
          paintEntries.add(entry.id);
        }
      }
    });

    observer.observe({ entryTypes: ['paint'] });

    // 页面加载完成后返回结果
    window.addEventListener('load', () => {
      setTimeout(() => {
        observer.disconnect();
        resolve(ccpValue);
      }, 3000); // 等待3秒以捕获更多的绘制事件
    });
  });
};
```

- TBT 阻塞时间 (Total Blocking Time) ✓
- TTI 可交互时间 (Time to Interactive) ✓

注: ✓ 表示 web-vitals 库可提供的指标

#### 设备信息

```ts
// 设备信息
const getDeviceInfo = () => {
  if (!window.performance || !window.navigator) {
    console.warn('当前浏览器不支持 performance 或 navigator');
    return;
  }

  return {
    deviceMemory: getDeviceMemory(),
    hardwareConcurrency: getHardwareConcurrency(),
    jsHeapSizeLimit: getJsHeapSizeLimit(),
    totalJSHeapSize: getTotalJSHeapSize(),
    usedJSHeapSize: getUsedJSHeapSize(),

    model: getDeviceModel(), // 非主要
    os: getDeviceOS(), // 非主要
    browser: getDeviceBrowser(), // 非主要
    screenResolution: getDeviceScreenResolution(), // 非主要
    screenColorDepth: getDeviceScreenColorDepth(), // 非主要
  };
};
```

- 已使用js堆大小 (重点关注 ⭐️)

```ts
// 已使用js堆大小
const getUsedJSHeapSize = () => {
  return performance.memory.usedJSHeapSize;
};
```

- 总js堆大小 (重点关注 ⭐️)

```ts
// 总js堆大小
const getTotalJSHeapSize = () => {
  return performance.memory.totalJSHeapSize;
};
```

- Js堆大小限制 (重点关注 ⭐️)

```ts
// Js堆大小限制
const getJsHeapSizeLimit = () => {
  return performance.memory.jsHeapSizeLimit;
};
```

- 硬件并发 (重点关注 ⭐️)

```ts
// 硬件并发
const getHardwareConcurrency = () => {
  return navigator.hardwareConcurrency;
};
```

- 设备内存 (重点关注 ⭐️)

```ts
// 设备内存
const getDeviceMemory = () => {
  try {
    // 优先使用 navigator.deviceMemory
    if (navigator.deviceMemory !== undefined) {
      return navigator.deviceMemory;
    }

    // 备选方案：使用 performance.memory（仅 Chrome 支持）
    if (performance && performance.memory) {
      return Math.round(performance.memory.jsHeapSizeLimit / (1024 * 1024 * 1024));
    }

    // 无法获取时返回 null
    return null;
  } catch (error) {
    console.warn('获取设备内存信息失败:', error);
    return null;
  }
};
```

- 设备型号

```ts
// 设备型号
const getDeviceModel = () => {
  return navigator.userAgent;
};
```

- 设备操作系统

```ts
// 设备操作系统
const getDeviceOS = () => {
  return navigator.userAgent.includes('Mac')
    ? 'macOS'
    : navigator.userAgent.includes('Windows')
      ? 'Windows'
      : 'Linux';
};
```

- 设备浏览器

```ts
// 设备浏览器
const getDeviceBrowser = () => {
  return navigator.userAgent.includes('Chrome')
    ? 'Chrome'
    : navigator.userAgent.includes('Firefox')
      ? 'Firefox'
      : 'Safari';
};
```

- 设备屏幕分辨率

```ts
// 设备屏幕分辨率
const getDeviceScreenResolution = () => {
  return screen.width + 'x' + screen.height;
};
```

- 设备屏幕颜色深度

```ts
// 设备屏幕颜色深度
const getDeviceScreenColorDepth = () => {
  return screen.colorDepth;
};
```

- 网络信息

```ts
// 网络信息
const getNetworkInfo = () => {
  return navigator.connection;
};
```

- 页面信息

```ts
// 页面信息
const getPageInfo = () => {
  const { host, hostname, href, protocol, origin, port, pathname, search, hash } = location;
  const { width, height } = window.screen;

  return {
    host,
    hostname,
    href,
    protocol,
    origin,
    port,
    pathname,
    search,
    hash,
    userAgent: 'userAgent' in navigator ? navigator.userAgent : '',
    screenResolution: `${width}x${height}`,
  };
};
```

### 数据处理

#### 数据上报

需要考虑上报时机，比如基于微任务上报，避免阻塞页面加载

- xhr

```ts
const xhr = new XMLHttpRequest();
xhr.open('POST', 'https://example.com/api/report', true);
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.send(JSON.stringify({ data: 'report data' }));
```

- image(主流上报方式)

```ts
// 1*1像素图片
const data = new URLSearchParams({
  type: 'performance',
  data: JSON.stringify({ data: 'report data' }),
});
const image = new Image();
image.src = `https://example.com/api/report?${data}`;
image.onload = () => {
  console.log('上报成功');
};
```

- sendBeacon

```ts
navigator.sendBeacon('https://example.com/api/report', JSON.stringify({ data: 'report data' }));
```

#### 数据清洗

- 阀值过滤

#### 数据持久化

- 存入数据库

#### 数据可视化

- 看板图表
- 邮件报表

### 页面性能指标可视化

## 项目结构

```bash

```
