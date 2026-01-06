# 🔒 Real-time & Reliability Improvements - Ticket System

**Version:** 1.0.0  
**Date:** December 26, 2025  
**Priority:** 🟡 MEDIUM - System Stability  
**Estimated Effort:** 6-8 ngày

---

## 🎯 Mục Tiêu

Tăng độ tin cậy và tính chặt chẽ của hệ thống thông qua:

- ✅ MongoDB Transactions cho data consistency
- ✅ Notification retry mechanism với Dead Letter Queue
- ✅ Optimistic UI updates với automatic rollback
- ✅ Rate limit visibility (user biết còn bao nhiêu lần)
- ✅ Conflict resolution UI cho version conflicts
- ✅ SLA warning system với auto-escalation
- ✅ Enhanced audit trail với change visualization

---

## 📋 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    RELIABILITY ARCHITECTURE                      │
└─────────────────────────────────────────────────────────────────┘

[User Action]
     │
     ▼
┌─────────────────────────┐
│  Optimistic Update (UI) │ ← Instant feedback
└────────┬────────────────┘
         │
         ▼
┌────────────────────────────────────────────┐
│  MongoDB Transaction Session               │
│  ┌──────────────────────────────────────┐  │
│  │ 1. Update YeuCau                     │  │
│  │ 2. Create Notification               │  │
│  │ 3. Update Badge Counts               │  │
│  │ 4. Add to Audit Log                  │  │
│  └──────────────────────────────────────┘  │
│        ├─ SUCCESS → Commit               │
│        └─ ERROR → Rollback               │
└────────┬───────────────────────────────────┘
         │
         ├─ SUCCESS ─────────────────────────► UI Sync
         │
         └─ ERROR ───┐
                     ▼
           ┌─────────────────────┐
           │  Notification Queue │
           │  (Redis + MongoDB)  │
           └─────────┬───────────┘
                     │
         ┌───────────┴──────────────┐
         │                          │
    Retry (3x)              Dead Letter Queue
    Exponential              Manual Review
    Backoff
```

---

## 1️⃣ MongoDB Transaction Wrapper

### Vấn Đề Hiện Tại

**Scenario:** User tiếp nhận yêu cầu

```javascript
// Current code (NO transaction)
async function tiepNhan(yeuCauId, data) {
  // Step 1: Update YeuCau
  const yeuCau = await YeuCau.findByIdAndUpdate(yeuCauId, {
    TrangThai: "DANG_XU_LY",
    NguoiXuLyID: data.NguoiXuLyID,
    ThoiGianHen: data.ThoiGianHen
  });

  // Step 2: Create notification
  await Notification.create({ ... }); // ❌ If this fails, YeuCau already updated!

  // Step 3: Update badge counts
  await BadgeCount.updateOne({ ... }); // ❌ If this fails, inconsistent state
}
```

**Problem:** Nếu Step 2 hoặc 3 fail → **partial update** → data inconsistency

---

### Giải Pháp: Transaction Wrapper

**File:** `giaobanbv-be/helpers/transactionHelper.js`

```javascript
const mongoose = require("mongoose");

/**
 * Execute function within MongoDB transaction
 * Auto-retry on transient errors
 */
async function withTransaction(fn, options = {}) {
  const session = await mongoose.startSession();

  const {
    maxRetries = 3,
    retryDelay = 100, // ms
  } = options;

  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      session.startTransaction({
        readConcern: { level: "snapshot" },
        writeConcern: { w: "majority" },
        readPreference: "primary",
      });

      // Execute user function
      const result = await fn(session);

      // Commit transaction
      await session.commitTransaction();

      console.log(
        `[Transaction] Committed successfully (attempt ${attempt + 1})`
      );

      return result;
    } catch (error) {
      // Abort transaction
      await session.abortTransaction();

      // Check if error is retryable
      if (isRetryableError(error) && attempt < maxRetries - 1) {
        attempt++;
        console.warn(
          `[Transaction] Retry ${attempt}/${maxRetries}:`,
          error.message
        );

        // Exponential backoff
        await new Promise((resolve) =>
          setTimeout(resolve, retryDelay * Math.pow(2, attempt))
        );

        continue;
      }

      // Non-retryable or max retries reached
      console.error(
        `[Transaction] Failed after ${attempt + 1} attempts:`,
        error
      );
      throw error;
    } finally {
      session.endSession();
    }
  }
}

/**
 * Check if error is transient and can be retried
 */
