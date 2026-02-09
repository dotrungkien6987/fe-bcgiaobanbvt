# 📘 PHẦN 17: PWA TESTING — KIỂM TRA TOÀN DIỆN

> **📌 MỤC ĐÍCH:**
>
> Checklist kiểm tra PWA, Service Worker, thông báo real-time sau khi deploy.
> Phân biệt rõ những gì **đang hoạt động** vs **Phase 2 (chưa triển khai)**.

---

## ✅ CHECKLIST TỔNG QUAN

```
ĐANG HOẠT ĐỘNG:
✅ HTTPS enabled (ổ khóa xanh)
✅ manifest.json valid (BC Bệnh viện)
✅ Service Worker registered & activated
✅ Icons: logoBVTPT.png (192x192, 512x512), logo64/128/256
✅ Offline: App shell load từ cache
✅ Installable: Add to Home Screen / Install PWA
✅ Socket.IO real-time notifications
✅ Auto-update: Banner xanh + reload 800ms

PHASE 2 (CHƯA TRIỂN KHAI):
⏳ FCM push notifications (app đóng)
⏳ Background sync
⏳ API response caching
```

---

## 🖥️ TEST TRÊN DESKTOP

### **1. Manifest.json:**

```
Chrome DevTools (F12) → Application → Manifest

Kiểm tra:
✅ Name:             Báo cáo Giaoban - Bệnh viện Đa khoa Tỉnh Phú Thọ
✅ Short name:       BC Bệnh viện
✅ Description:      Hệ thống quản lý công việc và KPI cho cán bộ y tế
✅ Start URL:        .
✅ Display:          standalone
✅ Orientation:      portrait-primary
✅ Theme color:      #1976d2
✅ Background color: #ffffff
✅ Language:          vi-VN
✅ Categories:       health, productivity, business
✅ Icons:            64x64, 128x128, 256x256, 192x192, 512x512
                     (192 & 512 dùng logoBVTPT.png)
```

### **2. Service Worker:**

```
Application → Service Workers

✅ Status:    activated and is running
✅ Source:    service-worker.js
✅ Scope:     https://hospital.vn/
✅ Clients:   1 (hoặc nhiều hơn nếu nhiều tab)

Verify cache:
Application → Cache Storage → hospital-pwa-v0.1.0

✅ Chứa: /, /index.html, /manifest.json, /favicon.ico,
         /logo192.png, /logo512.png, /logoBVTPT.png
```

### **3. Offline Mode:**

```
1. DevTools → Network → ☑️ Offline
2. Reload (Ctrl+R)

✅ App shell hiển thị (từ cached index.html)
✅ Logo, menu, layout hiển thị bình thường
✅ SPA routing vẫn hoạt động
❌ API data không load → Hiện lỗi "Không có kết nối mạng"
   → Đây là behavior ĐÚNG

3. Bỏ ☑️ Offline → Reload → Mọi thứ hoạt động bình thường ✅
```

### **4. PWA Install:**

```
Desktop Chrome:
1. URL bar → Icon install (⊕ hoặc 🖥️) ở bên phải
   → Nếu không thấy, click 3 chấm (⋮) → "Install BC Bệnh viện"
2. Click Install
3. App mở trong cửa sổ riêng (không có thanh URL)
4. Taskbar/Desktop có icon app ✅

Edge:
1. URL bar → Icon install → Install
2. Apps → "BC Bệnh viện" hiện trong danh sách ✅
```

### **5. Lighthouse Audit:**

```
DevTools → Lighthouse → Chọn:
☑️ Performance
☑️ Best Practices
☑️ PWA

→ Generate report

Mục tiêu:
✅ PWA:          ≥ 80  (100 nếu có HTTPS + full SW)
✅ Performance:  ≥ 80
✅ Best Practices: ≥ 90

Nếu PWA < 80:
→ Kiểm tra: HTTPS? SW activated? manifest.json valid? Icons đủ?
```

### **6. Auto-Update Flow:**

```
Giả lập update để test:

1. DevTools → Application → Service Workers
2. Tick ☑️ "Update on reload"
3. Sửa CACHE_NAME trong service-worker.js → Build lại
4. Reload trang

✅ Hiện banner xanh: "🔄 Đang cập nhật phiên bản mới..."
✅ Auto reload sau 800ms
✅ Cache Storage: cache cũ bị xóa, cache mới được tạo
```

---

## 📱 TEST TRÊN MOBILE

### **Android Chrome:**

```
1. Truy cập https://hospital.vn trên điện thoại
2. Chờ vài giây → Chrome hiện banner "Add to Home Screen"
   (hoặc: Menu ⋮ → "Add to Home Screen" / "Install app")
3. Tap "Install"
4. Icon "BC Bệnh viện" xuất hiện trên Home Screen ✅
5. Tap icon → App mở ở chế độ standalone (không có thanh URL) ✅
6. Test offline: Bật chế độ máy bay → Mở app
   → App shell vẫn hiển thị ✅
```

### **iOS Safari (iOS 16.4+):**

```
1. Truy cập https://hospital.vn trên Safari
2. Tap Share button (↗️) → "Add to Home Screen"
3. Sửa tên nếu muốn → Tap "Add"
4. Icon xuất hiện trên Home Screen ✅
5. Tap icon → Mở ở standalone mode ✅

⚠️ LƯU Ý iOS:
• Push notifications chỉ hỗ trợ từ iOS 16.4+
• Service Worker caching hoạt động nhưng có giới hạn
• WebSocket (Socket.IO) hoạt động bình thường
```

