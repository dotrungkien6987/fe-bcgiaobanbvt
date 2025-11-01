# Thiết Kế Temporal Data cho Quan Hệ Quản Lý Nhân Viên

## 🎯 Vấn Đề Cốt Lõi

**Tình huống thực tế:**

```
T1 (Jan 2025): Manager A quản lý Employee X (chấm KPI, giao việc)
T2 (Mar 2025): Employee X chuyển phòng → Manager B quản lý
T3 (Jun 2025): Cần review: "Ai đã chấm KPI cho Employee X trong Q1?"
```

**Current Design Problem:**

```javascript
// Schema hiện tại
QuanLyNhanVien {
  NhanVienQuanLy: ObjectId,
  NhanVienDuocQuanLy: ObjectId,
  LoaiQuanLy: "KPI" | "Giao_Viec",
  isDeleted: Boolean,      // ❌ CHỈ có soft delete
  createdAt: Date,         // ❌ Không có valid range
  updatedAt: Date
}

// ❌ Nếu xóa relation cũ + tạo relation mới:
// → Mất audit trail
// → DanhGiaKPI/CongViec trong quá khứ mất context
// → Reports sai
```

---

## 🚨 Hậu Quả Khi Xóa & Tạo Mới

### Scenario 1: **Chuyển Manager Giữa Chu Kỳ KPI**

```javascript
// ===== THÁNG 1: Manager A chấm KPI =====
QuanLyNhanVien {
  _id: "rel_001",
  NhanVienQuanLy: "manager_A",
  NhanVienDuocQuanLy: "employee_X",
  LoaiQuanLy: "KPI",
  isDeleted: false,
  createdAt: "2025-01-01"
}

DanhGiaKPI {
  _id: "kpi_q1",
  ChuKyDanhGiaID: "cycle_q1_2025",
  NhanVienID: "employee_X",
  NguoiDanhGiaID: "manager_A",  // ← Manager A chấm
  TrangThai: "DA_DUYET",
  TongDiemKPI: 85,
  NgayDuyet: "2025-01-31"
}

// ===== THÁNG 3: Employee X chuyển phòng =====
// ❌ DESIGN SAI: Xóa relation cũ, tạo mới
QuanLyNhanVien.findByIdAndUpdate("rel_001", { isDeleted: true })

QuanLyNhanVien.create({
  _id: "rel_002",
  NhanVienQuanLy: "manager_B",
  NhanVienDuocQuanLy: "employee_X",
  LoaiQuanLy: "KPI",
  isDeleted: false,
  createdAt: "2025-03-01"
})

// ===== THÁNG 6: Query lịch sử =====
// ❌ PROBLEM: Tìm ai đã chấm KPI cho Employee X trong Q1?
const relations = await QuanLyNhanVien.find({
  NhanVienDuocQuanLy: "employee_X",
  LoaiQuanLy: "KPI",
  isDeleted: false  // ← CHỈ tìm thấy Manager B!
})
// Result: [{ NhanVienQuanLy: "manager_B" }]
// ❌ Thiếu Manager A → Reports SAI!

// ❌ PROBLEM: JOIN query trả về NULL
const kpiWithManager = await DanhGiaKPI.findById("kpi_q1")
  .populate({
    path: "NguoiDanhGiaID",
    match: {
      // Tìm trong QuanLyNhanVien xem Manager A có quyền không?
      // → Không tìm thấy vì isDeleted = true
    }
  })
// Result: NguoiDanhGiaID = null (vì join failed)
```

### Scenario 2: **Reports/Analytics Bị Sai**

```javascript
// Report: "Top 10 managers có nhiều nhân viên nhất"
const stats = await QuanLyNhanVien.aggregate([
  { $match: { isDeleted: false, LoaiQuanLy: "KPI" } },
  { $group: { _id: "$NhanVienQuanLy", count: { $sum: 1 } } },
  { $sort: { count: -1 } },
  { $limit: 10 },
]);

// ❌ Kết quả SAI vì:
// - Manager A đã quản lý 50 nhân viên trong 5 năm
// - Nhưng tất cả đều chuyển phòng → relations bị xóa
// - Report hiển thị: Manager A = 0 nhân viên (?!)
```

