# 📘 PHẦN 6: CẤU HÌNH MONGODB REPLICA SET

## 🎯 MỤC TIÊU

Sau phần này bạn sẽ:

- ✅ Hiểu Replica Set là gì và tại sao cần (cho transactions)
- ✅ Cấu hình Single-node Replica Set
- ✅ Enable transactions trong MongoDB
- ✅ Test transactions từ Node.js
- ✅ Troubleshoot replica set issues

---

## 🔄 REPLICA SET LÀ GÌ?

```
Replica Set = Nhóm MongoDB instances làm việc cùng nhau

┌─────────────────────────────────────────────────────────┐
│  PRODUCTION REPLICA SET (3 nodes):                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐      ┌─────────────┐    ┌──────────┐ │
│  │  PRIMARY    │◄────►│  SECONDARY  │◄──►│SECONDARY │ │
│  │  (Master)   │      │  (Slave 1)  │    │ (Slave 2)│ │
│  │  Read+Write │      │  Read only  │    │ Read only│ │
│  └─────────────┘      └─────────────┘    └──────────┘ │
│         │                    │                  │       │
│         └────────────────────┴──────────────────┘       │
│                    Data Replication                     │
│                                                         │
│  Nếu PRIMARY chết → SECONDARY tự động thành PRIMARY    │
│  = High Availability (HA)                               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  DEVELOPMENT:  SINGLE-NODE REPLICA SET                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐                                        │
│  │  PRIMARY    │                                        │
│  │  (Only 1)   │                                        │
│  │  Read+Write │                                        │
│  └─────────────┘                                        │
│                                                         │
│  • Không có redundancy                                  │
│  • NHƯNG: Hỗ trợ transactions ✅                        │
│  • Đủ cho development/testing                          │
└─────────────────────────────────────────────────────────┘
```

---

## ❓ TẠI SAO CẦN REPLICA SET?

```
╔═══════════════════════════════════════════════════════════╗
║  MONGODB TRANSACTIONS CHỈ HOẠT ĐỘNG VỚI REPLICA SET!      ║
╚═══════════════════════════════════════════════════════════╝

Transaction = Nhóm nhiều operations thành 1 đơn vị
            = ALL thành công HOẶC ALL thất bại

Ví dụ:  Chuyển tiền
┌──────────────────────────────────────────────────────┐
│ Transaction {                                        │
│   1. Trừ 100$ từ account A                          │
│   2. Cộng 100$ vào account B                         │
│ }                                                    │
│                                                      │
│ Nếu bước 1 thành công nhưng bước 2 lỗi:              │
│ → ROLLBACK cả 2 bước (không mất tiền) ✅             │
└──────────────────────────────────────────────────────┘

Use cases trong app của bạn:
├─ Tạo ticket + log activity
├─ Update KPI + send notification
├─ Xóa user + xóa tất cả data liên quan
└─ Import bulk data (all or nothing)
```

---

## 🔧 BƯỚC 1: STOP MONGODB

```bash
# SSH vào server
ssh youruser@192.168.1.243

# Stop MongoDB
sudo systemctl stop mongod

# Verify đã stop
sudo systemctl status mongod

# Output:
# ● mongod.service - MongoDB Database Server
#      Active: inactive (dead)
```

---

## ⚙️ BƯỚC 2: CẤU HÌNH REPLICA SET

```bash
# Backup config
sudo cp /etc/mongod.conf /etc/mongod.conf.before-replica

# Edit config
sudo nano /etc/mongod.conf
```

```yaml
# ──────────────────────────────────────────────────────────
# FILE: /etc/mongod.conf
# ──────────────────────────────────────────────────────────

# Storage
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true

# Logging
systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log

# Network
net:
  port: 27017
  bindIp: 127.0.0.1
  # Nếu cần access từ mạng nội bộ (optional):
  # bindIp: 127.0.0.1,192.168.1.243

# Process Management
processManagement:
  timeZoneInfo: /usr/share/zoneinfo

# Security
security:
  authorization: enabled

# Replication - THÊM PHẦN NÀY!
replication:
  replSetName: "rs0"
  # rs0 = tên replica set (có thể đổi, nhưng rs0 là convention)

# ──────────────────────────────────────────────────────────
```

```bash
# Save: Ctrl+O → Enter → Ctrl+X

# Verify config syntax (optional)
mongod --config /etc/mongod.conf --configExpand rest 2>&1 | head -20

# Nếu không có error → OK
```

