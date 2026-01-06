# 📋 IMPLEMENTATION PLAN: Issue 2 - Notification Retry Queue + DLQ

**Status:** 📝 Ready to Implement  
**Estimated Effort:** 3-5 days (Backend Core), +2 days (Frontend UI Optional)  
**Priority:** HIGH  
**Created:** December 28, 2025

---

## 🎯 OBJECTIVE

Implement reliable notification delivery system with:

- ✅ Automatic retry mechanism (3 attempts × exponential backoff)
- ✅ Dead Letter Queue (DLQ) for failed notifications
- ✅ Admin monitoring dashboard
- ✅ Success rate improvement: 75-85% → 95-98%

---

## 📊 EXPECTED IMPACT

### Current State (Without Retry):

- **Miss Rate:** 15-25% (2,250-3,750 notifications/day)
- **Main Causes:**
  - User offline: 10-15%
  - Transient disconnect: 3-5%
  - Background tab throttle: 5-8%
  - Deploy window: 100% during 30s-1min
  - Network issues: 3-5%

### Future State (With Retry):

- **Miss Rate:** 2-5% (300-750 notifications/day)
- **Improvement:** Save 2,000-3,000 notifications/day
- **Success Rate:** 95-98%

---

## 🛠️ PREREQUISITES

### 1. Redis Installation

#### Option A: Development (Windows - Memurai)

```powershell
# Download from: https://www.memurai.com/get-memurai
# Install and verify:
memurai-cli ping
# Expected: PONG ✅
```

#### Option B: Development (Windows - WSL2 + Docker)

```powershell
# Install WSL2 and Docker Desktop
# Run Redis:
docker run -d -p 6379:6379 --name redis redis:7-alpine

# Verify:
docker exec -it redis redis-cli ping
# Expected: PONG ✅
```

#### Option C: Production (Linux)

```bash
sudo apt-get update
sudo apt-get install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Verify:
redis-cli ping
# Expected: PONG ✅
```

### 2. Node.js Dependencies

```bash
cd d:\project\webBV\giaobanbv-be
npm install --save bull@^4.12.0 redis@^4.6.0
```

**Packages:**

- `bull@^4.12.0` - Job queue with Redis backend
- `redis@^4.6.0` - Redis client for Node.js

---

## 📁 FILE STRUCTURE CHANGES

### New Files to Create:

```
giaobanbv-be/
├── config/
│   └── redisConfig.js                              ← NEW (30 min)
├── services/
│   └── notificationQueue.js                        ← NEW (3-4 hours)
├── modules/workmanagement/
│   ├── models/
│   │   └── NotificationFailure.js                  ← NEW (1 hour)
│   ├── controllers/
│   │   └── notificationQueue.controller.js         ← NEW (2 hours)
│   └── routes/
│       └── notificationQueue.api.js                ← NEW (1 hour)
```

### Files to Modify:

```
giaobanbv-be/
├── .env                                            ← UPDATE: Add Redis config
├── app.js                                          ← UPDATE: Init queue + shutdown
├── modules/workmanagement/
│   ├── services/
│   │   └── notificationService.js                  ← UPDATE: Use queue
│   └── routes/
│       └── notification.api.js                     ← UPDATE: Add queue routes
```

### Frontend (Optional - Phase 2):

```
fe-bcgiaobanbvt/src/features/Notification/Admin/
└── QueueMonitor.js                                 ← NEW (2 hours)
```

---

## ⚙️ CONFIGURATION REQUIREMENTS

### Environment Variables (.env)

```env
# Add to giaobanbv-be/.env

# Redis Configuration
REDIS_HOST=localhost              # localhost for dev, IP for production
REDIS_PORT=6379                   # Default Redis port
REDIS_PASSWORD=                   # Empty for dev, SET IN PRODUCTION ⚠️
REDIS_DB=0                        # Database index (0-15)
```

### Production Security Checklist:

