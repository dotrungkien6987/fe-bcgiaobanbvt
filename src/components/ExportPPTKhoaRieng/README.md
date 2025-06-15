# Export PowerPoint Khoa Riêng

Component này được sử dụng để xuất báo cáo PowerPoint cho từng khoa riêng biệt, bao gồm thông tin chi tiết về các bệnh nhân theo từng loại.

## Cấu trúc files

- `ExportBaoCaoKhoaButton.js` - Component button chính để xuất báo cáo
- `exportBaoCaoKhoaUtils.js` - Utility functions xử lý logic tạo PowerPoint
- `index.js` - File export các component và functions

## Cách sử dụng

### Import component

```javascript
import { ExportBaoCaoKhoaButton } from "../components/ExportPPTKhoaRieng";
```

### Sử dụng trong component

```javascript
const MyComponent = () => {
  const khoaId = "KHOA_001";
  const date = "2025-06-11";
  const tenKhoa = "Khoa Nội Tim Mạch";

  return (
    <ExportBaoCaoKhoaButton
      khoaId={khoaId}
      date={date}
      tenKhoa={tenKhoa}
      variant="contained"
      size="medium"
      fullWidth={false}
    />
  );
};
```

## Props

| Prop        | Type    | Required | Default     | Mô tả                          |
| ----------- | ------- | -------- | ----------- | ------------------------------ |
| `khoaId`    | string  | Yes      | -           | ID của khoa                    |
| `date`      | string  | Yes      | -           | Ngày báo cáo (ISO string)      |
| `tenKhoa`   | string  | Yes      | -           | Tên khoa hiển thị              |
| `variant`   | string  | No       | "contained" | Variant của Material-UI Button |
| `size`      | string  | No       | "medium"    | Size của Material-UI Button    |
| `fullWidth` | boolean | No       | false       | Có full width hay không        |

## Dữ liệu yêu cầu

Component sử dụng dữ liệu từ Redux store `baocaongay_riengtheokhoa` bao gồm:

- `bnTuVongs` - Bệnh nhân tử vong
- `bnChuyenViens` - Bệnh nhân chuyển viện
- `bnXinVes` - Bệnh nhân xin về
- `bnNangs` - Bệnh nhân nặng
- `bnPhauThuats` - Bệnh nhân phẫu thuật
- `bnNgoaiGios` - Bệnh nhân vào viện ngoài giờ
- `bnCanThieps` - Bệnh nhân can thiệp
- `bnTheoDois` - Bệnh nhân theo dõi
- `bcGiaoBanTheoNgay` - Thông tin báo cáo giao ban

## Cấu trúc PowerPoint được tạo

1. **Slide Cover** - Background image
2. **Slide Giới thiệu** - Thông tin khoa, BS trực, tổng quan
3. **Slides cho từng loại bệnh nhân**:
   - Slide tiêu đề loại
   - Slides chi tiết từng bệnh nhân
   - Slides hình ảnh (nếu có)
4. **Slide kết thúc** - Background image

## Tính năng

- ✅ Validation dữ liệu đầu vào
- ✅ Loading state khi xuất file
- ✅ Error handling
- ✅ Toast notifications
- ✅ Xử lý text dài tự động chia slide
- ✅ Hiển thị hình ảnh đính kèm
- ✅ Responsive design
- ✅ Customizable button props

## Dependencies

- `@mui/material` - UI components
- `pptxgenjs` - Tạo PowerPoint
- `react-redux` - State management
- `react-toastify` - Notifications

## Lưu ý

- Component yêu cầu dữ liệu đã được load trong Redux store trước khi sử dụng
- File PowerPoint được tải về với tên: `Báo cáo khoa [TenKhoa] ngày [Date].pptx`
- Nếu không có dữ liệu bệnh nhân, sẽ hiện warning và không tạo file
