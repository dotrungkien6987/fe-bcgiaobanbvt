# Dashboard Hoạt Động Bệnh Viện - Tài liệu tham chiếu

## Tổng quan hệ thống
Dashboard này cung cấp tổng quan về các hoạt động khám chữa bệnh, từ nội trú, ngoại trú đến xét nghiệm và thủ thuật. Được thiết kế để giúp quản lý bệnh viện theo dõi trực quan các hoạt động chính đang diễn ra theo thời gian thực.

## Cấu trúc dữ liệu và luồng xử lý
Hệ thống làm việc với 4 loại phòng chính (Type 2, 3, 7, 38) và tích hợp dữ liệu từ nhiều nguồn khác nhau:

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
   --> Khi nhấn "Xem dữ liệu", gọi API từ soThuTuSlice với danh sách departmentIds
   --> Hiển thị dữ liệu phân loại theo từng loại phòng
   ```

## Chi tiết cấu trúc dữ liệu theo loại phòng

### Type = 2: Phòng khám (ngoaiTru)
**soThuTuSlice.js: getSoThuTuPhongKham**
| Trường dữ liệu | Mô tả | Ví dụ |
|----------------|-------|-------|
| tong_benh_nhan | Tổng số bệnh nhân trong phòng | 45 |
| so_benh_nhan_chua_kham | Đang chờ khám | 15 |
| so_benh_nhan_da_kham | Đã được gọi vào khám | 20 |
| so_benh_nhan_kham_xong | Đã hoàn thành khám | 10 |
| max_sothutunumber | STT lớn nhất trong phòng | 45 |
| max_sothutunumber_da_kham | STT lớn nhất đã khám | 30 |
| latest_benh_nhan_da_kham | STT gần nhất được gọi khám | 16 |
| sothutunumber_du_kien_tiep_theo | STT dự kiến gọi tiếp theo | 17 |

### Type = 3: Phòng nội trú (noiTru)
**soThuTuSlice.js: getSoThuTuPhongNoiTru**
| Trường dữ liệu | Mô tả | Ví dụ |
|----------------|-------|-------|
| bhyt_count | Số bệnh nhân BHYT | 35 |
| vienphi_count | Số bệnh nhân viện phí | 12 |
| yeucau_count | Số bệnh nhân dịch vụ yêu cầu | 8 |
| total_count | Tổng số bệnh nhân | 55 |
| dang_dieu_tri | Số bệnh nhân đang điều trị | 45 |
| dieu_tri_ket_hop | Số bệnh nhân đang điều trị kết hợp | 3 |
| doi_nhap_khoa | Số bệnh nhân đợi nhập khoa | 6 |
| chuyen_khoa_den | Số bệnh nhân từ khoa khác chuyển đến | 4 |
| chuyen_dieu_tri_ket_hop_den | BN từ khoa khác chuyển điều trị kết hợp | 2 |
| benh_nhan_chuyen_khoa | Số bệnh nhân chuyển khoa đi | 5 |
| benh_nhan_ra_vien | Số bệnh nhân đã ra viện | 8 |

### Type = 7: Phòng thực hiện thủ thuật (thucHien)
**soThuTuSlice.js: getSoThuTuPhongThucHien**
| Trường dữ liệu | Mô tả | Ví dụ |
|----------------|-------|-------|
| tong_mau_benh_pham | Tổng số CLS đã chỉ định | 78 |
| tong_benh_nhan | Tổng bệnh nhân | 36 |
| so_ca_chua_thuc_hien | Chờ thực hiện | 25 |
| so_ca_da_thuc_hien_cho_ket_qua | Đã thực hiện, đợi kết quả | 15 |
| so_ca_da_tra_ket_qua | Đã có kết quả | 38 |
| max_sothutunumber | STT lớn nhất trong phòng | 78 |
| max_sothutunumber_da_thuc_hien | STT lớn nhất đã thực hiện | 53 |
| latest_sothutunumber_da_thuc_hien | STT gần nhất được thực hiện | 53 |
| sothutunumber_du_kien_tiep_theo | STT dự kiến thực hiện tiếp theo | 54 |

### Type = 38: Phòng lấy mẫu xét nghiệm (layMau)
**soThuTuSlice.js: getSoThuTuPhongLayMau**
| Trường dữ liệu | Mô tả | Ví dụ |
|----------------|-------|-------|
| tong_mau_benh_pham | Tổng số mẫu cần lấy | 120 |
| tong_benh_nhan | Tổng số bệnh nhân | 85 |
| so_ca_chua_lay_mau | Số ca chưa lấy mẫu | 45 |
| so_ca_da_lay_mau | Số ca đã lấy mẫu | 75 |
| so_benh_nhan_da_lay_mau | Số bệnh nhân đã lấy mẫu | 55 |
| so_benh_nhan_chua_lay_mau | Số bệnh nhân chưa lấy mẫu | 30 |
| so_ca_chua_thuc_hien | Số ca chưa thực hiện | 45 |
| so_ca_da_thuc_hien_cho_ket_qua | Đã thực hiện, chờ kết quả | 30 |
| so_ca_da_tra_ket_qua | Đã trả kết quả | 45 |
| max_sothutunumber | STT lớn nhất trong phòng | 120 |
| max_sothutunumber_da_lay_mau | STT lớn nhất đã lấy mẫu | 75 |
| latest_sothutunumber_da_lay_mau | STT gần nhất được lấy mẫu | 75 |
| sothutunumber_du_kien_tiep_theo | STT dự kiến lấy mẫu tiếp theo | 76 |

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

### soThuTuSlice.js
- `getSoThuTuPhongKham(date, departmentIds)`: Lấy dữ liệu phòng khám ngoại trú (Type 2)
- `getSoThuTuPhongNoiTru(date, departmentIds)`: Lấy dữ liệu phòng nội trú (Type 3)
- `getSoThuTuPhongThucHien(date, departmentIds)`: Lấy dữ liệu phòng thực hiện thủ thuật (Type 7)
- `getSoThuTuPhongLayMau(date, departmentIds)`: Lấy dữ liệu phòng lấy mẫu (Type 38)
- `getAllSoThuTuStats(date)`: Lấy thống kê tổng hợp tất cả loại phòng

### nhomkhoasothutuSlice.js
- `getAllNhomKhoa()`: Lấy danh sách tất cả nhóm khoa và khoa trực thuộc

### Selectors
- `selectSoThuTuPhongKham`: Dữ liệu phòng khám 
- `selectSoThuTuPhongNoiTru`: Dữ liệu phòng nội trú
- `selectSoThuTuPhongThucHien`: Dữ liệu phòng thực hiện
- `selectSoThuTuPhongLayMau`: Dữ liệu phòng lấy mẫu
- `selectSoThuTuLoading`: Trạng thái đang tải dữ liệu
- `selectSoThuTuError`: Lỗi nếu có khi tải dữ liệu
- `selectNhomKhoaList`: Danh sách nhóm khoa
- `selectNhomKhoaLoading`: Trạng thái đang tải danh sách nhóm khoa

## Quy ước màu sắc và trạng thái
- **Xanh lá (#388e3c)**: Hoàn thành, kết quả tốt
- **Cam (#f57c00)**: Đang thực hiện, chờ kết quả
- **Đỏ (#d32f2f)**: Cảnh báo, chậm trễ
- **Xanh dương (#1939B7/#1976d2)**: Thông tin chung, đang chờ

## Tính năng và tương tác người dùng

### Tìm kiếm và lọc dữ liệu
- **Tìm theo ngày**: Hiển thị dữ liệu theo ngày cụ thể
- **Lọc theo nhóm khoa**: Chỉ hiển thị các khoa trong nhóm được chọn
- **Lọc theo khoa phòng cụ thể**: Chọn một hoặc nhiều khoa từ Autocomplete

### Xử lý lỗi
- Hiển thị thông báo lỗi khi không thể kết nối API
- Sử dụng cached data khi có lỗi tạm thời
- Nút làm mới thủ công khi cần tải lại dữ liệu