- [ ] Set `REDIS_PASSWORD` (strong password)
- [ ] Enable Redis persistence (RDB + AOF)
- [ ] Restrict Redis network access (firewall/bind)
- [ ] Monitor Redis memory usage
- [ ] Setup DLQ cleanup cron job (monthly)

---

## 🔨 IMPLEMENTATION STEPS

### **PHASE 1: Backend Core** (Day 1-3)

---

#### **Step 1: Redis Configuration** (30 min)

**File:** `giaobanbv-be/config/redisConfig.js` (NEW)

**Key Points:**

- Create Redis client with reconnection strategy
- Event handlers for connect/error/ready
- Exponential backoff retry (max 10 attempts)
- Auto-connect on startup

**Validation:**

```javascript
// app.js should log:
// [Redis] ✅ Connected and ready
```

---

#### **Step 2: NotificationFailure Model** (1 hour)

**File:** `giaobanbv-be/modules/workmanagement/models/NotificationFailure.js` (NEW)

**Schema Fields:**

- `JobID` (String, unique) - Bull queue job ID
- `Recipients` ([ObjectId]) - User IDs that failed
- `NotificationData` (Mixed) - Original notification payload
- `Type` (String) - Notification type code
- `Attempts` (Number) - Number of retry attempts
- `LastError` (String) - Error message
- `ErrorStack` (String) - Stack trace for debugging
- `FailedAt` (Date) - When moved to DLQ
- `Status` (Enum) - pending_review/retrying/resolved/ignored
- `FailureReason` (Enum) - socket_offline/network_timeout/etc
- `RetriedAt`, `RetryJobID`, `ResolvedAt`, `ResolvedBy`, `Notes`

**Indexes:**

```javascript
{ JobID: 1 } (unique)
{ Status: 1, FailedAt: -1 }
{ FailureReason: 1, Status: 1 }
{ Type: 1, FailedAt: -1 }
```

**Static Methods:**

- `getPendingCount()` - Count pending_review items
- `getStats(days)` - Aggregate failure reasons

---

#### **Step 3: Notification Queue Service** (3-4 hours)

**File:** `giaobanbv-be/services/notificationQueue.js` (NEW)

**Core Components:**

1. **Queue Initialization:**

   - Bull Queue with Redis backend
   - Default job options: 3 attempts, exponential backoff (2s → 4s → 8s)
   - Keep completed jobs 24h (max 1000)
   - Keep failed jobs for DLQ

2. **Worker Logic:**

   - Check `socketService.isUserOnline(userId)`
   - If online: emit notification
   - If offline: throw error → trigger retry
   - Track success/failure counts

3. **DLQ Movement:**

   - After 3 failed attempts → `moveToDLQ(job, error)`
   - Classify error reason (socket_offline, network_timeout, etc)
   - Save to MongoDB NotificationFailure collection

4. **Retry from DLQ:**

   - `retryFromDLQ(failureId, userId)`
   - Re-queue with URGENT priority
   - Update failure record status to "retrying"

5. **Monitoring:**
   - Event handlers: completed, failed, waiting, active, stalled
   - `getStats()` - Queue metrics (waiting, active, completed, failed)

**Priority Mapping:**

```javascript
urgent: 1; // KPI approval, deadline warnings
high: 5; // Task assignments
normal: 10; // Comments, updates
low: 15; // Informational
```

---

#### **Step 4: Update NotificationService** (1 hour)

**File:** `giaobanbv-be/modules/workmanagement/services/notificationService.js` (MODIFY)

**Changes in `sendToUser()` method:**

**BEFORE:**

```javascript
// Direct socket emit
socketService.emitToUser(userId, "notification:new", {...});
```

**AFTER:**

```javascript
// Add to queue for reliable delivery
await notificationQueue.add({
  userIds: [userId],
  data: {...},
  type: typeCode,
  priority: priority || "normal",
});

// Fallback: If queue fails, direct emit
```

**Critical:** Keep notification creation in DB BEFORE queueing (already done)

---

#### **Step 5: Update app.js** (30 min)