---

## � BƯỚC 2.5: TẠO KEYFILE (BẮT BUỘC CHO REPLICA SET)

```
╔═══════════════════════════════════════════════════════════╗
║  KEYFILE = Shared secret giữa các nodes trong replica set ║
║  REQUIRED khi authentication enabled + replica set        ║
╚═══════════════════════════════════════════════════════════╝

KeyFile dùng để làm gì?
├─ Internal authentication giữa replica set members
├─ Ngăn rogue nodes join vào replica set
└─ Ngay cả single-node replica set cũng CẦN keyFile!

Yêu cầu:
├─ Độ dài: 6-1024 ký tự (base64)
├─ Permission: 400 hoặc 600 (chỉ owner đọc được)
└─ Owner: mongodb user
```

### **Tạo keyFile:**

```bash
# Tạo keyFile với OpenSSL (1024 bytes random)
sudo openssl rand -base64 756 | sudo tee /var/lib/mongodb/mongodb-keyfile

# Output: Chuỗi base64 random (khoảng 50 dòng)
# Ví dụ:
# xJ3K8mN2pQ4rT6vY9zA1B...
# (nhiều dòng)
# ...wX7eR5tK2hL9nM3oP1q

# Set permission 400 (chỉ owner đọc)
sudo chmod 400 /var/lib/mongodb/mongodb-keyfile

# Set owner là mongodb user
sudo chown mongodb:mongodb /var/lib/mongodb/mongodb-keyfile

# Verify
sudo ls -l /var/lib/mongodb/mongodb-keyfile

# Output:
# -r-------- 1 mongodb mongodb 1004 Feb  5 02:15 /var/lib/mongodb/mongodb-keyfile
#  ↑         ↑       ↑
#  400       owner   group
#  (chỉ owner đọc)
```

### **Cập nhật mongod.conf:**

```bash
# Edit lại config
sudo nano /etc/mongod.conf
```

```yaml
# ──────────────────────────────────────────────────────────
# FILE: /etc/mongod.conf (UPDATED)
# ──────────────────────────────────────────────────────────

# Storage
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true

# Logging
systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log

# Network
net:
  port: 27017
  bindIp: 0.0.0.0
  # ↑ Đã thay đổi ở File 05 để cho phép remote access

# Process Management
processManagement:
  timeZoneInfo: /usr/share/zoneinfo

# Security - THÊM keyFile!
security:
  authorization: enabled
  keyFile: /var/lib/mongodb/mongodb-keyfile # ← THÊM DÒNG NÀY!

# Replication
replication:
  replSetName: "rs0"

# ──────────────────────────────────────────────────────────
```

```bash
# Save: Ctrl+O → Enter → Ctrl+X

# Verify lại syntax
mongod --config /etc/mongod.conf --configExpand rest 2>&1 | head -20

# Nếu không có error → OK
```

**📌 LƯU Ý QUAN TRỌNG:**

```
╔══════════════════════════════════════════════════════════╗
║  ⚠️  KHÔNG BAO GIỜ mất keyFile này!                      ║
╠══════════════════════════════════════════════════════════╣
║  • Nếu mất keyFile → không start được MongoDB            ║
║  • Backup keyFile này ở nơi an toàn                      ║
║  • Trong production multi-node: TẤT CẢ nodes phải dùng   ║
║    CÙNG 1 keyFile (copy file này sang các nodes khác)    ║
╚══════════════════════════════════════════════════════════╝
```

### **Backup keyFile (recommended):**

```bash
# Backup vào home directory (encrypted backup)
sudo cp /var/lib/mongodb/mongodb-keyfile ~/mongodb-keyfile.backup
sudo chown $USER:$USER ~/mongodb-keyfile.backup
chmod 400 ~/mongodb-keyfile.backup

# Verify backup
ls -l ~/mongodb-keyfile.backup

# Hoặc copy vào USB/external storage để backup
```

---

## �🚀 BƯỚC 3: START MONGODB VỚI REPLICA SET

```bash
# Start MongoDB
sudo systemctl start mongod

# Kiểm tra status
sudo systemctl status mongod

# Output:
# ● mongod.service - MongoDB Database Server
#      Active:  active (running) ✅

# Kiểm tra logs
sudo tail -50 /var/log/mongodb/mongod.log

# Tìm dòng:
# {"t":{... },"s":"I", "c":"REPL", "ctx":"initandlisten","msg":"Did not find local replica set configuration document at startup"}
# → MongoDB đang chờ initiate replica set
```

