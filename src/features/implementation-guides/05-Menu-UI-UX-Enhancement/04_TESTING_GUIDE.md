# 🧪 Testing Guide

> Comprehensive testing strategies cho Menu UI/UX enhancements

## 📋 Testing Checklist

### ✅ Visual Testing

- [ ] Glassmorphism hiển thị đúng ở cả dark/light mode
- [ ] Icon animations mượt, không jerky
- [ ] Gradient selected state hiển thị full border
- [ ] Shimmer effect chạy 3 giây/lần
- [ ] Divider labels float trên line
- [ ] Staggered animation cascade từ trái
- [ ] Active indicator line align với selected item
- [ ] Glow effect pulse mỗi 2 giây

### ✅ Functional Testing

- [ ] Drawer toggle hoạt động với mọi role
- [ ] Mini drawer 64px đủ rộng cho icons
- [ ] Custom scrollbar responsive (6px open, 4px mini)
- [ ] Navigation giữ selected state khi reload
- [ ] Active indicator di chuyển smooth khi navigate
- [ ] Menu collapse/expand hoạt động bình thường

### ✅ Performance Testing

- [ ] 60fps animations (check với DevTools)
- [ ] No layout thrashing
- [ ] Memory không leak khi toggle nhiều lần
- [ ] Lazy loading cho routes

### ✅ Responsive Testing

- [ ] Desktop: Full drawer width 260px
- [ ] Tablet: Mini drawer 64px
- [ ] Mobile: Temporary drawer từ trái
- [ ] Touch gestures hoạt động

### ✅ Browser Compatibility

- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (macOS/iOS)
- [ ] Mobile browsers

---

## 1️⃣ Visual Regression Testing

### Setup

```bash
# Install Playwright
npm install -D @playwright/test

# Install browsers
npx playwright install
```

### Test Script

**File**: `tests/menu-ui.spec.js`

```javascript
import { test, expect } from "@playwright/test";

test.describe("Menu UI/UX Enhancements", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000");
    // Login nếu cần
    await page.fill('input[name="username"]', "testuser");
    await page.fill('input[name="password"]', "password");
    await page.click('button[type="submit"]');
    await page.waitForLoadState("networkidle");
  });

  test("Glassmorphism effect on menu popup", async ({ page }) => {
    // Hover vào menu item có children
    await page.hover('[data-testid="menu-reports"]');
    await page.waitForTimeout(300); // Animation delay

    // Screenshot popup
    const popup = page.locator(".MuiPopper-root");
    await expect(popup).toBeVisible();
    await expect(popup).toHaveScreenshot("glassmorphism-popup.png");
  });

  test("Icon bounce animation on hover", async ({ page }) => {
    const menuItem = page.locator('[data-testid="menu-dashboard"]');

    // Take screenshot before hover
    await expect(menuItem).toHaveScreenshot("icon-before-hover.png");

    // Hover
    await menuItem.hover();
    await page.waitForTimeout(300);

    // Take screenshot during animation
    await expect(menuItem).toHaveScreenshot("icon-hover-animation.png");
  });

  test("Gradient selected state", async ({ page }) => {
    // Click menu item
    await page.click('[data-testid="menu-analytics"]');
    await page.waitForTimeout(500);

    // Check selected state
    const selected = page.locator(".MuiListItemButton-root.Mui-selected");
    await expect(selected).toBeVisible();
    await expect(selected).toHaveScreenshot("gradient-selected.png");
  });

  test("Staggered animation on drawer open", async ({ page }) => {
    // Close drawer
    await page.click('[data-testid="drawer-toggle"]');
    await page.waitForTimeout(500);

    // Open drawer
    await page.click('[data-testid="drawer-toggle"]');

    // Record animation
    const drawer = page.locator('[aria-label="mailbox folders"]');
    const recording = await page.video();
    await page.waitForTimeout(1000); // Record full animation

    // Verify all items visible
    const items = drawer.locator(".MuiListItemButton-root");
    await expect(items.first()).toBeVisible();
    await expect(items.last()).toBeVisible();
  });

  test("Active indicator position", async ({ page }) => {
    // Navigate to different routes
    const routes = ["/dashboard", "/users", "/analytics"];

    for (const route of routes) {
      await page.goto(`http://localhost:3000${route}`);
      await page.waitForTimeout(500);

      // Check indicator position
      const indicator = page.locator('[data-testid="active-indicator"]');
      const selected = page.locator(".MuiListItemButton-root.Mui-selected");

      const indicatorBox = await indicator.boundingBox();
      const selectedBox = await selected.boundingBox();

      // Verify indicator aligned with selected item
      expect(Math.abs(indicatorBox.y - selectedBox.y)).toBeLessThan(5);
    }
  });

  test("Theme switching compatibility", async ({ page }) => {
    // Switch to dark mode
    await page.click('[data-testid="theme-toggle"]');
    await page.waitForTimeout(500);

    // Take screenshots
    await expect(page).toHaveScreenshot("menu-dark-mode.png");

    // Switch to light mode
    await page.click('[data-testid="theme-toggle"]');
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot("menu-light-mode.png");
  });
});
```

---

## 2️⃣ Performance Testing

### Chrome DevTools - Performance Tab

**Steps:**

1. Mở DevTools → Performance tab
2. Start recording
3. Toggle drawer 5 lần
4. Stop recording
5. Analyze results

**Expected Results:**

```
✅ FPS: Constant 60fps
✅ Scripting: < 50ms per frame
✅ Rendering: < 16ms per frame
✅ Painting: < 10ms per frame
✅ No long tasks (> 50ms)
```

### Lighthouse Performance Audit

```bash
# Run Lighthouse
npx lighthouse http://localhost:3000 --view