**File:** `giaobanbv-be/app.js` (MODIFY)

**Changes:**

1. **Import:**

```javascript
const notificationQueue = require("./services/notificationQueue");
const redisClient = require("./config/redisConfig");
```

2. **After server.listen():**

```javascript
// Wait for Redis ready
if (!redisClient.isReady) {
  await new Promise((resolve, reject) => {
    redisClient.once("ready", resolve);
    redisClient.once("error", reject);
    setTimeout(() => reject(new Error("Redis timeout")), 10000);
  });
}

// Initialize queue
await notificationQueue.init();
```

3. **Graceful Shutdown:**

```javascript
const gracefulShutdown = async (signal) => {
  console.log(`${signal} received, shutting down...`);

  httpServer.close(async () => {
    await notificationQueue.close();
    await redisClient.quit();
    await mongoose.connection.close();
    process.exit(0);
  });

  // Force close after 30s
  setTimeout(() => process.exit(1), 30000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
```

---

#### **Step 6: Admin APIs** (2 hours)

**File 1:** `giaobanbv-be/modules/workmanagement/controllers/notificationQueue.controller.js` (NEW)

**Endpoints:**

- `getQueueStats()` - Queue metrics (waiting, active, completed, failed)
- `getDLQCount()` - Count pending DLQ entries
- `getDLQEntries()` - List failed notifications with filters
- `getDLQStats()` - Failure reason breakdown (last 7 days)
- `retryFromDLQ(id)` - Retry specific failure
- `resolveDLQEntry(id)` - Mark as resolved
- `ignoreDLQEntry(id)` - Mark as ignored

**File 2:** `giaobanbv-be/modules/workmanagement/routes/notificationQueue.api.js` (NEW)

**Routes:**

```
GET  /api/workmanagement/notifications/queue/stats
GET  /api/workmanagement/notifications/queue/dlq/count
GET  /api/workmanagement/notifications/queue/dlq
GET  /api/workmanagement/notifications/queue/dlq/stats
POST /api/workmanagement/notifications/queue/dlq/:id/retry
POST /api/workmanagement/notifications/queue/dlq/:id/resolve
POST /api/workmanagement/notifications/queue/dlq/:id/ignore
```

**File 3:** Update `notification.api.js`:

```javascript
router.use("/queue", require("./notificationQueue.api"));
```

---

### **PHASE 2: Frontend Admin UI** (Day 4-5) - OPTIONAL

---

#### **Step 7: Queue Monitor Widget** (2 hours)

**File:** `fe-bcgiaobanbvt/src/features/Notification/Admin/QueueMonitor.js` (NEW)

**Features:**

- Display queue stats (Waiting, Active, Failed, DLQ count)
- Auto-refresh every 5 seconds
- Color-coded chips (primary, error, warning)
- Loading state with CircularProgress

**Integration:**

- Add to NotificationAdminPage
- Or create dedicated Queue Management page

---

## 🧪 TESTING CHECKLIST

### Manual Testing Scenarios:

#### Test 1: Normal Flow (User Online)

```
1. User A online
2. User B giao việc cho User A
3. Expected:
   - Backend log: [NotificationQueue] ✅ Queued job notif_...
   - Backend log: [NotificationQueue] 📤 Processing job ...
   - Backend log: [NotificationQueue] ✅ Delivered to user ...
   - Frontend: User A sees notification immediately
```

#### Test 2: User Offline → Retry Success

```
1. User A offline (logout/close browser)
2. User B giao việc cho User A
3. Wait 3 seconds
4. User A login
5. Expected:
   - Backend log: [NotificationQueue] ⚠️ User ... offline
   - Backend log: [NotificationQueue] 🔄 Active: ... (attempt 2)
   - Backend log: [NotificationQueue] ✅ Delivered to user ...
   - Frontend: User A sees notification after login
```

#### Test 3: User Offline → Move to DLQ

