# Demo Sử Dụng ThongKe_VienPhi_DuyetKeToan

## Cấu trúc dữ liệu từ backend

```json
{
  "total_all": 1219,
  "noitru": 497,
  "ngoaitru": 985,
  "ngoaitru_khong_nhapvien": 722
}
```

## Sử dụng trong Component

```javascript
import { useSelector } from "react-redux";

function SomeComponent() {
  // Lấy dữ liệu từ Redux store
  const {
    ThongKe_VienPhi_DuyetKeToan,
    ThongKe_VienPhi_DuyetKeToan_NgayChenhLech,
  } = useSelector((state) => state.dashboard);

  // Dữ liệu ngày hiện tại
  const currentStats = ThongKe_VienPhi_DuyetKeToan;
  // {
  //   total_all: 1219,
  //   noitru: 497,
  //   ngoaitru: 985,
  //   ngoaitru_khong_nhapvien: 722
  // }

  // Dữ liệu ngày chênh lệch (ngày trước)
  const prevStats = ThongKe_VienPhi_DuyetKeToan_NgayChenhLech;
  // {
  //   total_all: 1150,
  //   noitru: 480,
  //   ngoaitru: 950,
  //   ngoaitru_khong_nhapvien: 700
  // }

  // Tính chênh lệch
  const diff = {
    total_all: (currentStats.total_all || 0) - (prevStats.total_all || 0),
    noitru: (currentStats.noitru || 0) - (prevStats.noitru || 0),
    ngoaitru: (currentStats.ngoaitru || 0) - (prevStats.ngoaitru || 0),
    ngoaitru_khong_nhapvien:
      (currentStats.ngoaitru_khong_nhapvien || 0) -
      (prevStats.ngoaitru_khong_nhapvien || 0),
  };

  return (
    <div>
      <h3>Thống kê Viện phí Duyệt Kế toán</h3>

      <div>
        <strong>Tổng tất cả:</strong> {currentStats.total_all || 0}
        <span style={{ color: diff.total_all >= 0 ? "green" : "red" }}>
          ({diff.total_all >= 0 ? "+" : ""}
          {diff.total_all})
        </span>
      </div>

      <div>
        <strong>Nội trú:</strong> {currentStats.noitru || 0}
        <span style={{ color: diff.noitru >= 0 ? "green" : "red" }}>
          ({diff.noitru >= 0 ? "+" : ""}
          {diff.noitru})
        </span>
      </div>

      <div>
        <strong>Ngoại trú:</strong> {currentStats.ngoaitru || 0}
        <span style={{ color: diff.ngoaitru >= 0 ? "green" : "red" }}>
          ({diff.ngoaitru >= 0 ? "+" : ""}
          {diff.ngoaitru})
        </span>
      </div>

      <div>
        <strong>Ngoại trú không nhập viện:</strong>{" "}
        {currentStats.ngoaitru_khong_nhapvien || 0}
        <span
          style={{ color: diff.ngoaitru_khong_nhapvien >= 0 ? "green" : "red" }}
        >
          ({diff.ngoaitru_khong_nhapvien >= 0 ? "+" : ""}
          {diff.ngoaitru_khong_nhapvien})
        </span>
      </div>
    </div>
  );
}
```

## Tích hợp với BinhQuanBenhAn Component

Bạn có thể sử dụng trong `BinhQuanBenhAn.js`:

```javascript
const BinhQuanBenhAn = () => {
  const {
    BinhQuanBenhAn: rowsFromStore,
    BinhQuanBenhAn_NgayChenhLech: rowsChenhLech,
    ThongKe_VienPhi_DuyetKeToan,
    ThongKe_VienPhi_DuyetKeToan_NgayChenhLech,
    dashboadChiSoChatLuong,
  } = useSelector((state) => state.dashboard) || {};

  // Hiển thị summary cards với thống kê viện phí
  return (
    <Stack spacing={2}>
      {/* Card thống kê tổng quan */}
      <Card>
        <Typography variant="h6">Thống kê Viện phí đã duyệt</Typography>
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <Typography>
              Tổng: {ThongKe_VienPhi_DuyetKeToan?.total_all || 0}
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography>
              Nội trú: {ThongKe_VienPhi_DuyetKeToan?.noitru || 0}
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography>
              Ngoại trú: {ThongKe_VienPhi_DuyetKeToan?.ngoaitru || 0}
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography>
              NT không NV:{" "}
              {ThongKe_VienPhi_DuyetKeToan?.ngoaitru_khong_nhapvien || 0}
            </Typography>
          </Grid>
        </Grid>
      </Card>

      {/* Các component khác */}
    </Stack>
  );
};
```

## Lưu ý

1. **Kiểm tra null/undefined**: Luôn sử dụng optional chaining (`?.`) và default values (`|| 0`)
2. **Format số**: Có thể sử dụng `toLocaleString()` để format số đẹp hơn
3. **Màu sắc**: Sử dụng màu xanh cho tăng, đỏ cho giảm
4. **Backend field name**:
   - Field từ backend: `json_thongke_vienphi_duyetketoan`
   - Redux state: `ThongKe_VienPhi_DuyetKeToan`
   - Ngày chênh lệch: `ThongKe_VienPhi_DuyetKeToan_NgayChenhLech`
