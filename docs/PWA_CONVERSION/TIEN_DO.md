# 📊 Theo Dõi Tiến Độ Chuyển Đổi PWA

> **Cập nhật:** 2026-01-07  
> **Branch:** feature/pwa-conversion  
> **Trạng thái:** Chưa bắt đầu

---

## ✅ Tiến Độ Tổng Thể

```
Giai đoạn 1: Điều Hướng Mobile    [ ] 0/5 files   (0%)
Giai đoạn 2: Splash & Skeleton    [ ] 0/8 files   (0%)
Giai đoạn 3: Hệ Thống Gesture     [ ] 0/10 files  (0%)
Giai đoạn 4: Tối Ưu Route         [ ] 0/4 files   (0%)
Giai đoạn 5: Chiến Lược Offline   [ ] 0/5 files   (0%)
Giai đoạn 6: Thư Viện Component   [ ] 0/9 files   (0%)
─────────────────────────────────────────────────
Tổng Tiến Độ:                     [ ] 0/41 files  (0%)
```

---

## 🎯 Đang Làm

**Đang làm:** [Chưa bắt đầu]  
**Hoàn thành gần nhất:** [Không có]  
**Task tiếp theo:** Bắt đầu từ Giai đoạn 1 hoặc Giai đoạn 2

---

## 📋 Hướng Dẫn Bắt Đầu

### Lần Đầu Triển Khai

1. ✅ **Đọc Kế Hoạch Tổng Thể** → [KE_HOACH_TONG_THE.md](KE_HOACH_TONG_THE.md)
2. ➡️ **Chọn Giai Đoạn Bắt Đầu:**
   - **Khuyên dùng:** Giai đoạn 1 (Điều Hướng Mobile) - nền tảng
   - **Hoặc:** Giai đoạn 2 (Splash & Skeleton) - có thể chạy song song
3. 🚀 **Mở Document Giai Đoạn:** `GIAI_DOAN_X_[TÊN].md`
4. 📝 **Làm theo các bước** trong document
5. ✅ **Cập nhật tiến độ:** Đánh dấu files đã hoàn thành bên dưới

### Tiếp Tục Công Việc

1. 📋 **Kiểm tra TIEN_DO.md này** - xem đã làm gì
2. 🔍 **Tìm file chưa check** trong checklist giai đoạn
3. 📖 **Mở document Giai đoạn tương ứng** để có context
4. 💻 **Tiếp tục implement** từ bước đó
5. ✅ **Cập nhật checklist** khi file hoàn thành

---

## 📊 Checklist Chi Tiết Từng File

Đánh dấu `[✅]` khi file đã hoàn thành và test.

---

### Giai Đoạn 1: Điều Hướng Mobile (Tuần 1-2)

**Trạng thái:** 🔴 Chưa bắt đầu  
**Phụ thuộc:** Không (có thể bắt đầu ngay)  
**Document:** [GIAI_DOAN_1_DIEU_HUONG_MOBILE.md](GIAI_DOAN_1_DIEU_HUONG_MOBILE.md)

```
Files cần Tạo/Sửa:
├── [ ] src/hooks/useMobileLayout.js                     [MỚI]
│       Mục đích: Hook phát hiện mobile & theme
│       Ước tính: 30 phút
│
├── [ ] src/components/MobileBottomNav.js                [MỚI]
│       Mục đích: Bottom navigation component cho mobile
│       Ước tính: 2 giờ
│
├── [ ] src/config/featureFlags.js                       [MỚI]
│       Mục đích: Feature flags configuration
│       Ước tính: 30 phút
│
├── [ ] src/layout/MainLayout/index.js                   [SỬA]
│       Mục đích: Tích hợp bottom nav và mobile detection
│       Ước tính: 1 giờ
│
└── [ ] src/layout/MainLayoutAble/index.js               [SỬA]
        Mục đích: Mirror changes từ MainLayout
        Ước tính: 1 giờ
```

**Tiêu Chí Hoàn Thành:**

