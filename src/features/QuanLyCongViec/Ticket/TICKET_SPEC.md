# 🎫 Ticket Management - Quản Lý Ticket

**Version:** 1.0 (In Development 🚧)  
**Last Updated:** November 2025  
**Status:** Planning Phase

---

## 📋 Overview

Module **Ticket** cung cấp hệ thống quản lý ticket/issue cho các vấn đề phát sinh trong quá trình thực hiện công việc, hỗ trợ theo dõi, phân loại và giải quyết vấn đề một cách có hệ thống.

### Planned Features

- 🚧 **Ticket Creation** - Tạo ticket từ task hoặc độc lập
- 🚧 **Priority Queue** - Phân loại theo mức độ ưu tiên (Urgent, High, Medium, Low)
- 🚧 **SLA Tracking** - Theo dõi thời gian phản hồi và giải quyết
- 🚧 **Ticket Workflow** - Status progression (Open → In Progress → Resolved → Closed)
- 🚧 **Assignment & Transfer** - Gán người xử lý, chuyển ticket
- 🚧 **Ticket Linking** - Liên kết với CongViec, KPI, hoặc ticket khác
- 🚧 **Resolution Tracking** - Ghi nhận giải pháp và kết quả

---

## 🏗️ Architecture Overview

### Workflow States

```
┌─────────┐
│  OPEN   │ ← New ticket created
└────┬────┘
     │ Assign to handler
     ↓
┌─────────────┐
│ IN_PROGRESS │ ← Handler starts working
└──────┬──────┘
       │ Resolve issue
       ↓
  ┌──────────┐
  │ RESOLVED │ ← Solution provided
  └────┬─────┘
       │ Requester confirms
       ↓
    ┌────────┐
    │ CLOSED │ ← Final state
    └────────┘
       │ Reopen if needed
       └──────────┐
                  │
                  ↓
             ┌─────────┐
             │ REOPENED│
             └─────────┘
```

### Tech Stack

- **Backend:** Express.js + MongoDB (Ticket model)
- **Frontend:** React + Redux + Material-UI
- **Integration:** Links to CongViec, NhanVien, KPI modules
- **SLA Engine:** Configurable response/resolution time limits

---

## 📊 Data Model (Planned)

```typescript
// Ticket schema
{
  _id: ObjectId,

  // Basic info
  MaTicket: string,              // Auto-generated: TKT-2025-001
  TieuDe: string,                // Subject line
  MoTa: string,                  // Detailed description
  LoaiTicket: string,            // "BUG", "FEATURE_REQUEST", "QUESTION", "ISSUE"

  // Priority & SLA
  MucDoUuTien: string,           // "URGENT", "HIGH", "MEDIUM", "LOW"
  ThoiGianPhanHoi: number,       // Response time in hours (SLA)
  ThoiGianGiaiQuyet: number,     // Resolution time in hours (SLA)
  NgayTao: Date,
  NgayPhanHoi: Date,             // When first responded
  NgayGiaiQuyet: Date,           // When resolved
  NgayDong: Date,                // When closed

  // People
  NguoiTao: ObjectId,            // Creator (User/NhanVien)
  NguoiXuLy: ObjectId,           // Handler (NhanVien)
  NguoiTheoDoiIDs: [ObjectId],   // Watchers

  // Status
  TrangThai: string,             // "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REOPENED"

  // Linked entities
  LienKet: {
    type: string,                // "CongViec", "DanhGiaKPI", "NhiemVuThuongQuy"
    id: ObjectId,
    tenLienKet: string           // Display name
  },

  // Resolution
  GiaiPhap: string,              // How it was solved
  NguoiGiaiQuyet: ObjectId,      // Who solved it
  DanhGia: {                     // Satisfaction rating
    sao: number,                 // 1-5 stars
    nhanXet: string,
    ngayDanhGia: Date
  },

  // Attachments
  FileDinhKem: [
    {
      tenFile: string,
      url: string,
      loaiFile: string,
      kichThuoc: number,
      nguoiTai: ObjectId,
      ngayTai: Date
    }
  ],

  // System
  isDeleted: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🚀 Planned User Workflows

### Workflow 1: Create Ticket from Task

```
User in CongViec detail page
↓
Clicks "Tạo ticket" button
↓
Pre-filled form:
  - TieuDe: [Task name]
  - LienKet: CongViec ID
  - NguoiTao: Current user
