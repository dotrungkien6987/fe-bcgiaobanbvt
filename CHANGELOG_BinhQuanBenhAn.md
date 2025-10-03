# 📝 Changelog - BinhQuanBenhAn Component

## 🔄 Thay đổi cấu trúc dữ liệu (2025-10-02)

### Cấu trúc dữ liệu mới

```javascript
{
  KhoaID: number,           // Thay departmentid
  TenKhoa: string,          // Thay departmentname
  LoaiKhoa: "noitru" | "ngoaitru",  // MỚI - phân loại khoa
  departmentid: null,       // Không dùng nữa
  departmentname: null,     // Không dùng nữa
  departmentgroupid: number,
  departmentgroupname: string,
  vienphi_count: number,
  total_money: number,
  total_thuoc: number,
  total_vattu: number,
  avg_money_per_case: number,
  ty_le_thuoc: number,      // 0-1
  ty_le_vattu: number       // 0-1
}
```

---

## ✨ Tính năng mới

### 1. **Chia thành 2 bảng riêng biệt**

- ✅ **Bảng Nội trú** (`LoaiKhoa === "noitru"`)
- ✅ **Bảng Ngoại trú** (`LoaiKhoa === "ngoaitru"`)
- Mỗi bảng có màu tiêu đề riêng:
  - Nội trú: `#00C49F` (xanh lá)
  - Ngoại trú: `#FFBB28` (vàng)

### 2. **Summary Cards riêng cho mỗi loại**

Mỗi bảng có 4 thẻ tổng hợp:

- 🔵 Tổng số khoa (`#1939B7`)
- 🟢 Tổng ca viện phí (`#00C49F`)
- 🔴 Tổng doanh thu (`#bb1515`)
- 🟡 Bình quân/ca (`#FFBB28`)

### 3. **State quản lý độc lập**

```javascript
// Nội trú
const [searchNoiTru, setSearchNoiTru] = useState("");
const [orderNoiTru, setOrderNoiTru] = useState("desc");
const [orderByNoiTru, setOrderByNoiTru] = useState("total_money");

// Ngoại trú
const [searchNgoaiTru, setSearchNgoaiTru] = useState("");
const [orderNgoaiTru, setOrderNgoaiTru] = useState("desc");
const [orderByNgoaiTru, setOrderByNgoaiTru] = useState("total_money");
```

### 4. **Export CSV riêng**

- File cho Nội trú: `binh_quan_benh_an_noi_tru.csv`
- File cho Ngoại trú: `binh_quan_benh_an_ngoai_tru.csv`
- Header CSV đã cập nhật theo cấu trúc mới

### 5. **Cột bảng đơn giản hóa**

```
┌─────┬──────────────┬────────┬──────────┬────────┬──────┬───────┐
│ STT │ Tên Khoa     │ Số ca  │ Doanh thu│ BQ/ca  │ Thuốc│ Vật tư│
│     │ (ID: xxx)    │        │          │        │      │       │
└─────┴──────────────┴────────┴──────────┴────────┴──────┴───────┘
```

- Bỏ cột "Khối" (departmentgroupname)
- Hiển thị KhoaID dưới TenKhoa
- Có STT cho mỗi hàng

---

## 🔍 Logic lọc dữ liệu

### Lọc theo LoaiKhoa

```javascript
const rowsNoiTru = baseRows.filter((r) => r.LoaiKhoa === "noitru");
const rowsNgoaiTru = baseRows.filter((r) => r.LoaiKhoa === "ngoaitru");
```

### Validation dữ liệu

```javascript
const baseRows = useMemo(() => {
  const rows = Array.isArray(rowsFromStore) ? rowsFromStore : [];
  return rows.filter((r) => r && r.TenKhoa && r.KhoaID);
}, [rowsFromStore]);
```

- Chỉ chấp nhận record có TenKhoa và KhoaID
- Bỏ qua departmentname/departmentid (null)

---

## 🎯 Tìm kiếm & Sắp xếp

### Tìm kiếm

- Chỉ tìm theo **TenKhoa** (không tìm theo departmentgroupname nữa)
- Độc lập cho 2 bảng

