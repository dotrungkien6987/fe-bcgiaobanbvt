# Mô hình Dữ liệu (Domain Models)

(Trích xuất và suy luận từ code; tên field BE giữ tiếng Việt.)

## 1. CongViec (Task)

| Field                   | Kiểu                                                                            | Mô tả                                                                            |
| ----------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| \_id                    | ObjectId                                                                        | Định danh                                                                        |
| MaCongViec              | String                                                                          | Mã hiển thị (nếu có)                                                             |
| TieuDe                  | String                                                                          | Tiêu đề (<=200)                                                                  |
| MoTa                    | String                                                                          | Mô tả (<=2000)                                                                   |
| TrangThai               | Enum(TAO_MOI, DA_GIAO, DANG_THUC_HIEN, CHO_DUYET, HOAN_THANH)                   | Trạng thái workflow                                                              |
| MucDoUuTien             | Enum(THAP,BINH_THUONG,CAO,KHAN_CAP)                                             | Ưu tiên                                                                          |
| NgayBatDau              | Date                                                                            | Thời điểm bắt đầu                                                                |
| NgayHetHan              | Date                                                                            | Thời điểm deadline                                                               |
| NgayCanhBao             | Date                                                                            | Thời điểm kích hoạt cảnh báo nếu chế độ FIXED                                    |
| CanhBaoMode             | Enum(PERCENT,FIXED)                                                             | Cách xác định thời điểm cảnh báo                                                 |
| CanhBaoSapHetHanPercent | Number (0.5-1)                                                                  | Ngưỡng % thời lượng trôi qua để cảnh báo                                         |
| PhanTramTienDoTong      | Number 0..100                                                                   | Tiến độ tổng hợp                                                                 |
| SoGioTre                | Number                                                                          | Số giờ trễ do BE tính (nếu có)                                                   |
| NguoiGiaoViecID         | ObjectId (NhanVien)                                                             | Người giao                                                                       |
| NguoiChinhID            | ObjectId (NhanVien)                                                             | Người thực hiện chính                                                            |
| NguoiThamGia            | [{ NhanVienID, VaiTro }]                                                        | Danh sách tham gia (CHINH / PHOI_HOP)                                            |
| NhomViecUserID          | ObjectId                                                                        | Nhóm việc liên kết (nếu có)                                                      |
| CoDuyetHoanThanh        | Boolean                                                                         | Có yêu cầu duyệt khi hoàn thành tạm                                              |
| NgayGiaoViec            | Date                                                                            | Mốc được giao (sau action GIAO_VIEC)                                             |
| NgayHoanThanhTam        | Date                                                                            | Khi gửi hoàn thành chờ duyệt                                                     |
| NgayHoanThanh           | Date                                                                            | Khi hoàn thành chính thức                                                        |
| TinhTrangThoiHan        | Enum( DUNG_HAN, SAP_QUA_HAN, QUA_HAN, HOAN_THANH_TRE_HAN, HOAN_THANH_DUNG_HAN ) | Có thể BE tính & trả về                                                          |
| SoLuongBinhLuan         | Number                                                                          | Thống kê để list                                                                 |
| SoLuongNguoiThamGia     | Number                                                                          | Số người tham gia (hiển thị icon tệp trong table đang tạm dùng; cần đồng bộ lại) |
| updatedAt / createdAt   | Date                                                                            | Dùng làm version lạc quan                                                        |

## 2. BinhLuan (Comment)

| Field                                | Kiểu             | Mô tả                                          |
| ------------------------------------ | ---------------- | ---------------------------------------------- |
| \_id                                 | ObjectId         |
| CongViecID                           | ObjectId         | Liên kết công việc                             |
| NguoiBinhLuanID                      | ObjectId         | Nhân viên tạo                                  |
| NoiDung                              | String           | Nội dung (có thể bị xóa trắng khi recall text) |
| TrangThai                            | ACTIVE / DELETED | Thu hồi -> DELETED + rỗng nội dung             |
| Files                                | [TepTin]         | Danh sách tệp đính kèm thuộc bình luận         |
| BinhLuanChaID                        | ObjectId         | Nếu là reply                                   |
| RepliesCount                         | Number           | Đếm reply (tăng khi thêm)                      |
| NgayBinhLuan / createdAt / updatedAt | Date             |