↓
User adds MoTa, MucDoUuTien
↓
Submit → Ticket created
↓
Notification sent to NguoiXuLy (if assigned)
```

### Workflow 2: Handler Resolves Ticket

```
Handler receives notification (TICKET_ASSIGNED)
↓
Opens ticket detail
↓
Changes TrangThai: OPEN → IN_PROGRESS
↓
Works on issue (adds comments, uploads files)
↓
Finds solution → Fills "GiaiPhap" field
↓
Changes TrangThai: IN_PROGRESS → RESOLVED
↓
Notification sent to NguoiTao
↓
NguoiTao reviews → Confirms or reopens
```

### Workflow 3: Monitor SLA

```
Admin opens SLA Dashboard
↓
View tickets by status:
  🔴 OVERDUE (past resolution time)
  🟡 AT_RISK (80% of time elapsed)
  🟢 ON_TRACK
↓
Filter by MucDoUuTien, NguoiXuLy
↓
Export report → Excel/PDF
```

---

## 🎨 Planned UI Components

### TicketList (Main Page)

**Location:** `src/features/QuanLyCongViec/Ticket/TicketList.js`

**Features:**

- ✅ Table with columns: MaTicket, TieuDe, MucDoUuTien, TrangThai, NguoiXuLy, NgayTao
- ✅ Color-coded priority badges (Red/Orange/Yellow/Green)
- ✅ Status badges with icons
- ✅ Search by MaTicket/TieuDe
- ✅ Filters: TrangThai, MucDoUuTien, LoaiTicket
- ✅ Quick actions: View/Edit/Close

### TicketDetail (Dialog/Page)

**Location:** `src/features/QuanLyCongViec/Ticket/TicketDetail.js`

**Features:**

- ✅ Full ticket information display
- ✅ Status timeline (created → responded → resolved → closed)
- ✅ SLA progress bar (green → yellow → red)
- ✅ Comment thread (like CongViec)
- ✅ File attachments section
- ✅ Action buttons: Assign, Transfer, Resolve, Close, Reopen

### CreateTicketButton (Form Dialog)

**Location:** `src/features/QuanLyCongViec/Ticket/CreateTicketButton.js`

**Features:**

- ✅ React Hook Form + Yup validation
- ✅ Auto-suggest TieuDe based on linked entity
- ✅ Priority selector with descriptions
- ✅ NhanVien autocomplete for NguoiXuLy
- ✅ File upload (multiple)
- ✅ Preview linked entity (if from CongViec)

### TicketSLADashboard

**Location:** `src/features/QuanLyCongViec/Ticket/TicketSLADashboard.js`

**Features:**

- ✅ Summary cards:
  - Total tickets by status
  - Overdue count (red)
  - Average resolution time
  - Satisfaction rating average
- ✅ Charts:
  - Tickets by priority (pie chart)
  - Resolution time trend (line chart)
  - Top handlers (bar chart)
- ✅ Overdue ticket list (table)

---

## 🔄 Redux State (Planned)

### ticketSlice

**Location:** `src/features/QuanLyCongViec/Ticket/ticketSlice.js`

**State Shape:**

```javascript
{
  tickets: [],
  currentTicket: null,
  filters: {
    trangThai: "all",           // all | OPEN | IN_PROGRESS | RESOLVED | CLOSED
    mucDoUuTien: "all",
    loaiTicket: "all",
    nguoiXuLy: null,
    search: ""
  },
  slaStats: {
    overdue: 0,
    atRisk: 0,
    onTrack: 0,
    avgResolutionTime: 0
  },
  isLoading: false,
  error: null
}
```

**Key Actions:**

- `getTickets(filters)` - Load with filters
- `getTicketDetail(id)` - Single ticket
- `createTicket(data)` - New ticket
- `updateTicketStatus(id, status)` - State transition
- `assignTicket(id, nguoiXuLy)` - Assign handler
- `resolveTicket(id, giaiPhap)` - Mark resolved
- `closeTicket(id)` - Close ticket
- `reopenTicket(id, lyDo)` - Reopen
- `getSLAStats()` - Dashboard metrics

---

## 🔌 API Reference (Planned)

### 1. Get Tickets

```http
GET /api/workmanagement/tickets