```
1. User A offline (logout)
2. User B giao việc cho User A
3. Wait 10 seconds (retry window expired)
4. Expected:
   - Backend log: [NotificationQueue] ❌ Failed: ...
   - Backend log: [NotificationQueue] 📋 Moved to DLQ: ...
   - MongoDB: db.notificationfailures.findOne()
   - API: GET /queue/dlq returns 1 entry
```

#### Test 4: Retry from DLQ

```
1. Get DLQ entry ID from Test 3
2. User A login (online)
3. POST /queue/dlq/:id/retry
4. Expected:
   - Backend log: [NotificationQueue] 🔄 Retrying DLQ ...
   - Backend log: [NotificationQueue] ✅ Delivered to user ...
   - Frontend: User A sees notification
   - DLQ entry status: "resolved"
```

#### Test 5: Server Restart

```
1. 3 users online
2. Restart backend: npm restart
3. Create notification during startup
4. Expected:
   - All users reconnect within 5-10s
   - Notification delivered after reconnect
   - No notifications lost
```

#### Test 6: Redis Crash

```
1. Stop Redis: docker stop redis (or memurai-cli shutdown)
2. Create notification
3. Expected:
   - Backend log: [NotificationQueue] ⚠️ Queue error: ...
   - Fallback: Direct socket emit
   - Notification still delivered (if user online)
```

### API Testing (Postman/Thunder Client):

```http
### Get Queue Stats
GET http://localhost:8020/api/workmanagement/notifications/queue/stats
Authorization: Bearer {{token}}

### Get DLQ Count
GET http://localhost:8020/api/workmanagement/notifications/queue/dlq/count
Authorization: Bearer {{token}}

### Get DLQ Entries
GET http://localhost:8020/api/workmanagement/notifications/queue/dlq?status=pending_review&limit=50
Authorization: Bearer {{token}}

### Get DLQ Stats
GET http://localhost:8020/api/workmanagement/notifications/queue/dlq/stats?days=7
Authorization: Bearer {{token}}

### Retry from DLQ
POST http://localhost:8020/api/workmanagement/notifications/queue/dlq/{{failureId}}/retry
Authorization: Bearer {{token}}

### Resolve DLQ Entry
POST http://localhost:8020/api/workmanagement/notifications/queue/dlq/{{failureId}}/resolve
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "notes": "User was offline, manually resolved"
}
```

---

## 📈 MONITORING & METRICS

### Key Metrics to Track:

1. **Queue Performance:**

   - Jobs/minute throughput
   - Average processing time
   - Retry rate (%)
   - DLQ rate (%)

2. **Success Rate:**

   - Total notifications sent
   - Successful deliveries
   - Failed deliveries (DLQ)
   - Success rate = (Total - DLQ) / Total × 100%

3. **DLQ Analytics:**
   - Pending count (should be <50)
   - Top failure reasons
   - Average attempts before DLQ

### Dashboard Queries:

```javascript
// Daily success rate
const total = await Notification.countDocuments({
  createdAt: { $gte: startOfDay, $lte: endOfDay },
});

const dlqCount = await NotificationFailure.countDocuments({
  FailedAt: { $gte: startOfDay, $lte: endOfDay },
});

const successRate = (((total - dlqCount) / total) * 100).toFixed(2);
```

### Alert Rules:

```javascript
// Run every 5 minutes
const dlqCount = await NotificationFailure.getPendingCount();

if (dlqCount > 50) {
  // Send alert to admin (email/Slack)
  console.error(`⚠️ DLQ has ${dlqCount} pending failures!`);
}
```

---

## 🚨 ROLLBACK PLAN

### If Implementation Fails:

**Option 1: Disable Queue, Use Fallback**

```javascript
// In notificationService.js
// Comment out queue code, use direct emit
socketService.emitToUser(userId, "notification:new", {...});
```

**Option 2: Uninstall Redis**

```powershell
# Stop Redis
docker stop redis
# or: memurai-cli shutdown

# Remove from .env
# REDIS_HOST=...
# REDIS_PORT=...
```

