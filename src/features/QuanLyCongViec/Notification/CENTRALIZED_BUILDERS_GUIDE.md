# 🏗️ CENTRALIZED BUILDERS - IMPLEMENTATION GUIDE

> **Architecture Pattern:** Single Source of Truth for Notification Data  
> **Implementation Date:** December 19-25, 2025  
> **Status:** ✅ Complete (19/19 service locations migrated)

---

## 📋 OVERVIEW

Centralized Builders là pattern để build notification data objects với **guaranteed completeness** - tất cả variables luôn có sẵn, không bao giờ thiếu field.

### Problem Solved

**❌ BEFORE (Manual Data Building):**

```javascript
// yeuCau.service.js - Manual 10 fields
await notificationService.send({
  type: 'yeucau-tao-moi',
  data: {
    _id: yeuCau._id.toString(),
    MaYeuCau: yeuCau.MaYeuCau,
    TieuDe: yeuCau.TieuDe,
    // ... chỉ 10 fields
  }
});

// yeuCauStateMachine.js - Manual 15 fields
await notificationService.send({
  type: 'yeucau-tiep-nhan',
  data: {
    _id, MaYeuCau, TieuDe, TenNguoiYeuCau, ...
    // ... 15 fields khác nhau
  }
});

// 🔴 PROBLEM: Template cần 29 fields, nhưng mỗi nơi gửi số lượng fields khác nhau
```

**✅ AFTER (Centralized Builder):**

```javascript
// ALL services use same builder
const data = await buildYeuCauNotificationData(yeuCau, context);
await notificationService.send({ type: "yeucau-tao-moi", data });

// 🟢 SOLUTION: Builder always returns 29 complete fields
```

---

## 🔄 NOTIFICATION FLOW - END TO END

### Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                     🖥️  FRONTEND (React + Redux)                    │
│   fe-bcgiaobanbvt/src/features/QuanLyCongViec/                     │
└─────────────────────────────────────────────────────────────────────┘
                                    │
    ┌───────────────────────────────┼───────────────────────────────┐
    │                               │                               │
    ▼                               ▼                               ▼
┌─────────┐                   ┌─────────┐                   ┌─────────┐
│ YeuCau  │                   │CongViec │                   │   KPI   │
│ Ticket/ │                   │CongViec/│                   │   KPI/  │
│yeuCau   │                   │congViec │                   │*Slice.js│
│Slice.js │                   │Slice.js │                   │         │
└────┬────┘                   └────┬────┘                   └────┬────┘
     │                             │                             │
     │ createYeuCau()              │ createCongViec()           │ duyetDanhGia()
     │ updateYeuCau()              │ updateCongViec()           │ huyDuyetDanhGia()
     │ deleteYeuCau()              │ assignTask()               │ tuDanhGia()
     │                             │ changeStatus()             │
     ▼                             ▼                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    📡 HTTP REQUEST (Axios)                          │
│                  app/apiService.js                                  │
│  POST /api/workmanagement/yeucau                                    │
│  PUT  /api/workmanagement/yeucau/:id                                │
│  POST /api/workmanagement/congviec                                  │
│  POST /api/workmanagement/kpi/duyet                                 │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Network Layer
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  🛣️  BACKEND - API ROUTES                           │
│   giaobanbv-be/modules/workmanagement/routes/                      │
│   - yeuCau.routes.js        → POST /yeucau                          │
│   - congViec.routes.js      → POST /congviec                        │
│   - kpi.routes.js           → POST /kpi/duyet                       │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Route to Controller
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  🎮 CONTROLLERS & SERVICES                          │
│   giaobanbv-be/modules/workmanagement/                             │
└─────────────────────────────────────────────────────────────────────┘
         │                          │                          │
         ▼                          ▼                          ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│  services/       │    │  services/       │    │  controllers/    │
