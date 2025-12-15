# Role-Based Views Implementation Summary

**Ngày**: 08/12/2025  
**Trạng thái**: ✅ Planning Complete - 🚧 Implementation Started

---

## Tổng Quan

Đã hoàn thành việc phân tích và thiết kế hệ thống **Role-Based Views** cho module Yêu Cầu, giúp cải thiện UX bằng cách tách riêng views cho từng vai trò.

---

## Files Đã Tạo

### Frontend

1. **`hooks/useYeuCauRoles.js`** ✅

   - Hook kiểm tra vai trò: `isNguoiDieuPhoi`, `isQuanLyKhoa`
   - Load permissions từ API
   - Badge counts hook (stub)

2. **`YeuCauToiGuiPage.js`** ✅ (có lint errors)

   - View cho người GỬI
   - 5 tabs: Chờ phản hồi | Đang xử lý | Chờ đánh giá | Đã đóng | Bị từ chối
   - Filter theo `NhanVienTaoID`

3. **`YeuCauXuLyPage.js`** ✅ (có lint errors)

   - View cho người XỬ LÝ
   - 4 tabs: Chờ tiếp nhận | Đang xử lý | Chờ xác nhận | Đã hoàn thành
   - KPI metrics cards

4. **`YeuCauDieuPhoiPage.js`** ✅ (có lint errors)

   - View cho ĐIỀU PHỐI
   - 5 tabs: Mới đến | Chờ tiếp nhận | Đang xử lý | Hoàn thành | Từ chối
   - Dashboard stats với permission check

5. **`YeuCauQuanLyKhoaPage.js`** ✅ (có lint errors)

   - View cho QUẢN LÝ KHOA
   - 4 tabs: Gửi đến khoa | Khoa gửi đi | Quá hạn | Báo cáo
   - Summary stats + Export report

6. **`index.js`** ✅
   - Export 4 pages mới

### Documentation

7. **`ROLE_BASED_VIEWS.md`** ✅

   - Architecture chi tiết
   - Tab definitions
   - Permission checks
   - Menu integration
   - Migration plan

8. **`BACKEND_API_EXTENSIONS.md`** ✅

   - 5 API endpoints mới:
     - `GET /my-permissions`
     - `GET /badge-counts`
     - `GET /dashboard/xu-ly`
     - `GET /dashboard/dieu-phoi`
     - Enhanced `GET /yeucau` với shortcuts
   - Database indexes
   - Implementation code samples

9. **`00_TONG_QUAN.md`** ✅ (updated)
   - Thêm link đến ROLE_BASED_VIEWS.md

---

## Cần Làm Tiếp

### Frontend - Ưu tiên cao

- [ ] **Fix syntax errors** trong 4 page files (có vẻ là vấn đề với JSX syntax)
- [ ] **Update routes** `src/routes/index.js` - thêm 4 routes mới
- [ ] **Update navigation menu** với conditional rendering theo role
- [ ] **Implement badge counts** - real-time hoặc polling
- [ ] **Test pages** với mock data

### Backend - Ưu tiên cao

- [ ] **Implement 4 API endpoints**:

  ```javascript
  GET / api / workmanagement / yeucau / my - permissions;
  GET / api / workmanagement / yeucau / badge - counts;
  GET / api / workmanagement / yeucau / dashboard / xu - ly;
  GET / api / workmanagement / yeucau / dashboard / dieu - phoi;
  ```

- [ ] **Update layDanhSach()** với filter shortcuts:

  ```javascript
  ?role=xu-ly
  ?role=dieu-phoi&tab=moi-den
  ?ChuaDieuPhoi=true
  ?QuaHan=true
  ```

- [ ] **Add database indexes** (xem BACKEND_API_EXTENSIONS.md)

### Testing

- [ ] Unit tests cho `useYeuCauRoles` hook
- [ ] Integration tests cho API endpoints
- [ ] E2E tests cho từng role view
- [ ] Performance test với >1000 yêu cầu

---

## Architecture Highlights

### 1. Separation of Concerns

```
/yeu-cau/toi-gui       → Người gửi (tất cả nhân viên)
/yeu-cau/xu-ly         → Người xử lý (conditional access)
/yeu-cau/dieu-phoi     → Điều phối (CauHinhThongBaoKhoa)
/yeu-cau/quan-ly-khoa  → Quản lý (CauHinhThongBaoKhoa)
```

### 2. Permission Matrix