### Sắp xếp

Các cột có thể sắp xếp:

- ✅ TenKhoa (A-Z)
- ✅ vienphi_count (Số ca)
- ✅ total_money (Doanh thu) - **Mặc định DESC**
- ✅ avg_money_per_case (BQ/ca)

---

## 🎨 UI Improvements

### Màu sắc phân biệt

```javascript
// Header Nội trú
bgcolor: "#00C49F" (Xanh lá)

// Header Ngoại trú
bgcolor: "#FFBB28" (Vàng)
```

### Icon emoji

- 🏥 NỘI TRÚ
- 🏥 NGOẠI TRÚ

### Component tái sử dụng

```javascript
const renderTable = (
  sorted,
  totals,
  order,
  orderBy,
  handleRequestSort,
  loaiKhoa
) => {
  /* ... */
};
```

---

## 🔄 Breaking Changes

### ❌ Các trường không dùng nữa

- `departmentid` → Dùng `KhoaID`
- `departmentname` → Dùng `TenKhoa`
- `departmentgroupname` → Không hiển thị trong bảng

### ⚠️ CSV Export format thay đổi

**Cũ:**

```csv
departmentid,departmentname,departmentgroupid,departmentgroupname,...
```

**Mới:**

```csv
KhoaID,TenKhoa,LoaiKhoa,vienphi_count,...
```

---

## 📊 Data Flow

```
Redux Store (BinhQuanBenhAn)
       ↓
  baseRows (filter có TenKhoa & KhoaID)
       ↓
  ├── rowsNoiTru (filter LoaiKhoa === "noitru")
  │        ↓
  │   filteredNoiTru (search)
  │        ↓
  │   sortedNoiTru (sort)
  │
  └── rowsNgoaiTru (filter LoaiKhoa === "ngoaitru")
           ↓
      filteredNgoaiTru (search)
           ↓
      sortedNgoaiTru (sort)
```

---

## ✅ Testing Checklist

- [ ] Backend API trả về đúng cấu trúc mới với `KhoaID`, `TenKhoa`, `LoaiKhoa`
- [ ] Hiển thị đầy đủ 2 bảng trên cùng 1 trang
- [ ] Summary cards tính đúng số liệu cho từng loại
- [ ] Tìm kiếm hoạt động độc lập
- [ ] Sắp xếp hoạt động độc lập
- [ ] Export CSV đúng tên file và định dạng
- [ ] Dark mode hiển thị đúng
- [ ] Responsive trên mobile
- [ ] Auto-refresh 15 phút vẫn hoạt động
- [ ] Chọn ngày và ngày chênh lệch vẫn hoạt động

---

## 🚀 Migration Guide

### Backend cần trả về:

```javascript
// GET /api/dashboard/binh-quan-benh-an
{
  "success": true,
  "data": {
    "BinhQuanBenhAn": [
      {
        "KhoaID": 3,
        "TenKhoa": "Khoa Hồi sức tích cực - Chống độc",
        "LoaiKhoa": "noitru",
        "departmentid": null,
        "departmentname": null,
        "departmentgroupid": 3,
        "departmentgroupname": "Khoa Hồi sức tích cực - Chống độc",
        "vienphi_count": 7,
        "total_money": 182566962.87,
        "total_thuoc": 14998978.22,
        "total_vattu": 711784.65,
        "avg_money_per_case": 26080994.7,
        "ty_le_thuoc": 0.08,
        "ty_le_vattu": 0.00
      },
      // ... more records
    ]
  }
}
```

### Frontend không cần thay đổi Redux actions

- `getDataNewestByNgay()` - Vẫn giữ nguyên
- `getDataNewestByNgayChenhLech()` - Vẫn giữ nguyên
- Chỉ cần backend trả về đúng cấu trúc

---

## 📞 Contact

Nếu có vấn đề, kiểm tra:

1. Console log `rowsFromStore` để xem cấu trúc dữ liệu
2. Network tab để xem API response
3. Redux DevTools để xem state `dashboard.BinhQuanBenhAn`