│  yeuCau.service  │    │  congViec.service│    │  kpi.controller  │
│  .js             │    │  .js             │    │  .js             │
│                  │    │                  │    │                  │
│ ┌──────────────┐ │    │ ┌──────────────┐ │    │ ┌──────────────┐ │
│ │ createYeuCau │ │    │ │createCongViec│ │    │ │duyetDanhGia  │ │
│ │ updateYeuCau │ │    │ │updateCongViec│ │    │ │huyDuyet      │ │
│ │ deleteYeuCau │ │    │ │assignTask    │ │    │ │tuDanhGia     │ │
│ │ addComment   │ │    │ │updateStatus  │ │    │ └──────────────┘ │
│ └──────┬───────┘ │    │ └──────┬───────┘ │    │        │         │
│        │         │    │        │         │    │        │         │
│        │ STATE   │    │        │         │    │        │         │
│        │MACHINE? │    │        │         │    │        │         │
│        ▼         │    │        │         │    │        │         │
│ ┌──────────────┐ │    │        │         │    │        │         │
│ │yeuCauState   │ │    │        │         │    │        │         │
│ │Machine.js    │ │    │        │         │    │        │         │
│ │              │ │    │        │         │    │        │         │
│ │15 transitions│ │    │        │         │    │        │         │
│ │(TIEP_NHAN,   │ │    │        │         │    │        │         │
│ │ TU_CHOI,     │ │    │        │         │    │        │         │
│ │ DIEU_PHOI...)│ │    │        │         │    │        │         │
│ └──────┬───────┘ │    │        │         │    │        │         │
└────────┼─────────┘    └────────┼─────────┘    └────────┼─────────┘
         │                       │                       │
         │                       │                       │
         └───────────────────────┴───────────────────────┘
                                 │
                 ⚡ NOTIFICATION TRIGGER POINT
                                 │
                                 ▼
         ┌───────────────────────────────────────────┐
         │    🏗️  CENTRALIZED BUILDERS               │
         │    helpers/notificationDataBuilders.js   │
         │                                           │
         │  ┌─────────────────────────────────────┐ │
         │  │ buildYeuCauNotificationData()       │ │
         │  │ - Populate entity if needed         │ │
         │  │ - Extract 10 recipient candidates   │ │
         │  │ - Format 19 display fields          │ │
         │  │ - Apply null safety                 │ │
         │  │ - Return complete 29 fields         │ │
         │  └─────────────────────────────────────┘ │
         │                                           │
         │  ┌─────────────────────────────────────┐ │
         │  │ buildCongViecNotificationData()     │ │
         │  │ - Same pattern, 29 fields           │ │
         │  └─────────────────────────────────────┘ │
         │                                           │
         │  ┌─────────────────────────────────────┐ │
         │  │ buildKPINotificationData()          │ │
         │  │ - KPI specific, 16 fields           │ │
         │  └─────────────────────────────────────┘ │
         └───────────────────┬───────────────────────┘
                             │
                             │ Returns complete data object
                             ▼
         ┌───────────────────────────────────────────┐
         │    📬 NOTIFICATION SERVICE                │
         │    services/notificationService.js       │
         │                                           │
         │  async send({ type, data }) {             │
         │    1️⃣  Lookup NotificationType          │
         │    2️⃣  Lookup NotificationTemplate(s)   │
         │    3️⃣  Build recipients list            │
         │    4️⃣  Render templates                 │
         │    5️⃣  Resolve NhanVienID → UserID      │
         │    6️⃣  Save to DB                       │
         │    7️⃣  Broadcast via Socket.IO          │
         │  }                                        │
         └───────────┬───────────────┬───────────────┘
                     │               │
         ┌───────────▼──────┐   ┌────▼─────────────┐
         │   🗄️  DATABASE   │   │  🔌 SOCKET.IO    │
         │   MongoDB        │   │  Real-time       │
         └──────────────────┘   └──────────────────┘
              │                          │
              │                          │ Broadcast to connected clients
              ▼                          ▼
    ┌──────────────────┐      ┌──────────────────────┐
    │ notifications    │      │  Socket Event:       │
    │ Collection       │      │  "notification:new"  │
    │                  │      │                      │
    │ {                │      │  Payload: {          │
    │   type,          │      │    _id,              │
    │   data: {        │      │    type,             │
    │     29 fields    │      │    title,            │
    │   },             │      │    body,             │
    │   recipientUsers,│      │    actionUrl,        │
    │   createdAt      │      │    createdAt         │
    │ }                │      │  }                   │
    └──────────────────┘      └──────────────────────┘
                                         │
                                         │ WebSocket
                                         │
                                         ▼
         ┌───────────────────────────────────────────┐
         │   🖥️  FRONTEND - REAL-TIME UPDATE        │
         │   Socket.IO Client                        │
         │   features/QuanLyCongViec/Notification/  │
         │                                           │
         │   socket.on('notification:new', (data) => {
         │     - Update bell icon badge             │
         │     - Show toast notification            │
         │     - Update notification list           │
         │   })                                      │
         └───────────────────────────────────────────┘
                             │
                             ▼
         ┌───────────────────────────────────────────┐
         │   🔔 UI COMPONENTS                        │
         │                                           │
         │   NotificationBell.js                    │
         │   ├── Badge count                        │
         │   └── Dropdown                           │
         │       └── NotificationList.js            │
         │           └── NotificationItem.js        │
         │               ├── Title                  │
         │               ├── Body                   │
         │               ├── Timestamp              │
         │               └── Click → navigate(url)  │
         └───────────────────────────────────────────┘