- [ ] Bottom nav hiển thị trên mobile (<1024px)
- [ ] Navigation hoạt động đúng (routes)
- [ ] Active state highlight trang hiện tại
- [ ] Badge hiển thị số thông báo
- [ ] Drawer ẩn trên mobile
- [ ] Test trên Chrome DevTools mobile emulator
- [ ] Hoạt động trên cả Basic và Able theme

---

### Giai Đoạn 2: Splash Screen & Skeleton Loading (Tuần 2-3)

**Trạng thái:** 🔴 Chưa bắt đầu  
**Phụ thuộc:** Không (có thể chạy song song với Giai đoạn 1)  
**Document:** [GIAI_DOAN_2_SPLASH_SKELETON.md](GIAI_DOAN_2_SPLASH_SKELETON.md)

```
Files cần Tạo/Sửa:
├── [ ] src/components/SplashScreen.jsx                  [MỚI]
│       Mục đích: Splash screen với animation
│       Ước tính: 1.5 giờ
│
├── [ ] src/components/@extended/mobile/Skeletons.jsx    [MỚI]
│       Mục đích: PageSkeleton, CardListSkeleton, FormSkeleton
│       Ước tính: 2 giờ
│
├── [ ] src/App.js                                       [SỬA]
│       Mục đích: Tích hợp SplashScreen
│       Ước tính: 30 phút
│
├── [ ] src/routes/index.js                              [SỬA]
│       Mục đích: Thêm Suspense boundaries
│       Ước tính: 1 giờ
│
├── [ ] src/features/BenhNhan/BenhNhanTable.js           [SỬA]
│       Mục đích: Thêm CardListSkeleton
│       Ước tính: 30 phút
│
├── [ ] src/features/BaoCao/BaoCaoTable.js               [SỬA]
│       Mục đích: Thêm CardListSkeleton
│       Ước tính: 30 phút
│
├── [ ] src/features/QuanLyCongViec/CongViecTable.js     [SỬA]
│       Mục đích: Thêm CardListSkeleton
│       Ước tính: 30 phút
│
└── [ ] src/features/QuanLyCongViec/KPI/KPIForm.js       [SỬA]
        Mục đích: Thêm FormSkeleton
        Ước tính: 30 phút
```

**Tiêu Chí Hoàn Thành:**

- [ ] Splash screen xuất hiện khi load app
- [ ] Splash animation mượt với Framer Motion
- [ ] Skeleton hiển thị khi load pages
- [ ] Transitions mượt từ skeleton → content
- [ ] Không có flash/jank

---

### Giai Đoạn 3: Hệ Thống Gesture (Tuần 3-4)

**Trạng thái:** 🔴 Chưa bắt đầu  
**Phụ thuộc:** ⚠️ Giai đoạn 1 PHẢI hoàn thành (cần mobile detection)  
**Document:** [GIAI_DOAN_3_HE_THONG_THAO_TAC.md](GIAI_DOAN_3_HE_THONG_THAO_TAC.md)

```
Files cần Tạo/Sửa:
├── [ ] src/components/@extended/mobile/PullToRefreshWrapper.jsx  [MỚI/MOVE]
│       Mục đích: Pull-to-refresh component (di chuyển từ Ticket)
│       Ước tính: 1 giờ
│
├── [ ] src/components/@extended/mobile/SwipeableCard.jsx         [MỚI/MOVE]
│       Mục đích: Swipe actions component (di chuyển từ Ticket)
│       Ước tính: 1 giờ
│
├── [ ] src/components/@extended/mobile/LongPressMenu.jsx         [MỚI]
│       Mục đích: Long press context menu
│       Ước tính: 1.5 giờ
│
├── [ ] src/features/BenhNhan/BenhNhanTable.js           [SỬA]
│       Mục đích: Áp dụng Pull + Swipe gestures
│       Ước tính: 1 giờ
│
├── [ ] src/features/BaoCao/BaoCaoTable.js               [SỬA]
│       Mục đích: Áp dụng Pull + Swipe gestures
│       Ước tính: 1 giờ
│
├── [ ] src/features/BaoCaoSuCo/SuCoTable.js             [SỬA]
│       Mục đích: Áp dụng gestures + Long press
│       Ước tính: 1 giờ
│
├── [ ] src/features/QuanLyCongViec/KPI/KPITable.js      [SỬA]
│       Mục đích: Áp dụng Pull + Swipe gestures
│       Ước tính: 1 giờ
│
├── [ ] src/features/DaoTao/DaoTaoTable.js               [SỬA]
│       Mục đích: Áp dụng Pull + Swipe gestures
│       Ước tính: 1 giờ
│
├── [ ] src/features/QuanLyCongViec/NhiemVuTable.js      [SỬA]
│       Mục đích: Áp dụng gestures + Long press
│       Ước tính: 1 giờ
│
└── [ ] src/features/QuanLyCongViec/Ticket/             [REFACTOR]
        Mục đích: Cập nhật imports sau khi move components
        Ước tính: 30 phút
```

