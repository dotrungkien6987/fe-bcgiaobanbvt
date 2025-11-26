# Công Việc (CongViec) - Task Management

**Version:** 3.2 (Production)  
**Last Updated:** November 2025  
**Status:** ✅ Production Ready

---

## 📋 Overview

Module **CongViec** là hệ thống quản lý công việc với workflow phức tạp, optimistic concurrency, comment threading, và file management. Module core của QuanLyCongViec system.

### Key Features

- ✅ **State Machine** - 9+ trạng thái với validation chuyển đổi
- ✅ **Optimistic Concurrency** - Version conflict detection với `If-Unmodified-Since`
- ✅ **Comment System** - Threading với lazy-loaded replies + cache
- ✅ **File Management** - Upload/delete với soft delete pattern
- ✅ **Deadline Warnings** - Configurable alerts (percentage/fixed date)
- ✅ **Role-based Actions** - Dynamic action menu theo status + role
- ✅ **Real-time Updates** - Auto-refresh on conflict

---

## 📚 Comprehensive Documentation

Module này có **15 file tài liệu chi tiết** trong folder `docs/`:

### 📖 Core Architecture

- **[architecture-overview.md](docs/architecture-overview.md)** - Tổng quan kiến trúc, tech stack, data flow
- **[state-machine.md](docs/state-machine.md)** - State transition rules, validation logic

### 🔌 API & Integration

- **[api-spec.md](docs/api-spec.md)** - Complete REST API specifications
- **[workflow-status-actions.md](docs/workflow-status-actions.md)** - Available actions by status/role
- **[optimistic-concurrency.md](docs/optimistic-concurrency.md)** - Version control với `updatedAt`

### 💬 Features

- **[comment-system.md](docs/comment-system.md)** - Threading, replies, caching
- **[file-management.md](docs/file-management.md)** - Upload, soft delete, validation
- **[deadline-warnings.md](docs/deadline-warnings.md)** - NgayCanhBao, PhanTramCanhBao

### 🎨 UI Components

- **[ui-components.md](docs/ui-components.md)** - Component tree và props
- **[forms-validation.md](docs/forms-validation.md)** - React Hook Form + Yup schemas

### 🔄 Redux

- **[redux-state-management.md](docs/redux-state-management.md)** - Slice structure, actions, thunks

### 🧪 Testing & Quality

- **[testing-guide.md](docs/testing-guide.md)** - Unit, integration, E2E test cases
- **[error-handling.md](docs/error-handling.md)** - Error types, user messages

### 📝 Development

- **[development-workflow.md](docs/development-workflow.md)** - Setup, hot reload, debugging
- **[performance-optimization.md](docs/performance-optimization.md)** - Caching, lazy loading, bundle size

---

## 🚀 Quick Start

### Access

```
URL: /quanlycongviec/cong-viec
Menu: Quản lý công việc → Danh sách công việc
Roles: All authenticated users (create) | Assignee/Creator (edit) | Manager+ (approve/reject)
```

### Basic Workflow

```
1. Create Task
   ├─ TenCongViec, MoTa, NguoiThucHien
   ├─ NgayHetHan, PhanTramCanhBao (warning config)
   └─ Status: MOI_TAO

2. Assignee Works
   ├─ BAT_DAU_LAM → DANG_THUC_HIEN
   ├─ Add comments, upload files
   └─ YEU_CAU_DUYET when done

3. Manager Reviews
   ├─ PHAN_CONG_LAI (reassign if needed)
   ├─ TU_CHOI (reject → DANG_THUC_HIEN)
   └─ PHE_DUYET (approve → HOAN_THANH)

4. Task Completed
   └─ HOAN_THANH (final state)
```

---

## 🏗️ Architecture Highlights

### Optimistic Concurrency

**Problem:** Multiple users editing same task → data loss

**Solution:** `If-Unmodified-Since` header với `updatedAt` timestamp

