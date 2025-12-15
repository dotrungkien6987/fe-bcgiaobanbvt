# 🛠️ SETUP TEST DATA - YeuCau System

## Mục Tiêu

Tạo môi trường test hoàn chỉnh với:

- 6 test users với các vai trò khác nhau
- 10+ YeuCau records ở các trạng thái khác nhau
- Master data (DanhMuc YeuCau, Lý do từ chối, v.v.)

---

## 1️⃣ Tạo Test Users

### Script MongoDB

```javascript
// Chạy trong MongoDB shell hoặc MongoDB Compass

use giaoban_bvt; // Hoặc tên database của bạn

// 1. User Người Gửi (Regular User)
db.users.insertOne({
  UserName: "test_nguoigui",
  PassWord: "$2a$10$...", // hash của "Test@123" (cần hash bằng bcrypt)
  Email: "nguoigui@test.com",
  HoTen: "Nguyễn Văn A - Người Gửi",
  PhanQuyen: "user",
  KhoaID: ObjectId("..."), // ID của Khoa Ngoại (hoặc khoa nào đó)
  NhanVienID: ObjectId("..."), // ID của NhanVien tương ứng
  IsActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

// 2. User Điều Phối Viên (Manager)
db.users.insertOne({
  UserName: "test_dieuphoi",
  PassWord: "$2a$10$...",
  Email: "dieuphoi@test.com",
  HoTen: "Trần Thị B - Điều Phối",
  PhanQuyen: "manager",
  KhoaID: ObjectId("..."), // ID Khoa Nội
  NhanVienID: ObjectId("..."),
  IsActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

// 3. User Được Điều Phối (Staff in same department as DieuPhoi)
db.users.insertOne({
  UserName: "test_duocdieuphoi",
  PassWord: "$2a$10$...",
  Email: "duocdieuphoi@test.com",
  HoTen: "Lê Văn C - Được Điều Phối",
  PhanQuyen: "user",
  KhoaID: ObjectId("..."), // Cùng Khoa với DieuPhoi
  NhanVienID: ObjectId("..."),
  IsActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

// 4. User Người Nhận (Recipient for personal requests)
db.users.insertOne({
  UserName: "test_nguoinhan",
  PassWord: "$2a$10$...",
  Email: "nguoinhan@test.com",
  HoTen: "Phạm Thị D - Người Nhận",
  PhanQuyen: "user",
  KhoaID: ObjectId("..."),
  NhanVienID: ObjectId("..."),
  IsActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

// 5. User Xử Lý Khác
db.users.insertOne({
  UserName: "test_xulykhac",
  PassWord: "$2a$10$...",
  Email: "xulykhac@test.com",
  HoTen: "Hoàng Văn E - Xử Lý",
  PhanQuyen: "user",
  KhoaID: ObjectId("..."),
  NhanVienID: ObjectId("..."),
  IsActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

// 6. User Admin
db.users.insertOne({
  UserName: "test_admin",
  PassWord: "$2a$10$...",
  Email: "admin@test.com",
  HoTen: "Admin Test",
  PhanQuyen: "admin",
  KhoaID: null,
  NhanVienID: ObjectId("..."),
  IsActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});
```

### Helper Script để Hash Password

```javascript
// Chạy trong Node.js (nếu cần tạo password hash)
const bcrypt = require("bcryptjs");

const password = "Test@123";
const saltRounds = 10;

bcrypt.hash(password, saltRounds, function (err, hash) {
  console.log("Password hash:", hash);
  // Copy hash này vào script trên
});
```

### Lấy User IDs sau khi tạo

```javascript
// Query để lấy IDs
db.users
  .find({ UserName: { $regex: /^test_/ } }, { UserName: 1, _id: 1, HoTen: 1 })
  .pretty();

// Ghi lại IDs vào notepad để dùng cho steps tiếp theo:
// test_nguoigui: ObjectId("...")
// test_dieuphoi: ObjectId("...")
// test_duocdieuphoi: ObjectId("...")
// test_nguoinhan: ObjectId("...")
// test_xulykhac: ObjectId("...")
// test_admin: ObjectId("...")
```

---

## 2️⃣ Tạo Master Data (DanhMuc YeuCau)

### Script tạo DanhMuc