# Check scores:
# Performance: > 90
# Accessibility: > 90
# Best Practices: > 90
```

### Memory Leak Test

**File**: `tests/memory-leak.spec.js`

```javascript
test("No memory leaks on drawer toggle", async ({ page }) => {
  await page.goto("http://localhost:3000");

  // Get initial memory
  const initialMemory = await page.evaluate(
    () => performance.memory.usedJSHeapSize
  );

  // Toggle drawer 100 times
  for (let i = 0; i < 100; i++) {
    await page.click('[data-testid="drawer-toggle"]');
    await page.waitForTimeout(50);
  }

  // Force garbage collection (requires --js-flags="--expose-gc")
  await page.evaluate(() => window.gc && window.gc());

  // Get final memory
  const finalMemory = await page.evaluate(
    () => performance.memory.usedJSHeapSize
  );

  // Memory increase should be minimal (< 1MB)
  const memoryIncrease = finalMemory - initialMemory;
  expect(memoryIncrease).toBeLessThan(1024 * 1024);
});
```

---

## 3️⃣ Animation Performance Testing

### Frame Rate Test

**File**: `tests/animation-fps.js`

```javascript
const measureFPS = () => {
  let lastTime = performance.now();
  let frames = 0;
  let fps = 0;

  const loop = () => {
    const now = performance.now();
    frames++;

    if (now >= lastTime + 1000) {
      fps = Math.round((frames * 1000) / (now - lastTime));
      frames = 0;
      lastTime = now;
      console.log("FPS:", fps);
    }

    requestAnimationFrame(loop);
  };

  loop();
};

