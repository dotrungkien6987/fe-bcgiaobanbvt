# Subtasks – Thiết Kế Data Model

## 1. Bảng / Collection Ảnh Hưởng

- `CongViec` (MongoDB / Mongoose model hiện hữu).
- (Không tạo collection phụ cho quan hệ cây ở giai đoạn này.)

## 2. Thuộc Tính Bổ Sung (CongViec)

| Field                  | Type                    | Index                 | Mô tả                                      | Ghi chú                                    |
| ---------------------- | ----------------------- | --------------------- | ------------------------------------------ | ------------------------------------------ |
| `CongViecChaID`        | ObjectId (ref CongViec) | yes (`CongViecChaID`) | Cha trực tiếp                              | null nếu root                              |
| `Path`                 | [ObjectId]              | **no**                | DS ancestor từ root→cha                    | Materialized path (chưa index giai đoạn 1) |
| `Depth`                | Number                  | yes (`Depth`)         | Số cấp (root=0)                            | Derive từ Path length                      |
| `ChildrenCount`        | Number                  | no                    | Số con trực tiếp                           | Denormalize, tăng/giảm atomic              |
| `ChildrenSummaryCache` | Mixed                   | no                    | (Optional) cache tạm (ttl)                 | ⚠️ **CHƯA IMPLEMENT** - kế hoạch tương lai |
| `AllChildrenDoneAt`    | Date                    | no                    | Thời điểm tất cả con hoàn thành (đánh dấu) | ⚠️ **CHƯA IMPLEMENT** - kế hoạch tương lai |

## 3. Lý Do Chọn Materialized Path

| Tiêu chí            | Path                           | Adjacency (chỉ cha) | Nested Set            |
| ------------------- | ------------------------------ | ------------------- | --------------------- |
| Truy vấn subtree    | ✅ đơn giản (`Path: parentId`) | ❌ đệ quy           | ✅ nhưng cập nhật đắt |
| Cập nhật insert     | ✅ O(1)                        | ✅ O(1)             | ❌ O(n)               |
| Đổi cha (re-parent) | ❌ cần update toàn subtree     | ✅                  | ❌ tốn kém            |
| Phù hợp hiện tại    | ✅                             | OK                  | Overkill              |

Không hỗ trợ re-parent giai đoạn đầu → Path phù hợp & đơn giản nhất.

## 4. Lifecycle Giá Trị

1. Create root task:
   - `CongViecChaID=null`, `Path=[]`, `Depth=0`, `ChildrenCount=0`.
2. Create subtask:
   - Load cha (pick `Path` & `Depth`).
   - `Path = [...cha.Path, cha._id]`.
   - `Depth = cha.Depth + 1`.
   - Cha: `$inc { ChildrenCount: 1 }`.
3. Delete subtask (nếu policy cho phép xoá):
   - Cha: `$inc { ChildrenCount: -1 }`.
4. Transition child -> HOAN_THANH:
   - Không tác động cha (manual mode), nhưng khi build summary detail sẽ phản ánh.
5. Summary trên cha: build runtime bằng aggregation.

## 5. Aggregation Summary (Pseudo)

```js
const summary = await CongViec.aggregate([
  { $match: { CongViecChaID: parentId, DaXoa: { $ne: true } } },
  {
    $group: {
      _id: null,
      total: { $sum: 1 },
      done: { $sum: { $cond: [{ $eq: ["$TrangThai", "HOAN_THANH"] }, 1, 0] } },
      inProgress: {
        $sum: { $cond: [{ $eq: ["$TrangThai", "DANG_THUC_HIEN"] }, 1, 0] },
      },
      waiting: {
        $sum: { $cond: [{ $eq: ["$TrangThai", "CHO_DUYET"] }, 1, 0] },
      },
      late: {
        $sum: {
          $cond: [
            {
              $and: [
                { $ne: ["$TrangThai", "HOAN_THANH"] },
                { $lt: ["$NgayHetHan", new Date()] },
              ],
            },
            1,
            0,
          ],
        },
      },
    },
  },
]);
```

FE hiển thị `late` hoặc hợp nhất `late` vào inProgress tuỳ nhu cầu.

## 6. Mongoose Schema Patch (Gợi ý)