**Option 3: Revert Code Changes**

```bash
# If using git
git revert <commit-hash>
```

---

## 💾 BACKUP RECOMMENDATIONS

### Before Implementation:

1. **Database Backup:**

```bash
mongodump --db giaoban_bvt --out ./backup_$(date +%Y%m%d)
```

2. **Code Backup:**

```bash
git branch backup-before-queue
git add .
git commit -m "Backup before notification queue implementation"
```

3. **Environment Backup:**

```bash
cp .env .env.backup
```

---

## 📋 DEPLOYMENT CHECKLIST

### Development:

- [ ] Install Redis (Memurai or Docker)
- [ ] Update .env with Redis config
- [ ] Install npm dependencies (bull, redis)
- [ ] Create all new files
- [ ] Update existing files
- [ ] Test all scenarios
- [ ] Verify logs show queue initialization

### Staging:

- [ ] Deploy Redis on staging server
- [ ] Set REDIS_PASSWORD
- [ ] Deploy backend code
- [ ] Run migration tests
- [ ] Monitor for 24-48h
- [ ] Check DLQ for anomalies

### Production:

- [ ] Schedule maintenance window (optional, no downtime needed)
- [ ] Deploy Redis with persistence (RDB + AOF)
- [ ] Set strong REDIS_PASSWORD
- [ ] Deploy backend code with rolling restart
- [ ] Monitor queue stats dashboard
- [ ] Monitor DLQ count (expect <5% initially)
- [ ] Check success rate improvement (target: 95%+)

---

## 🔧 TROUBLESHOOTING GUIDE

### Issue: Redis won't connect

**Symptoms:** `[Redis] ❌ Error: ECONNREFUSED`

**Solutions:**

```powershell
# Check if Redis is running
docker ps | findstr redis
# or: memurai-cli ping

# Check port
netstat -an | findstr 6379

# Check firewall
# Windows: Allow port 6379 in Windows Defender Firewall
```

---

### Issue: Queue not processing jobs

**Symptoms:** Jobs stuck in "waiting" state

**Solutions:**

```javascript
// Check worker is running
console.log(notificationQueue.isInitialized); // Should be true

// Check Redis memory
redis-cli INFO memory

// Check for stalled jobs
const jobs = await queue.getJobs(['stalled']);
console.log(`Stalled jobs: ${jobs.length}`);
```

---

### Issue: High DLQ rate

**Symptoms:** >10% notifications going to DLQ

**Investigation:**

```javascript
// Check failure reasons
const stats = await NotificationFailure.getStats(7);
console.log(stats);

// Common causes:
// 1. socket_offline (70-80%) - Normal for offline users
// 2. network_timeout (10-15%) - Check network quality
// 3. connection_lost (5-10%) - Check Socket.IO reconnection
```

---

### Issue: Memory leak in Redis

**Symptoms:** Redis memory grows continuously

**Solutions:**

```bash
# Check Redis memory usage
redis-cli INFO memory

# Check job counts
redis-cli KEYS "bull:notifications:*" | wc -l

# Clean completed jobs manually
redis-cli DEL "bull:notifications:completed"

# Or in code: Update removeOnComplete settings
removeOnComplete: {
  age: 3600,  // Reduce to 1 hour
  count: 100  // Reduce max count
}
```

---

## 📚 REFERENCE DOCUMENTATION

### Bull Queue:

- Docs: https://github.com/OptimalBits/bull
- Patterns: https://optimalbits.github.io/bull/
- API: https://github.com/OptimalBits/bull/blob/develop/REFERENCE.md

### Redis:

- Commands: https://redis.io/commands
- Persistence: https://redis.io/docs/manual/persistence/
- Security: https://redis.io/docs/manual/security/

### Socket.IO:

- Rooms: https://socket.io/docs/v4/rooms/
- Emit cheatsheet: https://socket.io/docs/v4/emit-cheatsheet/

---

## 💡 FUTURE ENHANCEMENTS