---

## 🔐 BƯỚC 4: INITIATE REPLICA SET

```
╔═══════════════════════════════════════════════════════════════╗
║  ⚠️  QUAN TRỌNG: PHẢI DÙNG IP THAY VÌ HOSTNAME!              ║
╠═══════════════════════════════════════════════════════════════╣
║  Nếu dùng rs.initiate() không có config:                     ║
║  → MongoDB dùng HOSTNAME (vd: noibo-virtual-machine)          ║
║  → Máy dev KHÔNG THỂ kết nối (không resolve được hostname)   ║
║                                                               ║
║  Giải pháp: Initiate với IP ADDRESS                          ║
║  → Máy dev kết nối thành công qua IP                         ║
╚═══════════════════════════════════════════════════════════════╝
```

```bash
# Connect với admin user
mongosh -u admin -p --authenticationDatabase admin

# Trong mongosh:

// ❌ SAI: Initiate không có config (dùng hostname)
// rs.initiate()  // ← ĐỪNG DÙNG!

// ✅ ĐÚNG: Initiate với IP address
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "192.168.1.243:27017" }
  ]
})
// ↑ Thay 192.168.1.243 bằng IP thật của server!

// Output:
// {
//   ok: 1,
//   ...
// }

// Chờ vài giây, prompt sẽ đổi thành:
// rs0 [direct: primary] test>
//  ↑
//  Bạn đang ở PRIMARY node của replica set "rs0"

// Kiểm tra status
rs.status()

// Output (rút gọn):
// {
//   set: 'rs0',
//   members: [
//     {
//       _id: 0,
//       name: '192.168.1.243:27017',  ← IP ADDRESS, không phải hostname!
//       health: 1,
//       state: 1,
//       stateStr: 'PRIMARY',  ✅
//       ...
//     }
//   ],
//   ok: 1
// }

// Kiểm tra config
rs.conf()

// Output:
// {
//   _id: 'rs0',
//   version: 1,
//   members: [
//     {
//       _id: 0,
//       host: '192.168.1.243:27017',  ← PHẢI LÀ IP!
//       ...
//     }
//   ]
// }

// ⚠️ Nếu thấy host: 'noibo-virtual-machine:27017' hoặc hostname khác
// → Cần reconfigure! Xem BƯỚC 4.5 bên dưới
```

---

## 🔧 BƯỚC 4.5: RECONFIGURE (NẾU ĐÃ DÙNG HOSTNAME)

```
╔═══════════════════════════════════════════════════════════════╗
║  Nếu đã chạy rs.initiate() không có config và replica set    ║
║  đang dùng HOSTNAME thay vì IP → Cần reconfigure!            ║
╚═══════════════════════════════════════════════════════════════╝
```

### **Kiểm tra xem đang dùng hostname hay IP:**

```javascript
// Trong mongosh (đã connect với admin)
rs.conf();

// Xem field "host" trong members:
// ❌ Nếu thấy: host: "noibo-virtual-machine:27017" → HOSTNAME (cần fix)
// ✅ Nếu thấy: host: "192.168.1.243:27017" → IP (OK, skip bước này)
```

### **Cách 1: Reconfigure replica set (Recommended):**

```javascript
// Trong mongosh (vẫn connect với admin)

// Lấy config hiện tại
var config = rs.conf();

// Xem config
config;

// Sửa hostname thành IP
config.members[0].host = "192.168.1.243:27017";
// ↑ Thay 192.168.1.243 bằng IP thật của server!

// Tăng version (bắt buộc)
config.version++;

// Apply config mới
rs.reconfig(config);

// Output:
// {
//   ok: 1,
//   ...
// }

// Verify lại
rs.conf();
// Phải thấy: host: "192.168.1.243:27017"

// Check status
rs.status();
// Phải thấy: name: "192.168.1.243:27017"
```

### **Cách 2: Reset và initiate lại (Nếu Cách 1 không được):**

