# Archive kpiSlice - Tiêu chí master (deprecated)

**Date:** 2025-10-24  
**Reason:** Hệ thống đã chuyển sang cycle-based criteria (TieuChiCauHinh trong ChuKyDanhGia), không còn dùng master TieuChiDanhGia collection.

## Archived Functions (lines 710-800)

### 1. getTieuChiDanhGias

- API: `GET /workmanagement/tieu-chi-danh-gia`
- Purpose: Lấy danh sách tiêu chí master
- Status: ❌ Deprecated

### 2. createTieuChiDanhGia

- API: `POST /workmanagement/tieu-chi-danh-gia`
- Purpose: Tạo tiêu chí master mới
- Status: ❌ Deprecated

### 3. updateTieuChiDanhGia

- API: `PUT /workmanagement/tieu-chi-danh-gia/:id`
- Purpose: Sửa tiêu chí master
- Status: ❌ Deprecated

### 4. deleteTieuChiDanhGia

- API: `DELETE /workmanagement/tieu-chi-danh-gia/:id`
- Purpose: Xóa tiêu chí master
- Status: ❌ Deprecated

## Archived Reducers

- `getTieuChiDanhGiasSuccess`
- `createTieuChiDanhGiaSuccess`
- `updateTieuChiDanhGiaSuccess`
- `deleteTieuChiDanhGiaSuccess`

## New Pattern

Tiêu chí giờ quản lý trong `ChuKyDanhGia.TieuChiCauHinh[]`:

- Tạo/sửa tiêu chí qua form Chu kỳ
- Mỗi chu kỳ có snapshot riêng, không ảnh hưởng chu kỳ khác
- Chấm điểm dùng trực tiếp từ snapshot, không join với master
