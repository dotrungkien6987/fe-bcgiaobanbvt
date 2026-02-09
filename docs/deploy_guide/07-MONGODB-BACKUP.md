# 📘 PHẦN 7: BACKUP & RESTORE MONGODB

## 🎯 MỤC TIÊU

Sau phần này bạn sẽ:

- ✅ Hiểu tại sao cần backup
- ✅ Backup MongoDB bằng mongodump
- ✅ Restore MongoDB bằng mongorestore
- ✅ Tự động hóa backup hàng ngày
- ✅ Lưu trữ và quản lý backups
- ✅ Test restore trên database mới

---

## 💾 TẠI SAO CẦN BACKUP?

```
╔═══════════════════════════════════════════════════════════╗
║  NHỮNG ĐIỀU CÓ THỂ XẢY RA:                                 ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  ❌ Disk failure (ổ cứng hỏng)                            ║
║  ❌ Xóa nhầm database/collection                          ║
║  ❌ Bug trong code xóa/corrupt data                       ║
║  ❌ Hacker tấn công, xóa data                             ║
║  ❌ Server chết, không khôi phục được                     ║
║  ❌ Update script chạy sai, corrupt data                  ║
║  ❌ Thiên tai (cháy, ngập, động đất)                      ║
║                                                           ║
║  → KHÔNG CÓ BACKUP = MẤT TẤT CẢ DATA ❌                   ║
║  → CÓ BACKUP = RESTORE TRONG VÀI PHÚT ✅                  ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

---

## 🔧 BƯỚC 1: TẠO THƯ MỤC BACKUP

```bash
# SSH vào server
ssh youruser@192.168.1.243

# Tạo thư mục backup
sudo mkdir -p /backup/mongodb
sudo mkdir -p /backup/mongodb/daily
sudo mkdir -p /backup/mongodb/manual

# Set ownership
sudo chown -R $USER:$USER /backup

# Kiểm tra
ls -la /backup/
```

---

## 📤 BƯỚC 2: BACKUP THỦ CÔNG (MONGODUMP)

```
╔═══════════════════════════════════════════════════════════╗
║  ⚠️  VÌ ĐANG DÙNG REPLICA SET → PHẢI DÙNG --oplog!        ║
╠═══════════════════════════════════════════════════════════╣
║  --gzip   = Nén backup (tiết kiệm ~80% dung lượng)        ║
║  --oplog  = Backup nhất quán (point-in-time consistency)  ║
║                                                           ║
║  ✅ Replica Set backup: --gzip --oplog (BẮT BUỘC)        ║
║  ❌ Standalone backup: không cần --oplog                  ║
╚═══════════════════════════════════════════════════════════╝
```

### **2.1 - Backup toàn bộ databases (Replica Set):**

```bash
# Backup tất cả databases với --gzip và --oplog
mongodump \
  --username=admin \
  --password=YOUR_ADMIN_PASSWORD \
  --authenticationDatabase=admin \
  --gzip \
  --oplog \
  --out=/backup/mongodb/manual/backup-$(date +%Y%m%d-%H%M%S)
# ↑↑↑ 2 options BẮT BUỘC cho replica set!

# Output:
# 2025-12-26T10:30:00.000+0700  writing admin.system.version to dump/admin/system.version.bson.gz
# 2025-12-26T10:30:00.000+0700  done dumping admin.system.version (1 document)
# 2025-12-26T10:30:00.000+0700  writing ticketdb.accounts to dump/ticketdb/accounts.bson.gz
# 2025-12-26T10:30:01.000+0700  done dumping ticketdb.accounts (2 documents)
# 2025-12-26T10:30:01.000+0700  writing captured oplog to dump/oplog.bson.gz
#                                                      ↑↑↑↑↑ OPLOG!
# 2025-12-26T10:30:01.000+0700  done dumping oplog (15 operations)
# ...

# Kiểm tra backup
ls -lh /backup/mongodb/manual/

# Output:
# drwxr-xr-x 5 user user 4.0K Dec 26 10:30 backup-20251226-103000

