# 📅 Integration Guide - Agenda.js Deadline Implementation Plan

> **🎉 IMPLEMENTATION COMPLETE** - All 10 steps completed on Nov 28, 2025

## 📋 TABLE OF CONTENTS

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Implementation Steps](#implementation-steps)
4. [Files Reference](#files-reference)
5. [Testing Guide](#testing-guide)
6. [Rollback Plan](#rollback-plan)

---

## 📌 OVERVIEW

### Mục tiêu

Implement hệ thống tự động gửi notification khi:

- **Sắp đến hạn** (`DEADLINE_APPROACHING`): Tại thời điểm `NgayCanhBao`
- **Quá hạn** (`DEADLINE_OVERDUE`): Tại thời điểm `NgayHetHan`

### Quyết định đã confirm

| #   | Quyết định               | Giá trị                                                    |
| --- | ------------------------ | ---------------------------------------------------------- |
| 1   | SAP_QUA_HAN gửi mấy lần? | **1 lần duy nhất**                                         |
| 2   | QUA_HAN gửi mấy lần?     | **1 lần duy nhất**                                         |
| 3   | Gửi cho ai?              | **Tất cả** (NguoiChinhID + NguoiGiaoViecID + NguoiThamGia) |

### Tech Stack

```
┌─────────────────────────────────────────┐
│           AGENDA.JS STACK               │
├─────────────────────────────────────────┤
│  Package: agenda (npm)                  │
│  Storage: MongoDB (agendaJobs)          │
│  Integration: TriggerService            │
│  Notification: Socket.IO + FCM          │
└─────────────────────────────────────────┘
```

---

## ✅ IMPLEMENTATION STATUS

| Step | Description                            | Status | File(s)                                               |
| ---- | -------------------------------------- | ------ | ----------------------------------------------------- |
| 1    | Install agenda package                 | ✅     | `npm install agenda`                                  |
| 2    | Add tracking fields to CongViec        | ✅     | `models/CongViec.js`                                  |
| 3    | Create AgendaService                   | ✅     | `services/agendaService.js`                           |
| 4    | Create Deadline Job Handlers           | ✅     | `jobs/deadlineJobs.js`                                |
| 5    | Add Trigger Configs                    | ✅     | `config/notificationTriggers.js`                      |
| 6    | Add Deadline Handler to TriggerService | ✅     | `services/triggerService.js`                          |
| 7    | Create deadlineScheduler helper        | ✅     | `modules/workmanagement/helpers/deadlineScheduler.js` |
| 8    | Integrate with congViec.service        | ✅     | `modules/workmanagement/services/congViec.service.js` |
| 9    | Update bin/www                         | ✅     | `bin/www`                                             |
| 10   | Create Migration Script                | ✅     | `scripts/migrateDeadlineJobs.js`                      |

---

## ✅ PREREQUISITES

### Đã có sẵn

| #   | Component                          | Status | Location                                   |
| --- | ---------------------------------- | ------ | ------------------------------------------ |
| 1   | MongoDB                            | ✅     | Existing                                   |
| 2   | TriggerService                     | ✅     | `services/triggerService.js`               |
| 3   | NotificationService                | ✅     | `modules/workmanagement/services/`         |
| 4   | CongViec model với deadline fields | ✅     | `modules/workmanagement/models/`           |
| 5   | Notification templates             | ✅     | `DEADLINE_APPROACHING`, `DEADLINE_OVERDUE` |

### Cần thêm vào CongViec model

```javascript
// Tracking fields để chống duplicate
ApproachingNotifiedAt: { type: Date, default: null },
OverdueNotifiedAt: { type: Date, default: null },
```

---

## 🚀 IMPLEMENTATION STEPS

### Phase 12: Agenda Deadline Scheduler

#### Step 1: Install Dependencies ✅

```bash
cd giaobanbv-be
npm install agenda
```

**Verify:**

```bash
npm list agenda
# agenda@5.x.x
```

---

#### Step 2: Add Tracking Fields to CongViec Model ✅

**File:** `modules/workmanagement/models/CongViec.js`

**Add fields:**

```javascript
// Trong schema definition, thêm:
ApproachingNotifiedAt: {
  type: Date,
  default: null,
  description: "Thời điểm gửi thông báo sắp đến hạn"
},
OverdueNotifiedAt: {
  type: Date,
  default: null,
  description: "Thời điểm gửi thông báo quá hạn"
},
```

---

#### Step 3: Create AgendaService

**File:** `giaobanbv-be/services/agendaService.js`

```javascript
/**
 * Agenda.js Service - Job Scheduling
 */
const Agenda = require("agenda");

class AgendaService {
  constructor() {
    this.agenda = null;
    this.isReady = false;
  }

  async init(mongoUri) {
    if (this.agenda) {
      console.log("[AgendaService] Already initialized");
      return;
    }

    this.agenda = new Agenda({
      db: {
        address: mongoUri,
        collection: "agendaJobs",
        options: { useUnifiedTopology: true },
      },
      processEvery: "30 seconds",
      maxConcurrency: 10,
      defaultConcurrency: 5,
    });

    this.agenda.on("ready", () => {
      console.log("[AgendaService] ✅ Connected to MongoDB");
      this.isReady = true;
    });

    this.agenda.on("error", (err) => {
      console.error("[AgendaService] ❌ Error:", err);
    });

    // Define jobs
    this._defineJobs();

    await this.agenda.start();
    console.log("[AgendaService] ✅ Started processing jobs");
  }

  _defineJobs() {
    const { defineDeadlineJobs } = require("../jobs/deadlineJobs");
    defineDeadlineJobs(this.agenda);
  }

  async schedule(when, jobName, data) {
    if (!this.agenda) {
      console.error("[AgendaService] Not initialized");
      return null;
    }
    const job = await this.agenda.schedule(when, jobName, data);
    console.log(`[AgendaService] Scheduled "${jobName}" at ${when}`);
    return job;
  }

  async cancel(query) {
    if (!this.agenda) return 0;
    const numRemoved = await this.agenda.cancel(query);
    if (numRemoved > 0) {
      console.log(`[AgendaService] Cancelled ${numRemoved} jobs`);
    }
    return numRemoved;
  }

  getAgenda() {
    return this.agenda;
  }

  async stop() {
    if (this.agenda) {
      await this.agenda.stop();
      console.log("[AgendaService] Stopped");
    }
  }
}

module.exports = new AgendaService();
```

---

#### Step 4: Create Deadline Job Handlers

**File:** `giaobanbv-be/jobs/deadlineJobs.js`

```javascript
/**
 * Deadline Job Definitions
 */
const { CongViec } = require("../modules/workmanagement/models");
const triggerService = require("../services/triggerService");

function defineDeadlineJobs(agenda) {
  // deadline-approaching
  agenda.define(
    "deadline-approaching",
    {
      lockLifetime: 5 * 60 * 1000,
      concurrency: 5,
    },
    async (job) => {
      const { taskId, taskCode } = job.attrs.data;
      console.log(`[DeadlineJob] Processing APPROACHING: ${taskCode}`);
      await processDeadlineApproaching(taskId);
    }
  );

  // deadline-overdue
  agenda.define(
    "deadline-overdue",
    {
      lockLifetime: 5 * 60 * 1000,
      concurrency: 5,
    },
    async (job) => {
      const { taskId, taskCode } = job.attrs.data;
      console.log(`[DeadlineJob] Processing OVERDUE: ${taskCode}`);
      await processDeadlineOverdue(taskId);
    }
  );

  console.log(
    "[DeadlineJobs] ✅ Defined: deadline-approaching, deadline-overdue"
  );
}

async function processDeadlineApproaching(taskId) {
  const task = await CongViec.findById(taskId)
    .populate("NguoiChinhID", "_id")
    .populate("NguoiGiaoViecID", "_id")
    .populate("NguoiThamGia", "_id");

  if (!task) {
    console.log(`[DeadlineJob] Task ${taskId} not found`);
    return;
  }

  if (task.TrangThai === "HOAN_THANH") {
    console.log(`[DeadlineJob] Task ${task.MaCongViec} completed, skip`);
    return;
  }

  if (task.ApproachingNotifiedAt) {
    console.log(`[DeadlineJob] Task ${task.MaCongViec} already notified, skip`);
    return;
  }

  const now = new Date();
  const deadline = new Date(task.NgayHetHan);
  const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

  await triggerService.fire("CongViec.DEADLINE_APPROACHING", {
    congViec: task,
    daysLeft: Math.max(0, daysLeft),
    performerId: null,
  });

  await CongViec.findByIdAndUpdate(taskId, {
    ApproachingNotifiedAt: new Date(),
  });

  console.log(`[DeadlineJob] ✅ APPROACHING sent: ${task.MaCongViec}`);
}

async function processDeadlineOverdue(taskId) {
  const task = await CongViec.findById(taskId)
    .populate("NguoiChinhID", "_id")
    .populate("NguoiGiaoViecID", "_id")
    .populate("NguoiThamGia", "_id");

  if (!task) return;
  if (task.TrangThai === "HOAN_THANH") return;
  if (task.OverdueNotifiedAt) return;

  const now = new Date();
  const deadline = new Date(task.NgayHetHan);
  const daysOverdue = Math.floor((now - deadline) / (1000 * 60 * 60 * 24));

  await triggerService.fire("CongViec.DEADLINE_OVERDUE", {
    congViec: task,
    daysOverdue: Math.max(0, daysOverdue),
    performerId: null,
  });

  await CongViec.findByIdAndUpdate(taskId, {
    OverdueNotifiedAt: new Date(),
  });

  console.log(`[DeadlineJob] ✅ OVERDUE sent: ${task.MaCongViec}`);
}

module.exports = { defineDeadlineJobs };
```

---

#### Step 5: Add Trigger Configs

**File:** `giaobanbv-be/config/notificationTriggers.js`

**Add after KPI triggers:**

```javascript
// ═══════════════════════════════════════════════════════════════════════════
// DEADLINE (Auto-scheduled by Agenda.js) - 2 triggers
// ═══════════════════════════════════════════════════════════════════════════

"CongViec.DEADLINE_APPROACHING": {
  enabled: true,
  template: "DEADLINE_APPROACHING",
  description: "Thông báo khi công việc sắp đến hạn (auto)",
  handler: "deadline",
  recipients: "all",
  excludePerformer: false,
},

"CongViec.DEADLINE_OVERDUE": {
  enabled: true,
  template: "DEADLINE_OVERDUE",
  description: "Thông báo khi công việc quá hạn (auto)",
  handler: "deadline",
  recipients: "all",
  excludePerformer: false,
},
```

---

#### Step 6: Add Deadline Handler to TriggerService

**File:** `giaobanbv-be/services/triggerService.js`

**In `_processHandler()` switch statement, add:**

```javascript
case "deadline":
  return this._handleDeadline(context, config);
```

**Add new method:**

```javascript
/**
 * Handle deadline notifications (APPROACHING / OVERDUE)
 */
async _handleDeadline(context, config) {
  const { congViec, daysLeft, daysOverdue } = context;

  // Build recipients: all related users
  const recipientIds = new Set();

  if (congViec.NguoiChinhID) {
    const id = congViec.NguoiChinhID._id || congViec.NguoiChinhID;
    recipientIds.add(id.toString());
  }

  if (congViec.NguoiGiaoViecID) {
    const id = congViec.NguoiGiaoViecID._id || congViec.NguoiGiaoViecID;
    recipientIds.add(id.toString());
  }

  if (congViec.NguoiThamGia?.length > 0) {
    congViec.NguoiThamGia.forEach(p => {
      const id = p._id || p;
      recipientIds.add(id.toString());
    });
  }

  // Build data
  const data = {
    taskId: congViec._id.toString(),
    taskCode: congViec.MaCongViec,
    taskName: congViec.TenCongViec,
  };

  if (daysLeft !== undefined) data.daysLeft = daysLeft;
  if (daysOverdue !== undefined) data.daysOverdue = daysOverdue;

  return {
    recipientIds: Array.from(recipientIds),
    data
  };
}
```

---

#### Step 7: Create Helper Functions

**File:** `giaobanbv-be/modules/workmanagement/services/deadlineScheduler.js`

```javascript
/**
 * Deadline Job Scheduler Helper
 */
const agendaService = require("../../../services/agendaService");

/**
 * Schedule deadline jobs for a task
 */
async function scheduleDeadlineJobs(task) {
  // Cancel existing jobs
  await agendaService.cancel({ "data.taskId": task._id.toString() });

  // Skip if completed or no deadline
  if (task.TrangThai === "HOAN_THANH" || !task.NgayHetHan) {
    return;
  }

  const now = new Date();
  const jobData = {
    taskId: task._id.toString(),
    taskCode: task.MaCongViec,
  };

  // Schedule approaching (if not passed and not notified)
  if (
    task.NgayCanhBao &&
    new Date(task.NgayCanhBao) > now &&
    !task.ApproachingNotifiedAt
  ) {
    await agendaService.schedule(
      task.NgayCanhBao,
      "deadline-approaching",
      jobData
    );
  }

  // Schedule overdue (if not passed and not notified)
  if (new Date(task.NgayHetHan) > now && !task.OverdueNotifiedAt) {
    await agendaService.schedule(task.NgayHetHan, "deadline-overdue", jobData);
  }
}

/**
 * Cancel deadline jobs for a task
 */
async function cancelDeadlineJobs(taskId) {
  await agendaService.cancel({ "data.taskId": taskId.toString() });
}

module.exports = { scheduleDeadlineJobs, cancelDeadlineJobs };
```

---

#### Step 8: Integrate with congViec.service.js

**File:** `giaobanbv-be/modules/workmanagement/services/congViec.service.js`

**Add import:**

```javascript
const {
  scheduleDeadlineJobs,
  cancelDeadlineJobs,
} = require("./deadlineScheduler");
```

**Hook vào các functions:**

```javascript
// After CREATE task
const task = await CongViec.create(data);
await scheduleDeadlineJobs(task);  // ← ADD

// After UPDATE task (especially deadline fields)
const task = await CongViec.findByIdAndUpdate(...);
await scheduleDeadlineJobs(task);  // ← ADD (reschedules)

// After COMPLETE task (DUYET_HOAN_THANH transition)
await cancelDeadlineJobs(taskId);  // ← ADD

// After DELETE task
await cancelDeadlineJobs(taskId);  // ← ADD
```

---

#### Step 9: Initialize Agenda in bin/www

**File:** `giaobanbv-be/bin/www`

**Add after socketService.init():**

```javascript
// Initialize Agenda for job scheduling
const agendaService = require("../services/agendaService");
agendaService.init(process.env.MONGODB_URI);
```

**Add graceful shutdown:**

```javascript
// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down...");
  await agendaService.stop();
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
```

---

#### Step 10: Create Migration Script

**File:** `giaobanbv-be/scripts/migrateDeadlineJobs.js`

```javascript
/**
 * Migration: Schedule jobs for existing tasks
 * Run: node scripts/migrateDeadlineJobs.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const { CongViec } = require("../modules/workmanagement/models");
const agendaService = require("../services/agendaService");

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    await agendaService.init(process.env.MONGODB_URI);
    await new Promise((r) => setTimeout(r, 2000)); // Wait for Agenda

    const tasks = await CongViec.find({
      TrangThai: { $nin: ["HOAN_THANH", "HUY"] },
      NgayHetHan: { $exists: true, $ne: null },
      isDeleted: { $ne: true },
    });

    console.log(`Found ${tasks.length} active tasks`);

    let scheduled = 0;
    const now = new Date();

    for (const task of tasks) {
      const jobData = {
        taskId: task._id.toString(),
        taskCode: task.MaCongViec,
      };

      if (
        task.NgayCanhBao &&
        new Date(task.NgayCanhBao) > now &&
        !task.ApproachingNotifiedAt
      ) {
        await agendaService.schedule(
          task.NgayCanhBao,
          "deadline-approaching",
          jobData
        );
        scheduled++;
      }

      if (new Date(task.NgayHetHan) > now && !task.OverdueNotifiedAt) {
        await agendaService.schedule(
          task.NgayHetHan,
          "deadline-overdue",
          jobData
        );
        scheduled++;
      }
    }

    console.log(`✅ Scheduled ${scheduled} jobs`);
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await agendaService.stop();
    await mongoose.disconnect();
    process.exit(0);
  }
}

migrate();
```

**Add to package.json:**

```json
"scripts": {
  "migrate:deadline-jobs": "node scripts/migrateDeadlineJobs.js"
}
```

---

## 📁 FILES REFERENCE

### New Files (5)

| #   | File                               | Description              |
| --- | ---------------------------------- | ------------------------ |
| 1   | `services/agendaService.js`        | Agenda singleton service |
| 2   | `jobs/deadlineJobs.js`             | Job handlers             |
| 3   | `modules/.../deadlineScheduler.js` | Helper functions         |
| 4   | `scripts/migrateDeadlineJobs.js`   | Migration script         |
| 5   | `jobs/` folder                     | New folder               |

### Modified Files (4)

| #   | File                             | Changes                         |
| --- | -------------------------------- | ------------------------------- |
| 1   | `models/CongViec.js`             | Add tracking fields             |
| 2   | `config/notificationTriggers.js` | Add 2 deadline triggers         |
| 3   | `services/triggerService.js`     | Add deadline handler            |
| 4   | `services/congViec.service.js`   | Hook schedule/cancel            |
| 5   | `bin/www`                        | Init Agenda + graceful shutdown |
| 6   | `package.json`                   | Add migration script            |

---

## 🧪 TESTING GUIDE

### Test 1: Verify Agenda Starts

```bash
npm start
# Look for:
# [AgendaService] ✅ Connected to MongoDB
# [AgendaService] ✅ Started processing jobs
# [DeadlineJobs] ✅ Defined: deadline-approaching, deadline-overdue
```

### Test 2: Create Task with Deadline

1. Create task với `NgayHetHan` = 5 phút sau
2. Check MongoDB:

```javascript
db.agendaJobs.find({ "data.taskCode": "CV-XXX" });
// Should see 2 jobs
```

### Test 3: Verify Job Execution

1. Create task với deadline 1 phút sau
2. Wait 1 minute
3. Check console: `[DeadlineJob] ✅ OVERDUE sent`
4. Check notifications collection

### Test 4: Update Deadline

1. Update task deadline
2. Check: old jobs cancelled, new jobs created

### Test 5: Complete Task

1. Complete a task với pending deadline jobs
2. Check: jobs cancelled

---

## 🔙 ROLLBACK PLAN

### If issues occur:

1. **Disable Agenda:**

```javascript
// In bin/www, comment out:
// agendaService.init(process.env.MONGODB_URI);
```

2. **Clear pending jobs:**

```javascript
db.agendaJobs.deleteMany({});
```

3. **Remove tracking fields (optional):**

```javascript
db.congviecs.updateMany(
  {},
  {
    $unset: { ApproachingNotifiedAt: "", OverdueNotifiedAt: "" },
  }
);
```

---

## ✅ IMPLEMENTATION CHECKLIST

### Pre-Implementation

- [ ] Backup database
- [ ] Review all files to modify

### Implementation

- [ ] Install agenda package
- [ ] Add tracking fields to CongViec model
- [ ] Create agendaService.js
- [ ] Create jobs/deadlineJobs.js
- [ ] Create deadlineScheduler.js helper
- [ ] Add trigger configs
- [ ] Add deadline handler to TriggerService
- [ ] Hook into congViec.service.js
- [ ] Update bin/www
- [ ] Create migration script

### Post-Implementation

- [ ] Run migration script
- [ ] Test create task → jobs scheduled
- [ ] Test update deadline → jobs rescheduled
- [ ] Test complete task → jobs cancelled
- [ ] Test job execution → notification sent
- [ ] Monitor for 24h

---

## 📊 PROGRESS TRACKER

| Step | Description             | Status |
| ---- | ----------------------- | ------ |
| 1    | Install agenda          | ⬜     |
| 2    | Add tracking fields     | ⬜     |
| 3    | Create AgendaService    | ⬜     |
| 4    | Create Job Handlers     | ⬜     |
| 5    | Add Trigger Configs     | ⬜     |
| 6    | Add Deadline Handler    | ⬜     |
| 7    | Create Helper Functions | ⬜     |
| 8    | Integrate with service  | ⬜     |
| 9    | Update bin/www          | ⬜     |
| 10   | Migration script        | ⬜     |

---

**Last Updated:** November 28, 2025
**Version:** 1.0