```javascript
// Tạo 3 danh mục yêu cầu để test

// 1. Danh mục Sửa chữa máy móc
db.danhMucYeuCau.insertOne({
  TenDanhMuc: "Sửa chữa thiết bị y tế",
  MoTa: "Yêu cầu sửa chữa, bảo trì thiết bị y tế",
  ThoiGianDuKien: 2,
  DonViThoiGian: "NGAY", // GIO, NGAY, PHUT
  IsActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});

// 2. Danh mục Hỗ trợ IT
db.danhMucYeuCau.insertOne({
  TenDanhMuc: "Hỗ trợ IT",
  MoTa: "Yêu cầu hỗ trợ về máy tính, mạng, phần mềm",
  ThoiGianDuKien: 4,
  DonViThoiGian: "GIO",
  IsActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});

// 3. Danh mục Vật tư tiêu hao
db.danhMucYeuCau.insertOne({
  TenDanhMuc: "Cung cấp vật tư tiêu hao",
  MoTa: "Yêu cầu cung cấp vật tư, thiết bị tiêu hao",
  ThoiGianDuKien: 1,
  DonViThoiGian: "NGAY",
  IsActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});

// Lấy IDs
db.danhMucYeuCau.find({}, { TenDanhMuc: 1, _id: 1 }).pretty();
```

### Tạo Lý Do Từ Chối (trong DataFix)

```javascript
// Cập nhật hoặc tạo DataFix cho YeuCau
db.datafix.updateOne(
  { LoaiDataFix: "YeuCau" },
  {
    $set: {
      LyDoTuChoi: [
        {
          MaLyDo: "KHONG_DU_NHAN_LUC",
          TenLyDo: "Không đủ nhân lực",
          GhiChu: "Đội ngũ hiện tại đã quá tải",
          index: 0,
        },
        {
          MaLyDo: "KHONG_THUOC_PHAM_VI",
          TenLyDo: "Không thuộc phạm vi xử lý",
          GhiChu: "Vấn đề này không thuộc trách nhiệm của phòng ban",
          index: 1,
        },
        {
          MaLyDo: "THONG_TIN_KHONG_RO_RANG",
          TenLyDo: "Thông tin không rõ ràng",
          GhiChu: "Cần bổ sung thêm thông tin chi tiết",
          index: 2,
        },
        {
          MaLyDo: "YEU_CAU_KHONG_HOP_LE",
          TenLyDo: "Yêu cầu không hợp lệ",
          GhiChu: "Yêu cầu không phù hợp với quy định",
          index: 3,
        },
        {
          MaLyDo: "LY_DO_KHAC",
          TenLyDo: "Lý do khác",
          GhiChu: "Vui lòng ghi rõ lý do",
          index: 4,
        },
      ],
    },
  },
  { upsert: true }
);
```

---

## 3️⃣ Tạo Test YeuCau Records

### TC-MOI-K-01: YeuCau MOI gửi đến KHOA

```javascript
db.yeuCaus.insertOne({
  TieuDe: "TC-MOI-K-01: Máy X-quang hỏng cần sửa chữa gấp",
  NoiDung: "Máy X-quang tại phòng chụp chiếu đang bị lỗi, không thể khởi động",
  LoaiNguoiNhan: "GUI_DEN_KHOA",
  TrangThai: "MOI",

  // Người gửi
  NguoiGuiID: ObjectId("..."), // ID của test_nguoigui

  // Gửi đến khoa (Khoa Nội)
  KhoaNhanID: ObjectId("..."), // ID Khoa Nội (khoa của test_dieuphoi)

  // Danh mục
  DanhMucYeuCauID: ObjectId("..."), // ID danh mục "Sửa chữa thiết bị"
  SnapshotDanhMuc: {
    TenDanhMuc: "Sửa chữa thiết bị y tế",
    ThoiGianDuKien: 2,
    DonViThoiGian: "NGAY",
  },

  // Priority
  MucDoUuTien: "CAO",

  // Status fields (null khi MOI)
  NguoiXuLyID: null,
  ThoiGianHen: null,
  ThoiGianBatDau: null,
  ThoiGianHoanThanh: null,
  TienDoHoanThanh: 0,

  // Rating (null khi chưa đánh giá)
  DanhGia: null,
  NhanXet: null,

  // Files
  Files: [],

  // Timestamps
  createdAt: new Date(),
  updatedAt: new Date(),
});
```

### TC-MOI-CN-01: YeuCau MOI gửi đến CÁ NHÂN