```javascript
// ⚠️ CẢNH BÁO: Cách này XÓA replica set config (data vẫn giữ nguyên)

// Trong mongosh
exit

// Stop MongoDB
sudo systemctl stop mongod

// Xóa replica set config
sudo rm -rf /var/lib/mongodb/local.* /var/lib/mongodb/journal/*

// Hoặc xóa toàn bộ local database (chứa replica set metadata)
sudo rm -rf /var/lib/mongodb/local

// Start MongoDB
sudo systemctl start mongod

// Connect lại
mongosh -u admin -p --authenticationDatabase admin

// Initiate lại với IP
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "192.168.1.243:27017" }
  ]
})

// Verify
rs.conf()
// Phải thấy: host: "192.168.1.243:27017"
```

### **Test từ máy dev:**

```bash
# Trên máy dev (Windows), mở PowerShell
# Test telnet
Test-NetConnection -ComputerName 192.168.1.243 -Port 27017

# Nếu "TcpTestSucceeded: True" → Network OK

# Mở MongoDB Compass
# Connection string:
mongodb://appuser:PASSWORD@192.168.1.243:27017/ticketdb?authSource=admin&replicaSet=rs0

# Click Connect
# Nếu thành công → Đã fix xong!
```

**💡 Giải thích tại sao cần dùng IP:**

```
┌─────────────────────────────────────────────────────────────┐
│  SCENARIO 1: Dùng HOSTNAME (noibo-virtual-machine)          │
├─────────────────────────────────────────────────────────────┤
│  1. Compass connect: 192.168.1.243:27017                    │
│  2. MongoDB trả lời: "Tôi là noibo-virtual-machine"          │
│  3. Compass cố connect: noibo-virtual-machine:27017          │
│  4. Windows: "noibo-virtual-machine là ai?" ❌               │
│  5. Kết quả: Connection failed!                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  SCENARIO 2: Dùng IP (192.168.1.243)                        │
├─────────────────────────────────────────────────────────────┤
│  1. Compass connect: 192.168.1.243:27017                    │
│  2. MongoDB trả lời: "Tôi là 192.168.1.243"                  │
│  3. Compass cố connect: 192.168.1.243:27017                  │
│  4. Windows: "OK, tôi biết IP này" ✅                        │
│  5. Kết quả: Connected!                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ BƯỚC 5: VERIFY REPLICA SET

```javascript
// Trong mongosh (vẫn đang connect):

// Kiểm tra replica set name
rs.conf().settings;

// Kiểm tra PRIMARY
rs.isMaster();

// Output:
// {
//   ismaster: true,  ✅
//   setName: 'rs0',
//   hosts: [ '192.168.1.243:27017' ],  ← IP ADDRESS
//   primary: '192.168.1.243:27017',
//   me: '192.168.1.243:27017',
//   ...
// }

// ⚠️ Nếu thấy hostname thay vì IP → Quay lại BƯỚC 4.5

// Hello command (MongoDB 5.0+)
db.hello();

// Thoát
exit;
```

---

## 🧪 BƯỚC 6: TEST TRANSACTIONS

### **6.1 - Tạo test script:**

```bash
cd ~/mongodb-test

# Tạo transaction test file
nano test-transaction.js
```

```javascript
// ──────────────────────────────────────────────────────────
// FILE: test-transaction.js
// ──────────────────────────────────────────────────────────

const { MongoClient } = require("mongodb");

const uri =
  "mongodb://appuser:YOUR_PASSWORD@localhost:27017/ticketdb?authSource=admin&replicaSet=rs0";
// ↑ CHÚ Ý: Thêm &replicaSet=rs0 vào connection string!

const client = new MongoClient(uri);

async function testTransaction() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB Replica Set");

    const db = client.db("ticketdb");
    const accountsCollection = db.collection("accounts");

    // Xóa test data cũ (nếu có)
    await accountsCollection.deleteMany({});

    // Tạo 2 accounts
    await accountsCollection.insertMany([
      { name: "Alice", balance: 1000 },
      { name: "Bob", balance: 500 },
    ]);

    console.log("\n📊 Initial state:");
    const accounts = await accountsCollection.find().toArray();
    accounts.forEach((acc) => {
      console.log(`  ${acc.name}: $${acc.balance}`);
    });

    // ═══════════════════════════════════════════════════════
    // TRANSACTION:  Chuyển $200 từ Alice → Bob
    // ═══════════════════════════════════════════════════════

    const session = client.startSession();

    try {
      await session.withTransaction(async () => {
        console.log("\n💸 Starting transaction:  Alice → Bob ($200)");

        // Bước 1: Trừ tiền Alice
        const updateAlice = await accountsCollection.updateOne(
          { name: "Alice" },
          { $inc: { balance: -200 } },
          { session },
        );
        console.log("  ✓ Deducted from Alice");

        // Simulation: Uncomment dòng này để test rollback
        // throw new Error('Simulated error! ');

        // Bước 2: Cộng tiền Bob
        const updateBob = await accountsCollection.updateOne(
          { name: "Bob" },
          { $inc: { balance: 200 } },
          { session },
        );
        console.log("  ✓ Added to Bob");

        console.log("✅ Transaction committed");
      });
    } catch (error) {
      console.error("❌ Transaction aborted:", error.message);
    } finally {
      await session.endSession();
    }

    // Xem kết quả
    console.log("\n📊 Final state:");
    const finalAccounts = await accountsCollection.find().toArray();
    finalAccounts.forEach((acc) => {
      console.log(`  ${acc.name}: $${acc.balance}`);
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await client.close();
    console.log("\n👋 Disconnected");
  }
}