// Run during drawer toggle
test("FPS during drawer animation", async ({ page }) => {
  await page.goto("http://localhost:3000");

  // Start FPS monitoring
  await page.evaluate(measureFPS);

  // Toggle drawer
  await page.click('[data-testid="drawer-toggle"]');
  await page.waitForTimeout(1000);

  // Get FPS logs
  const logs = await page.evaluate(() => {
    return window.fpsLogs; // Collect logs
  });

  // All FPS readings should be > 55
  logs.forEach((fps) => {
    expect(fps).toBeGreaterThan(55);
  });
});
```

### CPU Throttling Test

```javascript
test("Performance under CPU throttling", async ({ page, context }) => {
  // Simulate slow device
  await context.setCPUThrottlingRate(4); // 4x slowdown

  await page.goto("http://localhost:3000");

  const startTime = Date.now();

  // Toggle drawer
  await page.click('[data-testid="drawer-toggle"]');
  await page.waitForSelector(".MuiDrawer-paper");

  const duration = Date.now() - startTime;

  // Should still be reasonably fast even on slow device
  expect(duration).toBeLessThan(1000);
});
```

---

## 4️⃣ Browser Compatibility Testing

### Cross-Browser Test Matrix

| Feature                         | Chrome | Firefox | Safari  | Edge |
| ------------------------------- | ------ | ------- | ------- | ---- |
| Glassmorphism (backdrop-filter) | ✅     | ✅      | ⚠️ 9.1+ | ✅   |
| CSS Animations                  | ✅     | ✅      | ✅      | ✅   |
| Gradient Borders                | ✅     | ✅      | ✅      | ✅   |
| Pseudo-elements                 | ✅     | ✅      | ✅      | ✅   |
| Transform animations            | ✅     | ✅      | ✅      | ✅   |

### Fallback Test (Safari < 9.1)

**File**: `src/utils/browserSupport.js`

```javascript
export const supportsBackdropFilter = () => {
  return CSS.supports("backdrop-filter", "blur(1px)") || CSS.supports("-webkit-backdrop-filter", "blur(1px)");
};

// Usage trong component:
const hasBackdropFilter = supportsBackdropFilter();

sx={{
  backdropFilter: hasBackdropFilter ? "blur(20px)" : "none",
  background: hasBackdropFilter
    ? "rgba(30,30,30,0.85)"
    : "rgba(30,30,30,0.95)", // More opaque fallback
}}
```

### BrowserStack Test Script

```javascript
// Configure browsers
const browsers = [
  { browserName: "Chrome", browserVersion: "latest" },
  { browserName: "Firefox", browserVersion: "latest" },
  { browserName: "Safari", browserVersion: "15.0" },
  { browserName: "Edge", browserVersion: "latest" },
];

browsers.forEach((browser) => {
  test(`Menu UI on ${browser.browserName}`, async ({ page }) => {
    // ... test logic
  });
});
```

---

## 5️⃣ Accessibility Testing

### Keyboard Navigation

```javascript
test("Keyboard navigation", async ({ page }) => {
  await page.goto("http://localhost:3000");

  // Tab through menu items
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");

  // Current focused item should be visible
  const focused = page.locator(":focus");
  await expect(focused).toBeVisible();

  // Enter to activate
  await page.keyboard.press("Enter");
  await page.waitForNavigation();

  // Should navigate
  expect(page.url()).not.toBe("http://localhost:3000");
});
```

### Screen Reader Test

```javascript
test("ARIA labels and roles", async ({ page }) => {
  await page.goto("http://localhost:3000");

  // Check drawer has proper role
  const drawer = page.locator('[role="navigation"]');
  await expect(drawer).toBeVisible();

  // Check menu items have labels
  const menuItems = page.locator('[role="button"]');
  const count = await menuItems.count();

  for (let i = 0; i < count; i++) {
    const item = menuItems.nth(i);
    const ariaLabel = await item.getAttribute("aria-label");
    expect(ariaLabel).toBeTruthy();
  }
});
```

### Color Contrast Test

```javascript
test("Color contrast ratios", async ({ page }) => {
  await page.goto("http://localhost:3000");

  // Inject axe-core
  await page.addScriptTag({
    url: "https://unpkg.com/axe-core@4.6.0/axe.min.js",
  });

  // Run accessibility checks
  const results = await page.evaluate(() => {
    return new Promise((resolve) => {
      axe.run(document, (err, results) => {
        resolve(results.violations);
      });
    });
  });

  // Filter color-contrast violations
  const contrastIssues = results.filter((v) => v.id === "color-contrast");

  expect(contrastIssues).toHaveLength(0);
});
```

---

## 6️⃣ Responsive Testing

### Viewport Test Matrix

```javascript
const viewports = [
  { name: "Mobile", width: 375, height: 667 },
  { name: "Tablet", width: 768, height: 1024 },
  { name: "Desktop", width: 1440, height: 900 },
  { name: "Large", width: 1920, height: 1080 },
];

