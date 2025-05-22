# Tính năng Hoạt động Bệnh viện

## Mô tả

Tính năng Hoạt động Bệnh viện cho phép người dùng xem toàn bộ hoạt động của các khoa phòng trong bệnh viện, giúp quản lý và theo dõi tình hình hoạt động của bệnh viện một cách hiệu quả. Hệ thống này tổng hợp và hiển thị dữ liệu từ 4 loại nguồn dữ liệu khác nhau.

## Cấu trúc thư mục

```
HoatDongBenhVien/
├── components/
│   ├── AbbreviationChip.js       # Component hiển thị từ viết tắt
│   └── AbbreviationChips.js      # Tập hợp các chip viết tắt
├── configs/
│   └── columnConfig.js           # Cấu hình hiển thị cột cho bảng dữ liệu
├── EnhancedCellValue.js          # Component hiển thị giá trị trong ô với màu sắc tùy chỉnh
├── HoatDongDashboard.js          # Component chính quản lý trang dashboard
├── HoatDongDataCard.js           # Component hiển thị bảng dữ liệu
├── HoatDongSummaryCard.js        # Component hiển thị thẻ tổng quan
├── NextNumberDisplay.js          # Component hiển thị số thứ tự tiếp theo
├── StripedTableRow.js            # Component tạo hiệu ứng sọc cho dòng bảng
├── TitleNoteForHoatDongDataCard.md # Chú thích cho các thông số hiển thị
└── README.md                     # Tài liệu hướng dẫn (tệp này)
```

## Cách sử dụng

1. Import component HoatDongDashboard vào trang cần hiển thị:

   ```jsx
   import HoatDongDashboard from "src/features/HoatDongBenhVien/HoatDongDashboard";
   ```

2. Sử dụng component trong trang:

   ```jsx
   <HoatDongDashboard />
   ```

3. Truy cập tính năng qua URL:
   ```
   /hoatdongbenhvien
   ```

## Các loại nguồn dữ liệu

Hệ thống hiển thị thông tin từ 4 loại nguồn dữ liệu khác nhau:

1. **Type 2: Phòng khám (Outpatient)** - Hiển thị thông tin về hoạt động khám ngoại trú
2. **Type 3: Phòng nội trú (Inpatient)** - Hiển thị thông tin về bệnh nhân nội trú
3. **Type 7: Phòng thực hiện (Procedure)** - Hiển thị thông tin về thủ thuật, CLS
4. **Type 38: Phòng lấy mẫu (Sample collection)** - Hiển thị thông tin về lấy mẫu xét nghiệm

## Tính năng chính

- Hiển thị tổng quan hoạt động bệnh viện qua các chỉ số chính
- Xem chi tiết hoạt động theo bốn loại dữ liệu:
  - **Phòng khám (Type 2)**: Thông tin về bệnh nhân ngoại trú, lượt khám
  - **Phòng nội trú (Type 3)**: Thông tin về bệnh nhân nội trú
  - **Phòng thực hiện (Type 7)**: Thông tin về các thủ thuật, CLS
  - **Phòng lấy mẫu (Type 38)**: Thông tin về lấy mẫu xét nghiệm
- Lọc dữ liệu theo ngày, nhóm khoa, và khoa phòng cụ thể
- Tự động làm mới dữ liệu định kỳ
- Tùy chỉnh giao diện hiển thị:
  - Chuyển đổi giữa chế độ xem nhỏ gọn và chế độ xem mở rộng
  - Tùy chỉnh các cột hiển thị trong bảng dữ liệu
  - Điều chỉnh chiều cao của bảng dữ liệu

## Tích hợp với API

Hiện tại, component đang sử dụng dữ liệu mẫu. Để tích hợp với API thực tế:

1. Tạo slice redux cho hoạt động bệnh viện trong thư mục `src/features/Slice`:

   ```jsx
   // Ví dụ: src/features/Slice/hoatdongbenhvienSlice.js
   import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
   import apiService from "../../app/apiService";

   export const getHoatDongBenhVien = createAsyncThunk(
     "hoatdongbenhvien/getHoatDongBenhVien",
     async (params, { rejectWithValue }) => {
       try {
         const response = await apiService.get("/api/hoatdongbenhvien", {
           params,
         });
         return response.data;
       } catch (error) {
         return rejectWithValue(error.response.data);
       }
     }
   );

   // ... tiếp tục implement slice
   ```

2. Cập nhật `HoatDongDashboard.js` để sử dụng dữ liệu từ API thay vì dữ liệu mẫu.

## Lưu ý

- Tính năng này được phát triển dựa trên mẫu từ tính năng SoThuTuPhongKham.
- Các màu sắc và style được đồng bộ với thiết kế chung của ứng dụng.
- Đảm bảo đã cài đặt đầy đủ các dependency cần thiết như `@mui/material`, `@mui/x-date-pickers`, `dayjs`, v.v.

## Phát triển tiếp theo

1. Tích hợp với API backend thực tế
2. Thêm khả năng xuất báo cáo dạng Excel hoặc PDF
3. Thêm biểu đồ thống kê trực quan
4. Thêm chức năng so sánh dữ liệu giữa các thời điểm