Query Params:
  ?trangThai=OPEN
  &mucDoUuTien=URGENT
  &nguoiXuLy=<nhanvienId>
  &page=1&limit=20

Response:
{
  "success": true,
  "data": {
    "tickets": [ ... ],
    "pagination": { ... }
  }
}
```

### 2. Create Ticket

```http
POST /api/workmanagement/tickets

Request Body:
{
  "TieuDe": "Bug: Không lưu được điểm KPI",
  "MoTa": "Khi nhập điểm tự đánh giá...",
  "LoaiTicket": "BUG",
  "MucDoUuTien": "HIGH",
  "NguoiXuLy": "<nhanvienId>",
  "LienKet": {
    "type": "DanhGiaKPI",
    "id": "<kpiId>"
  }
}

Response:
{
  "success": true,
  "data": {
    "_id": "...",
    "MaTicket": "TKT-2025-001",
    "TrangThai": "OPEN",
    ...
  },
  "message": "Tạo ticket thành công"
}
```

### 3. Update Status

```http
PUT /api/workmanagement/tickets/:id/status

Request Body:
{
  "TrangThai": "RESOLVED",
  "GiaiPhap": "Đã sửa validation logic..."
}

Response:
{
  "success": true,
  "data": { ...updated ticket... },
  "message": "Cập nhật trạng thái thành công"
}
```

### 4. Assign/Transfer

```http
PUT /api/workmanagement/tickets/:id/assign

Request Body:
{
  "NguoiXuLy": "<newHandlerId>",
  "LyDoChuyenGiao": "Thuộc chuyên môn của team khác"
}

Response:
{
  "success": true,
  "data": { ...updated ticket... },
  "message": "Chuyển giao ticket thành công"
}
```

### 5. Get SLA Statistics

```http
GET /api/workmanagement/tickets/sla-stats

Query Params:
  ?startDate=2025-01-01
  &endDate=2025-12-31

Response:
{
  "success": true,
  "data": {
    "overdue": 5,
    "atRisk": 12,
    "onTrack": 30,
    "avgResolutionTime": 36.5,  // hours
    "satisfactionAvg": 4.2       // out of 5
  }
}
```

---

## 🧪 Testing Plan

### Unit Tests

- [ ] Ticket creation logic
- [ ] Status transition validation
- [ ] SLA calculation
- [ ] Priority sorting algorithm

### Integration Tests

- [ ] Create ticket from CongViec
- [ ] Notification on assign/resolve
- [ ] SLA warning triggers
- [ ] Satisfaction rating submission

### Manual Testing Scenarios

1. **End-to-end Ticket Flow**

   - Create ticket → Assign → Resolve → Close
   - Verify notifications at each step
   - Check SLA tracking accuracy

2. **Reopen Scenario**

   - Close ticket → Requester unsatisfied → Reopen
   - Verify status history preserved
   - Check SLA timer reset logic

3. **SLA Breach**
   - Create URGENT ticket → Wait past deadline
   - Verify overdue badge appears
   - Check notification sent to admin

---

## 🔮 Implementation Roadmap

### Phase 1: Core CRUD (1 week)

- [ ] Create Ticket model + CRUD APIs
- [ ] TicketList component with filters
- [ ] CreateTicketButton + form validation
- [ ] TicketDetail view
- [ ] Redux slice with basic actions

### Phase 2: Workflow & SLA (1 week)

- [ ] Implement status state machine
- [ ] SLA calculation engine
- [ ] SLA warning notifications
- [ ] Status timeline component
- [ ] Assign/transfer functionality

### Phase 3: Integration (3 days)

- [ ] Link from CongViec detail page
- [ ] Link from KPI evaluation
- [ ] Event emitter for notifications
- [ ] Comment system (reuse from CongViec)
- [ ] File attachment handling

### Phase 4: Dashboard & Reports (3 days)

- [ ] TicketSLADashboard component
- [ ] Charts with Chart.js/Recharts
- [ ] Export to Excel/PDF
- [ ] Advanced filters & search

### Phase 5: Polish & Testing (2 days)

- [ ] Unit tests for critical paths
- [ ] Integration tests
- [ ] UI/UX refinement
- [ ] Performance optimization
- [ ] Documentation updates

---

## ⚠️ Technical Considerations

### SLA Engine Design

```javascript
// Backend: Calculate SLA status
function calculateSLAStatus(ticket) {
  const now = new Date();
  const elapsed = now - ticket.NgayTao;
  const limit = ticket.ThoiGianGiaiQuyet * 60 * 60 * 1000; // hours to ms

  if (elapsed > limit) {
    return "OVERDUE";
  } else if (elapsed > limit * 0.8) {
    return "AT_RISK";
  } else {
    return "ON_TRACK";
  }
}