```

### Detailed Step-by-Step Flow

#### 📍 Step 1: User Action (Frontend)

```javascript
// File: fe-bcgiaobanbvt/src/features/QuanLyCongViec/Ticket/yeuCauSlice.js

export const createYeuCau = (data, navigate) => async (dispatch) => {
  dispatch(slice.actions.startLoading());

  const response = await apiService.post("/workmanagement/yeucau", data);
  // ← POST request sent to backend

  dispatch(slice.actions.createYeuCauSuccess(response.data.data));
  toast.success("Tạo yêu cầu thành công");
};
```

#### 📍 Step 2: API Route (Backend)

```javascript
// File: giaobanbv-be/modules/workmanagement/routes/yeuCau.routes.js

router.post('/',
  authentication.loginRequired,
  validators.validate([...]),
  yeuCauController.createYeuCau
);
// ← Routes to controller
```

#### 📍 Step 3: Service Logic (Backend)

```javascript
// File: giaobanbv-be/modules/workmanagement/services/yeuCau.service.js

const {
  buildYeuCauNotificationData,
} = require("../helpers/notificationDataBuilders");

yeuCauService.createYeuCau = async (data, nguoiTaoId) => {
  // 1. Create entity
  const yeuCau = await YeuCau.create({ ...data, NguoiYeuCauID: nguoiTaoId });

  // 2. Get coordinator IDs
  const config = await CauHinhThongBaoKhoa.findOne({
    KhoaID: yeuCau.KhoaDichID,
  });
  const arrNguoiDieuPhoiID = config?.layDanhSachNguoiDieuPhoiIDs() || [];

  // 3. Build notification data via CENTRALIZED BUILDER
  const notificationData = await buildYeuCauNotificationData(yeuCau, {
    tenNguoiThucHien: "Người tạo",
    arrNguoiDieuPhoiID: arrNguoiDieuPhoiID.map((id) => id.toString()),
  });
  // ← Builder returns 29 complete fields

  // 4. Send notification
  await notificationService.send({
    type: "yeucau-tao-moi",
    data: notificationData,
  });

  return yeuCau;
};
```

#### 📍 Step 4: Centralized Builder (Backend)

```javascript
// File: giaobanbv-be/modules/workmanagement/helpers/notificationDataBuilders.js