testTransaction();

// ──────────────────────────────────────────────────────────
```

```bash
# Save: Ctrl+O → Enter → Ctrl+X

# NHỚ THAY YOUR_PASSWORD bằng password thật!
nano test-transaction.js
# Sửa dòng const uri = ...
```

### **6.2 - Chạy test:**

```bash
node test-transaction.js

# Output mong muốn:
# ✅ Connected to MongoDB Replica Set
#
# 📊 Initial state:
#   Alice: $1000
#   Bob: $500
#
# 💸 Starting transaction: Alice → Bob ($200)
#   ✓ Deducted from Alice
#   ✓ Added to Bob
# ✅ Transaction committed
#
# 📊 Final state:
#   Alice: $800
#   Bob: $700
#
# 👋 Disconnected
```

### **6.3 - Test rollback:**

```bash
# Edit file
nano test-transaction.js

# Uncomment dòng:
// throw new Error('Simulated error!');
# → Thành:
throw new Error('Simulated error! ');

# Save và chạy lại
node test-transaction.js

# Output:
# ✅ Connected to MongoDB Replica Set
#
# 📊 Initial state:
#   Alice:  $800
#   Bob: $700
#
# 💸 Starting transaction: Alice → Bob ($200)
#   ✓ Deducted from Alice
# ❌ Transaction aborted: Simulated error!
#
# 📊 Final state:
#   Alice: $800   ← KHÔNG THAY ĐỔI (rollback thành công!)
#   Bob: $700     ← KHÔNG THAY ĐỔI
#
# 👋 Disconnected
```

---

## 🔍 BƯỚC 7: VERIFY TRONG MONGOSH

```bash
# Connect
mongosh -u appuser -p --authenticationDatabase admin ticketdb

# Trong mongosh:

// Kiểm tra replica set status
rs.status()

// Xem accounts collection
db.accounts.find()

// Output:
// [
//   { _id: ObjectId('...'), name: 'Alice', balance: 800 },
//   { _id: ObjectId('...'), name: 'Bob', balance: 700 }
// ]

// Test transaction trong mongosh
const session = db.getMongo().startSession();
session.startTransaction();

try {
  const accountsCol = session.getDatabase('ticketdb').accounts;

  accountsCol.updateOne(
    { name: 'Alice' },
    { $inc: { balance: -100 } }
  );

  accountsCol.updateOne(
    { name: 'Bob' },
    { $inc: { balance: 100 } }
  );

  session.commitTransaction();
  print('Transaction committed');
} catch (error) {
  session.abortTransaction();
  print('Transaction aborted:  ' + error);
} finally {
  session.endSession();
}

// Xem kết quả
db.accounts.find()

// Xóa test data
db.accounts.drop()

// Thoát
exit
```

---

## 🛠️ TROUBLESHOOTING

### **Lỗi: `security.keyFile is required when authorization is enabled with replica sets`**

```
Nguyên nhân: Thiếu keyFile khi dùng replica set với authentication

Giải pháp:
1. Tạo keyFile:
   sudo openssl rand -base64 756 | sudo tee /var/lib/mongodb/mongodb-keyfile

2. Set permissions:
   sudo chmod 400 /var/lib/mongodb/mongodb-keyfile
   sudo chown mongodb:mongodb /var/lib/mongodb/mongodb-keyfile

3. Thêm vào /etc/mongod.conf:
   security:
     authorization: enabled
     keyFile: /var/lib/mongodb/mongodb-keyfile