**Tiêu Chí Hoàn Thành:**

- [ ] Pull-to-refresh hoạt động trên 6+ list pages
- [ ] Swipe left/right kích hoạt actions
- [ ] Long press hiển thị context menu
- [ ] Animations mượt 60fps
- [ ] Desktop không thấy gesture UI
- [ ] Touch feedback rõ ràng

---

### Giai Đoạn 4: Tối Ưu Route & Lazy Loading (Tuần 4-5)

**Trạng thái:** 🔴 Chưa bắt đầu  
**Phụ thuộc:** Không (độc lập)  
**Document:** [GIAI_DOAN_4_TOI_UU_ROUTE.md](GIAI_DOAN_4_TOI_UU_ROUTE.md)

```
Files cần Tạo/Sửa:
├── [ ] src/routes/index.js                              [SỬA]
│       Mục đích: Chuyển 50+ routes sang React.lazy()
│       Ước tính: 2 giờ
│
├── [ ] src/utils/preloadRoutes.js                       [MỚI]
│       Mục đích: Preload common routes
│       Ước tính: 1 giờ
│
├── [ ] src/layout/MainLayout/index.js                   [SỬA]
│       Mục đích: Tích hợp preload logic
│       Ước tính: 30 phút
│
└── [ ] src/utils/retryChunkLoad.js                      [MỚI]
        Mục đích: Retry mechanism cho chunk load errors
        Ước tính: 30 phút
```

**Tiêu Chí Hoàn Thành:**

- [ ] Initial bundle <1MB
- [ ] First Contentful Paint <1.5s trên 3G
- [ ] Skeleton hiển thị khi load route chunks
- [ ] Preload hoạt động cho common routes
- [ ] No console errors
- [ ] Lighthouse score improved

---

### Giai Đoạn 5: Chiến Lược Offline (Tuần 5-6)

**Trạng thái:** 🔴 Chưa bắt đầu  
**Phụ thuộc:** Không (độc lập)  
**Document:** [GIAI_DOAN_5_CHIEN_LUOC_OFFLINE.md](GIAI_DOAN_5_CHIEN_LUOC_OFFLINE.md)

```
Files cần Tạo/Sửa:
├── [ ] public/service-worker.js                         [SỬA]
│       Mục đích: Bật API caching strategies
│       Ước tính: 2 giờ
│
├── [ ] src/utils/offlineQueue.js                        [MỚI]
│       Mục đích: IndexedDB queue cho offline mutations
│       Ước tính: 2 giờ
│
├── [ ] src/app/apiService.js                            [SỬA]
│       Mục đích: Offline handling trong Axios
│       Ước tính: 1 giờ
│
├── [ ] src/components/OfflineBanner.jsx                 [MỚI]
│       Mục đích: Banner thông báo offline/sync
│       Ước tính: 1.5 giờ
│
└── [ ] src/App.js                                       [SỬA]
        Mục đích: Tích hợp OfflineBanner
        Ước tính: 15 phút
```

**Tiêu Chí Hoàn Thành:**