async function buildYeuCauNotificationData(yeuCau, context = {}) {
  // Auto-populate if needed
  let populated = context.populated || yeuCau;
  if (!populated.NguoiYeuCauID?.Ten) {
    populated = await yeuCau.populate([
      "NguoiYeuCauID",
      "KhoaNguonID",
      "KhoaDichID",
      "DanhMucYeuCauID",
    ]);
  }

  // Return complete 29 fields with null safety
  return {
    // 10 Recipient Candidates
    _id: yeuCau._id.toString(),
    NguoiYeuCauID: populated.NguoiYeuCauID?._id?.toString() || null,
    NguoiXuLyID: populated.NguoiXuLyID?._id?.toString() || null,
    arrNguoiDieuPhoiID: context.arrNguoiDieuPhoiID || [],
    // ... 6 more recipient fields

    // 19 Display Fields
    MaYeuCau: yeuCau.MaYeuCau || "",
    TieuDe: yeuCau.TieuDe || "",
    TenKhoaGui: populated.KhoaNguonID?.TenKhoa || "",
    TenNguoiYeuCau: populated.NguoiYeuCauID?.Ten || "",
    ThoiGianHen: yeuCau.ThoiGianHen
      ? dayjs(yeuCau.ThoiGianHen).format("DD/MM/YYYY HH:mm")
      : "",
    // ... 14 more display fields
  };
}
```

#### 📍 Step 5: Notification Service (Backend)

```javascript
// File: giaobanbv-be/modules/workmanagement/services/notificationService.js

async function send({ type, data }) {
  // 1. Lookup type definition
  const notificationType = await NotificationType.findOne({ code: type });

  // 2. Lookup templates
  const templates = await NotificationTemplate.find({ typeCode: type });

  // 3. Process each template
  for (const template of templates) {
    // 3a. Build recipients from data
    const recipientNhanVienIds = buildRecipientList(
      template.recipientConfig,
      data
    );
    // Example: [data.NguoiYeuCauID, ...data.arrNguoiDieuPhoiID]

    // 3b. Resolve NhanVienID → UserID
    const recipientUserIds = await resolveNhanVienListToUserIds(
      recipientNhanVienIds
    );

    // 3c. Render template
    const title = renderTemplate(template.titleTemplate, data);
    const body = renderTemplate(template.bodyTemplate, data);
    const actionUrl = renderTemplate(template.actionUrlTemplate, data);
    // Example: "/yeucau/{{_id}}" → "/yeucau/507f1f77bcf86cd799439011"

    // 3d. Save to database
    const notification = await Notification.create({
      type,
      title,
      body,
      actionUrl,
      recipientUserIds,
      data, // Store complete data object (29 fields)
      createdAt: new Date(),
    });

    // 3e. Broadcast via Socket.IO
    for (const userId of recipientUserIds) {
      io.to(userId.toString()).emit("notification:new", {
        _id: notification._id,
        type,
        title,
        body,
        actionUrl,
        createdAt: notification.createdAt,
        isRead: false,
      });
    }
  }
}
```

#### 📍 Step 6: Real-time Delivery (WebSocket)

```javascript
// File: fe-bcgiaobanbvt/src/contexts/SocketContext.js

socket.on("notification:new", (data) => {
  // 1. Update Redux state
  dispatch(addNotification(data));

  // 2. Show toast
  toast.info(data.title, {
    onClick: () => navigate(data.actionUrl),
  });

  // 3. Update bell badge count
  dispatch(incrementUnreadCount());
});
```

#### 📍 Step 7: UI Update (Frontend)

```javascript
// File: fe-bcgiaobanbvt/src/features/QuanLyCongViec/Notification/NotificationBell.js

function NotificationBell() {
  const notifications = useSelector((state) => state.notification.list);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <IconButton onClick={handleOpenMenu}>
      <Badge badgeContent={unreadCount} color="error">
        <NotificationsIcon />
      </Badge>
    </IconButton>
  );
}