4. Restart MongoDB:
   sudo systemctl restart mongod
```

### **Lỗi: `permissions on /var/lib/mongodb/mongodb-keyfile are too open`**

```bash
# KeyFile phải có permission 400 hoặc 600, KHÔNG được 644/755

# Fix:
sudo chmod 400 /var/lib/mongodb/mongodb-keyfile
sudo chown mongodb:mongodb /var/lib/mongodb/mongodb-keyfile

# Verify:
sudo ls -l /var/lib/mongodb/mongodb-keyfile
# Phải thấy: -r-------- 1 mongodb mongodb

# Restart:
sudo systemctl restart mongod
```

### **Lỗi: `Transaction numbers are only allowed on a replica set member`**

```
Nguyên nhân: MongoDB chưa initiate replica set

Giải pháp:
1. Connect mongosh
2. Chạy:  rs.initiate()
3. Chờ prompt đổi thành: rs0 [direct: primary]
4. Thử lại
```

### **Lỗi: `No primary found in replica set`**

```bash
# Kiểm tra status
mongosh -u admin -p --authenticationDatabase admin
rs.status()

# Tìm field "stateStr" của từng member
# Phải có ít nhất 1 member có stateStr:  "PRIMARY"

# Nếu tất cả đều "SECONDARY" hoặc "STARTUP":
# Chờ thêm 30 giây, MongoDB đang election

# Nếu vẫn không có PRIMARY sau 1 phút:
# Restart MongoDB
sudo systemctl restart mongod

# Wait 30s và check lại
```

### **Lỗi: MongoDB Compass không kết nối được từ máy dev**

```
Triệu chứng:
- Từ server (localhost) connect OK
- Từ máy dev (MongoDB Compass) timeout hoặc "No primary found"

Nguyên nhân:
1. UFW chưa cho phép IP máy dev → Xem File 03
2. MongoDB dùng HOSTNAME thay vì IP ← Nguyên nhân phổ biến!
3. bindIp vẫn là 127.0.0.1 → Xem File 05

Kiểm tra:
```

```javascript
// Connect vào server
mongosh -u admin -p --authenticationDatabase admin

// Check replica set config
rs.conf()

// Xem field "host":
// ❌ host: "noibo-virtual-machine:27017" → ĐÂY LÀ VẤN ĐỀ!
// ✅ host: "192.168.1.243:27017" → OK

// Nếu thấy hostname → Reconfigure:
var config = rs.conf()
config.members[0].host = "192.168.1.243:27017"  // IP thật
config.version++
rs.reconfig(config)

// Verify lại
rs.status()
// Phải thấy: name: "192.168.1.243:27017"

// Bây giờ từ máy dev connect lại
```

```bash
# Check thêm:

# 1. UFW có cho phép IP máy dev không?
sudo ufw status | grep 27017

# 2. MongoDB có listen 0.0.0.0 không?
sudo ss -tulpn | grep 27017
# Phải thấy: 0.0.0.0:27017

# 3. Test từ máy dev
# Trên Windows PowerShell:
Test-NetConnection -ComputerName 192.168.1.243 -Port 27017
# Phải thấy: TcpTestSucceeded: True
```

### **Lỗi: `connection string must include replicaSet`**

```javascript
// Sai:
mongodb://user:pass@localhost:27017/db

// Đúng:
mongodb://user:pass@localhost:27017/db?replicaSet=rs0
//                                        ↑ Thêm này!
```

### **Replica Set không start sau reboot:**

```bash
# MongoDB phải start SAU KHI network ready

# Kiểm tra systemd service
sudo systemctl status mongod

# Nếu failed, check logs
sudo journalctl -u mongod -n 100

# Fix: Enable network dependency
sudo nano /lib/systemd/system/mongod.service

# Thêm vào [Unit]:
After=network-online.target
Wants=network-online.target

# Reload systemd
sudo systemctl daemon-reload
sudo systemctl restart mongod
```

---

## 📊 REPLICA SET MONITORING

### **Check replica set health:**

```javascript
// Trong mongosh

// Status tổng quan
rs.status();

// Config
rs.conf();

// Xem oplog (replication log) size
db.getReplicationInfo();

// Output:
// {
//   logSizeMB: 1024,
//   usedMB: 0. 05,
//   timeDiff: 3600,
//   ...
// }