### Scenario 3: **Audit Trail Mất Dấu**

```javascript
// Kiểm toán: "Ai đã approve KPI score 95 cho Employee X vào tháng 2?"
const kpi = await DanhGiaKPI.findOne({
  NhanVienID: "employee_X",
  TongDiemKPI: 95,
  NgayDuyet: { $gte: "2025-02-01", $lte: "2025-02-28" },
});

// kpi.NguoiDanhGiaID = "manager_A"
// Nhưng QuanLyNhanVien relation đã bị xóa
// ❌ Không thể verify: "Manager A có quyền chấm vào tháng 2 không?"
// ❌ Compliance issue!
```

---

## ✅ Giải Pháp 1: **Effective Dating (Recommended)**

### Schema Design

```javascript
const quanLyNhanVienSchema = new Schema(
  {
    NhanVienQuanLy: {
      type: Schema.ObjectId,
      required: true,
      ref: "NhanVien",
    },
    NhanVienDuocQuanLy: {
      type: Schema.ObjectId,
      required: true,
      ref: "NhanVien",
    },
    LoaiQuanLy: {
      type: String,
      enum: ["KPI", "Giao_Viec"],
      required: true,
    },

    // ✅ TEMPORAL FIELDS
    NgayBatDau: {
      type: Date,
      required: true,
      default: Date.now,
      description: "Ngày bắt đầu hiệu lực của quan hệ quản lý",
    },
    NgayKetThuc: {
      type: Date,
      default: null,
      description: "Ngày kết thúc hiệu lực (null = vô thời hạn)",
    },

    // Metadata
    LyDoThayDoi: {
      type: String,
      maxlength: 500,
      description:
        "Lý do thay đổi/kết thúc quan hệ (chuyển phòng, nghỉ việc, v.v.)",
    },
    NguoiThayDoi: {
      type: Schema.ObjectId,
      ref: "User",
      description: "Người thực hiện thay đổi",
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ✅ INDEX: Tối ưu query theo time range
quanLyNhanVienSchema.index({
  NhanVienDuocQuanLy: 1,
  NgayBatDau: 1,
  NgayKetThuc: 1,
});

quanLyNhanVienSchema.index({
  NhanVienQuanLy: 1,
  NgayBatDau: 1,
  NgayKetThuc: 1,
});

// ✅ UNIQUE CONSTRAINT: Không overlap time range cho cùng 1 pair
quanLyNhanVienSchema.index(
  {
    NhanVienQuanLy: 1,
    NhanVienDuocQuanLy: 1,
    LoaiQuanLy: 1,
    NgayBatDau: 1,
  },
  {
    unique: true,
    partialFilterExpression: { isDeleted: false },
  }
);
```

### Business Logic

```javascript
// ✅ Helper: Kiểm tra quan hệ có hiệu lực tại thời điểm X không?
quanLyNhanVienSchema.statics.isValidAt = function (
  managerId,
  employeeId,
  loaiQuanLy,
  checkDate = new Date()
) {
  return this.findOne({
    NhanVienQuanLy: managerId,
    NhanVienDuocQuanLy: employeeId,
    LoaiQuanLy: loaiQuanLy,
    NgayBatDau: { $lte: checkDate },
    $or: [
      { NgayKetThuc: null }, // Vô thời hạn
      { NgayKetThuc: { $gte: checkDate } }, // Chưa hết hạn
    ],
    isDeleted: false,
  });
};

// ✅ Helper: Lấy tất cả quan hệ trong khoảng thời gian
quanLyNhanVienSchema.statics.getRelationsInPeriod = function (
  employeeId,
  startDate,
  endDate
) {
  return this.find({
    NhanVienDuocQuanLy: employeeId,
    $or: [
      // Case 1: Relation bắt đầu trong period
      {
        NgayBatDau: { $gte: startDate, $lte: endDate },
      },
      // Case 2: Relation kết thúc trong period
      {
        NgayKetThuc: { $gte: startDate, $lte: endDate },
      },
      // Case 3: Relation cover toàn bộ period
      {
        NgayBatDau: { $lte: startDate },
        $or: [{ NgayKetThuc: null }, { NgayKetThuc: { $gte: endDate } }],
      },
    ],
    isDeleted: false,
  }).populate("NhanVienQuanLy NhanVienDuocQuanLy");
};

// ✅ Helper: Kết thúc quan hệ hiện tại
quanLyNhanVienSchema.methods.endRelation = async function (
  endDate = new Date(),
  reason = "",
  userId = null
) {
  // Validate: Không kết thúc trong quá khứ
  if (endDate < this.NgayBatDau) {
    throw new Error("Ngày kết thúc không thể trước ngày bắt đầu");
  }

  // Validate: Không có dữ liệu sau ngày kết thúc
  const futureKPIs = await mongoose.model("DanhGiaKPI").countDocuments({
    NguoiDanhGiaID: this.NhanVienQuanLy,
    NhanVienID: this.NhanVienDuocQuanLy,
    createdAt: { $gt: endDate },
    isDeleted: false,
  });

  if (futureKPIs > 0) {
    throw new Error(
      `Không thể kết thúc quan hệ vì có ${futureKPIs} đánh giá KPI sau ngày ${endDate}`
    );
  }

  this.NgayKetThuc = endDate;
  this.LyDoThayDoi = reason;
  this.NguoiThayDoi = userId;

  return this.save();
};
```