# Xem cấu trúc
ls -lh /backup/mongodb/manual/backup-20251226-103000/

# Output:
# drwxr-xr-x 2 user user 4.0K Dec 26 10:30 admin
# drwxr-xr-x 2 user user 4.0K Dec 26 10:30 ticketdb
# -rw-r--r-- 1 user user  856 Dec 26 10:30 oplog.bson.gz  ← OPLOG FILE!

# Xem size (đã nén)
du -sh /backup/mongodb/manual/backup-*

# Output:
# 156K    /backup/mongodb/manual/backup-20251226-103000
#         ↑↑↑ Nhỏ hơn nhiều nhờ --gzip (không nén sẽ ~1.2M)
```

### **2.2 - Backup 1 database cụ thể:**

```bash
# Backup chỉ database ticketdb (với --gzip và --oplog)
mongodump \
  --username=appuser \
  --password=YOUR_APP_PASSWORD \
  --authenticationDatabase=admin \
  --db=ticketdb \
  --gzip \
  --oplog \
  --out=/backup/mongodb/manual/ticketdb-$(date +%Y%m%d-%H%M%S)

# ⚠️ LƯU Ý: --oplog với --db có thể không capture đủ oplog
# → Khuyến nghị: Backup toàn bộ databases (BƯỚC 2.1) cho replica set

# Kiểm tra
ls -lh /backup/mongodb/manual/ticketdb-*/ticketdb/

# Output:
# -rw-r--r-- 1 user user   45 Dec 26 10:31 accounts.bson.gz
# -rw-r--r-- 1 user user  150 Dec 26 10:31 accounts.metadata.json.gz
```

### **2.3 - Backup 1 collection cụ thể:**

```bash
# Backup chỉ collection "tickets" (với --gzip)
mongodump \
  --username=appuser \
  --password=YOUR_APP_PASSWORD \
  --authenticationDatabase=admin \
  --db=ticketdb \
  --collection=tickets \
  --gzip \
  --out=/backup/mongodb/manual/tickets-$(date +%Y%m%d-%H%M%S)

# ⚠️ LƯU Ý: KHÔNG dùng --oplog với --collection
# (oplog chỉ hoạt động với full database backup)

### **💡 Giải thích chi tiết:**

```

┌─────────────────────────────────────────────────────────┐
│ TẠI SAO CẦN --oplog CHO REPLICA SET? │
├─────────────────────────────────────────────────────────┤
│ │
│ Khi backup replica set KHÔNG có --oplog: │
│ ├─ Backup collection A lúc 10:30:00 │
│ ├─ Trong khi đó, data tiếp tục thay đổi... │
│ └─ Backup collection B lúc 10:30:15 │
│ → Backup KHÔNG NHẤT QUÁN (inconsistent) │
│ │
│ Khi backup replica set VỚI --oplog: │
│ ├─ Capture tất cả operations trong quá trình backup │
│ └─ Khi restore, replay oplog → data nhất quán │
│ → Backup NHẤT QUÁN tại 1 thời điểm (point-in-time) │
│ │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ SO SÁNH KÍCH THƯỚC (ví dụ database 10MB): │
├─────────────────────────────────────────────────────────┤
│ Không nén (no --gzip): 10.5 MB │
│ Có nén (--gzip): 1.2 MB (nhỏ hơn ~8-9 lần) │
└─────────────────────────────────────────────────────────┘

````

---

## 📥 BƯỚC 3: RESTORE (MONGORESTORE)

### **⚠️ CHÚ Ý: RESTORE SẼ GHI ĐÈ DATA HIỆN TẠI! **

### **3.1 - Test restore (vào database mới):**

```bash
# Tạo test data trong ticketdb
mongosh -u appuser -p --authenticationDatabase admin ticketdb

// Trong mongosh:
db.test_restore. insertOne({ message: 'Before restore', time: new Date() })
exit