```javascript
const roles = useYeuCauRoles();
// {
//   isNguoiDieuPhoi: bool,
//   isQuanLyKhoa: bool,
//   khoaDieuPhoiIds: ObjectId[],
//   khoaQuanLyIds: ObjectId[],
//   isAdmin: bool,
// }
```

### 3. Menu với Badge Counts

```javascript
📋 YÊU CẦU HỖ TRỢ
├── 📤 Tôi gửi đi    (badge: 5)   // Always visible
├── 📥 Tôi xử lý     (badge: 10)  // If hasYeuCauCanXuLy()
├── 🔄 Điều phối     (badge: 7)   // If roles.isNguoiDieuPhoi
└── 📊 Quản lý khoa                // If roles.isQuanLyKhoa
```

### 4. Filter Logic Examples

**YeuCauXuLyPage - Tab "Chờ tiếp nhận":**

```javascript
filters = {
  TrangThai: ["MOI"],
  NguoiDuocDieuPhoiID: user.NhanVienID,
};
```

**YeuCauDieuPhoiPage - Tab "Mới đến":**

```javascript
filters = {
  KhoaDichID: user.KhoaID,
  TrangThai: ["MOI"],
  LoaiNguoiNhan: "KHOA",
  ChuaDieuPhoi: true, // → NguoiDuocDieuPhoiID = null
};
```

---

## Migration Strategy

### Phase 1: Parallel Deployment (Current)

- ✅ Create new routes alongside old `/yeu-cau`
- [ ] Add banner: "Thử giao diện mới"
- [ ] Gather feedback

### Phase 2: Soft Launch (Week 2)

- [ ] Default redirect từ `/yeu-cau` → route phù hợp
- [ ] Keep "Quay lại giao diện cũ" option

### Phase 3: Full Migration (Week 3)

- [ ] Remove old page
- [ ] Update all links
- [ ] Update documentation

---

## Benefits

### For Users

- ✅ **Context-aware**: Chỉ thấy data liên quan
- ✅ **Less clutter**: Không bị overwhelm với quá nhiều data
- ✅ **Quick actions**: Actions phù hợp với vai trò
- ✅ **Real-time notifications**: Badge counts

### For Developers

- ✅ **Maintainable**: Separation of concerns
- ✅ **Reusable**: Shared components (`YeuCauList`, `YeuCauCard`)
- ✅ **Testable**: Each view có logic riêng
- ✅ **Scalable**: Dễ thêm role mới

### For Performance

- ✅ **Targeted queries**: Fetch ít data hơn
- ✅ **Cached permissions**: Check 1 lần
- ✅ **Lazy loading**: Tabs fetch on-demand

---

## Next Steps

### Immediate (This Week)

1. **Fix syntax errors** trong page files
2. **Implement backend APIs** (my-permissions, badge-counts)
3. **Add routes** vào routes/index.js
4. **Test** với mock data

### Short-term (Next Week)

5. **Update menu** với conditional rendering
6. **Implement real badge counts** (polling hoặc WebSocket)
7. **Add database indexes**
8. **Integration testing**

### Long-term (Week 3+)

9. **Dashboard charts** cho Quản lý khoa
10. **Export reports** functionality
11. **Mobile optimization**
12. **Full migration** từ old page

---

## Technical Debt Notes

- [ ] **Syntax errors** trong page files cần fix ngay
- [ ] `useYeuCauBadgeCounts` hook chỉ là stub, cần implement
- [ ] Dashboard metrics chỉ là mock data
- [ ] Chưa có error boundaries cho các pages
- [ ] Chưa có loading skeletons

---

## Questions for Discussion

1. **Badge counts**: Real-time (WebSocket) hay polling (every 30s)?
2. **Default route**: Redirect `/yeu-cau` về đâu? (suggest: `/yeu-cau/toi-gui`)
3. **Mobile menu**: Collapse submenu hay giữ expanded?
4. **Export format**: Excel hay PDF cho báo cáo Quản lý khoa?
5. **Cache strategy**: Redis cho permissions hay in-memory?

---

## Resources

- **Frontend files**: `fe-bcgiaobanbvt/src/features/QuanLyCongViec/Ticket/`
- **Backend files**: `giaobanbv-be/modules/workmanagement/`
- **Documentation**:
  - `ROLE_BASED_VIEWS.md`
  - `BACKEND_API_EXTENSIONS.md`
  - `00_TONG_QUAN.md`

---

**Maintained by**: Development Team  
**Contact**: dotrungkien6987@gmail.com  
**Last Updated**: 08/12/2025