### Controller Logic

```javascript
/**
 * Thay đổi manager cho nhân viên
 * - Kết thúc quan hệ cũ (set NgayKetThuc)
 * - Tạo quan hệ mới (với NgayBatDau)
 */
quanLyNhanVienController.changeManager = catchAsync(async (req, res, next) => {
  const {
    employeeId,
    oldManagerId,
    newManagerId,
    loaiQuanLy,
    effectiveDate = new Date(),
    reason = "",
  } = req.body;

  // ✅ STEP 1: Validate effective date
  if (effectiveDate < new Date()) {
    throw new AppError(400, "Ngày hiệu lực không thể trong quá khứ");
  }

  // ✅ STEP 2: Tìm quan hệ hiện tại
  const currentRelation = await QuanLyNhanVien.findOne({
    NhanVienQuanLy: oldManagerId,
    NhanVienDuocQuanLy: employeeId,
    LoaiQuanLy: loaiQuanLy,
    NgayBatDau: { $lte: effectiveDate },
    $or: [{ NgayKetThuc: null }, { NgayKetThuc: { $gte: effectiveDate } }],
    isDeleted: false,
  });

  if (!currentRelation) {
    throw new AppError(404, "Không tìm thấy quan hệ quản lý hiện tại");
  }

  // ✅ STEP 3: Validate không có dữ liệu sau effective date
  const CongViec = mongoose.model("CongViec");
  const DanhGiaKPI = mongoose.model("DanhGiaKPI");

  const futureWorks = await CongViec.countDocuments({
    NguoiGiaoViecID: oldManagerId,
    $or: [
      { NguoiChinhID: employeeId },
      { "NguoiThamGia.NhanVienID": employeeId },
    ],
    createdAt: { $gt: effectiveDate },
    isDeleted: false,
  });

  const futureKPIs = await DanhGiaKPI.countDocuments({
    NguoiDanhGiaID: oldManagerId,
    NhanVienID: employeeId,
    createdAt: { $gt: effectiveDate },
    isDeleted: false,
  });

  if (futureWorks > 0 || futureKPIs > 0) {
    throw new AppError(
      400,
      `Không thể thay đổi vì có ${futureWorks} công việc và ${futureKPIs} KPI sau ngày ${effectiveDate}`
    );
  }

  // ✅ STEP 4: Kết thúc quan hệ cũ
  await currentRelation.endRelation(effectiveDate, reason, req.user._id);

  // ✅ STEP 5: Tạo quan hệ mới
  const newRelation = await QuanLyNhanVien.create({
    NhanVienQuanLy: newManagerId,
    NhanVienDuocQuanLy: employeeId,
    LoaiQuanLy: loaiQuanLy,
    NgayBatDau: effectiveDate,
    NgayKetThuc: null,
    LyDoThayDoi: `Chuyển từ manager ${oldManagerId}. ${reason}`,
    NguoiThayDoi: req.user._id,
  });

  // ✅ STEP 6: Populate và trả về
  const populated = await QuanLyNhanVien.findById(newRelation._id).populate(
    "NhanVienQuanLy NhanVienDuocQuanLy NguoiThayDoi"
  );

  return sendResponse(
    res,
    200,
    true,
    {
      oldRelation: currentRelation,
      newRelation: populated,
      effectiveDate,
    },
    null,
    "Thay đổi manager thành công"
  );
});
```