# Restore vào database MỚI (ticketdb_restored)
mongorestore \
  --username=appuser \
  --password=YOUR_APP_PASSWORD \
  --authenticationDatabase=admin \
  --nsFrom='ticketdb.*' \
  --nsTo='ticketdb_restored.*' \
  --gzip \
  --oplogReplay \
  /backup/mongodb/manual/backup-20251226-103000/ticketdb
# ↑ Thêm --oplogReplay để apply oplog entries

# Output:
# 2025-12-26T10:35:00.000+0700  preparing collections to restore from
# 2025-12-26T10:35:00.000+0700  reading metadata for ticketdb_restored. accounts
# 2025-12-26T10:35:00.000+0700  restoring ticketdb_restored.accounts from file
# 2025-12-26T10:35:01.000+0700  finished restoring ticketdb_restored. accounts (2 documents, 0 failures)
# 2025-12-26T10:35:01.000+0700  2 document(s) restored successfully

# Verify
mongosh -u appuser -p --authenticationDatabase admin ticketdb_restored

// Trong mongosh:
show collections
db.accounts.find()
exit
````

### **3.2 - Restore ghi đè (DROP existing data):**

```bash
# ⚠️ CẢNH BÁO: Lệnh này sẽ XÓA data hiện tại!

# Restore và drop collections cũ trước
mongorestore \
  --username=admin \
  --password=YOUR_ADMIN_PASSWORD \
  --authenticationDatabase=admin \
  --drop \
  --gzip \
  --oplogReplay \
  /backup/mongodb/manual/backup-20251226-103000

# --drop = Xóa collection trước khi restore
# --oplogReplay = Apply oplog để có data nhất quán
```

### **3.3 - Restore chỉ 1 collection:**

```bash
# Restore chỉ collection tickets
mongorestore \
  --username=appuser \
  --password=YOUR_APP_PASSWORD \
  --authenticationDatabase=admin \
  --db=ticketdb \
  --collection=tickets \
  /backup/mongodb/manual/backup-20251226-103000/ticketdb/tickets. bson
```

---

## 🤖 BƯỚC 4: TỰ ĐỘNG HÓA BACKUP

### **4.1 - Tạo backup script:**

```bash
# Tạo script
nano ~/backup-mongodb.sh
```

```bash
#!/bin/bash
# ──────────────────────────────────────────────────────────
# FILE: backup-mongodb.sh
# MongoDB Daily Backup Script
# ──────────────────────────────────────────────────────────

# Configuration
MONGO_USER="admin"
MONGO_PASS="YOUR_ADMIN_PASSWORD"  # ĐỔI PASSWORD!
AUTH_DB="admin"
BACKUP_DIR="/backup/mongodb/daily"
RETENTION_DAYS=90  # Giữ backup 90 ngày

# Date format
DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_PATH="$BACKUP_DIR/backup-$DATE"

# Log file
LOG_FILE="/var/log/mongodb-backup.log"

# ══════════════════════════════════════════════════════════
# Functions
# ══════════════════════════════════════════════════════════

log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# ══════════════════════════════════════════════════════════
# Main Backup
# ══════════════════════════════════════════════════════════

log "🔄 Starting MongoDB backup..."

# Check MongoDB is running
if ! systemctl is-active --quiet mongod; then
  log "❌ MongoDB is not running!"
  exit 1
fi

# Create backup
if mongodump \
  --username="$MONGO_USER" \
  --password="$MONGO_PASS" \
  --authenticationDatabase="$AUTH_DB" \
  --gzip \
  --oplog \
  --out="$BACKUP_PATH" \
  >> "$LOG_FILE" 2>&1; then
  # ↑ Thêm --oplog cho replica set backup!

  # Get backup size
  SIZE=$(du -sh "$BACKUP_PATH" | cut -f1)
  log "✅ Backup completed:  $BACKUP_PATH ($SIZE)"

else
  log "❌ Backup failed!"
  exit 1
fi

# ══════════════════════════════════════════════════════════
# Cleanup old backups
# ══════════════════════════════════════════════════════════

log "🗑️  Cleaning up backups older than $RETENTION_DAYS days..."

find "$BACKUP_DIR" -name "backup-*" -type d -mtime +$RETENTION_DAYS -exec rm -rf {} \; 2>/dev/null

REMAINING=$(find "$BACKUP_DIR" -name "backup-*" -type d | wc -l)
log "📊 Remaining backups: $REMAINING"

# ══════════════════════════════════════════════════════════
# Disk space check
# ══════════════════════════════════════════════════════════

DISK_USAGE=$(df -h /backup | tail -1 | awk '{print $5}' | sed 's/%//')

if [ "$DISK_USAGE" -gt 80 ]; then
  log "⚠️  Warning: Disk usage is ${DISK_USAGE}%"
fi

log "✅ Backup process completed"
log "════════════════════════════════════════════════════════"

# ──────────────────────────────────────────────────────────
```