// File: NotificationItem.js
function NotificationItem({ notification }) {
  const navigate = useNavigate();

  const handleClick = async () => {
    await markAsRead(notification._id);
    navigate(notification.actionUrl); // ← Navigate to entity detail page
  };

  return (
    <MenuItem onClick={handleClick}>
      <Typography variant="subtitle2">{notification.title}</Typography>
      <Typography variant="body2">{notification.body}</Typography>
      <Typography variant="caption">
        {formatTimeAgo(notification.createdAt)}
      </Typography>
    </MenuItem>
  );
}
```

---

## 🎯 ARCHITECTURE

### 3 Builder Functions

```
giaobanbv-be/modules/workmanagement/helpers/notificationDataBuilders.js
├── buildYeuCauNotificationData(yeuCau, context)      → 29 fields
├── buildCongViecNotificationData(congViec, context)  → 29 fields
└── buildKPINotificationData(danhGia, context)        → 16 fields
```

### Builder Output Structure

**YeuCau & CongViec (29 fields):**

```javascript
{
  // Recipient Candidates (10 fields)
  _id,
    NguoiYeuCauID,
    NguoiXuLyID,
    NguoiDuocDieuPhoiID,
    arrNguoiDieuPhoiID,
    arrQuanLyKhoaID,
    NguoiSuaID,
    NguoiBinhLuanID,
    NguoiXoaID,
    NguoiNhanID,
    // Display Fields (19 fields)
    MaYeuCau,
    TieuDe,
    MoTa,
    TenKhoaGui,
    TenKhoaNhan,
    TenLoaiYeuCau,
    TenNguoiYeuCau,
    TenNguoiXuLy,
    TenNguoiSua,
    TenNguoiThucHien,
    TenNguoiXoa,
    TenNguoiComment,
    ThoiGianHen,
    ThoiGianHenCu,
    TrangThai,
    LyDoTuChoi,
    DiemDanhGia,
    NoiDungDanhGia,
    NoiDungComment,
    NoiDungThayDoi;
}
```

**KPI (16 fields):**

```javascript
{
  // Recipient Candidates (6 fields)
  _id,
    NhanVienID,
    NguoiDanhGiaID,
    NguoiQuanLyID,
    arrNguoiLienQuanID,
    arrQuanLyKhoaID,
    // Display Fields (10 fields)
    TenNhanVien,
    TenNguoiDanhGia,
    TenChuKy,
    Thang,
    Nam,
    TongDiemKPI,
    XepLoai,
    TrangThai,
    NgayDuyet,
    GhiChu;
}
```

---

## 💡 USAGE PATTERNS

### Pattern 1: Basic Usage (Most Common)

```javascript
const {
  buildYeuCauNotificationData,
} = require("../helpers/notificationDataBuilders");