### Query Examples

```javascript
// ✅ Query 1: Ai quản lý Employee X vào ngày 15/02/2025?
const relation = await QuanLyNhanVien.findOne({
  NhanVienDuocQuanLy: "employee_X",
  LoaiQuanLy: "KPI",
  NgayBatDau: { $lte: new Date("2025-02-15") },
  $or: [
    { NgayKetThuc: null },
    { NgayKetThuc: { $gte: new Date("2025-02-15") } },
  ],
  isDeleted: false,
});
// Result: Manager A (vì Manager B chỉ bắt đầu từ 01/03)

// ✅ Query 2: Employee X có bao nhiêu managers trong Q1/2025?
const managers = await QuanLyNhanVien.getRelationsInPeriod(
  "employee_X",
  new Date("2025-01-01"),
  new Date("2025-03-31")
);
// Result: [Manager A (01/01 - 28/02), Manager B (01/03 - null)]

// ✅ Query 3: Validate KPI approval
const kpi = await DanhGiaKPI.findById("kpi_q1");
const hasPermission = await QuanLyNhanVien.isValidAt(
  kpi.NguoiDanhGiaID,
  kpi.NhanVienID,
  "KPI",
  kpi.NgayDuyet // ← CHECK tại thời điểm duyệt!
);
// Result: true (Manager A có quyền vào 31/01/2025)

// ✅ Query 4: Timeline report
const timeline = await QuanLyNhanVien.aggregate([
  {
    $match: {
      NhanVienDuocQuanLy: mongoose.Types.ObjectId("employee_X"),
      isDeleted: false,
    },
  },
  {
    $project: {
      manager: "$NhanVienQuanLy",
      from: "$NgayBatDau",
      to: { $ifNull: ["$NgayKetThuc", new Date()] },
      duration: {
        $subtract: [{ $ifNull: ["$NgayKetThuc", new Date()] }, "$NgayBatDau"],
      },
    },
  },
  { $sort: { from: 1 } },
]);
// Result: Timeline đầy đủ của employee
```

---

## ✅ Giải Pháp 2: **History Table (Alternative)**

### Schema Design

```javascript
// Bảng chính: Chỉ lưu quan hệ HIỆN TẠI
const quanLyNhanVienSchema = new Schema({
  NhanVienQuanLy: ObjectId,
  NhanVienDuocQuanLy: ObjectId,
  LoaiQuanLy: String,
  isDeleted: Boolean,
  // ... các fields khác
});

// ✅ Bảng lịch sử: Lưu TẤT CẢ thay đổi
const quanLyNhanVienHistorySchema = new Schema(
  {
    QuanLyNhanVienID: {
      type: ObjectId,
      ref: "QuanLyNhanVien",
      description: "Reference đến bản ghi hiện tại (nếu còn tồn tại)",
    },
    NhanVienQuanLy: ObjectId,
    NhanVienDuocQuanLy: ObjectId,
    LoaiQuanLy: String,

    // Temporal
    NgayBatDau: Date,
    NgayKetThuc: Date,

    // Metadata
    HanhDong: {
      type: String,
      enum: ["TAO_MOI", "CAP_NHAT", "XOA"],
    },
    NguoiThucHien: ObjectId,
    LyDo: String,

    // Snapshot của data tại thời điểm đó
    Snapshot: {
      type: Schema.Types.Mixed,
      description: "Full snapshot của QuanLyNhanVien record",
    },
  },
  { timestamps: true }
);
```

### Middleware Auto-logging