## 3. TepTin (File Attachment)

| Field                   | Mô tả                          |
| ----------------------- | ------------------------------ | --------- | ----------------------------------- |
| \_id                    | ObjectId                       |
| CongViecID              | ObjectId                       |
| BinhLuanID              | ObjectId (nếu thuộc bình luận) |
| NhanVienID              | Người upload                   |
| TenGoc                  | Tên file gốc                   |
| DungLuong               | Kích thước                     |
| DuongDan                | Đường dẫn lưu trữ tương đối    |
| MimeType                | Kiểu nội dung                  |
| TrangThai               | ACTIVE / DELETED               |
| PhamVi                  | CONG_VIEC                      | BINH_LUAN | NGUOI_THAM_GIA (tùy chiến lược lưu) |
| inlineUrl / downloadUrl | FE sử dụng xem / tải           |

## 4. NguoiThamGia (Embedded / Subdocument)

| Field      | Mô tả                            |
| ---------- | -------------------------------- |
| NhanVienID | ObjectId hoặc object đã populate |
| VaiTro     | CHINH / PHOI_HOP                 |

## 5. Routine Task (NhiemVuThuongQuy)

Trong slice hiển thị cho FE chọn nhanh để liên kết (`NhiemVuThuongQuyID`). Cấu trúc rút gọn (suy đoán từ service):
| Field | Mô tả |
|-------|------|
| \_id | ID |
| Ten | Tên nhiệm vụ định kỳ |
| MoTa | Mô tả |
| Tần suất & cài đặt khác | (xem module `nhiemvuthuongquy` nếu cần) |

## 6. ColorConfig

| Field          | Mô tả                           |
| -------------- | ------------------------------- |
| statusColors   | Map { TrangThaiCode: hexColor } |
| priorityColors | Map { PriorityCode: hexColor }  |
| updatedAt      | Version                         |

## 7. Quan hệ chính

```
CongViec 1---* BinhLuan 1---* TepTin
          \
           *---* NguoiThamGia (nhúng)
CongViec --- (0..1) NhomViecUser
CongViec --- (0..1) NhiemVuThuongQuy (liên kết khi chọn)
NhanVien ---* CongViec (vai trò giao hoặc chính hoặc phối hợp)
```

## 8. Ràng buộc & Quy tắc suy luận

- `NguoiChinh` phải có trong `NguoiThamGia` với VaiTro=CHINH (FE build payload đảm bảo; BE nên enforce).
- `TinhTrangThoiHan` tính từ cặp (NgayBatDau, NgayHetHan, NgayCanhBao, NgayHoanThanh, TrangThai) nếu BE không lưu sẵn FE fallback bằng util.
- Khi `CanhBaoMode=PERCENT`: `NgayCanhBao = NgayBatDau + (NgayHetHan - NgayBatDau) * percent` (FE render preview; BE có thể tự tính trước khi lưu ổn định).
- Thu hồi bình luận: không xóa cứng -> set TrangThai=DELETED, xóa nội dung, giữ metadata & file (hoặc cũng đánh dấu file DELETED khi deleteComment).
- Optimistic version: dùng `updatedAt`. Thực hiện update/transition phải kiểm tra không đổi; nếu đổi trả `VERSION_CONFLICT`.

## 9. Chỉ số phụ

- `SoGioTre`: tính khi quá hạn (thời gian hiện tại hoặc thời gian hoàn thành - NgayHetHan).
- `PhanTramTienDoTong`: có thể cập nhật thủ công bởi người chính / assigner (tùy rule) qua PUT update.

---

**Tiếp tục**: xem `api-spec.md` để biết chi tiết endpoints.
