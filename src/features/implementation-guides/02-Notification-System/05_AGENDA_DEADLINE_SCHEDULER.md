# 📅 Notification System - Agenda.js Deadline Scheduler

## 📋 TABLE OF CONTENTS

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [How Agenda.js Works](#how-agendajs-works)
4. [Job Types & Flow](#job-types--flow)
5. [Implementation Guide](#implementation-guide)
6. [Integration Points](#integration-points)
7. [Migration Script](#migration-script)
8. [Troubleshooting](#troubleshooting)

---

## 📌 OVERVIEW

### What is Agenda.js?

Agenda.js là một **job scheduling library** cho Node.js sử dụng MongoDB làm backend storage:

- **Per-record scheduling**: Mỗi task có jobs riêng
- **Persistent**: Jobs survive server restarts
- **Accurate**: Trigger đúng thời điểm được schedule
- **Lightweight**: Chỉ cần MongoDB (đã có sẵn)

### Why Agenda.js for Deadline Notifications?

| Approach       | Accuracy     | Persist    | Complexity |
| -------------- | ------------ | ---------- | ---------- |
| **Cron Job**   | ±12h (daily) | ✅         | Low        |
| **Agenda.js**  | ✅ Exact     | ✅ MongoDB | Medium     |
| **Bull Queue** | ✅ Exact     | ✅ Redis   | High       |
| **setTimeout** | ✅ Exact     | ❌ Lost    | Low        |

**Agenda wins because:**

- Không cần thêm Redis (Bull yêu cầu)
- Chính xác tuyệt đối (Cron không đảm bảo)
- Persist qua restart (setTimeout không)

### Business Requirements

| Notification Type      | Frequency      | Recipients             |
| ---------------------- | -------------- | ---------------------- |
| `DEADLINE_APPROACHING` | 1 lần duy nhất | Tất cả người liên quan |
| `DEADLINE_OVERDUE`     | 1 lần duy nhất | Tất cả người liên quan |

**Recipients = NguoiChinhID + NguoiGiaoViecID + NguoiThamGia[]**

---

## 🏗️ ARCHITECTURE

### System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AGENDA.JS ARCHITECTURE                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────────────┐                                                       │
│   │   CongViec API   │                                                       │
│   │   (CRUD)         │                                                       │
│   └────────┬─────────┘                                                       │
│            │                                                                 │
│            ▼                                                                 │
│   ┌──────────────────┐     Schedule/Cancel      ┌──────────────────┐        │
│   │ congViec.service │ ──────────────────────▶  │   AgendaService  │        │
│   └──────────────────┘                          └────────┬─────────┘        │
│                                                          │                   │
│                                                          ▼                   │
│                                                 ┌──────────────────┐        │
│                                                 │    MongoDB       │        │
│                                                 │  ┌────────────┐  │        │
│                                                 │  │ agendaJobs │  │        │
│                                                 │  └────────────┘  │        │
│                                                 └────────┬─────────┘        │
│                                                          │                   │
│            ┌─────────────────────────────────────────────┘                   │
│            │ Poll & Execute                                                  │
│            ▼                                                                 │
│   ┌──────────────────┐                          ┌──────────────────┐        │
│   │  Agenda Worker   │ ──────────────────────▶  │  TriggerService  │        │
│   │  (Job Handlers)  │        Fire              └────────┬─────────┘        │
│   └──────────────────┘                                   │                   │
│                                                          ▼                   │
│                                                 ┌──────────────────┐        │
│                                                 │ NotificationSvc  │        │
│                                                 │ + Socket.IO      │        │
│                                                 └──────────────────┘        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### MongoDB Collections

```javascript
// Existing collection
congviecs: {
  _id, TenCongViec, MaCongViec,
  NgayBatDau, NgayHetHan, NgayCanhBao,  // Deadline fields
  NguoiChinhID, NguoiGiaoViecID, NguoiThamGia,
  TrangThai, ...
}

// New collection (auto-created by Agenda)
agendaJobs: {
  _id,
  name: "deadline-approaching" | "deadline-overdue",
  data: { taskId, taskCode },
  nextRunAt: Date,           // When to execute
  lockedAt: Date | null,     // Prevent duplicate execution
  lastFinishedAt: Date,
  failCount: Number,
  ...
}
```

---

## ⚙️ HOW AGENDA.JS WORKS

### Core Concepts

```
┌─────────────────────────────────────────────────────────────────┐
│                    AGENDA.JS CORE CONCEPTS                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. JOB DEFINITION                                               │
│     agenda.define('job-name', handler)                          │
│     → Đăng ký handler function cho job type                     │
│                                                                  │
│  2. JOB SCHEDULING                                               │
│     agenda.schedule(when, 'job-name', data)                     │
│     → Tạo job document trong MongoDB với nextRunAt = when       │
│                                                                  │
│  3. JOB PROCESSING                                               │
│     Agenda polls MongoDB theo interval (default 5s)             │
│     → Find jobs WHERE nextRunAt <= now AND lockedAt = null      │
│     → Lock job (set lockedAt = now)                             │
│     → Execute handler                                           │
│     → Update lastFinishedAt, clear lockedAt                     │
│                                                                  │
│  4. JOB CANCELLATION                                             │
│     agenda.cancel({ 'data.taskId': taskId })                    │
│     → Remove matching jobs from MongoDB                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Job Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                      JOB LIFECYCLE                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   SCHEDULED ──▶ QUEUED ──▶ RUNNING ──▶ COMPLETED                │
│       │            │          │            │                     │
│       │            │          │            └─▶ Job removed       │
│       │            │          │               from queue         │
│       │            │          │                                  │
│       │            │          └─▶ On Error:                      │
│       │            │              failCount++                    │
│       │            │              Retry if < maxRetries          │
│       │            │                                             │
│       │            └─▶ nextRunAt <= now                         │
│       │                                                          │
│       └─▶ Job saved to MongoDB                                  │
│           with nextRunAt = scheduled time                       │
│                                                                  │
│   CANCELLED                                                      │
│       └─▶ Job removed from MongoDB                              │
│           (when task completed/deleted)                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 JOB TYPES & FLOW

### Job Type 1: deadline-approaching

**Trigger time:** `NgayCanhBao` (computed warning date)

```
┌─────────────────────────────────────────────────────────────────┐
│                  DEADLINE APPROACHING FLOW                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   [NgayCanhBao arrives]                                         │
│           │                                                      │
│           ▼                                                      │
│   ┌─────────────────────────────────────┐                       │
│   │ 1. Fetch CongViec by taskId         │                       │
│   └─────────────────┬───────────────────┘                       │
│                     │                                            │
│                     ▼                                            │
│   ┌─────────────────────────────────────┐                       │
│   │ 2. Check: TrangThai = HOAN_THANH?   │                       │
│   └─────────────────┬───────────────────┘                       │
│                     │                                            │
│           ┌─────────┴─────────┐                                  │
│           ▼                   ▼                                  │
│        [YES]               [NO]                                  │
│           │                   │                                  │
│           ▼                   ▼                                  │
│   ┌──────────────┐   ┌─────────────────────────────────────┐    │
│   │ Skip - Done  │   │ 3. Check: ApproachingNotifiedAt?    │    │
│   └──────────────┘   └─────────────────┬───────────────────┘    │
│                                        │                         │
│                              ┌─────────┴─────────┐               │
│                              ▼                   ▼               │
│                           [EXISTS]            [NULL]             │
│                              │                   │               │
│                              ▼                   ▼               │
│                      ┌──────────────┐   ┌──────────────────┐    │
│                      │ Skip - Sent  │   │ 4. Calculate     │    │
│                      └──────────────┘   │    daysLeft      │    │
│                                         └────────┬─────────┘    │
│                                                  │               │
│                                                  ▼               │
│                                         ┌──────────────────┐    │
│                                         │ 5. TriggerService│    │
│                                         │    .fire(        │    │
│                                         │    'DEADLINE_    │    │
│                                         │    APPROACHING') │    │
│                                         └────────┬─────────┘    │
│                                                  │               │
│                                                  ▼               │
│                                         ┌──────────────────┐    │
│                                         │ 6. Update task:  │    │
│                                         │ ApproachingNoti- │    │
│                                         │ fiedAt = now     │    │
│                                         └──────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Job Type 2: deadline-overdue

**Trigger time:** `NgayHetHan` (deadline)

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEADLINE OVERDUE FLOW                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   [NgayHetHan arrives]                                          │
│           │                                                      │
│           ▼                                                      │
│   Same flow as APPROACHING, but:                                │
│   • Check OverdueNotifiedAt instead                             │
│   • Calculate daysOverdue (will be 0 on first trigger)          │
│   • Fire 'DEADLINE_OVERDUE' trigger                             │
│   • Update OverdueNotifiedAt                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Notification Data

```javascript
// DEADLINE_APPROACHING
{
  type: "DEADLINE_APPROACHING",
  data: {
    taskId: "...",
    taskCode: "CV-001",
    taskName: "Báo cáo tháng 11",
    daysLeft: 2  // Số ngày còn lại
  },
  recipients: [NguoiChinhID, NguoiGiaoViecID, ...NguoiThamGia]
}

// DEADLINE_OVERDUE
{
  type: "DEADLINE_OVERDUE",
  data: {
    taskId: "...",
    taskCode: "CV-001",
    taskName: "Báo cáo tháng 11",
    daysOverdue: 0  // Số ngày quá hạn (0 = vừa quá)
  },
  recipients: [NguoiChinhID, NguoiGiaoViecID, ...NguoiThamGia]
}
```

---

## 🔧 IMPLEMENTATION GUIDE

### File Structure

```
giaobanbv-be/
├── services/
│   └── agendaService.js           [NEW] - Agenda singleton
├── jobs/
│   └── deadlineJobs.js            [NEW] - Job definitions
├── modules/workmanagement/
│   └── services/
│       └── congViec.service.js    [MODIFY] - Integration
├── config/
│   └── notificationTriggers.js    [MODIFY] - Add triggers
└── bin/
    └── www                        [MODIFY] - Start agenda
```

### Step 1: Install Agenda

```bash
cd giaobanbv-be
npm install agenda
```

### Step 2: Create AgendaService

**File:** `giaobanbv-be/services/agendaService.js`

```javascript
/**
 * Agenda.js Service - Job Scheduling
 *
 * Sử dụng MongoDB làm job store, đảm bảo jobs persist qua restart
 */
const Agenda = require("agenda");

class AgendaService {
  constructor() {
    this.agenda = null;
    this.isReady = false;
  }

  /**
   * Initialize Agenda with MongoDB connection
   */
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
      processEvery: "30 seconds", // Poll interval
      maxConcurrency: 10, // Max concurrent jobs
      defaultConcurrency: 5,
    });

    // Event handlers
    this.agenda.on("ready", () => {
      console.log("[AgendaService] ✅ Connected to MongoDB");
      this.isReady = true;
    });

    this.agenda.on("error", (err) => {
      console.error("[AgendaService] ❌ Error:", err);
    });

    // Define jobs
    this._defineJobs();

    // Start processing
    await this.agenda.start();
    console.log("[AgendaService] ✅ Started processing jobs");
  }

  /**
   * Define all job types
   */
  _defineJobs() {
    // Import job definitions
    const { defineDeadlineJobs } = require("../jobs/deadlineJobs");
    defineDeadlineJobs(this.agenda);
  }

  /**
   * Schedule a job at specific time
   */
  async schedule(when, jobName, data) {
    if (!this.agenda) {
      console.error("[AgendaService] Not initialized");
      return null;
    }

    const job = await this.agenda.schedule(when, jobName, data);
    console.log(`[AgendaService] Scheduled "${jobName}" for ${when}`);
    return job;
  }

  /**
   * Cancel jobs matching query
   */
  async cancel(query) {
    if (!this.agenda) return 0;

    const numRemoved = await this.agenda.cancel(query);
    console.log(`[AgendaService] Cancelled ${numRemoved} jobs`);
    return numRemoved;
  }

  /**
   * Get agenda instance
   */
  getAgenda() {
    return this.agenda;
  }

  /**
   * Graceful shutdown
   */
  async stop() {
    if (this.agenda) {
      await this.agenda.stop();
      console.log("[AgendaService] Stopped");
    }
  }
}

module.exports = new AgendaService();
```

### Step 3: Create Deadline Job Handlers

**File:** `giaobanbv-be/jobs/deadlineJobs.js`

```javascript
/**
 * Deadline Job Definitions
 *
 * Handlers cho DEADLINE_APPROACHING và DEADLINE_OVERDUE
 */
const { CongViec } = require("../modules/workmanagement/models");
const triggerService = require("../services/triggerService");

/**
 * Define deadline-related jobs
 */
function defineDeadlineJobs(agenda) {
  // Job: deadline-approaching
  agenda.define(
    "deadline-approaching",
    {
      lockLifetime: 5 * 60 * 1000, // 5 minutes lock
      concurrency: 5,
    },
    async (job) => {
      const { taskId, taskCode } = job.attrs.data;
      console.log(`[DeadlineJob] Processing APPROACHING for ${taskCode}`);

      try {
        await processDeadlineApproaching(taskId);
      } catch (error) {
        console.error(`[DeadlineJob] Error APPROACHING ${taskCode}:`, error);
        throw error; // Agenda will retry
      }
    }
  );

  // Job: deadline-overdue
  agenda.define(
    "deadline-overdue",
    {
      lockLifetime: 5 * 60 * 1000,
      concurrency: 5,
    },
    async (job) => {
      const { taskId, taskCode } = job.attrs.data;
      console.log(`[DeadlineJob] Processing OVERDUE for ${taskCode}`);

      try {
        await processDeadlineOverdue(taskId);
      } catch (error) {
        console.error(`[DeadlineJob] Error OVERDUE ${taskCode}:`, error);
        throw error;
      }
    }
  );

  console.log(
    "[DeadlineJobs] ✅ Defined: deadline-approaching, deadline-overdue"
  );
}

/**
 * Process deadline approaching notification
 */
async function processDeadlineApproaching(taskId) {
  // 1. Fetch task with populated fields
  const task = await CongViec.findById(taskId)
    .populate("NguoiChinhID", "_id")
    .populate("NguoiGiaoViecID", "_id")
    .populate("NguoiThamGia", "_id");

  if (!task) {
    console.log(`[DeadlineJob] Task ${taskId} not found, skipping`);
    return;
  }

  // 2. Check if task is completed
  if (task.TrangThai === "HOAN_THANH") {
    console.log(`[DeadlineJob] Task ${task.MaCongViec} completed, skipping`);
    return;
  }

  // 3. Check if already notified
  if (task.ApproachingNotifiedAt) {
    console.log(
      `[DeadlineJob] Task ${task.MaCongViec} already notified, skipping`
    );
    return;
  }

  // 4. Calculate days left
  const now = new Date();
  const deadline = new Date(task.NgayHetHan);
  const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

  // 5. Fire trigger
  await triggerService.fire("CongViec.DEADLINE_APPROACHING", {
    congViec: task,
    daysLeft: Math.max(0, daysLeft),
    performerId: null, // System triggered
  });

  // 6. Mark as notified
  await CongViec.findByIdAndUpdate(taskId, {
    ApproachingNotifiedAt: new Date(),
  });

  console.log(`[DeadlineJob] ✅ APPROACHING sent for ${task.MaCongViec}`);
}

/**
 * Process deadline overdue notification
 */
async function processDeadlineOverdue(taskId) {
  // 1. Fetch task
  const task = await CongViec.findById(taskId)
    .populate("NguoiChinhID", "_id")
    .populate("NguoiGiaoViecID", "_id")
    .populate("NguoiThamGia", "_id");

  if (!task) {
    console.log(`[DeadlineJob] Task ${taskId} not found, skipping`);
    return;
  }

  // 2. Check if task is completed
  if (task.TrangThai === "HOAN_THANH") {
    console.log(`[DeadlineJob] Task ${task.MaCongViec} completed, skipping`);
    return;
  }

  // 3. Check if already notified
  if (task.OverdueNotifiedAt) {
    console.log(
      `[DeadlineJob] Task ${task.MaCongViec} already notified, skipping`
    );
    return;
  }

  // 4. Calculate days overdue
  const now = new Date();
  const deadline = new Date(task.NgayHetHan);
  const daysOverdue = Math.floor((now - deadline) / (1000 * 60 * 60 * 24));

  // 5. Fire trigger
  await triggerService.fire("CongViec.DEADLINE_OVERDUE", {
    congViec: task,
    daysOverdue: Math.max(0, daysOverdue),
    performerId: null,
  });

  // 6. Mark as notified
  await CongViec.findByIdAndUpdate(taskId, {
    OverdueNotifiedAt: new Date(),
  });

  console.log(`[DeadlineJob] ✅ OVERDUE sent for ${task.MaCongViec}`);
}

module.exports = { defineDeadlineJobs };
```

### Step 4: Add Trigger Configs

**File:** `giaobanbv-be/config/notificationTriggers.js` (ADD)

```javascript
// Thêm vào cuối phần CongViec triggers:

"CongViec.DEADLINE_APPROACHING": {
  enabled: true,
  template: "DEADLINE_APPROACHING",
  description: "Thông báo khi công việc sắp đến hạn",
  handler: "deadline",
  recipients: "all",  // NguoiChinhID + NguoiGiaoViecID + NguoiThamGia
  excludePerformer: false,  // System triggered, no performer
},

"CongViec.DEADLINE_OVERDUE": {
  enabled: true,
  template: "DEADLINE_OVERDUE",
  description: "Thông báo khi công việc quá hạn",
  handler: "deadline",
  recipients: "all",
  excludePerformer: false,
},
```

### Step 5: Add Deadline Handler to TriggerService

**File:** `giaobanbv-be/services/triggerService.js` (MODIFY)

```javascript
// Thêm vào _processHandler():

case "deadline":
  return this._handleDeadline(context, config);

// Thêm method mới:
async _handleDeadline(context, config) {
  const { congViec, daysLeft, daysOverdue } = context;

  // Build recipients list
  const recipientIds = new Set();

  if (congViec.NguoiChinhID) {
    const id = congViec.NguoiChinhID._id || congViec.NguoiChinhID;
    recipientIds.add(id.toString());
  }

  if (congViec.NguoiGiaoViecID) {
    const id = congViec.NguoiGiaoViecID._id || congViec.NguoiGiaoViecID;
    recipientIds.add(id.toString());
  }

  if (congViec.NguoiThamGia && congViec.NguoiThamGia.length > 0) {
    congViec.NguoiThamGia.forEach(p => {
      const id = p._id || p;
      recipientIds.add(id.toString());
    });
  }

  // Build notification data
  const data = {
    taskId: congViec._id.toString(),
    taskCode: congViec.MaCongViec,
    taskName: congViec.TenCongViec,
  };

  // Add appropriate field
  if (daysLeft !== undefined) {
    data.daysLeft = daysLeft;
  }
  if (daysOverdue !== undefined) {
    data.daysOverdue = daysOverdue;
  }

  return {
    recipientIds: Array.from(recipientIds),
    data
  };
}
```

---

## 🔗 INTEGRATION POINTS

### Integration với congViec.service.js

```javascript
const agendaService = require("../../../services/agendaService");

/**
 * Schedule deadline notification jobs for a task
 */
async function scheduleDeadlineJobs(task) {
  // Cancel existing jobs for this task
  await agendaService.cancel({ "data.taskId": task._id.toString() });

  // Only schedule if task is not completed and has deadline
  if (task.TrangThai === "HOAN_THANH" || !task.NgayHetHan) {
    return;
  }

  const now = new Date();
  const jobData = {
    taskId: task._id.toString(),
    taskCode: task.MaCongViec,
  };

  // Schedule approaching notification
  if (task.NgayCanhBao && new Date(task.NgayCanhBao) > now) {
    await agendaService.schedule(
      task.NgayCanhBao,
      "deadline-approaching",
      jobData
    );
  }

  // Schedule overdue notification
  if (new Date(task.NgayHetHan) > now) {
    await agendaService.schedule(task.NgayHetHan, "deadline-overdue", jobData);
  }
}

/**
 * Cancel deadline jobs when task is completed
 */
async function cancelDeadlineJobs(taskId) {
  await agendaService.cancel({ "data.taskId": taskId.toString() });
}

// Export để dùng trong controller
module.exports = { scheduleDeadlineJobs, cancelDeadlineJobs };
```

### Hook Points in CRUD Operations

```javascript
// CREATE TASK
async function createTask(data) {
  const task = await CongViec.create(data);
  await scheduleDeadlineJobs(task); // ← ADD
  return task;
}

// UPDATE TASK (deadline changed)
async function updateTask(taskId, data) {
  const task = await CongViec.findByIdAndUpdate(taskId, data, { new: true });
  await scheduleDeadlineJobs(task); // ← ADD (reschedules)
  return task;
}

// COMPLETE TASK
async function completeTask(taskId) {
  const task = await CongViec.findByIdAndUpdate(taskId, {
    TrangThai: "HOAN_THANH",
    NgayHoanThanh: new Date(),
  });
  await cancelDeadlineJobs(taskId); // ← ADD
  return task;
}

// DELETE TASK
async function deleteTask(taskId) {
  await cancelDeadlineJobs(taskId); // ← ADD
  await CongViec.findByIdAndDelete(taskId);
}
```

---

## 🔄 MIGRATION SCRIPT

### For Existing Tasks

**File:** `giaobanbv-be/scripts/migrateDeadlineJobs.js`

```javascript
/**
 * Migration Script: Schedule deadline jobs for existing tasks
 *
 * Run once after deploying Agenda implementation:
 * node scripts/migrateDeadlineJobs.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const { CongViec } = require("../modules/workmanagement/models");
const agendaService = require("../services/agendaService");

async function migrate() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Initialize Agenda
    await agendaService.init(process.env.MONGODB_URI);

    // Wait for Agenda to be ready
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Find active tasks with deadlines
    const tasks = await CongViec.find({
      TrangThai: { $nin: ["HOAN_THANH", "HUY"] },
      NgayHetHan: { $exists: true, $ne: null },
      isDeleted: { $ne: true },
    });

    console.log(`Found ${tasks.length} active tasks with deadlines`);

    let scheduled = 0;
    const now = new Date();

    for (const task of tasks) {
      const jobData = {
        taskId: task._id.toString(),
        taskCode: task.MaCongViec,
      };

      // Schedule approaching if not yet passed and not notified
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

      // Schedule overdue if not yet passed and not notified
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
    console.error("❌ Migration failed:", error);
  } finally {
    await agendaService.stop();
    await mongoose.disconnect();
    process.exit(0);
  }
}

migrate();
```

### Add to package.json

```json
{
  "scripts": {
    "migrate:deadline-jobs": "node scripts/migrateDeadlineJobs.js"
  }
}
```

---

## 🐛 TROUBLESHOOTING

### Issue 1: Jobs not executing

**Symptoms:** Jobs scheduled but never run

**Solutions:**

```javascript
// 1. Check if Agenda started
console.log(agendaService.isReady); // Should be true

// 2. Check pending jobs in MongoDB
db.agendaJobs.find({ nextRunAt: { $lte: new Date() } });

// 3. Check for locked jobs (stuck)
db.agendaJobs.find({ lockedAt: { $ne: null } });

// 4. Manually unlock stuck jobs
db.agendaJobs.updateMany(
  { lockedAt: { $ne: null } },
  { $set: { lockedAt: null } }
);
```

### Issue 2: Duplicate notifications

**Symptoms:** Same notification sent multiple times

**Solutions:**

```javascript
// Check if tracking fields are being set
const task = await CongViec.findById(taskId);
console.log(task.ApproachingNotifiedAt); // Should be set after first send
console.log(task.OverdueNotifiedAt);
```

### Issue 3: Jobs not cancelled

**Symptoms:** Completed task still sends notifications

**Solutions:**

```javascript
// Ensure cancel is called with correct query
await agendaService.cancel({
  "data.taskId": taskId.toString(), // Must be string
});

// Verify jobs removed
const remaining = await db.agendaJobs
  .find({
    "data.taskId": taskId,
  })
  .count();
console.log("Remaining jobs:", remaining); // Should be 0
```

### Issue 4: Performance concerns

**Symptoms:** High MongoDB load from Agenda polling

**Solutions:**

```javascript
// Increase poll interval (default 5s)
this.agenda = new Agenda({
  processEvery: "1 minute", // Poll less frequently
  maxConcurrency: 5, // Reduce concurrent jobs
});

// Add index for better query performance
db.agendaJobs.createIndex({ nextRunAt: 1, lockedAt: 1 });
```

---

## ✅ VERIFICATION CHECKLIST

### After Implementation

- [ ] `npm install agenda` successful
- [ ] AgendaService initializes without errors
- [ ] Job definitions loaded (`deadline-approaching`, `deadline-overdue`)
- [ ] Create task → Jobs appear in `agendaJobs` collection
- [ ] Update deadline → Old jobs cancelled, new jobs created
- [ ] Complete task → Jobs cancelled
- [ ] Delete task → Jobs cancelled

### Testing Notifications

```javascript
// Quick test: Schedule job for 1 minute from now
const testDate = new Date(Date.now() + 60 * 1000);
await agendaService.schedule(testDate, "deadline-approaching", {
  taskId: "test-123",
  taskCode: "TEST-001",
});

// Check agendaJobs collection
// Wait 1 minute, check console logs
```

---

## 📚 REFERENCES

- [Agenda.js Documentation](https://github.com/agenda/agenda)
- [MongoDB TTL Indexes](https://docs.mongodb.com/manual/core/index-ttl/)
- [Node.js Job Scheduling Best Practices](https://blog.logrocket.com/node-js-job-scheduling/)

---

**Last Updated:** November 28, 2025
**Version:** 1.0
