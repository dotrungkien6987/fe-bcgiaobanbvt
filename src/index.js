import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import store from "./app/store";
import App from "./App";
import { fetchColorConfig } from "features/QuanLyCongViec/CongViec/colorConfigSlice";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

const container = document.getElementById("root");
const root = createRoot(container);

// Preload global color configuration once at bootstrap
store.dispatch(fetchColorConfig());

root.render(
  <Provider store={store}>
    <App />
  </Provider>
);

// ✅ REGISTER SERVICE WORKER FOR PWA
// Service Worker chỉ hoạt động trong production mode
serviceWorkerRegistration.register({
  onSuccess: (registration) => {
    console.log("✅ Service Worker registered successfully!");
    console.log("📦 App is now available offline");

    // 🔔 Xin quyền notification sau khi SW đăng ký thành công
    // Delay 2 giây để không làm phiền user ngay lập tức
    setTimeout(() => {
      serviceWorkerRegistration.requestNotificationPermission();
    }, 2000);
  },
  onUpdate: (registration) => {
    console.log("🔄 New version available!");
    // Hiển thị thông báo cho user biết đang cập nhật
    const updateMessage = document.createElement("div");
    updateMessage.innerHTML = "🔄 Đang cập nhật phiên bản mới...";
    updateMessage.style.cssText =
      "position:fixed;top:0;left:0;right:0;background:#1976d2;color:white;text-align:center;padding:12px;z-index:99999;font-size:14px;font-family:sans-serif;";
    document.body.prepend(updateMessage);

    // Kích hoạt SW mới và reload
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
    }
    setTimeout(() => window.location.reload(), 800);
  },
});