function isRetryableError(error) {
  const retryableErrors = [
    "TransientTransactionError",
    "WriteConflict",
    "LockTimeout",
    "NetworkTimeout",
  ];

  return retryableErrors.some(
    (errType) =>
      error.errorLabels?.includes(errType) || error.message?.includes(errType)
  );
}

/**
 * Execute multiple transactions in sequence
 * If any fails, all are rolled back
 */
async function withSequentialTransactions(transactionFns) {
  const results = [];
  const sessions = [];

  try {
    // Execute all transactions
    for (const fn of transactionFns) {
      const session = await mongoose.startSession();
      sessions.push(session);

      session.startTransaction();
      const result = await fn(session);
      results.push(result);
    }

    // Commit all
    await Promise.all(sessions.map((s) => s.commitTransaction()));

    return results;
  } catch (error) {
    // Rollback all
    await Promise.all(sessions.map((s) => s.abortTransaction()));
    throw error;
  } finally {
    sessions.forEach((s) => s.endSession());
  }
}

module.exports = {
  withTransaction,
  withSequentialTransactions,
};
```

### Usage in State Machine

**File:** `giaobanbv-be/modules/workmanagement/services/yeuCauStateMachine.js`

```javascript
const { withTransaction } = require("../../../helpers/transactionHelper");

async function executeTransition(yeuCauId, action, data, nguoiThucHienId) {
  return await withTransaction(
    async (session) => {
      // Step 1: Validate and get YeuCau
      const yeuCau = await YeuCau.findById(yeuCauId).session(session);

      if (!yeuCau) {
        throw new AppError(404, "Yêu cầu không tồn tại", "NOT_FOUND");
      }

      // Step 2: Validate transition
      const transition = TRANSITIONS[yeuCau.TrangThai]?.[action];
      if (!transition) {
        throw new AppError(400, "Hành động không hợp lệ", "INVALID_ACTION");
      }

      // Step 3: Check permission
      const hasPermission = await checkPermission(
        yeuCau,
        action,
        nguoiThucHienId
      );
      if (!hasPermission) {
        throw new AppError(403, "Không có quyền thực hiện", "FORBIDDEN");
      }

      // Step 4: Apply side effects and update YeuCau
      const updates = await applySideEffects(yeuCau, transition, data);

      Object.assign(yeuCau, updates);
      yeuCau.TrangThai = transition.nextState;

      await yeuCau.save({ session });

      // Step 5: Create history record
      await LichSuYeuCau.create(
        [
          {
            YeuCauID: yeuCau._id,
            HanhDong: transition.hanhDong,
            NguoiThucHienID: nguoiThucHienId,
            NoiDung: data.GhiChu || "",
            DuLieuCu: yeuCau.toObject(),
            DuLieuMoi: updates,
          },
        ],
        { session }
      );

      // Step 6: Create notification
      if (transition.notificationType) {
        const recipients = getNotificationRecipients(yeuCau, action);
        const notificationData = buildYeuCauNotificationData(
          yeuCau,
          transition.notificationType,
          data
        );

        await notificationService.send(recipients, notificationData, {
          session,
        });
      }

      // Step 7: Update badge counts
      await updateBadgeCounts(yeuCau, transition, { session });

      // All steps succeeded → transaction will commit
      return yeuCau;
    },
    { maxRetries: 3 }
  ); // Retry transient errors
}
```

**Benefits:**

- ✅ Atomic operations: All-or-nothing
- ✅ Data consistency guaranteed
- ✅ Auto-retry transient errors
- ✅ Clean rollback on failure

---

## 2️⃣ Notification Retry Queue với Dead Letter Queue

### Architecture

```
[Notification Created]
        │
        ▼
┌─────────────────────┐
│  Primary Queue      │
│  (Redis List)       │
└────────┬────────────┘
         │
    ┌────┴────┐
    │ Worker  │
    └────┬────┘
         │
    Attempt 1 ───► SUCCESS ──────► ✅ Delivered
         │
    ❌ FAIL
         │
    Attempt 2 (after 2s) ───► SUCCESS ──────► ✅ Delivered
         │
    ❌ FAIL
         │
    Attempt 3 (after 4s) ───► SUCCESS ──────► ✅ Delivered
         │
    ❌ FAIL (Max retries)
         │
         ▼
┌─────────────────────┐
│  Dead Letter Queue  │
│  (MongoDB)          │
│  → Manual Review    │
└─────────────────────┘
```

### Implementation

**File:** `giaobanbv-be/services/notificationQueue.js`

```javascript
const Queue = require("bull");
const redis = require("../config/redis"); // Assume Redis configured
const NotificationFailure = require("../models/NotificationFailure");
const fcmService = require("./fcmService");