```bash
# Save:  Ctrl+O → Enter → Ctrl+X

# ĐỔI PASSWORD trong script!
nano ~/backup-mongodb.sh
# Tìm dòng:  MONGO_PASS="YOUR_ADMIN_PASSWORD"
# Đổi thành password thật

# Make executable
chmod +x ~/backup-mongodb.sh

# Test chạy thủ công
~/backup-mongodb. sh

# Output:
# [2025-12-26 10:40:00] 🔄 Starting MongoDB backup...
# [2025-12-26 10:40:15] ✅ Backup completed: /backup/mongodb/daily/backup-20251226-104000 (156K)
# [2025-12-26 10:40:15] 🗑️  Cleaning up backups older than 90 days...
# [2025-12-26 10:40:15] 📊 Remaining backups: 1
# [2025-12-26 10:40:15] ✅ Backup process completed

# Xem log
cat /var/log/mongodb-backup.log
```

### **4.2 - Schedule với Cron (chạy hàng ngày):**

```bash
# Tạo log file
sudo touch /var/log/mongodb-backup.log
sudo chown $USER:$USER /var/log/mongodb-backup.log

# Edit crontab
crontab -e

# Chọn editor (nếu lần đầu):
# Select an editor:  1

# Thêm vào cuối file:
```

```cron
# ──────────────────────────────────────────────────────────
# MongoDB Daily Backup
# Chạy lúc 2:00 AM mỗi ngày
# ──────────────────────────────────────────────────────────

0 2 * * * /home/youruser/backup-mongodb.sh

# Giải thích:
# 0     = Phút (0)
# 2     = Giờ (2 AM)
# *     = Ngày trong tháng (mọi ngày)
# *     = Tháng (mọi tháng)
# *     = Ngày trong tuần (mọi ngày)

# ──────────────────────────────────────────────────────────
```

```bash
# Save: Ctrl+O → Enter → Ctrl+X

# Kiểm tra crontab
crontab -l

# Output:
# 0 2 * * * /home/youruser/backup-mongodb.sh

# Test cron job (không cần chờ đến 2 AM)
# Tạm thời đổi thời gian chạy 1 phút nữa
# Ví dụ hiện tại là 10:45, đổi thành:
# 46 10 * * * /home/youruser/backup-mongodb.sh

# Chờ 1 phút, check log
tail -f /var/log/mongodb-backup.log

# Nếu thấy log mới → Cron hoạt động ✅
# Đổi lại thành 0 2 * * *
```

---

## 🔄 BƯỚC 5: POINT-IN-TIME RECOVERY (OPLOG)

### **Restore đến 1 thời điểm cụ thể:**

```
╔═══════════════════════════════════════════════════════════╗
║  Với --oplog backup, bạn có thể restore đến bất kỳ        ║
║  thời điểm nào TRONG QUÁ TRÌNH backup đang chạy           ║
╚═══════════════════════════════════════════════════════════╝
```