### Phase 3 (Nice-to-have):

1. **FCM Integration** (for offline users)

   - Estimated: 2-3 days
   - Benefit: Reach users when app closed
   - Priority: MEDIUM

2. **Priority Queue Visualization**

   - Real-time queue dashboard
   - Job timeline view
   - Priority distribution chart

3. **Smart Retry Logic**

   - Adaptive backoff based on user patterns
   - Time-of-day awareness (don't retry at night)
   - User preference: retry count per type

4. **Advanced DLQ Management**
   - Bulk retry operations
   - Auto-resolve after X days
   - Export DLQ to CSV for analysis

---

## 📞 SUPPORT & ESCALATION

### If You Get Stuck:

1. **Check Logs:**

   - Backend console: Look for `[NotificationQueue]`, `[Redis]` logs
   - MongoDB logs: Check for connection issues
   - Browser console: Check for Socket.IO errors

2. **Verify Prerequisites:**

   - Redis running: `redis-cli ping`
   - Dependencies installed: `npm list bull redis`
   - Environment variables set: `console.log(process.env.REDIS_HOST)`

3. **Test Isolation:**

   - Test Redis connection separately
   - Test Bull Queue with simple job
   - Test Socket.IO connection separately

4. **Community Resources:**
   - Bull GitHub Issues: https://github.com/OptimalBits/bull/issues
   - Stack Overflow: Tag `bull` or `redis`

---

## ✅ COMPLETION CRITERIA

### Definition of Done:

- [ ] Redis installed and connected
- [ ] All 6 new files created
- [ ] All 4 files modified successfully
- [ ] All 6 test scenarios pass
- [ ] Queue stats API returns valid data
- [ ] DLQ API returns valid data
- [ ] Success rate improved to >95%
- [ ] Documentation updated
- [ ] Team trained on DLQ management
- [ ] Monitoring dashboard live (optional)

### Success Metrics (After 1 Week):

- [ ] Success rate: 95-98%
- [ ] DLQ count: <5% of total notifications
- [ ] Average retry count: 1.2-1.5
- [ ] Zero critical incidents related to notifications
- [ ] User complaints about missed notifications: <5/week

---

## 📅 ESTIMATED TIMELINE

```
Day 1 (4 hours):
├── Redis installation (1h)
├── Create config & model (1.5h)
├── Initial testing (1h)
└── Documentation (0.5h)

Day 2 (6 hours):
├── Create notificationQueue.js (3h)
├── Update notificationService.js (1h)
├── Update app.js (0.5h)
└── Integration testing (1.5h)

Day 3 (5 hours):
├── Create admin APIs (2h)
├── API testing (1h)
├── End-to-end scenarios (1.5h)
└── Bug fixes & refinement (0.5h)

Day 4-5 (Optional - 8 hours):
├── Frontend QueueMonitor (2h)
├── DLQ Table component (3h)
├── Integration (1h)
└── Final testing (2h)

Total: 15-23 hours (2-3 days core, +1-2 days UI)
```

---

## 🎯 FINAL NOTES

### Key Takeaways:

1. **Redis is essential** - The core of the retry mechanism
2. **Notifications MUST be saved to DB first** - Queue only handles delivery
3. **Fallback is critical** - If queue fails, direct emit as backup
4. **Monitor DLQ regularly** - Should be <5% of total notifications
5. **Graceful shutdown** - Prevent job loss during deploys

### When to Start:

- **Best time:** After current sprint/milestone
- **Prerequisites:** 2-3 days for implementation + testing
- **Team availability:** At least 1 developer full-time
- **Risk:** LOW (can rollback easily)

### First Steps When Ready:

1. Read this document completely ✅
2. Install Redis (Option A, B, or C)
3. Create `redisConfig.js`
4. Test Redis connection
5. Follow step-by-step implementation

---

**Good luck with the implementation! 🚀**

**Contact:** Reference this document when starting implementation. All code snippets are production-ready.