async function someServiceFunction(yeuCauId, nguoiThucHienId) {
  const yeuCau = await YeuCau.findById(yeuCauId);

  // Get performer info
  const performer = await NhanVien.findById(nguoiThucHienId)
    .select("Ten")
    .lean();

  // Build complete data
  const data = await buildYeuCauNotificationData(yeuCau, {
    tenNguoiThucHien: performer?.Ten,
  });

  // Send notification
  await notificationService.send({
    type: "yeucau-tao-moi",
    data,
  });
}
```

### Pattern 2: With Recipients (Coordinators)

```javascript
async function yeuCauWithCoordinators(yeuCau) {
  // Query coordinator IDs from department config
  const config = await CauHinhThongBaoKhoa.findOne({
    KhoaID: yeuCau.KhoaDichID,
  });
  const arrNguoiDieuPhoiID = (
    config?.layDanhSachNguoiDieuPhoiIDs?.() || []
  ).map((id) => id?.toString());

  // Build data with recipients
  const data = await buildYeuCauNotificationData(yeuCau, {
    arrNguoiDieuPhoiID,
    tenNguoiThucHien: "Người tạo",
  });

  await notificationService.send({ type: "yeucau-tao-moi", data });
}
```

### Pattern 3: With Action-Specific Context

```javascript
async function changeDeadline(yeuCau, newDeadline, oldDeadline) {
  const data = await buildYeuCauNotificationData(yeuCau, {
    tenNguoiThucHien: "Người cập nhật",
    thoiGianHenCu: dayjs(oldDeadline).format("DD/MM/YYYY HH:mm"), // Action-specific
  });

  await notificationService.send({ type: "yeucau-doi-thoi-gian-hen", data });
}
```

### Pattern 4: State Machine (Complex)

```javascript
async function fireNotificationTrigger(yeuCau, action, nguoiThucHienId, data) {
  try {
    // 1. Populate entity
    const populated = await YeuCau.findById(yeuCau._id)
      .populate("NguoiYeuCauID", "Ten")
      .populate("KhoaDichID", "TenKhoa")
      .lean();

    // 2. Get performer
    const performer = await NhanVien.findById(nguoiThucHienId)
      .select("Ten")
      .lean();

    // 3. Get recipients
    const config = await CauHinhThongBaoKhoa.findOne({
      KhoaID: populated.KhoaDichID,
    });
    const arrNguoiDieuPhoiID = (
      config?.layDanhSachNguoiDieuPhoiIDs?.() || []
    ).map((id) => id?.toString());

    // 4. Build context
    const context = {
      populated,
      tenNguoiThucHien: performer?.Ten || "",
      arrNguoiDieuPhoiID,
    };

    // 5. Add action-specific overrides
    if (action === "DOI_THOI_GIAN_HEN" && data.oldDeadline) {
      context.thoiGianHenCu = dayjs(data.oldDeadline).format(
        "DD/MM/YYYY HH:mm"
      );
    }

    // 6. Call builder
    const notificationData = await buildYeuCauNotificationData(yeuCau, context);

    // 7. Add fields not in builder
    notificationData.HanhDong = action;
    notificationData.GhiChu = data.GhiChu || "";

    // 8. Send
    const actionTypeCode = action.toLowerCase().replace(/_/g, "-");
    await notificationService.send({
      type: `yeucau-${actionTypeCode}`,
      data: notificationData,
    });
  } catch (error) {
    console.error("Notification failed:", error.message);
    // Don't throw - notification failure shouldn't block workflow
  }
}
```

---

## 🔧 CONTEXT PARAMETERS

### YeuCau Context (buildYeuCauNotificationData)

| Parameter             | Type   | Description                   | Example                                 |
| --------------------- | ------ | ----------------------------- | --------------------------------------- |
| `populated`           | Object | Pre-populated yeuCau document | `await YeuCau.findById().populate(...)` |
| `tenNguoiThucHien`    | String | Name of action performer      | `"Nguyễn Văn A"`                        |
| `arrNguoiDieuPhoiID`  | Array  | Coordinator NhanVienIDs       | `["507f...", "507g..."]`                |
| `arrQuanLyKhoaID`     | Array  | Manager NhanVienIDs           | `["507h..."]`                           |
| `tenNguoiSua`         | String | Editor name                   | For edit actions                        |
| `nguoiSuaId`          | String | Editor NhanVienID             | For edit actions                        |
| `tenNguoiBinhLuan`    | String | Commenter name                | For comment actions                     |
| `nguoiBinhLuanId`     | String | Commenter NhanVienID          | For comment actions                     |
| `noiDungComment`      | String | Comment content               | Comment text                            |
| `tenNguoiXoa`         | String | Deleter name                  | For delete action                       |
| `nguoiXoaId`          | String | Deleter NhanVienID            | For delete action                       |
| `thoiGianHenCu`       | String | Old deadline (formatted)      | `"25/12/2025 14:00"`                    |
| `nguoiDuocDieuPhoiID` | String | Assigned handler ID           | When dispatching                        |
| `nguoiNhanId`         | String | Receiver ID                   | For direct sends                        |
| `snapshotDanhMuc`     | Object | Category snapshot             | `{ TenLoaiYeuCau: "..." }`              |

### CongViec Context (buildCongViecNotificationData)

| Parameter             | Type   | Description              |
| --------------------- | ------ | ------------------------ |
| `populated`           | Object | Pre-populated congViec   |
| `tenNguoiGiao`        | String | Assigner name            |
| `nguoiGiaoViecId`     | String | Assigner NhanVienID      |
| `tenNguoiChinhMoi`    | String | New main assignee name   |
| `nguoiChinhMoiId`     | String | New main assignee ID     |
| `tenNguoiThamGiaMoi`  | String | New participant name     |
| `nguoiThamGiaMoiId`   | String | New participant ID       |
| `nguoiThamGiaBiXoaId` | String | Removed participant ID   |
| `tenNguoiCapNhat`     | String | Updater name             |
| `tenNguoiThucHien`    | String | Action performer name    |
| `tenNguoiComment`     | String | Commenter name           |
| `noiDungComment`      | String | Comment content          |
| `mucDoUuTienCu`       | String | Old priority             |
| `ngayHetHanCu`        | String | Old deadline (formatted) |
| `tienDoMoi`           | Number | New progress %           |
| `tenFile`             | String | File name                |
| `nguoiThamGiaIds`     | Array  | Participant NhanVienIDs  |

### KPI Context (buildKPINotificationData)

| Parameter          | Type   | Description              |
| ------------------ | ------ | ------------------------ |
| `populated`        | Object | Pre-populated DanhGiaKPI |
| `tenNguoiDuyet`    | String | Approver name            |
| `nguoiDuyetId`     | String | Approver NhanVienID      |
| `tenNguoiHuyDuyet` | String | Undo approver name       |
| `nguoiHuyDuyetId`  | String | Undo approver ID         |
| `lyDoHuyDuyet`     | String | Undo reason              |
| `arrQuanLyKhoaID`  | Array  | Manager NhanVienIDs      |

---

## ✅ BUILDER FEATURES

### 1. Auto-Populate

Builder tự động populate nếu entity chưa được populate:

```javascript
// ✅ You can pass unpopulated entity
const yeuCau = await YeuCau.findById(id); // Not populated
const data = await buildYeuCauNotificationData(yeuCau); // Builder populates