viewports.forEach(({ name, width, height }) => {
  test(`Menu UI on ${name}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("http://localhost:3000");

    if (width < 900) {
      // Mobile/Tablet: Temporary drawer
      const drawer = page.locator(".MuiDrawer-root");
      await expect(drawer).toHaveCSS("position", "fixed");
    } else {
      // Desktop: Persistent drawer
      const drawer = page.locator(".MuiDrawer-root");
      await expect(drawer).toHaveCSS("position", "fixed");
    }
  });
});
```

### Touch Gesture Test

```javascript
test("Swipe to open drawer (mobile)", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("http://localhost:3000");

  // Simulate swipe from left edge
  await page.touchscreen.tap(10, 300);
  await page.touchscreen.tap(200, 300);

  // Drawer should open
  const drawer = page.locator(".MuiDrawer-paper");
  await expect(drawer).toBeVisible();
});
```

---

## 7️⃣ User Acceptance Testing

### Test Scenarios

#### Scenario 1: First-Time User

```
Given: User mở app lần đầu
When: User click vào hamburger icon
Then:
  - Drawer mở ra smooth với staggered animation
  - Menu items cascade từ trái sang phải
  - Icons bounce khi hover
  - Selected item có gradient border
```

#### Scenario 2: Power User

```
Given: User đã quen với app
When: User navigate nhanh giữa các pages
Then:
  - Active indicator di chuyển smooth
  - Selected state update instant
  - Không có lag hoặc jank
```

#### Scenario 3: Mobile User

```
Given: User trên điện thoại
When: User swipe từ cạnh trái
Then:
  - Drawer slide in từ trái
  - Touch gestures responsive
  - Animations mượt mà
```

### Feedback Collection

```javascript
// Add analytics tracking
const trackMenuInteraction = (action, item) => {
  analytics.track("Menu Interaction", {
    action, // 'hover', 'click', 'toggle'
    item,
    timestamp: Date.now(),
    viewport: window.innerWidth,
  });
};

// Usage:
<ListItemButton
  onClick={() => {
    handleClick();
    trackMenuInteraction('click', item.id);
  }}
>
```

---

## 8️⃣ Regression Testing

### Before/After Comparison

```javascript
test("Performance regression", async ({ page }) => {
  // Baseline metrics (before enhancements)
  const baseline = {
    drawerToggleTime: 200,
    firstPaintTime: 500,
    memoryUsage: 10 * 1024 * 1024, // 10MB
  };

  // Current metrics
  await page.goto("http://localhost:3000");

  const startTime = Date.now();
  await page.click('[data-testid="drawer-toggle"]');
  await page.waitForSelector(".MuiDrawer-paper");
  const toggleTime = Date.now() - startTime;

  const memory = await page.evaluate(() => performance.memory.usedJSHeapSize);

  // Verify no regression
  expect(toggleTime).toBeLessThanOrEqual(baseline.drawerToggleTime * 1.2); // 20% tolerance
  expect(memory).toBeLessThanOrEqual(baseline.memoryUsage * 1.5); // 50% tolerance
});
```

---

## 📊 Test Reports

### Generate HTML Report

```bash
# Run all tests với reporter
npx playwright test --reporter=html

# View report
npx playwright show-report
```

### CI/CD Integration

**File**: `.github/workflows/test.yml`

```yaml
name: Menu UI Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run tests
        run: npx playwright test

      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 🎯 Testing Best Practices

1. **Test pyramids**: Unit > Integration > E2E
2. **Isolate tests**: Mỗi test độc lập, không depend lẫn nhau
3. **Use data-testid**: Thay vì CSS selectors brittle
4. **Mock external dependencies**: APIs, images, fonts
5. **Parallel execution**: Tăng tốc với `fullyParallel: true`
6. **Visual regression**: Screenshot comparison quan trọng
7. **Performance budgets**: Set thresholds rõ ràng

---

**Next**: [Express Rate Limit Guide](../06-Security/00_EXPRESS_RATE_LIMIT_GUIDE.md) →