```javascript
db.yeuCaus.insertOne({
  TieuDe: "TC-MOI-CN-01: Cần hỗ trợ cài đặt phần mềm HIS",
  NoiDung: "Máy tính tại phòng khám không thể đăng nhập phần mềm HIS",
  LoaiNguoiNhan: "GUI_DEN_CA_NHAN",
  TrangThai: "MOI",

  // Người gửi
  NguoiGuiID: ObjectId("..."), // ID của test_nguoigui

  // Gửi đến người nhận cụ thể
  NguoiNhanID: ObjectId("..."), // ID của test_nguoinhan

  // Danh mục
  DanhMucYeuCauID: ObjectId("..."), // ID danh mục "Hỗ trợ IT"
  SnapshotDanhMuc: {
    TenDanhMuc: "Hỗ trợ IT",
    ThoiGianDuKien: 4,
    DonViThoiGian: "GIO",
  },

  MucDoUuTien: "TRUNG_BINH",

  NguoiXuLyID: null,
  ThoiGianHen: null,
  ThoiGianBatDau: null,
  ThoiGianHoanThanh: null,
  TienDoHoanThanh: 0,

  DanhGia: null,
  NhanXet: null,
  Files: [],

  createdAt: new Date(),
  updatedAt: new Date(),
});
```

### TC-XL-01: YeuCau DANG_XU_LY

```javascript
db.yeuCaus.insertOne({
  TieuDe: "TC-XL-01: Đang sửa chữa máy điện tim",
  NoiDung: "Máy điện tim cần thay thế linh kiện",
  LoaiNguoiNhan: "GUI_DEN_KHOA",
  TrangThai: "DANG_XU_LY",

  NguoiGuiID: ObjectId("..."), // test_nguoigui
  KhoaNhanID: ObjectId("..."), // Khoa Nội
  NguoiXuLyID: ObjectId("..."), // test_duocdieuphoi (đã tiếp nhận)

  DanhMucYeuCauID: ObjectId("..."),
  SnapshotDanhMuc: {
    TenDanhMuc: "Sửa chữa thiết bị y tế",
    ThoiGianDuKien: 2,
    DonViThoiGian: "NGAY",
  },

  MucDoUuTien: "CAO",

  // Đã tiếp nhận
  ThoiGianHen: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Hẹn sau 2 ngày
  ThoiGianBatDau: new Date(Date.now() - 2 * 60 * 60 * 1000), // Bắt đầu 2 giờ trước
  TienDoHoanThanh: 35, // Đang xử lý 35%

  ThoiGianHoanThanh: null,
  DanhGia: null,
  NhanXet: null,
  Files: [],

  createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 giờ trước
  updatedAt: new Date(),
});
```

### TC-HT-01: YeuCau DA_HOAN_THANH (chưa đánh giá)

```javascript
db.yeuCaus.insertOne({
  TieuDe: "TC-HT-01: Đã sửa xong máy X-quang",
  NoiDung: "Máy X-quang đã hoạt động bình thường",
  LoaiNguoiNhan: "GUI_DEN_CA_NHAN",
  TrangThai: "DA_HOAN_THANH",

  NguoiGuiID: ObjectId("..."), // test_nguoigui
  NguoiNhanID: ObjectId("..."), // test_nguoinhan
  NguoiXuLyID: ObjectId("..."), // test_nguoinhan (đã xử lý xong)

  DanhMucYeuCauID: ObjectId("..."),
  SnapshotDanhMuc: {
    TenDanhMuc: "Sửa chữa thiết bị y tế",
    ThoiGianDuKien: 2,
    DonViThoiGian: "NGAY",
  },

  MucDoUuTien: "CAO",

  ThoiGianHen: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  ThoiGianBatDau: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  ThoiGianHoanThanh: new Date(Date.now() - 5 * 60 * 60 * 1000), // Hoàn thành 5 giờ trước
  TienDoHoanThanh: 100,

  // Chưa đánh giá
  DanhGia: null,
  NhanXet: null,

  Files: [],

  createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 ngày trước
  updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
});
```

### TC-DONG-01: YeuCau DA_DONG (5 ngày trước - còn có thể mở lại)

```javascript
db.yeuCaus.insertOne({
  TieuDe: "TC-DONG-01: Đã cung cấp vật tư tiêu hao",
  NoiDung: "Vật tư đã được giao đủ số lượng",
  LoaiNguoiNhan: "GUI_DEN_KHOA",
  TrangThai: "DA_DONG",

  NguoiGuiID: ObjectId("..."), // test_nguoigui
  KhoaNhanID: ObjectId("..."),
  NguoiXuLyID: ObjectId("..."), // test_dieuphoi

  DanhMucYeuCauID: ObjectId("..."),
  SnapshotDanhMuc: {
    TenDanhMuc: "Cung cấp vật tư tiêu hao",
    ThoiGianDuKien: 1,
    DonViThoiGian: "NGAY",
  },

  MucDoUuTien: "THAP",

  ThoiGianHen: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  ThoiGianBatDau: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
  ThoiGianHoanThanh: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
  TienDoHoanThanh: 100,

  // Đã đánh giá 5 sao
  DanhGia: 5,
  NhanXet: "Rất hài lòng, giao hàng đúng hẹn",

  // Đã đóng 5 ngày trước (vẫn còn trong 7 ngày để mở lại)
  NgayDong: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),

  Files: [],

  createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
  updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
});
```