- [ ] App xem được data khi offline
- [ ] Forms submit offline → queue
- [ ] Auto-sync khi có mạng trở lại
- [ ] Banner hiển thị offline state
- [ ] Cache hit rate >80% cho master data
- [ ] Queue không duplicate

---

### Giai Đoạn 6: Thư Viện Component Mobile (Tuần 6-7)

**Trạng thái:** 🔴 Chưa bắt đầu  
**Phụ thuộc:** Giai đoạn 1 (cần useMobileLayout)  
**Document:** [GIAI_DOAN_6_THU_VIEN_COMPONENT.md](GIAI_DOAN_6_THU_VIEN_COMPONENT.md)

```
Files cần Tạo/Sửa:
├── [ ] src/components/@extended/mobile/MobileCard.jsx   [MỚI]
│       Mục đích: Touch-optimized card (72px min height)
│       Ước tính: 1 giờ
│
├── [ ] src/components/@extended/mobile/TouchButton.jsx  [MỚI]
│       Mục đích: 48px min height button với haptic
│       Ước tính: 1 giờ
│
├── [ ] src/components/@extended/mobile/MobileDialog.jsx [MỚI]
│       Mục đích: Full-screen dialog trên mobile
│       Ước tính: 1.5 giờ
│
├── [ ] src/components/@extended/mobile/TouchIconButton.jsx [MỚI]
│       Mục đích: 48px touch target icon button
│       Ước tính: 30 phút
│
├── [ ] src/components/@extended/mobile/MobileList.jsx   [MỚI]
│       Mục đích: Touch-optimized list items
│       Ước tính: 1 giờ
│
├── [ ] src/components/@extended/mobile/index.js         [MỚI]
│       Mục đích: Centralized exports
│       Ước tính: 15 phút
│
├── [ ] src/theme/typography.js                          [SỬA]
│       Mục đích: Responsive typography scale
│       Ước tính: 1 giờ
│
├── [ ] docs/MOBILE_COMPONENTS.md                        [MỚI]
│       Mục đích: Component library documentation
│       Ước tính: 1 giờ
│
└── [ ] [Migration: 5-10 pages to use mobile components] [SỬA]
        Mục đích: Example migrations
        Ước tính: 2 giờ
```

**Tiêu Chí Hoàn Thành:**

- [ ] Tất cả touch targets ≥48px
- [ ] Typography responsive mobile/desktop
- [ ] Dialogs full-screen trên mobile
- [ ] Components documented
- [ ] Lighthouse accessibility >90
- [ ] Example migrations hoạt động

---

## 📈 Milestones

```
Week 1-2:  [ ] Giai đoạn 1 Complete
Week 2-3:  [ ] Giai đoạn 2 Complete
Week 3-4:  [ ] Giai đoạn 3 Complete
Week 4-5:  [ ] Giai đoạn 4 Complete
Week 5-6:  [ ] Giai đoạn 5 Complete
Week 6-7:  [ ] Giai đoạn 6 Complete
Week 7:    [ ] Testing & Deployment
```

---

## 🔗 Quick Links

- [Kế Hoạch Tổng Thể](KE_HOACH_TONG_THE.md)
- [Giai Đoạn 1](GIAI_DOAN_1_DIEU_HUONG_MOBILE.md)
- [Giai Đoạn 2](GIAI_DOAN_2_SPLASH_SKELETON.md)
- [Giai Đoạn 3](GIAI_DOAN_3_HE_THONG_THAO_TAC.md)
- [Giai Đoạn 4](GIAI_DOAN_4_TOI_UU_ROUTE.md)
- [Giai Đoạn 5](GIAI_DOAN_5_CHIEN_LUOC_OFFLINE.md)
- [Giai Đoạn 6](GIAI_DOAN_6_THU_VIEN_COMPONENT.md)
- [Tổng Kết Lập Kế Hoạch](LAP_KE_HOACH_HOAN_THANH.md)

---

**Cập nhật lần cuối:** 2026-01-07  
**Tổng files:** 41 files  
**Tổng thời gian ước tính:** 35 giờ  
**Timeline:** 6-7 tuần

🚀 **Sẵn sàng bắt đầu!**