// Kiểm tra lag (nếu có nhiều nodes)
rs.printSlaveReplicationInfo();
```

### **Monitoring scripts:**

```bash
# Tạo monitoring script
nano ~/check-replica. sh
```

```bash
#!/bin/bash
# ──────────────────────────────────────────────────────────
# FILE: check-replica.sh
# ──────────────────────────────────────────────────────────

echo "🔍 Checking MongoDB Replica Set..."

# Connection string
MONGO_URI="mongodb://admin:YOUR_PASSWORD@localhost:27017/admin?authSource=admin"

# Check status
mongosh "$MONGO_URI" --quiet --eval "
  var status = rs.status();
  print('Replica Set:  ' + status.set);
  print('Members: ' + status.members.length);
  status.members.forEach(function(member) {
    print('  - ' + member.name + ': ' + member.stateStr);
  });
"

echo "✅ Check complete"

# ──────────────────────────────────────────────────────────
```

```bash
# Save và make executable
chmod +x ~/check-replica.sh

# Chạy
~/check-replica.sh

# Output:
# 🔍 Checking MongoDB Replica Set...
# Replica Set: rs0
# Members: 1
#   - 127.0.0.1:27017: PRIMARY
# ✅ Check complete
```

---

## 📝 CONNECTION STRING REFERENCE

### **Với Replica Set:**

```javascript
// Từ SERVER (app code trên server):
mongodb://user:pass@localhost:27017/dbname?authSource=admin&replicaSet=rs0
// ↑ Dùng localhost = nhanh hơn, không qua network

// Từ MÁY DEV (MongoDB Compass/Studio 3T):
mongodb://user:pass@192.168.1.243:27017/dbname?authSource=admin&replicaSet=rs0
// ↑ PHẢI DÙNG IP, không dùng localhost!

// Multiple nodes (production):
mongodb://user:pass@192.168.1.10:27017,192.168.1.11:27017,192.168.1.12:27017/dbname?authSource=admin&replicaSet=rs0
// ↑ Dùng IP cho tất cả nodes

// Với options khác
mongodb://user:pass@localhost:27017/dbname?authSource=admin&replicaSet=rs0&retryWrites=true&w=majority

// Options giải thích:
// authSource=admin      → Database chứa user credentials
// replicaSet=rs0        → Tên replica set (BẮT BUỘC cho transactions)
// retryWrites=true      → Tự động retry nếu write fail
// w=majority            → Write concern (đợi majority nodes confirm)
```

---

## ✅ CHECKLIST HOÀN THÀNH

```
□ Đã tạo keyFile (/var/lib/mongodb/mongodb-keyfile)
□ KeyFile có permission 400 và owner mongodb:mongodb
□ Đã backup keyFile vào nơi an toàn
□ MongoDB đã cấu hình với replicaSet: rs0 và keyFile
□ bindIp: 0.0.0.0 (cho phép remote access)
□ Đã restart MongoDB thành công
□ Đã initiate replica set với IP ADDRESS (không phải hostname)
□ rs.conf() hiển thị host: "192.168.1.243:27017" (IP, không phải hostname)
□ Prompt mongosh hiển thị: rs0 [direct: primary]
□ rs.status() hiển thị stateStr: "PRIMARY"
□ Đã test connection từ máy dev (MongoDB Compass) thành công
□ Đã test transaction từ Node.js thành công
□ Transaction commit thành công
□ Transaction rollback thành công (khi có error)
□ Connection string có &replicaSet=rs0
□ Đã xóa test data (db.accounts.drop())

GHI CHÚ:
Replica Set Name: rs0
Member: 192.168.1.243:27017 (PRIMARY)  ← PHẢI LÀ IP!

Connection String (từ server):
mongodb://appuser:PASSWORD@localhost:27017/ticketdb?authSource=admin&replicaSet=rs0

Connection String (từ máy dev):
mongodb://appuser:PASSWORD@192.168.1.243:27017/ticketdb?authSource=admin&replicaSet=rs0

⚠️ LƯU Ý:
- App code trên server: Dùng localhost (nhanh hơn)
- MongoDB Compass/Studio 3T: Dùng IP 192.168.1.243
- rs.conf() PHẢI hiển thị IP, KHÔNG phải hostname!

→ Sẵn sàng chuyển sang File 07-MONGODB-BACKUP.md
```

---

**⏭️ TIẾP THEO: File 07-MONGODB-BACKUP.md**