### TC-TC-01: YeuCau TU_CHOI (để test Appeal)

```javascript
db.yeuCaus.insertOne({
  TieuDe: "TC-TC-01: Yêu cầu cài đặt phần mềm đã bị từ chối",
  NoiDung: "Cần cài đặt phần mềm thiết kế đồ họa",
  LoaiNguoiNhan: "GUI_DEN_CA_NHAN",
  TrangThai: "TU_CHOI",

  NguoiGuiID: ObjectId("..."), // test_nguoigui
  NguoiNhanID: ObjectId("..."), // test_nguoinhan

  DanhMucYeuCauID: ObjectId("..."),
  SnapshotDanhMuc: {
    TenDanhMuc: "Hỗ trợ IT",
    ThoiGianDuKien: 4,
    DonViThoiGian: "GIO",
  },

  MucDoUuTien: "THAP",

  // Bị từ chối
  LyDoTuChoiID: ObjectId("..."), // ID của lý do "Không thuộc phạm vi"
  SnapshotLyDoTuChoi: {
    MaLyDo: "KHONG_THUOC_PHAM_VI",
    TenLyDo: "Không thuộc phạm vi xử lý",
  },
  GhiChuTuChoi: "Phần mềm này không nằm trong danh mục được hỗ trợ",
  ThoiGianTuChoi: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 giờ trước

  NguoiXuLyID: null,
  ThoiGianHen: null,
  ThoiGianBatDau: null,
  ThoiGianHoanThanh: null,
  TienDoHoanThanh: 0,

  DanhGia: null,
  NhanXet: null,
  Files: [],

  createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
});
```

---

## 4️⃣ Verification Checklist

Sau khi chạy xong các scripts, kiểm tra:

### ✅ Users

```javascript
db.users.countDocuments({ UserName: { $regex: /^test_/ } });
// Expected: 6 users
```

### ✅ DanhMuc YeuCau

```javascript
db.danhMucYeuCau.countDocuments({ IsActive: true });
// Expected: >= 3 danh mục
```

### ✅ DataFix (Lý do từ chối)

```javascript
db.datafix.findOne({ LoaiDataFix: "YeuCau" }, { LyDoTuChoi: 1 });
// Expected: Array với 5 lý do
```

### ✅ YeuCau Test Records

```javascript
db.yeuCaus.countDocuments({ TieuDe: { $regex: /^TC-/ } });
// Expected: >= 6 test records
```

### ✅ Test Login

- Login vào frontend với từng test user
- Verify có thể xem được YeuCau tương ứng
- Verify availableActions đúng với vai trò

---

## 5️⃣ Cleanup Scripts (Sau khi test xong)

### Xóa Test Data

```javascript
// XÓA TEST USERS
db.users.deleteMany({ UserName: { $regex: /^test_/ } });

// XÓA TEST YEU CAU
db.yeuCaus.deleteMany({ TieuDe: { $regex: /^TC-/ } });

// Nếu muốn xóa DanhMuc test (optional)
db.danhMucYeuCau.deleteMany({
  TenDanhMuc: {
    $in: ["Sửa chữa thiết bị y tế", "Hỗ trợ IT", "Cung cấp vật tư tiêu hao"],
  },
});

// Verify
db.users.countDocuments({ UserName: { $regex: /^test_/ } }); // 0
db.yeuCaus.countDocuments({ TieuDe: { $regex: /^TC-/ } }); // 0
```

---

## 📝 Notes

1. **Password Hash**: Tất cả test users đều dùng password `Test@123` (đã hash)
2. **ObjectIds**: Cần thay thế `ObjectId("...")` bằng IDs thực tế từ database
3. **Khoa IDs**: Cần dùng KhoaID thực tế có trong database
4. **NhanVien IDs**: Mỗi User phải có NhanVienID tương ứng
5. **Timeline**: Setup này mất khoảng 15-20 phút để hoàn thành

---

## 🚀 Quick Start Commands

```bash
# 1. Mở MongoDB shell
mongosh

# 2. Chọn database
use giaoban_bvt

# 3. Copy-paste từng section scripts ở trên

# 4. Verify
db.users.find({ UserName: { $regex: /^test_/ } }).pretty()
db.yeuCaus.find({ TieuDe: { $regex: /^TC-/ } }).pretty()
```

**Ready to test!** 🎯