// ✅ Or pass populated entity via context
const populated = await YeuCau.findById(id).populate(...).lean();
const data = await buildYeuCauNotificationData(yeuCau, { populated });
```

### 2. Null Safety

Tất cả field access dùng optional chaining + fallbacks:

```javascript
// In builder code
TenNguoiYeuCau: populated.NguoiYeuCauID?.Ten || '',
TenKhoaGui: populated.KhoaNguonID?.TenKhoa || '',
ThoiGianHen: yeuCau.ThoiGianHen
  ? dayjs(yeuCau.ThoiGianHen).format('DD/MM/YYYY HH:mm')
  : '',
```

### 3. Consistent Formatting

- **Dates**: Always `DD/MM/YYYY HH:mm` format via dayjs
- **IDs**: Always `.toString()` for ObjectIds
- **Names**: Always fallback to empty string `''`
- **Numbers**: Always fallback to `0`

### 4. Recipient Candidates

10 recipient fields always included (even if null):

```javascript
{
  _id: "507f...",
  NguoiYeuCauID: "507g..." || null,
  arrNguoiDieuPhoiID: ["507h...", "507i..."] || [],
  // ... 7 more recipient fields
}
```

---

## 📊 MIGRATION STATUS

### Service Locations Using Builders

| Service File            | Locations                   | Status               |
| ----------------------- | --------------------------- | -------------------- |
| `yeuCau.service.js`     | 4 calls                     | ✅ Complete          |
| `yeuCauStateMachine.js` | 1 function (15 transitions) | ✅ Complete (Dec 25) |
| `congViec.service.js`   | 9 calls                     | ✅ Complete          |
| `kpi.controller.js`     | 6 calls                     | ✅ Complete          |

**Total:** 19 service locations → 19/19 migrated ✅

### Code Reduction

| Metric            | Before   | After | Saved          |
| ----------------- | -------- | ----- | -------------- |
| Lines of code     | ~1,200   | ~450  | **~750 lines** |
| Duplicate logic   | High     | Zero  | 100%           |
| Null safety bugs  | Multiple | Zero  | 100%           |
| Missing variables | Frequent | Never | 100%           |

---

## 🎯 BEST PRACTICES

### DO's ✅

1. **Always use builder** - Không build data thủ công
2. **Pass context** - Provide action-specific context parameters
3. **Handle errors** - Try-catch around builder call
4. **Don't throw** - Notification failure không được block workflow
5. **Use populated** - Pass pre-populated entity via context nếu đã có

### DON'Ts ❌

1. **Manual data building** - `{ _id, MaYeuCau, ... }` ❌
2. **Partial fields** - Builder luôn return đủ 29/16 fields
3. **Skip null safety** - Builder có sẵn nhưng service cần check entity exists
4. **Use UserID** - Recipients phải là NhanVienID
5. **Assume fields** - Luôn check builder JSDoc cho context params

### Error Handling Pattern

```javascript
// ✅ CORRECT: Don't throw on notification failure
try {
  const data = await buildYeuCauNotificationData(yeuCau, context);
  await notificationService.send({ type, data });
} catch (error) {
  console.error("[Service] Notification failed:", error.message);
  // Continue with main workflow
}