```javascript
// ✅ Hook: Tự động log mỗi khi thay đổi
quanLyNhanVienSchema.post("save", async function (doc) {
  const QuanLyNhanVienHistory = mongoose.model("QuanLyNhanVienHistory");

  await QuanLyNhanVienHistory.create({
    QuanLyNhanVienID: doc._id,
    NhanVienQuanLy: doc.NhanVienQuanLy,
    NhanVienDuocQuanLy: doc.NhanVienDuocQuanLy,
    LoaiQuanLy: doc.LoaiQuanLy,
    NgayBatDau: doc.createdAt,
    NgayKetThuc: doc.isDeleted ? new Date() : null,
    HanhDong: doc.isNew ? "TAO_MOI" : "CAP_NHAT",
    Snapshot: doc.toObject(),
  });
});

quanLyNhanVienSchema.post("findOneAndUpdate", async function (doc) {
  if (doc && doc.isDeleted) {
    const QuanLyNhanVienHistory = mongoose.model("QuanLyNhanVienHistory");

    await QuanLyNhanVienHistory.create({
      QuanLyNhanVienID: doc._id,
      NhanVienQuanLy: doc.NhanVienQuanLy,
      NhanVienDuocQuanLy: doc.NhanVienDuocQuanLy,
      LoaiQuanLy: doc.LoaiQuanLy,
      NgayBatDau: doc.createdAt,
      NgayKetThuc: new Date(),
      HanhDong: "XOA",
      Snapshot: doc.toObject(),
    });
  }
});
```

**Pros:**

- ✅ Giữ nguyên schema hiện tại (minimal migration)
- ✅ Full audit trail với snapshots
- ✅ Dễ implement

**Cons:**

- ❌ Queries phức tạp hơn (phải JOIN 2 tables)
- ❌ Tốn storage (duplicate data)
- ❌ Cần maintain consistency giữa 2 tables

---

## 📊 So Sánh Các Giải Pháp

| **Tiêu Chí**          | **Effective Dating** | **History Table** | **Current (Soft Delete)** |
| --------------------- | -------------------- | ----------------- | ------------------------- |
| **Audit Trail**       | ✅ Đầy đủ            | ✅ Đầy đủ         | ❌ Mất dữ liệu            |
| **Query Performance** | ✅ Nhanh (1 table)   | ⚠️ Chậm (JOIN)    | ✅ Nhanh                  |
| **Storage**           | ✅ Tối ưu            | ❌ Duplicate      | ✅ Tối ưu                 |
| **Migration Effort**  | ⚠️ Medium            | ✅ Low            | ✅ None                   |
| **Temporal Queries**  | ✅ Dễ                | ⚠️ Phức tạp       | ❌ Không thể              |
| **Data Integrity**    | ✅ Cao               | ✅ Cao            | ❌ Thấp                   |
| **Reports/Analytics** | ✅ Chính xác         | ✅ Chính xác      | ❌ Sai                    |
| **Compliance**        | ✅ Pass              | ✅ Pass           | ❌ Fail                   |

---

## 🎯 Recommendation

### **Chọn Effective Dating** vì:

1. ✅ **Best practice** trong enterprise systems
2. ✅ **Performance tốt** - chỉ 1 table, queries đơn giản
3. ✅ **Scalable** - dễ mở rộng về sau
4. ✅ **Compliance-ready** - đáp ứng audit requirements
5. ✅ **Migration path rõ ràng** - có script migrate từ current design

### Migration Strategy

```javascript
// Script migrate từ current design
async function migrateToEffectiveDating() {
  const QuanLyNhanVien = mongoose.model("QuanLyNhanVien");

  // 1. Add NgayBatDau field = createdAt cho tất cả records hiện tại
  await QuanLyNhanVien.updateMany({ NgayBatDau: { $exists: false } }, [
    { $set: { NgayBatDau: "$createdAt" } },
  ]);

  // 2. Set NgayKetThuc = updatedAt cho records đã xóa
  await QuanLyNhanVien.updateMany(
    { isDeleted: true, NgayKetThuc: { $exists: false } },
    [{ $set: { NgayKetThuc: "$updatedAt" } }]
  );

  // 3. Set NgayKetThuc = null cho records active
  await QuanLyNhanVien.updateMany(
    { isDeleted: false, NgayKetThuc: { $exists: false } },
    { $set: { NgayKetThuc: null } }
  );

  console.log("✅ Migration completed");
}
```