class NotificationQueue {
  constructor() {
    this.queue = new Queue("notifications", {
      redis: redis,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000, // Start at 2s
        },
        removeOnComplete: true,
        removeOnFail: false, // Keep failed jobs for DLQ
      },
    });

    this.setupWorker();
  }

  /**
   * Add notification to queue
   */
  async add(notification) {
    const job = await this.queue.add(notification, {
      priority: notification.priority === "urgent" ? 1 : 10,
    });

    console.log(`[NotificationQueue] Queued job ${job.id}`);
    return job.id;
  }

  /**
   * Setup worker to process queue
   */
  setupWorker() {
    this.queue.process(async (job) => {
      const { recipients, data, type } = job.data;

      console.log(
        `[NotificationQueue] Processing job ${job.id}, attempt ${
          job.attemptsMade + 1
        }`
      );

      try {
        // Send via FCM
        if (type === "push") {
          const result = await fcmService.sendToUsers(recipients, data);

          if (result.failed > 0) {
            throw new Error(`Failed to send to ${result.failed} users`);
          }
        }

        // Send via Socket.IO
        if (type === "socket" || type === "both") {
          // Existing Socket.IO logic
          // socketService.emit(recipients, data);
        }

        console.log(`[NotificationQueue] Job ${job.id} completed`);
      } catch (error) {
        console.error(`[NotificationQueue] Job ${job.id} failed:`, error);

        // If max retries reached, move to DLQ
        if (job.attemptsMade >= 2) {
          await this.moveToDLQ(job, error);
        }

        throw error; // Re-throw to trigger Bull retry
      }
    });

    // Handle failed jobs
    this.queue.on("failed", async (job, error) => {
      console.error(
        `[NotificationQueue] Job ${job.id} permanently failed:`,
        error
      );
    });

    // Monitor queue health
    this.queue.on("error", (error) => {
      console.error("[NotificationQueue] Queue error:", error);
    });
  }

  /**
   * Move failed notification to Dead Letter Queue
   */
  async moveToDLQ(job, error) {
    try {
      await NotificationFailure.create({
        JobID: job.id,
        Recipients: job.data.recipients,
        NotificationData: job.data.data,
        Type: job.data.type,
        Attempts: job.attemptsMade + 1,
        LastError: error.message,
        FailedAt: new Date(),
        Status: "pending_review",
      });

      console.log(`[NotificationQueue] Moved job ${job.id} to DLQ`);

      // Alert admin
      // alertAdmin(`Notification ${job.id} failed permanently`);
    } catch (dlqError) {
      console.error("[NotificationQueue] Failed to move to DLQ:", dlqError);
    }
  }

  /**
   * Retry notifications from DLQ
   */
  async retryDLQ(failureId) {
    const failure = await NotificationFailure.findById(failureId);

    if (!failure) {
      throw new Error("Failure record not found");
    }

    // Re-add to queue
    const jobId = await this.add({
      recipients: failure.Recipients,
      data: failure.NotificationData,
      type: failure.Type,
      priority: "urgent", // Prioritize manual retries
    });

    // Update DLQ record
    failure.Status = "retrying";
    failure.RetriedAt = new Date();
    failure.RetryJobID = jobId;
    await failure.save();

    return jobId;
  }

  /**
   * Get queue stats
   */
  async getStats() {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.queue.getWaitingCount(),
      this.queue.getActiveCount(),
      this.queue.getCompletedCount(),
      this.queue.getFailedCount(),
      this.queue.getDelayedCount(),
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + completed + failed + delayed,
    };
  }
}

module.exports = new NotificationQueue();
```

**NotificationFailure Model:**

```javascript
// giaobanbv-be/models/NotificationFailure.js
const mongoose = require("mongoose");

