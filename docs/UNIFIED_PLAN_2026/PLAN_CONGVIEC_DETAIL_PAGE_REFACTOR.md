# 🔄 CongViec Detail: Dialog → Page Refactor

## 📋 Tổng Quan

**Mục tiêu**: Chuyển CongViecDetailDialog từ Dialog → Page component thuần

**Lý do**:

- F5 refresh tự nhiên hơn
- Deep link/share URL hoạt động native
- Browser back/forward native
- Loại bỏ Dialog overhead (Portal, Backdrop)
- Consistent với YeuCau module

**Effort**: ~2-3 giờ | **Risk**: LOW

---

## 📁 Files Liên Quan

| File                       | Lines | Thay Đổi                  |
| -------------------------- | ----- | ------------------------- |
| `CongViecDetailDialog.js`  | 839   | Giữ nguyên (legacy)       |
| `CongViecDetailPage.js`    | 39    | **Viết lại hoàn toàn**    |
| `CongViecDetailPageNew.js` | ~850  | **TẠO MỚI** (để test)     |
| `CongViecDetailMobile.js`  | ~400  | **TẠO MỚI** (mobile view) |
| `SubtasksSection.jsx`      | 200   | Bỏ prop `open`            |
| `routes/index.js`          | -     | Đổi route (sau khi test)  |

---

## 🚀 Phases

### Phase 1: Tạo Desktop Page (Test Riêng)

- Tạo `CongViecDetailPageNew.js`
- Copy logic từ Dialog, đổi wrapper
- Route tạm: `/congviec-new/:id`
- Test đầy đủ trước khi chuyển

### Phase 2: Tạo Mobile View

- Tạo `CongViecDetailMobile.js`
- Layout tabs: Chi tiết | Comments | Files | Lịch sử
- Bottom actions sticky
- Test trên mobile

### Phase 3: Tích Hợp Responsive

- Combine Desktop + Mobile với `useMediaQuery`
- Test cả 2 modes

### Phase 4: Chuyển Route Chính

- Đổi route `/congviec/:id` sang Page mới
- Deprecate Dialog cũ

---

## ✅ Checklist

### Phase 1

- [ ] Tạo `CongViecDetailPageNew.js`
- [ ] Thêm route tạm `/congviec-new/:id`
- [ ] Test F5 refresh
- [ ] Test browser back
- [ ] Test deep link share
- [ ] Test subtasks CRUD
- [ ] Test comments CRUD

### Phase 2

- [ ] Tạo `CongViecDetailMobile.js`
- [ ] Test trên iOS Safari
- [ ] Test trên Android Chrome
- [ ] Test swipe/scroll UX

### Phase 3

- [ ] Tích hợp responsive
- [ ] Test breakpoint switching

### Phase 4

- [ ] Đổi route chính
- [ ] Xóa route tạm
- [ ] Cleanup files cũ

---

## 🎯 Bắt Đầu

**Bước tiếp theo**: Tạo Phase 1 - Desktop Page

Command:

```
"Thực hiện Phase 1: Tạo CongViecDetailPageNew.js"
```

---

_Xem chi tiết từng phase trong các file riêng_