```javascript
// Frontend sends
headers: {
  'If-Unmodified-Since': task.updatedAt  // Last known version
}

// Backend validates
if (task.updatedAt > requestedUpdatedAt) {
  throw new AppError(409, "VERSION_CONFLICT");
}

// Frontend handles conflict
if (error.errorType === "VERSION_CONFLICT") {
  dispatch(getCongViec(id));  // Auto-refresh
  toast.warning("Dữ liệu đã thay đổi, vui lòng thử lại");
}
```

### State Machine

**9 Core States:**

- MOI_TAO, CHO_PHAN_CONG, DA_PHAN_CONG, BAT_DAU_LAM
- DANG_THUC_HIEN, YEU_CAU_DUYET, TU_CHOI, PHE_DUYET, HOAN_THANH

**Validation:** `getAvailableActions(status, role)` determines allowed transitions

See: [docs/state-machine.md](docs/state-machine.md)

### Comment Threading

**Two-level hierarchy:**

- Parent comments (top-level)
- Replies (child comments với ParentCommentID)

**Lazy Loading:**

```javascript
// Initially load only parents
const parents = comments.filter((c) => !c.ParentCommentID);

// Load replies on demand
const replies = await fetchReplies(parentId);

// Cache in Redux
state.repliesByParent[parentId] = replies;
```

See: [docs/comment-system.md](docs/comment-system.md)

---

## 📊 Data Model

```typescript
{
  _id: ObjectId,
  TenCongViec: string,
  MoTa: string,
  TrangThai: string,              // MOI_TAO, DANG_THUC_HIEN, etc.
  NguoiTao: ObjectId,             // Creator (User._id)
  NguoiThucHien: ObjectId,        // Assignee (NhanVien._id)
  NgayBatDau: Date,
  NgayHetHan: Date,
  NgayCanhBao: Date,              // Fixed warning date
  PhanTramCanhBao: number,        // Percentage-based warning (0-100)

  // Files (separate from comment files)
  Files: [
    {
      url: string,
      fileName: string,
      fileSize: number,
      uploadedBy: ObjectId,
      uploadedAt: Date,
      isDeleted: boolean
    }
  ],

  // Comments stored in separate collection (BinhLuan)
  // Linked via: BinhLuan.CongViecID → CongViec._id

  // Version control
  updatedAt: Date,                // For optimistic locking
  createdAt: Date,
  isDeleted: boolean
}
```

---

## 🔌 Key API Endpoints

| Method | Endpoint                                     | Purpose        | Auth             |
| ------ | -------------------------------------------- | -------------- | ---------------- |
| GET    | `/api/workmanagement/cong-viec`              | List all tasks | User+            |
| GET    | `/api/workmanagement/cong-viec/:id`          | Get detail     | User+            |
| POST   | `/api/workmanagement/cong-viec`              | Create task    | User+            |
| PUT    | `/api/workmanagement/cong-viec/:id`          | Update task    | Creator/Assignee |
| PUT    | `/api/workmanagement/cong-viec/:id/status`   | Change status  | Role-dependent   |
| DELETE | `/api/workmanagement/cong-viec/:id`          | Soft delete    | Creator/Admin    |
| POST   | `/api/workmanagement/cong-viec/:id/comments` | Add comment    | User+            |
| GET    | `/api/workmanagement/cong-viec/:id/comments` | Get comments   | User+            |

**See:** [docs/api-spec.md](docs/api-spec.md) for complete specifications

---

## 🎨 Main Components

### CongViecList

- Table với search, filter, sort
- Status badges với colors
- Quick actions menu
- Pagination

### CongViecDetail

- Full task information
- Status timeline
- Action buttons (role-based)
- Comment section
- File attachments section

### CongViecForm (Create/Edit)

- React Hook Form + Yup validation
- NhanVien autocomplete
- Date pickers (NgayHetHan, NgayCanhBao)
- Warning configuration (percentage vs. fixed date)

### CommentSection

