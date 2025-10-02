# Old Components - Version 1.0

Thư mục này chứa các component của phiên bản cũ (V1.0) của tính năng Giao Nhiệm Vụ.

## Các component trong thư mục này:

### 1. GiaoNhiemVuPage.js

- **Mô tả**: Trang chính của version 1.0 với thiết kế sidebar
- **UI**: Danh sách nhân viên ở sidebar bên trái, form giao nhiệm vụ bên phải
- **Route cũ**: `/quanlycongviec/giao-nhiem-vu-old/:NhanVienID` (vẫn hoạt động để tham khảo)

### 2. EmployeeList.js

- **Mô tả**: Component hiển thị danh sách nhân viên dạng sidebar
- **Được sử dụng bởi**: GiaoNhiemVuPage.js

### 3. AssignmentTable.js

- **Mô tả**: Bảng hiển thị danh sách nhiệm vụ đã gán cho một nhân viên
- **Được sử dụng bởi**: GiaoNhiemVuPage.js

### 4. DutyPicker.js

- **Mô tả**: Component để chọn và giao nhiệm vụ (UI dạng form)
- **Được sử dụng bởi**: GiaoNhiemVuPage.js

## Lý do chuyển sang V2.0

Version 1.0 có một số hạn chế về UX:

- Sidebar chiếm nhiều không gian
- Không có tổng quan về tất cả nhân viên cùng lúc
- Phải click từng nhân viên để xem nhiệm vụ
- Không có thống kê tổng quan

## Version 2.0 (đang sử dụng)

Các component mới ở thư mục `components/`:

- **GiaoNhiemVuPageNew.js**: Trang chính với layout bảng và stats cards
- **EmployeeOverviewTable.js**: Bảng tổng quan tất cả nhân viên
- **AssignDutiesDialog.js**: Dialog giao nhiệm vụ dạng checkbox với preview diff
- **ViewAssignmentsDialog.js**: Dialog xem nhiệm vụ đã gán

## Ghi chú

Các component trong thư mục này vẫn được giữ lại để:

1. Tham khảo khi cần
2. So sánh với version mới
3. Khôi phục nếu cần thiết
4. Route backup tại `/quanlycongviec/giao-nhiem-vu-old/:NhanVienID`

**Khuyến nghị**: Sử dụng version 2.0 cho tất cả tính năng mới.