---

## 🔔 TEST THÔNG BÁO (SOCKET.IO — ĐANG HOẠT ĐỘNG)

### **Test cơ bản:**

```
1. Mở https://hospital.vn → Đăng nhập

2. Lần đầu: Browser popup "Cho phép thông báo?"
   → Click "Allow" ✅
   → Test notification hiện: "🏥 Thông báo đã được bật!" ✅

3. Kiểm tra NotificationBell (icon chuông trên header):
   ✅ Hiển thị icon chuông
   ✅ Badge số (nếu có thông báo chưa đọc)
   ✅ Click → Dropdown/Drawer danh sách thông báo

4. Kiểm tra WebSocket connection:
   DevTools → Network → WS filter
   ✅ /socket.io/ → Status: 101
   ✅ Messages: ping/pong liên tục
```

### **Test real-time delivery:**

```
CHUẨN BỊ: Mở 2 tab/browser khác nhau

Tab A (người gửi): Đăng nhập tài khoản A
Tab B (người nhận): Đăng nhập tài khoản B

THỰC HIỆN:
1. Tab A: Tạo yêu cầu mới → Chọn người xử lý = User B
   (hoặc: Chuyển trạng thái công việc liên quan đến User B)

2. Tab B: KHÔNG reload, chỉ quan sát:
   ✅ Badge trên chuông tăng lên (realtime)
   ✅ Toast notification popup (góc trên phải)
   ✅ Click chuông → Thông báo mới nằm đầu danh sách

3. Tab B: Click vào thông báo:
   ✅ Navigate đến trang liên quan (công việc/yêu cầu)
   ✅ Thông báo chuyển sang "đã đọc"
   ✅ Badge giảm
```

### **Test notification settings:**

```
1. Vào: Quản lý công việc → Cài đặt → Thông báo
   (hoặc: /quanlycongviec/cai-dat/thong-bao)

2. Kiểm tra trang settings:
   ✅ Toggle bật/tắt từng loại thông báo
   ✅ Quiet hours setting
   ✅ Save settings → Toast "Lưu thành công" ✅

3. Test: Tắt 1 loại thông báo → Trigger action tương ứng
   → KHÔNG nhận thông báo loại đó ✅
   → Bật lại → Nhận bình thường ✅
```

---

## ⏳ TEST PUSH NOTIFICATIONS (PHASE 2 — KHI ĐÃ TRIỂN KHAI FCM)

> **Phần này chỉ test được sau khi hoàn thành File 16 — FCM Setup**

```
1. Đăng nhập → Allow notifications → FCM token logged trong Console

2. Test foreground (app đang mở):
   → Trigger action → Toast + bell badge ✅

3. Test background (ĐẾN tab):
   → Trigger action từ tab/device khác
   → OS notification hiện trên desktop/mobile ✅

4. Click notification:
   → Mở app tại URL đúng ✅
   → Focus window nếu app đã mở ✅

5. Test từ Firebase Console (optional):
   Firebase Console → Cloud Messaging → Send first message
   → Kiểm tra notification hiện ✅
```

---

## 📋 BẢNG TỔNG KẾT

| Tính năng               | Trạng thái          | Test method                              |
| ----------------------- | ------------------- | ---------------------------------------- |
| HTTPS                   | ✅ Hoạt động        | Kiểm tra ổ khóa xanh                     |
| manifest.json           | ✅ Valid            | DevTools → Application → Manifest        |
| Service Worker          | ✅ Active           | DevTools → Application → Service Workers |
| Static caching          | ✅ Cache First      | Application → Cache Storage              |
| Offline shell           | ✅ Hoạt động        | Network → Offline → Reload               |
| PWA Install             | ✅ Desktop + Mobile | URL bar icon / Menu                      |
| Auto-update             | ✅ Banner + reload  | Thay version → Deploy → Reload           |
| Socket.IO notifications | ✅ Real-time        | Test với 2 tabs                          |
| Notification permission | ✅ Hoạt động        | Popup + test notification                |
| Notification settings   | ✅ UI + logic       | Settings page                            |
| FCM push (background)   | ⏳ Phase 2          | Sau khi setup Firebase                   |
| Background sync         | ⏳ Phase 2          | —                                        |
| API offline cache       | ⏳ Tùy chọn         | Uncomment API_ROUTES_TO_CACHE            |

---

## 🛠️ QUICK FIX

| Vấn đề                    | Giải pháp nhanh                              |
| ------------------------- | -------------------------------------------- |
| Install prompt không hiện | Kiểm tra HTTPS + manifest + SW               |
| SW không activate         | DevTools → Unregister → Reload               |
| Cache cũ                  | DevTools → Storage → Clear site data         |
| Notification blocked      | Browser settings → Notifications → Allow     |
| WebSocket disconnect      | Kiểm tra Nginx WebSocket config (Phase 2)    |
| Badge không update        | Kiểm tra Redux DevTools → notification state |
| Lighthouse PWA < 80       | Chạy audit, fix từng item trong report       |

---

**⏭️ TIẾP THEO: [18-SSL-HTTPS.md](18-SSL-HTTPS.md)**
