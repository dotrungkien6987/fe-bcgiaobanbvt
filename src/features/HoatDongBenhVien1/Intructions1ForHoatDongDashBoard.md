# Dashboard Hoạt Động Bệnh Viện - Tài liệu tham chiếu

## Tổng quan hệ thống
Dashboard này cung cấp tổng quan về lịch trực theo ngày của bệnh viện từ nội trú, ngoại trú đến xét nghiệm và thủ thuật. Được thiết kế để giúp quản lý bệnh viện theo dõi lịch trực

## Cấu trúc dữ liệu và luồng xử lý
Hệ thống làm việc với 4 loại phòng chính (Type 2, 3, 7, 38) và tích hợp dữ liệu từ nhiều nguồn khác nhau:
-Type 2: Phòng khám
-Type 3: Khoa nội trú
-Type 7: Phòng thực hiện
-Type 38: Phòng lấy mẫu
1. **Nguồn dữ liệu chính:**
   - `soThuTuSlice.js`: Quản lý dữ liệu số thứ tự bệnh nhân từ API 
   - `nhomKhoaSoThuTuSlice.js`: Quản lý dữ liệu nhóm khoa
   - `lichTrucSlice.js`: Quản lý dữ liệu lịch trực bác sĩ, điều dưỡng
   - `khoaSlice.js`: Quản lý thông tin khoa phòng

2. **Luồng dữ liệu:**
   ```
   Người dùng chọn ngày & nhóm khoa
   --> Truy xuất danh sách khoa từ nhomKhoaSoThuTuSlice
   --> Phân loại khoa theo HisDepartmentType (2, 3, 7, 38)
   --> Lấy thông tin tên khoa từ khoaSlice
   --> Lấy lịch trực từ lichTrucSlice
   
   --> Hiển thị dữ liệu phân loại theo từng loại phòng
   ```

## Chi tiết cấu trúc dữ liệu :
- Tên khoa phòng:
- Điều dưỡng trực:
- Bác sĩ trực: 
-Ghi Chú:

### Dữ liệu lịch trực (chung cho tất cả loại phòng)
**lichTrucSlice.js:**
```json
{
  "DieuDuong": ["Nguyễn Thị A", "Trần Văn B"],
  "BacSi": ["Lê Thị C", "Phạm Văn D"],
  "GhiChu": "Tiếp nhận bệnh nhân từ 7h-16h"
}
```

## Redux Slices và Actions

### nhomkhoasothutuSlice.js
- `getAllNhomKhoa()`: Lấy danh sách tất cả nhóm khoa và khoa trực thuộc


## Tính năng và tương tác người dùng

### Tìm kiếm và lọc dữ liệu
- **Tìm theo ngày**: Hiển thị dữ liệu theo ngày cụ thể
- **Lọc theo nhóm khoa**: Chỉ hiển thị các khoa trong nhóm được chọn


### Hiển thị và điều khiển
- **Chế độ xem**: Compact (chia cột) hoặc Expanded (toàn màn hình)

- **Quản lý cột hiển thị**: Tùy chỉnh các cột được hiển thị trong bảng
- **Lọc theo loại hoạt động**: Chọn hiển thị Thủ thuật/Lấy mẫu, Nội trú, Ngoại trú

### Xử lý lỗi
- Hiển thị thông báo lỗi khi không thể kết nối API
- Sử dụng cached data khi có lỗi tạm thời
- Nút làm mới thủ công khi cần tải lại dữ liệu
### Cấu trúc code
Tối ưu code, tách thành nhiều component nếu cần để giữ cho code từng file được ngắn hơn, dễ đọc, dễ bảo trì.
### Giao diện
Chuẩn UI/UX
Reponsive, hiển thị phù hợp với mọi loại thiết bị.