---

## 🔧 Implementation Checklist

### Phase 1: Schema Update (Week 1)

- [ ] Add `NgayBatDau`, `NgayKetThuc` fields to QuanLyNhanVien
- [ ] Add `LyDoThayDoi`, `NguoiThayDoi` fields
- [ ] Create indexes for temporal queries
- [ ] Add validation: NgayKetThuc >= NgayBatDau
- [ ] Add unique constraint: prevent overlap

### Phase 2: Helper Functions (Week 1)

- [ ] Implement `isValidAt(managerId, employeeId, date)`
- [ ] Implement `getRelationsInPeriod(employeeId, start, end)`
- [ ] Implement `endRelation(endDate, reason)`
- [ ] Implement `getCurrentManager(employeeId, loaiQuanLy)`

### Phase 3: Controller Updates (Week 2)

- [ ] Create `changeManager()` endpoint
- [ ] Update `xoaQuanHe()` to set NgayKetThuc instead of isDeleted
- [ ] Update `themQuanHe()` to validate no overlap
- [ ] Add `getRelationHistory()` endpoint for timeline

### Phase 4: Frontend Updates (Week 2)

- [ ] Add "Ngày hiệu lực" field in forms
- [ ] Show timeline/history in UI
- [ ] Add "Change Manager" workflow
- [ ] Update delete to "End Relationship"

### Phase 5: Migration (Week 3)

- [ ] Run migration script on staging
- [ ] Test all existing queries
- [ ] Verify data integrity
- [ ] Deploy to production

### Phase 6: Validation Updates (Week 3)

- [ ] Update KPI validation to check `isValidAt(approveDate)`
- [ ] Update CongViec validation
- [ ] Update reports to use temporal queries
- [ ] Add compliance reports

---

## 💡 Best Practices

### 1. **Always Query với Time Context**

```javascript
// ❌ BAD: Query without time
const relation = await QuanLyNhanVien.findOne({
  NhanVienQuanLy: managerId,
  NhanVienDuocQuanLy: employeeId,
});

// ✅ GOOD: Query tại thời điểm cụ thể
const relation = await QuanLyNhanVien.isValidAt(
  managerId,
  employeeId,
  "KPI",
  actionDate // ← Thời điểm action xảy ra
);
```

### 2. **Validate Before Critical Actions**

```javascript
// ✅ Trước khi approve KPI
const canApprove = await QuanLyNhanVien.isValidAt(
  req.currentNhanVienID,
  kpi.NhanVienID,
  "KPI",
  new Date() // Ngày hôm nay
);

if (!canApprove) {
  throw new AppError(403, "Bạn không còn quyền chấm KPI cho nhân viên này");
}
```

### 3. **Prevent Future Dating Misuse**

```javascript
// ✅ Chỉ cho phép set NgayKetThuc trong quá khứ hoặc hôm nay
if (endDate > new Date()) {
  throw new AppError(400, "Không thể kết thúc quan hệ trong tương lai");
}
```

### 4. **Use Transactions for Consistency**

```javascript
const session = await mongoose.startSession();
session.startTransaction();
try {
  await currentRelation.endRelation(effectiveDate, reason);
  await QuanLyNhanVien.create([newRelation], { session });
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

---

## 📝 Conclusion

**Your concern is 100% valid!**

Current design (xóa cũ + tạo mới) sẽ gây:

- ❌ Mất audit trail
- ❌ Reports sai
- ❌ Compliance issues
- ❌ Data integrity violations

**Recommended solution: Effective Dating**

- ✅ Giữ toàn bộ lịch sử
- ✅ Queries chính xác
- ✅ Performance tốt
- ✅ Scalable
- ✅ Migration dễ dàng

**Next Steps:**

1. Review design với team
2. Approve migration plan
3. Implement trong sprint tiếp theo
4. Test kỹ trước khi deploy

Đây là thay đổi **critical** cho hệ thống - nên làm NGAY trước khi có nhiều dữ liệu!