- Parent comment list
- Reply threading
- Lazy-load replies
- File attachments per comment
- Edit/delete actions

---

## 🔄 Redux Integration

**Slice:** `congViecSlice.js`

**State:**

```javascript
{
  congViecList: [],
  currentCongViec: null,
  comments: [],
  repliesByParent: {},        // Cache: { parentId: [replies] }
  filters: { trangThai, search },
  isLoading: false,
  error: null
}
```

**Key Actions:**

- `getCongViecList(filters)`
- `getCongViecDetail(id)`
- `updateCongViecStatus(id, status)` - With optimistic locking
- `addComment(congViecId, data)`
- `getReplies(parentCommentId)` - Lazy loading

**See:** [docs/redux-state-management.md](docs/redux-state-management.md)

---

## 🧪 Testing

### Critical Test Cases

1. **Optimistic Concurrency**

   - User A edits task → User B edits same task
   - Expect: B gets VERSION_CONFLICT → auto-refresh

2. **State Machine**

   - MOI_TAO → BAT_DAU_LAM (by assignee) ✅
   - MOI_TAO → PHE_DUYET (by assignee) ❌ (invalid)

3. **Comment Threading**

   - Add parent → Load replies (lazy) → Add reply
   - Cache check: Don't refetch loaded replies

4. **File Management**
   - Upload → Soft delete → Verify isDeleted=true
   - Task file vs. comment file separation

**See:** [docs/testing-guide.md](docs/testing-guide.md)

---

## ⚠️ Known Issues & Workarounds

### Issue 1: Version Conflict on Rapid Updates

**Symptom:** Multiple clicks → conflict error  
**Workaround:** Debounce submit button (300ms)

### Issue 2: Comment Reply Cache Stale

**Symptom:** New reply doesn't show until refresh  
**Workaround:** Invalidate cache on add/edit/delete reply

**See:** [docs/error-handling.md](docs/error-handling.md)

---

## 🔮 Future Enhancements

- [ ] Bulk status update (multiple tasks)
- [ ] Gantt chart view (timeline visualization)
- [ ] Task dependencies (blocking/blocked by)
- [ ] Email notifications on status change
- [ ] Mobile app (React Native)

---

## 🔗 Integration Points

### With NhiemVuThuongQuy

```javascript
// CongViec created from assigned routine duty
CongViec.NhiemVuThuongQuyID → NhiemVuThuongQuy._id
```

### With GiaoNhiemVu

```javascript
// Batch task creation via assignment
GiaoNhiemVu → Creates multiple CongViec records
```

### With Notification (Planned)

```javascript
// Emit events for notifications
workEventEmitter.emit("TASK_ASSIGNED", { congViecId, nguoiThucHien });
workEventEmitter.emit("TASK_COMPLETED", { congViecId, nguoiTao });
```

---

## 📚 Related Documentation

- **Architecture:** [../MODULE_ARCHITECTURE.md](../MODULE_ARCHITECTURE.md#1-congviec-task-management)
- **KPI Integration:** [../KPI/KPI_GUIDE.md](../KPI/KPI_GUIDE.md)
- **Notification Events:** [../Notification/NOTIFICATION_SPEC.md](../Notification/NOTIFICATION_SPEC.md)

---

## 📝 Changelog

### v3.2 (November 2025)

- ✅ Documentation restructure (moved to docs/ folder)
- ✅ Updated README with quick navigation

### v3.1 (October 2025)

- ✅ Optimistic concurrency implementation
- ✅ Comment threading with lazy loading
- ✅ File soft delete pattern

### v3.0 (September 2025)

- ✅ State machine refactor
- ✅ Role-based action validation
- ✅ Deadline warning system

---

**Maintained by:** Development Team  
**For Questions:** Check [docs/](docs/) folder first, then contact team lead

---

> **💡 Pro Tip:** This README is a quick reference. For detailed implementation, always refer to the `docs/` folder. Each doc file is self-contained and up-to-date.
