# Chú thích cho HoatDongBenhVien Dashboard

## Các chỉ số hiển thị trong HoatDongDataCard

### Type = 2: Phòng khám
//phần hiển thị gọi api trong soThuTuSlice.js
- **tong_benh_nhan**: Tổng người bệnh
- **so_benh_nhan_chua_kham**: Số bệnh nhân chưa khám
- **so_benh_nhan_da_kham**: Số bệnh nhân đã khám
- **so_benh_nhan_kham_xong**: Số bệnh nhân khám xong
- **max_sothutunumber**: STT lớn nhất trong phòng
- **max_sothutunumber_da_kham**: STT lớn nhất đã khám
- **latest_benh_nhan_da_kham**: STT gần nhất bệnh nhân đã khám
- **sothutunumber_du_kien_tiep_theo**: STT tiếp theo

// phần hiển thị gọi api trong lichtrucSlice.js
- **DieuDuong**: Danh sách điều dưỡng trực
- **BacSi**: Danh sách bác sĩ trực
- **GhiChu**: Ghi chú lịch trực

### Type = 3: Phòng nội trú
//phần hiển thị gọi api trong soThuTuSlice.js
- **departmentid**: ID phòng ban
- **departmentname**: Tên phòng ban
- **departmentgroupid**: ID nhóm phòng ban
- **departmentgroupname**: Tên nhóm phòng ban
- **bhyt_count**: Số bệnh nhân BHYT
- **vienphi_count**: Số bệnh nhân viện phí
- **yeucau_count**: Số bệnh nhân yêu cầu
- **total_count**: Tổng số bệnh nhân
- **dang_dieu_tri**: Số bệnh nhân đang điều trị
- **dieu_tri_ket_hop**: Số bệnh nhân đang điều trị kết hợp
- **doi_nhap_khoa**: Số bệnh nhân đang đợi nhập khoa
- **chuyen_khoa_den**: Số bệnh nhân từ khoa khác chuyển đến
- **chuyen_dieu_tri_ket_hop_den**: Số bệnh nhân từ khoa khác chuyển điều trị kết hợp
- **benh_nhan_chuyen_khoa**: Số bệnh nhân chuyển khoa đi (đã kết thúc)
- **benh_nhan_ra_vien**: Số bệnh nhân đã ra viện

// phần hiển thị gọi api trong lichtrucSlice.js
- **DieuDuong**: Danh sách điều dưỡng trực
- **BacSi**: Danh sách bác sĩ trực
- **GhiChu**: Ghi chú lịch trực

### Type = 7: Phòng thực hiện
//phần hiển thị gọi api trong soThuTuSlice.js
- **tong_mau_benh_pham**: Tổng số CLS
- **tong_benh_nhan**: Tổng người bệnh
- **so_ca_chua_thuc_hien**: Số ca chưa thực hiện
- **so_ca_da_thuc_hien_cho_ket_qua**: Đã thực hiện đợi kết quả
- **so_ca_da_tra_ket_qua**: Đã trả kết quả
- **max_sothutunumber**: STT lớn nhất trong phòng
- **max_sothutunumber_da_thuc_hien**: STT lớn nhất đã thực hiện
- **latest_sothutunumber_da_thuc_hien**: STT gần nhất đã thực hiện
- **sothutunumber_du_kien_tiep_theo**: STT tiếp theo

// phần hiển thị gọi api trong lichtrucSlice.js
- **DieuDuong**: Danh sách điều dưỡng trực
- **BacSi**: Danh sách bác sĩ trực
- **GhiChu**: Ghi chú lịch trực

### Type = 38: Phòng lấy mẫu
//phần hiển thị gọi api trong soThuTuSlice.js
- **tong_mau_benh_pham**: Tổng số CLS
- **tong_benh_nhan**: Tổng người bệnh
- **so_ca_chua_lay_mau**: Số ca chưa lấy mẫu
- **so_ca_da_lay_mau**: Số ca đã lấy mẫu
- **so_benh_nhan_da_lay_mau**: Số bệnh nhân đã lấy mẫu
- **so_benh_nhan_chua_lay_mau**: Số bệnh nhân chưa lấy mẫu
- **so_ca_chua_thuc_hien**: Số ca chưa thực hiện
- **so_ca_da_thuc_hien_cho_ket_qua**: Đã thực hiện đợi kết quả
- **so_ca_da_tra_ket_qua**: Đã trả kết quả
- **max_sothutunumber_da_lay_mau**: STT lớn nhất đã lấy mẫu
- **max_sothutunumber**: STT lớn nhất trong phòng
- **latest_sothutunumber_da_lay_mau**: STT gần nhất đã lấy mẫu
- **sothutunumber_du_kien_tiep_theo**: STT tiếp theo

// phần hiển thị gọi api trong lichtrucSlice.js
- **DieuDuong**: Danh sách điều dưỡng trực
- **BacSi**: Danh sách bác sĩ trực
- **GhiChu**: Ghi chú lịch trực

## Màu sắc sử dụng

- **Xanh lá (#388e3c)**: Chỉ số tốt, hoàn thành
- **Cam (#f57c00)**: Chỉ số trung bình hoặc đang chờ
- **Đỏ (#d32f2f)**: Chỉ số cần chú ý hoặc cảnh báo
- **Xanh dương (#1976d2)**: Thông tin chung

## Tính năng chính

1. **Tìm kiếm theo ngày**: Xem dữ liệu theo ngày cụ thể
2. **Lọc theo nhóm khoa**: Hiển thị dữ liệu cho một nhóm khoa cụ thể, chọn từ NhomKhoa trong DB
3. **Lọc theo tên khoa phòng**: Hiển thị dữ liệu cho một hoặc nhiều khoa phòng cụ thể

4. **Chuyển đổi chế độ xem**: Chế độ xem nhỏ gọn hoặc mở rộng
5. **Tùy chỉnh hiển thị cột**: Người dùng có thể chọn cột muốn hiển thị
6. **Điều chỉnh chiều cao bảng**: Thay đổi chiều cao của bảng dữ liệu

## Luồng xử lý dữ liệu
1. Người dùng chọn nhóm khoa (load dữ liệu từ nhomkhoasothutuSlice.js), lấy được danh sách khoa tương ứng, căn cứ theo HisDepartmentType chia thành 4 mảng (2,3,7,38). 
2. Lấy dữ liệu TenKhoa sử dụng api trong khoaSilce để hiển thị trước tiên,
3. Lấy dữ  liệu DieuDuong,BacSi,GhiChu trong lichtrucSlice.js 
3. Có 1 button xem dữ liệu, khi click sẽ gọi api trong soThuTuSlice.js để hiển thị các thông tin liên quan tương ứng với từng khoa, tham số truyền vào là list HisDepartmentID tương ứng theo listkhoa