```js
const CongViecSchema = new Schema({
  // ...existing fields...
  CongViecChaID: {
    type: Schema.Types.ObjectId,
    ref: "CongViec",
    default: null,
  },
  Path: { type: [Schema.Types.ObjectId], default: [], index: false }, // Chưa index giai đoạn 1
  Depth: { type: Number, default: 0, index: true },
  ChildrenCount: { type: Number, default: 0 },
});

CongViecSchema.index({ CongViecChaID: 1 });
CongViecSchema.index({ CongViecChaID: 1, TrangThai: 1 });
CongViecSchema.index({ Depth: 1 });

// Hook set Path/Depth on create
CongViecSchema.pre("save", async function (next) {
  if (!this.isNew) return next();
  if (this.CongViecChaID) {
    const parent = await this.constructor
      .findById(this.CongViecChaID)
      .select("_id Path Depth TrangThai");
    if (!parent) return next(new Error("ParentNotFound"));
    if (parent.TrangThai === "HOAN_THANH")
      return next(new Error("ParentCompleted"));
    this.Path = [...(parent.Path || []), parent._id];
    this.Depth = (parent.Depth || 0) + 1;
  } else {
    this.Path = [];
    this.Depth = 0;
  }
  next();
});

// (Optional) static util: recompute ChildrenCount for a list of parents
CongViecSchema.statics.recountChildren = async function (parentIds = []) {
  const coll = this;
  const stats = await coll.aggregate([
    { $match: { CongViecChaID: { $in: parentIds }, DaXoa: { $ne: true } } },
    { $group: { _id: "$CongViecChaID", cnt: { $sum: 1 } } },
  ]);
  const map = Object.fromEntries(stats.map((s) => [String(s._id), s.cnt]));
  for (const pid of parentIds) {
    await coll.updateOne(
      { _id: pid },
      { $set: { ChildrenCount: map[String(pid)] || 0 } }
    );
  }
};
```

## 7. Validation Rules

| Rule                                 | Lỗi trả về                   | HTTP Code |
| ------------------------------------ | ---------------------------- | --------- |
| Parent completed                     | `PARENT_COMPLETED`           | 409       |
| Parent not found                     | `PARENT_NOT_FOUND`           | 404       |
| Not principal parent                 | `NOT_ALLOWED`                | 403       |
| Parent has children (when delete)    | `PARENT_HAS_CHILDREN` + list | 409       |
| Complete parent with active children | `CHILDREN_INCOMPLETE`        | 409       |

## 8. DTO Mở Rộng (GET Detail)

```json
{
  "_id": "...",
  "CongViecChaID": "...",
  "Depth": 2,
  "ChildrenCount": 5,
  "ChildrenSummary": { "total": 5, "done": 3, "inProgress": 1, "late": 1 },
  "AllChildrenDone": false
}
```

## 9. Bảo Mật Quyền Truy Cập Subtree

Pseudo check (middleware):

```js
function canView(task, user) {
  if (user.isAdmin) return true;
  if (
    isPrincipal(task, user) ||
    isAssigner(task, user) ||
    isParticipant(task, user)
  )
    return true;
  // Ancestor principals / managers
  return userManagedAncestor(task.Path, user);
}
```

## 10. Kịch Bản Edge

| Tình huống                         | Xử lý                                                                            |
| ---------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------ |
| Cha đã hoàn thành → cố tạo con     | 409 + PARENT_COMPLETED                                                           |
| Xóa cha có con                     | 409 + danh sách con (tối đa 10)                                                  |
| Tạo con rồi rollback DB giữa chừng | Sử dụng transaction (nếu cluster hỗ trợ) hoặc chấp nhận eventual consistency nhỏ |
| Nhiều user tạo con đồng thời       | Atomic $inc an toàn                                                              |
| ChildrenCount lệch thực tế         | Dừng giữa chừng / xóa mềm không đồng bộ                                          | Dùng `recountChildren` (script cron) |

### Integrity Check (Manual Script)

Pseudo Node.js script để rà soát:

```js
// Liệt kê top 50 parent có lệch count
db.CongViec.aggregate([
  { $match: { CongViecChaID: { $ne: null }, DaXoa: { $ne: true } } },
  { $group: { _id: "$CongViecChaID", real: { $sum: 1 } } },
  {
    $lookup: {
      from: "congviecs",
      localField: "_id",
      foreignField: "_id",
      as: "parent",
    },
  },
  { $unwind: "$parent" },
  {
    $project: {
      parentId: "$_id",
      real: 1,
      stored: "$parent.ChildrenCount",
      diff: { $subtract: ["$real", "$parent.ChildrenCount"] },
    },
  },
  { $match: { diff: { $ne: 0 } } },
  { $sort: { diff: -1 } },
  { $limit: 50 },
]);
```

## 11. Test Case Gốc

1. Create root (no parent) → Depth=0 Path=[].
2. Create child of root → Path=[root], Depth=1.
3. Create grandchild → Path=[root, child], Depth=2.
4. Parent complete fail (child active) → 409.
5. All children complete → detail shows AllChildrenDone=true.
6. Delete parent with children → 409.
7. Permission: non principal try create → 403.

## 12. Mở Rộng Tương Lai

- Field AutoProgressMode (AUTO|MANUAL).
- Re-parent: cập nhật Path + Depth toàn subtree (bulk update pipeline).
- Cached subtree counts per ancestor (incremental maintenance).

---

Xem thêm: `subtasks-feature-overview.md`, `subtasks-api-design.md`.