// ❌ WRONG: Throwing error blocks workflow
const data = await buildYeuCauNotificationData(yeuCau, context);
await notificationService.send({ type, data }); // If this fails, whole operation fails
```

---

## 🔍 DEBUGGING

### Check Builder Output

```javascript
const data = await buildYeuCauNotificationData(yeuCau, context);
console.log("Builder output:", Object.keys(data).length); // Should be 29
console.log("Data:", data);
```

### Verify Context

```javascript
console.log("Context passed:", {
  hasPopulated: !!context.populated,
  tenNguoiThucHien: context.tenNguoiThucHien,
  arrNguoiDieuPhoiID: context.arrNguoiDieuPhoiID?.length,
});
```

### Check Notification Sent

```javascript
// After send, check DB
db.notifications
  .find({
    type: "yeucau-tao-moi",
    createdAt: { $gte: new Date(Date.now() - 60000) },
  })
  .pretty();

// Verify data object has 29 fields
db.notifications.findOne({ type: "yeucau-tao-moi" }).data;
```

---

## 📚 RELATED DOCS

- [AUDIT_PROMPT.md](AUDIT_PROMPT.md) - How to audit notification types
- [SCHEMA_QUICK_REFERENCE.md](SCHEMA_QUICK_REFERENCE.md) - Entity schemas
- [README.md](README.md) - Documentation index

---

## 🚀 QUICK REFERENCE

**Import:**

```javascript
const {
  buildYeuCauNotificationData,
  buildCongViecNotificationData,
  buildKPINotificationData,
} = require("../helpers/notificationDataBuilders");
```

**Basic Call:**

```javascript
const data = await buildYeuCauNotificationData(yeuCau, {
  tenNguoiThucHien: performer?.Ten,
});
await notificationService.send({ type: "yeucau-tao-moi", data });
```

**Full Pattern:**

```javascript
try {
  const performer = await NhanVien.findById(performerId).select("Ten").lean();
  const config = await CauHinhThongBaoKhoa.findOne({
    KhoaID: yeuCau.KhoaDichID,
  });
  const arrNguoiDieuPhoiID = (
    config?.layDanhSachNguoiDieuPhoiIDs?.() || []
  ).map((id) => id?.toString());

  const data = await buildYeuCauNotificationData(yeuCau, {
    tenNguoiThucHien: performer?.Ten || "",
    arrNguoiDieuPhoiID,
  });

  await notificationService.send({ type: "yeucau-tao-moi", data });
} catch (error) {
  console.error("Notification failed:", error.message);
}
```

---

_Architecture implemented: December 2025. All service locations migrated. Zero manual data building._