```bash
# Ví dụ: Backup chạy từ 10:30:00 → 10:30:15
# Bạn muốn restore đến đúng 10:30:10

# Restore với oplog limit (đến timestamp cụ thể)
mongorestore \
  --username=admin \
  --password=YOUR_ADMIN_PASSWORD \
  --authenticationDatabase=admin \
  --oplogReplay \
  --oplogLimit="1703649010:1" \
  --gzip \
  /backup/mongodb/manual/backup-20251226-103000

# Cách lấy timestamp:
mongosh -u admin -p --authenticationDatabase admin
// Trong mongosh:
db.oplog.rs.find().sort({$natural: -1}).limit(1).pretty()
// Copy giá trị "ts" field
```

### **Xem oplog entries trong backup:**

```bash
# Extract oplog từ backup
gunzip -c /backup/mongodb/manual/backup-20251226-103000/oplog.bson.gz > /tmp/oplog.bson

# Xem bằng bsondump
bsondump /tmp/oplog.bson | head -20

# Output:
# {"ts":{"$timestamp":{"t":1703649000,"i":1}},"op":"i","ns":"ticketdb.accounts",...}
# {"ts":{"$timestamp":{"t":1703649001,"i":1}},"op":"u","ns":"ticketdb.tickets",...}
# ...
```

---

## 💾 BƯỚC 6: LƯU TRỮ BACKUP

### **6.1 - Backup ra USB/External Drive:**

```bash
# Mount USB drive
sudo mkdir /mnt/usb
sudo mount /dev/sdb1 /mnt/usb

# Copy backup
cp -r /backup/mongodb/daily/backup-20251226-104000 /mnt/usb/

# Unmount
sudo umount /mnt/usb
```

### **6.2 - Backup lên Cloud (rsync):**

```bash
# Cài rsync
sudo apt install rsync -y

# Backup sang server khác (nếu có)
rsync -avz /backup/mongodb/daily/ \
  user@backup-server:/remote/backup/mongodb/

# Hoặc dùng cloud services (sẽ hướng dẫn sau nếu cần):
# - AWS S3
# - Google Cloud Storage
# - Azure Blob Storage
```

### **6.3 - Encryption (bảo mật backup):**

```bash
# Mã hóa backup bằng GPG
tar -czf - /backup/mongodb/daily/backup-20251226-104000 | \
  gpg --symmetric --cipher-algo AES256 \
  -o /backup/mongodb/backup-20251226-encrypted.tar.gz. gpg

# Nhập password khi được hỏi

# Giải mã khi cần restore
gpg --decrypt /backup/mongodb/backup-20251226-encrypted. tar.gz.gpg | \
  tar -xzf - -C /restore/
```

---

## 🧪 BƯỚC 7: TEST RESTORE ĐỊNH KỲ

### **⚠️ QUAN TRỌNG: Backup không test = Backup không tồn tại!**

```bash
# Tạo restore test script
nano ~/test-restore.sh
```

```bash
#!/bin/bash
# ──────────────────────────────────────────────────────────
# FILE: test-restore. sh
# Test MongoDB Restore
# ──────────────────────────────────────────────────────────

MONGO_USER="admin"
MONGO_PASS="YOUR_ADMIN_PASSWORD"
AUTH_DB="admin"
TEST_DB="restore_test_$(date +%Y%m%d_%H%M%S)"

# Lấy backup mới nhất
LATEST_BACKUP=$(ls -td /backup/mongodb/daily/backup-* | head -1)

echo "🧪 Testing restore from: $LATEST_BACKUP"

# Restore vào database test
mongorestore \
  --username="$MONGO_USER" \
  --password="$MONGO_PASS" \
  --authenticationDatabase="$AUTH_DB" \
  --nsFrom='ticketdb.*' \
  --nsTo="$TEST_DB.*" \
  --gzip \
  "$LATEST_BACKUP/ticketdb"

if [ $? -eq 0 ]; then
  echo "✅ Restore test successful!"

  # Xóa test database
  mongosh -u "$MONGO_USER" -p "$MONGO_PASS" \
    --authenticationDatabase "$AUTH_DB" \
    --eval "db.getSiblingDB('$TEST_DB').dropDatabase()"

  echo "🗑️  Test database cleaned up"
else
  echo "❌ Restore test failed!"
  exit 1
fi

# ──────────────────────────────────────────────────────────
```