const notificationFailureSchema = new mongoose.Schema(
  {
    JobID: String,
    Recipients: [{ type: mongoose.Schema.ObjectId, ref: "NhanVien" }],
    NotificationData: mongoose.Schema.Types.Mixed,
    Type: { type: String, enum: ["push", "socket", "both"] },
    Attempts: Number,
    LastError: String,
    FailedAt: Date,
    Status: {
      type: String,
      enum: ["pending_review", "retrying", "resolved", "ignored"],
      default: "pending_review",
    },
    RetriedAt: Date,
    RetryJobID: String,
    ResolvedAt: Date,
    Notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "NotificationFailure",
  notificationFailureSchema
);
```

---

## 3️⃣ Optimistic UI Updates với Rollback

### Frontend Implementation

**File:** `fe-bcgiaobanbvt/src/features/QuanLyCongViec/Ticket/yeuCauSlice.js`

```javascript
// Enhanced slice with optimistic updates
const slice = createSlice({
  name: "yeuCau",
  initialState: {
    // ... existing state
    optimisticUpdates: {}, // Map of yeuCauId → optimistic state
    rollbackData: {}, // Map of yeuCauId → original state
  },
  reducers: {
    // ... existing reducers

    // Optimistic update
    applyOptimisticUpdate: (state, action) => {
      const { yeuCauId, updates } = action.payload;

      // Store original state for rollback
      const original = state.yeuCauList.find((y) => y._id === yeuCauId);
      if (original) {
        state.rollbackData[yeuCauId] = { ...original };
      }

      // Apply optimistic update
      state.optimisticUpdates[yeuCauId] = updates;

      // Update in list
      state.yeuCauList = state.yeuCauList.map((y) =>
        y._id === yeuCauId ? { ...y, ...updates } : y
      );

      // Update detail if viewing
      if (state.yeuCauDetail?._id === yeuCauId) {
        state.yeuCauDetail = { ...state.yeuCauDetail, ...updates };
      }
    },

    // Sync with server response
    syncOptimisticUpdate: (state, action) => {
      const { yeuCauId, serverData } = action.payload;

      // Remove optimistic tracking
      delete state.optimisticUpdates[yeuCauId];
      delete state.rollbackData[yeuCauId];

      // Update with server truth
      state.yeuCauList = state.yeuCauList.map((y) =>
        y._id === yeuCauId ? serverData : y
      );

      if (state.yeuCauDetail?._id === yeuCauId) {
        state.yeuCauDetail = serverData;
      }
    },

    // Rollback on error
    rollbackOptimisticUpdate: (state, action) => {
      const { yeuCauId } = action.payload;

      const original = state.rollbackData[yeuCauId];

      if (original) {
        // Restore original state
        state.yeuCauList = state.yeuCauList.map((y) =>
          y._id === yeuCauId ? original : y
        );

        if (state.yeuCauDetail?._id === yeuCauId) {
          state.yeuCauDetail = original;
        }

        // Clean up
        delete state.optimisticUpdates[yeuCauId];
        delete state.rollbackData[yeuCauId];
      }
    },
  },
});

// Enhanced thunk with optimistic updates
export const tiepNhanYeuCau =
  (yeuCauId, data) => async (dispatch, getState) => {
    const { user } = getState().auth;

    // Step 1: Apply optimistic update
    dispatch(
      slice.actions.applyOptimisticUpdate({
        yeuCauId,
        updates: {
          TrangThai: "DANG_XU_LY",
          NguoiXuLyID: user.NhanVienID,
          ThoiGianHen: data.ThoiGianHen,
          _optimistic: true, // Flag for UI
        },
      })
    );

    // Step 2: Send to backend
    try {
      const response = await apiService.post(
        `/workmanagement/yeucau/${yeuCauId}/actions/tiep-nhan`,
        data
      );

      // Step 3: Sync with server response
      dispatch(
        slice.actions.syncOptimisticUpdate({
          yeuCauId,
          serverData: response.data.data,
        })
      );

      toast.success("Đã tiếp nhận yêu cầu");
    } catch (error) {
      // Step 4: Rollback on error
      dispatch(slice.actions.rollbackOptimisticUpdate({ yeuCauId }));

      toast.error("Tiếp nhận thất bại: " + error.message);

      // Check for version conflict
      if (error.response?.data?.error === "VERSION_CONFLICT") {
        // Show conflict resolution dialog
        dispatch(showConflictDialog({ yeuCauId }));
      }
    }
  };
```

### Visual Feedback

```jsx
// Show shimmer effect for optimistic updates
<Card
  sx={{
    opacity: yeuCau._optimistic ? 0.7 : 1,
    animation: yeuCau._optimistic
      ? 'pulse 1.5s ease-in-out infinite'
      : 'none',
  }}
>
  {/* Card content */}
</Card>

// Add CSS animation
<style>{`
  @keyframes pulse {
    0%, 100% { opacity: 0.7; }
    50% { opacity: 1; }
  }
`}</style>
```

---

## 4️⃣ Rate Limit Visibility

### Backend: Return Rate Limit Info

```javascript
// In yeuCauStateMachine.js
async function getAvailableActions(yeuCau, nguoiThucHienId) {
  const actions = [];
  const rateLimits = {};

  for (const [action, transition] of Object.entries(
    TRANSITIONS[yeuCau.TrangThai] || {}
  )) {
    // ... permission checks ...

    // Check rate limit
    if (transition.rateLimit) {
      const usage = await checkRateLimitUsage(
        yeuCau._id,
        action,
        nguoiThucHienId,
        transition.rateLimit
      );

      rateLimits[action] = {
        max: transition.rateLimit.max,
        remaining: transition.rateLimit.max - usage.count,
        resetAt: usage.resetAt,
        used: usage.count,
      };

      if (usage.count >= transition.rateLimit.max) {
        continue; // Skip this action
      }
    }

    actions.push(action);
  }

  return { actions, rateLimits };
}

async function checkRateLimitUsage(
  yeuCauId,
  action,
  nguoiThucHienId,
  rateLimit
) {
  const { per } = rateLimit; // 'day', 'hour'

  const since = dayjs().startOf(per);

  const count = await LichSuYeuCau.countDocuments({
    YeuCauID: yeuCauId,
    HanhDong: action,
    NguoiThucHienID: nguoiThucHienId,
    createdAt: { $gte: since.toDate() },
  });

  return {
    count,
    resetAt: dayjs().endOf(per).toDate(),
  };
}
```

### Frontend: Display Rate Limits

```jsx
// In YeuCauActionButtons.js
function YeuCauActionButtons({ availableActions, rateLimits, onActionClick }) {
  return availableActions.map((action) => {
    const limit = rateLimits[action];

    return (
      <Tooltip
        title={
          limit
            ? `Còn ${limit.remaining}/${limit.max} lần (reset ${dayjs(
                limit.resetAt
              ).fromNow()})`
            : undefined
        }
      >
        <Button
          onClick={() => onActionClick(action)}
          disabled={limit && limit.remaining === 0}
        >
          {ACTION_CONFIG[action].label}
          {limit && ` (${limit.remaining}/${limit.max})`}
        </Button>
      </Tooltip>
    );
  });
}
```

---

## 5️⃣ Conflict Resolution UI

```jsx
// ConflictResolutionDialog.jsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import ReactDiffViewer from "react-diff-viewer";

export default function ConflictResolutionDialog({
  open,
  localVersion,
  serverVersion,
  onResolve,
  onClose,
}) {
  const handleUseServer = () => {
    onResolve(serverVersion);
  };

  const handleRetry = () => {
    // Retry with local changes on top of server version
    const merged = { ...serverVersion, ...localVersion };
    onResolve(merged);
  };

  const handleManualMerge = () => {
    // Show detailed merge UI
    // ...
  };

  return (
    <Dialog open={open} maxWidth="md" fullWidth>
      <DialogTitle>⚠️ Conflict Detected</DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Dữ liệu đã được cập nhật bởi người khác. Chọn phiên bản để tiếp tục:
        </Typography>

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Thay đổi:
          </Typography>

          <ReactDiffViewer
            oldValue={JSON.stringify(serverVersion, null, 2)}
            newValue={JSON.stringify(localVersion, null, 2)}
            splitView={true}
            leftTitle="Server (hiện tại)"
            rightTitle="Của bạn"
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={handleUseServer} variant="outlined">
          Dùng phiên bản Server
        </Button>
        <Button onClick={handleRetry} variant="contained" color="primary">
          Thử lại với dữ liệu mới
        </Button>
      </DialogActions>
    </Dialog>
  );
}
```

---

## 6️⃣ SLA Warning System + Auto-Escalation

### Backend: Cron Job

```javascript
// giaobanbv-be/jobs/slaWarningJob.js
const cron = require("node-cron");
const YeuCau = require("../modules/workmanagement/models/YeuCau");
const notificationService = require("../modules/workmanagement/services/notificationService");
const dayjs = require("dayjs");

class SLAWarningJob {
  start() {
    // Run every 15 minutes
    cron.schedule("*/15 * * * *", async () => {
      console.log("[SLAWarningJob] Running...");
      await this.checkDeadlines();
    });
  }

  async checkDeadlines() {
    const now = dayjs();

    // Find tickets approaching deadline (next 2 hours)
    const warningThreshold = now.add(2, "hour").toDate();

    const approachingDeadline = await YeuCau.find({
      TrangThai: { $in: ["MOI", "DANG_XU_LY"] },
      ThoiGianHen: {
        $exists: true,
        $gte: now.toDate(),
        $lte: warningThreshold,
      },
      LastSLAWarningAt: {
        $not: { $gte: now.subtract(2, "hour").toDate() }, // Don't spam
      },
    }).populate("NguoiXuLyID NguoiDuocDieuPhoiID");

    for (const yeuCau of approachingDeadline) {
      await this.sendWarning(yeuCau);
    }

    // Find overdue tickets
    const overdue = await YeuCau.find({
      TrangThai: { $in: ["MOI", "DANG_XU_LY"] },
      ThoiGianHen: { $lt: now.toDate() },
      IsEscalated: { $ne: true },
    }).populate("NguoiXuLyID KhoaDichID");

    for (const yeuCau of overdue) {
      await this.escalate(yeuCau);
    }
  }

  async sendWarning(yeuCau) {
    const hoursRemaining = dayjs(yeuCau.ThoiGianHen).diff(
      dayjs(),
      "hour",
      true
    );

    const recipient = yeuCau.NguoiXuLyID || yeuCau.NguoiDuocDieuPhoiID;

    if (!recipient) return;

    await notificationService.send([recipient._id], {
      type: "YEUCAU_SLA_WARNING",
      title: "⏰ Yêu cầu sắp đến hạn",
      message: `YC #${yeuCau.MaYeuCau} còn ${Math.ceil(hoursRemaining)} giờ`,
      actionUrl: `/yeu-cau/${yeuCau._id}`,
      priority: "urgent",
      yeuCauId: yeuCau._id,
    });

    // Update warning timestamp
    yeuCau.LastSLAWarningAt = new Date();
    await yeuCau.save();

    console.log(`[SLAWarningJob] Warning sent for YC ${yeuCau.MaYeuCau}`);
  }

  async escalate(yeuCau) {
    // Get managers of destination department
    const managers = await CauHinhThongBaoKhoa.findOne({
      KhoaID: yeuCau.KhoaDichID,
    }).populate("DanhSachQuanLyKhoa");

    if (!managers || !managers.DanhSachQuanLyKhoa.length) {
      console.warn(`[SLAWarningJob] No managers found for ${yeuCau.MaYeuCau}`);
      return;
    }

    const hoursOverdue = dayjs().diff(yeuCau.ThoiGianHen, "hour", true);

    await notificationService.send(
      managers.DanhSachQuanLyKhoa.map((m) => m._id),
      {
        type: "YEUCAU_ESCALATED",
        title: "🚨 Yêu cầu quá hạn - Cần can thiệp",
        message: `YC #${yeuCau.MaYeuCau} đã quá hạn ${Math.ceil(
          hoursOverdue
        )} giờ`,
        actionUrl: `/yeu-cau/${yeuCau._id}`,
        priority: "urgent",
        yeuCauId: yeuCau._id,
      }
    );

    // Mark as escalated
    yeuCau.IsEscalated = true;
    yeuCau.EscalatedAt = new Date();
    await yeuCau.save();

    console.log(`[SLAWarningJob] Escalated YC ${yeuCau.MaYeuCau} to managers`);
  }
}

module.exports = new SLAWarningJob();
```

**Start job in app.js:**

```javascript
const slaWarningJob = require("./jobs/slaWarningJob");
slaWarningJob.start();
```

---

## ✅ Implementation Checklist

**Day 1-2: Transaction Wrapper**

- [ ] Create transactionHelper.js
- [ ] Update yeuCauStateMachine.js
- [ ] Test commit/rollback scenarios
- [ ] Load test transactions

**Day 3-4: Notification Retry**

- [ ] Setup Bull queue (requires Redis)
- [ ] Create notificationQueue.js
- [ ] Create NotificationFailure model
- [ ] Add retry logic
- [ ] Test DLQ workflow

**Day 5: Optimistic UI**

- [ ] Add optimistic reducers to slice
- [ ] Update thunks with optimistic logic
- [ ] Add visual feedback
- [ ] Test rollback scenarios

**Day 6: Rate Limit & Conflict**

- [ ] Add rate limit info to backend
- [ ] Display rate limits in UI
- [ ] Create ConflictResolutionDialog
- [ ] Test conflict scenarios

**Day 7-8: SLA System**

- [ ] Create slaWarningJob.js
- [ ] Test warning logic
- [ ] Test escalation logic
- [ ] Add cron monitoring

---

**Next:** [04_ANALYTICS_MONITORING.md](./04_ANALYTICS_MONITORING.md)
