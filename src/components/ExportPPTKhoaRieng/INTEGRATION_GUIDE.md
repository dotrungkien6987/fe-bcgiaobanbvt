# Hướng dẫn tích hợp ExportBaoCaoKhoaButton

## Tổng quan

Component `ExportBaoCaoKhoaButton` đã được triển khai thành công trong thư mục `src/components/ExportPPTKhoaRieng/` với đầy đủ chức năng xuất báo cáo PowerPoint cho từng khoa riêng biệt.

## Files đã tạo

```
ExportPPTKhoaRieng/
├── ExportBaoCaoKhoaButton.js    ✅ Component chính
├── exportBaoCaoKhoaUtils.js     ✅ Utility functions
├── ExportBaoCaoKhoaDemo.js      ✅ Demo component
├── index.js                     ✅ Export file
└── README.md                    ✅ Documentation
```

## Cách tích hợp vào project

### 1. Import component

```javascript
import { ExportBaoCaoKhoaButton } from "../components/ExportPPTKhoaRieng";
```

### 2. Sử dụng trong trang báo cáo khoa

```javascript
// Trong component trang báo cáo khoa
const BaoCaoKhoaPage = () => {
  const khoaId = "KHOA_001";
  const date = "2025-06-11T00:00:00.000Z";
  const tenKhoa = "Khoa Nội Tim Mạch";

  return (
    <Box>
      {/* Nội dung khác */}

      <ExportBaoCaoKhoaButton
        khoaId={khoaId}
        date={date}
        tenKhoa={tenKhoa}
        variant="contained"
        size="medium"
      />
    </Box>
  );
};
```

### 3. Đảm bảo dữ liệu đã được load

Trước khi sử dụng component, cần đảm bảo dữ liệu đã được load vào Redux store:

```javascript
// Trong useEffect của component cha
useEffect(() => {
  dispatch(getDataBCNgay_Rieng(date, khoaId));
}, [dispatch, date, khoaId]);
```

## Tích hợp vào các trang hiện có

### 1. Trang báo cáo ngày riêng theo khoa

Có thể thêm button vào toolbar hoặc action panel:

```javascript
// Trong BaoCaoNgayRiengTheoKhoa.js
import { ExportBaoCaoKhoaButton } from "../components/ExportPPTKhoaRieng";

// Thêm vào action buttons
<Box sx={{ display: "flex", gap: 2 }}>
  <Button variant="outlined">Lưu</Button>
  <ExportBaoCaoKhoaButton
    khoaId={bcGiaoBanTheoNgay.KhoaID}
    date={bcGiaoBanTheoNgay.Ngay}
    tenKhoa={tenKhoa}
  />
</Box>;
```

### 2. Modal hoặc Dialog

```javascript
<Dialog open={openDialog}>
  <DialogTitle>Xuất báo cáo khoa</DialogTitle>
  <DialogContent>
    <Typography>Bạn có muốn xuất báo cáo PowerPoint?</Typography>
  </DialogContent>
  <DialogActions>
    <Button onClick={handleClose}>Hủy</Button>
    <ExportBaoCaoKhoaButton
      khoaId={khoaId}
      date={date}
      tenKhoa={tenKhoa}
      variant="contained"
    />
  </DialogActions>
</Dialog>
```

### 3. Menu dropdown

```javascript
<Menu>
  <MenuItem>
    <ExportBaoCaoKhoaButton
      khoaId={khoaId}
      date={date}
      tenKhoa={tenKhoa}
      variant="text"
      size="small"
      fullWidth
    />
  </MenuItem>
</Menu>
```

## Customization

### Button variants

```javascript
// Contained button (default)
<ExportBaoCaoKhoaButton variant="contained" />

// Outlined button
<ExportBaoCaoKhoaButton variant="outlined" />

// Text button (cho menu)
<ExportBaoCaoKhoaButton variant="text" />
```

### Sizes

```javascript
// Small
<ExportBaoCaoKhoaButton size="small" />

// Medium (default)
<ExportBaoCaoKhoaButton size="medium" />

// Large
<ExportBaoCaoKhoaButton size="large" />
```

### Full width

```javascript
<ExportBaoCaoKhoaButton fullWidth />
```

## Testing

Để test component, có thể sử dụng `ExportBaoCaoKhoaDemo.js`:

```javascript
import ExportBaoCaoKhoaDemo from "../components/ExportPPTKhoaRieng/ExportBaoCaoKhoaDemo";

// Render trong trang test
<ExportBaoCaoKhoaDemo />;
```

## Notes

1. **Dependencies**: Component yêu cầu các dependencies sau đã được cài đặt:

   - `@mui/material`
   - `pptxgenjs`
   - `react-redux`
   - `react-toastify`

2. **Redux Store**: Đảm bảo `baocaongay_riengtheokhoa` slice đã được thêm vào store

3. **File Assets**: Cần có các file trong `public/`:

   - `logo.png`
   - `backgroundSlide.png`

4. **Error Handling**: Component đã tích hợp error handling và toast notifications

## Troubleshooting

### Lỗi "Không có dữ liệu bệnh nhân"

- Kiểm tra dữ liệu đã được load trong Redux store
- Gọi `getDataBCNgay_Rieng()` trước khi render component

### Lỗi "Thiếu thông tin khoa hoặc ngày"

- Đảm bảo props `tenKhoa` và `date` được truyền đúng
- Kiểm tra format của `date` (phải là ISO string)

### Lỗi tạo PowerPoint

- Kiểm tra các file assets trong `public/`
- Xem console log để debug chi tiết

## Liên hệ

Nếu có vấn đề hoặc cần support, vui lòng tạo issue hoặc liên hệ team development.