// Cron job: Check SLA every hour
cron.schedule("0 * * * *", async () => {
  const atRiskTickets = await Ticket.find({
    TrangThai: { $in: ["OPEN", "IN_PROGRESS"] },
  });

  for (const ticket of atRiskTickets) {
    if (calculateSLAStatus(ticket) === "AT_RISK") {
      notificationService.emit("TICKET_SLA_WARNING", {
        ticketId: ticket._id,
        nguoiXuLy: ticket.NguoiXuLy,
      });
    }
  }
});
```

### Performance Optimization

- **Indexing:** MaTicket, TrangThai, NgayTao, NguoiXuLy
- **Pagination:** Default 20 items per page
- **Caching:** Redis cache for SLA stats (5-minute TTL)
- **Lazy Loading:** Comments/files loaded on demand

### Security

- **Authorization:** Only NguoiTao, NguoiXuLy, Admins can update
- **Audit Trail:** Track all status changes with user + timestamp
- **Input Validation:** Sanitize MoTa, GiaiPhap for XSS

---

## 🔗 Integration Points

### With CongViec

```javascript
// CongViec detail page
<CreateTicketButton
  defaultValues={{
    TieuDe: congViec.TenCongViec,
    LienKet: { type: "CongViec", id: congViec._id }
  }}
/>

// Show linked tickets in CongViec detail
<RelatedTickets congViecId={congViec._id} />
```

### With Notification

```javascript
// Emit events for notification module
workEventEmitter.emit("TICKET_ASSIGNED", {
  ticketId: ticket._id,
  nguoiXuLy: ticket.NguoiXuLy,
  mucDoUuTien: ticket.MucDoUuTien,
});

workEventEmitter.emit("TICKET_RESOLVED", {
  ticketId: ticket._id,
  nguoiTao: ticket.NguoiTao,
  giaiPhap: ticket.GiaiPhap,
});
```

---

## 📚 Related Documentation

- **Architecture:** [../ARCHITECTURE.md](../ARCHITECTURE.md)
- **CongViec Integration:** [../CongViec/docs/architecture-overview.md](../CongViec/docs/architecture-overview.md)
- **Notification Events:** [../Notification/README.md](../Notification/README.md#priority-1-events)

---

## 🐛 Known Risks & Mitigations

| Risk                  | Impact                    | Mitigation                               |
| --------------------- | ------------------------- | ---------------------------------------- |
| SLA calculation drift | Inaccurate overdue status | Use MongoDB date operations, not JS      |
| Ticket spam           | System overload           | Rate limiting + duplicate detection      |
| Incomplete resolution | Frequent reopens          | Require detailed GiaiPhap before resolve |
| Lost context          | Poor troubleshooting      | Force link to entity when created        |

---

## 📝 Developer Notes

### Before Implementation

1. ✅ Review SLA requirements with business team
2. ✅ Study CongViec comment system for reuse
3. ✅ Check notification module readiness
4. ✅ Design database indexes for performance

### Code Guidelines

- Use consistent MaTicket format: `TKT-YYYY-NNN`
- Always validate status transitions (use state machine)
- Log all SLA warnings for audit
- Handle timezone correctly (UTC in DB, local in UI)
- Write integration tests for linked entities

---

**Maintained by:** Development Team  
**Next Review:** After Notification module completion  
**Questions:** Review SLA requirements with product owner before coding

---

> **Note:** This is a planning document. Priority levels and SLA times must be confirmed with stakeholders before implementation.