```bash
# Save, make executable
chmod +x ~/test-restore.sh

# Chạy test
~/test-restore.sh

# Schedule test hàng tuần (mỗi Chủ nhật 3 AM)
crontab -e

# Thêm:
0 3 * * 0 /home/youruser/test-restore.sh >> /var/log/mongodb-restore-test.log 2>&1
```

---

## 📊 BƯỚC 8: MONITORING BACKUPS

### **Check backup status:**

```bash
# Tạo monitoring script
nano ~/check-backups.sh
```

```bash
#!/bin/bash
# ──────────────────────────────────────────────────────────
# FILE: check-backups. sh
# ──────────────────────────────────────────────────────────

BACKUP_DIR="/backup/mongodb/daily"

echo "📊 MongoDB Backup Status"
echo "════════════════════════════════════════"

# Count backups
COUNT=$(find "$BACKUP_DIR" -name "backup-*" -type d | wc -l)
echo "Total backups: $COUNT"

# Latest backup
LATEST=$(ls -td "$BACKUP_DIR"/backup-* | head -1)
if [ -n "$LATEST" ]; then
  LATEST_DATE=$(basename "$LATEST" | sed 's/backup-//')
  LATEST_SIZE=$(du -sh "$LATEST" | cut -f1)
  echo "Latest backup:  $LATEST_DATE ($LATEST_SIZE)"
else
  echo "⚠️  No backups found!"
fi

# Disk usage
echo ""
echo "💾 Disk Usage:"
df -h /backup | tail -1

# Last 5 backups
echo ""
echo "📁 Recent Backups:"
ls -lth "$BACKUP_DIR" | head -6

# ──────────────────────────────────────────────────────────
```

```bash
# Make executable
chmod +x ~/check-backups.sh

# Chạy
~/check-backups.sh
```

---

## 🛠️ TROUBLESHOOTING

### **Lỗi: `Failed:  error writing data for collection`**

```bash
# Nguyên nhân: Không đủ dung lượng

# Kiểm tra disk space
df -h /backup

# Giải pháp:
# 1. Xóa backups cũ
find /backup/mongodb/daily -name "backup-*" -type d -mtime +30 -exec rm -rf {} \;

# 2. Hoặc backup với compression cao hơn
mongodump --gzip ...
```

### **Restore chậm:**

```bash
# Tăng số lượng parallel connections
mongorestore --numParallelCollections=4 ...

# Hoặc disable index rebuilding (build sau)
mongorestore --noIndexRestore ...
```

### **Backup quá lớn:**

```bash
# Backup chỉ collections quan trọng
mongodump --excludeCollection=logs --excludeCollection=temp ...

# Hoặc backup theo query (chỉ data gần đây)
mongodump --query '{"createdAt": {"$gte":  new Date("2025-01-01")}}' ...
```

---

## ✅ CHECKLIST HOÀN THÀNH

```
□ Đã tạo thư mục /backup/mongodb
□ Đã test mongodump với --gzip và --oplog thành công
□ Đã verify backup có file oplog.bson.gz
□ Đã test mongorestore với --oplogReplay vào database mới
□ Đã tạo script backup tự động (backup-mongodb.sh) với --oplog
□ Đã test script chạy thành công
□ Đã schedule cron job (2 AM hàng ngày)
□ Đã tạo script test restore (test-restore.sh)
□ Đã kiểm tra backup sau 24h đầu tiên
□ Đã backup credentials ra chỗ an toàn

GHI CHÚ:
Backup location: /backup/mongodb/daily
Backup schedule: 2:00 AM daily
Retention: 90 days
Log file: /var/log/mongodb-backup.log

Latest backup:
ls -lth /backup/mongodb/daily | head -2

→ Sẵn sàng chuyển sang File 08-DOMAIN-SETUP.md
```

---

**⏭️ TIẾP THEO: File 08-DOMAIN-SETUP.md**
