# Hướng dẫn sử dụng ViewToggle Component

## Tổng quan

ViewToggle component đã được triển khai thành công để chuyển đổi giữa chế độ hiển thị Card và Table cho các loại phòng khác nhau trong hệ thống Dashboard Hoạt động Bệnh viện.

## Các component đã được tạo/cập nhật:

### 1. ViewToggle Component (`ViewToggle.js`)

- Toggle button với 2 chế độ: Card và Table
- Sử dụng Material-UI icons và styling
- Responsive design phù hợp với UI/UX của hệ thống

### 2. Table Components

- `NoiTruTable.js` - Bảng hiển thị dữ liệu khoa nội trú
- `NgoaiTruTable.js` - Bảng hiển thị dữ liệu khoa ngoại trú
- `ThuThuatTable.js` - Bảng hiển thị dữ liệu phòng thủ thuật
- `LayMauTable.js` - Bảng hiển thị dữ liệu phòng lấy mẫu

### 3. Constants được cập nhật

- Thêm `DISPLAY_MODES.CARD` và `DISPLAY_MODES.TABLE`

### 4. Provider được cập nhật

- Thêm `displayMode` và `setDisplayMode` state
- Export trong context value

### 5. FilterControls được cập nhật

- Tích hợp ViewToggle component
- Layout responsive với SearchBar

### 6. Schedule Components được cập nhật

- `NoiTruSchedule.js`
- `NgoaiTruSchedule.js`
- `ThuThuatSchedule.js`
- `LayMauSchedule.js`

## Tính năng chính:

### Card View (Mặc định)

- Hiển thị thông tin dạng card như trước
- Phù hợp cho overview nhanh
- Responsive trên mobile

### Table View

- Hiển thị dữ liệu dạng bảng với nhiều cột thông tin chi tiết
- Header có background màu nhẹ
- Hover effect trên các row
- Action buttons cho từng department
- Responsive với horizontal scroll trên mobile

## Cấu trúc dữ liệu theo từng loại phòng:

### Nội trú:

- Tổng BN, phân loại BN (BHYT/VP/DV)
- Trạng thái điều trị (đang điều trị/ra viện)

### Ngoại trú:

- STT hiện tại, STT tiếp theo
- Tình trạng (chờ khám/đã khám/tổng BN)

### Thủ thuật:

- STT lớn nhất, STT đã thực hiện, STT tiếp theo
- Tình trạng ca (chờ/hoàn thành/có KQ)

### Lấy mẫu:

- Tổng BN, CLS đã chỉ định
- Trạng thái mẫu (chờ lấy/đã lấy/có KQ)

## Test thử:

1. Khởi động ứng dụng với `npm start`
2. Truy cập trang Dashboard Hoạt động Bệnh viện
3. Tìm ViewToggle ở góc phải FilterControls
4. Click để chuyển đổi giữa Card và Table view
5. Kiểm tra responsive design trên các kích thước màn hình khác nhau

## Lưu ý:

- ViewToggle được đặt cùng hàng với SearchBar
- State displayMode được lưu trong context, không reset khi refresh data
- Table view hỗ trợ search highlighting
- Mỗi table có action button để refresh dữ liệu riêng cho từng department
