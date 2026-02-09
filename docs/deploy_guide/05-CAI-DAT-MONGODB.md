# 📘 PHẦN 5: CÀI ĐẶT MONGODB

## 🎯 MỤC TIÊU

Sau phần này bạn sẽ:

- ✅ Hiểu MongoDB là gì và tại sao dùng
- ✅ Cài đặt MongoDB 7.0 (latest stable)
- ✅ Cấu hình MongoDB security
- ✅ Tạo users và databases
- ✅ Test connection
- ✅ Chuẩn bị cho Replica Set (transaction support)

---

## 🗄️ MONGODB LÀ GÌ?

```
MongoDB = NoSQL Database
        = Document-oriented Database
        = Lưu data dạng JSON-like (BSON)

┌─────────────────────────────────────────────────────────┐
│  SQL DATABASE (MySQL, PostgreSQL):                     │
├─────────────────────────────────────────────────────────┤
│  Table:  Users                                           │
│  ┌────┬──────────┬─────────┬─────────────┐             │
│  │ ID │ Name     │ Email   │ Age         │             │
│  ├────┼──────────┼─────────┼─────────────┤             │
│  │ 1  │ John     │ j@e.com │ 30          │             │
│  │ 2  │ Jane     │ ja@e.com│ 25          │             │
│  └────┴──────────┴─────────┴─────────────┘             │
│  • Fixed schema (phải define trước)                     │
│  • Relationships với JOIN                               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  MONGODB (NoSQL):                                       │
├─────────────────────────────────────────────────────────┤
│  Collection: users                                      │
│  {                                                      │
│    _id: ObjectId("..."),                                │
│    name: "John",                                        │
│    email: "j@e. com",                                    │
│    age: 30,                                             │
│    address: { city: "Hanoi", street: "..." }           │
│  }                                                      │
│  {                                                      │
│    _id: ObjectId("..."),                                │
│    name:  "Jane",                                        │
│    email: "ja@e.com",                                   │
│    hobbies: ["reading", "coding"]                       │
│  }                                                      │
│  • Flexible schema (mỗi document khác nhau OK)          │
│  • Embedded documents (không cần JOIN)                  │
│  • Dễ scale horizontally                                │
└─────────────────────────────────────────────────────────┘

Tại sao dùng MongoDB:
✅ Flexible schema (phù hợp MVP, thay đổi nhanh)
✅ JSON-native (dễ dùng với Node.js)
✅ Powerful query language
✅ Good performance cho read-heavy workloads
✅ Built-in replication & sharding
```

---

## 📦 BƯỚC 1: IMPORT MONGODB PUBLIC KEY

```bash
# SSH vào server
ssh youruser@192.168.1.243

# Import MongoDB GPG key
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg \
   --dearmor

# Kiểm tra key đã import
ls -la /usr/share/keyrings/ | grep mongodb

# Output:
# -rw-r--r--  1 root root  ...  mongodb-server-7.0.gpg
```

---

## 📝 BƯỚC 2: THÊM MONGODB REPOSITORY

### **Kiểm tra Ubuntu version:**

```bash
lsb_release -a

# Output:
# Distributor ID: Ubuntu
# Description:     Ubuntu 22.04.x LTS
# Release:        22.04
# Codename:       jammy

# → jammy = Ubuntu 22.04
# → focal = Ubuntu 20.04
```

### **Thêm repository:**

```bash
# Cho Ubuntu 22.04 (jammy)
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list. d/mongodb-org-7.0.list

# Nếu Ubuntu 20.04, thay "jammy" thành "focal"

# Kiểm tra file đã tạo
cat /etc/apt/sources.list.d/mongodb-org-7.0.list

# Output:
# deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse
```

---

## 🚀 BƯỚC 3: CÀI ĐẶT MONGODB

(
Nếu lỗi: chạy cụm lệnh:

# Đảm bảo file địa chỉ đúng

(echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Bắt buộc cập nhật danh sách

sudo apt update

# Thử cài đặt lại

sudo apt install -y mongodb-org)
)

```bash
# Update package list
sudo apt update

# Cài MongoDB
sudo apt install -y mongodb-org

# Output:
# Reading package lists... Done
# Building dependency tree... Done
# The following NEW packages will be installed:
#   mongodb-database-tools mongodb-mongosh mongodb-org mongodb-org-database ...
# ...
# Setting up mongodb-org (7.0.x) ...

# Kiểm tra version
mongod --version

# Output:
# db version v7.0.x
# Build Info: {
#     "version": "7.0.x",
#     ...
# }
```

---

## ⚙️ BƯỚC 4: START MONGODB SERVICE

```bash
# Start MongoDB
sudo systemctl start mongod

# Kiểm tra status
sudo systemctl status mongod

# Output mong muốn:
# ● mongod.service - MongoDB Database Server
#      Loaded: loaded (/lib/systemd/system/mongod.service; disabled)
#      Active: active (running) ✅
#      ...

# Enable tự động start khi boot
sudo systemctl enable mongod

# Output:
# Created symlink /etc/systemd/system/multi-user.target.wants/mongod.service

# Kiểm tra MongoDB đang listen port nào
sudo ss -tulpn | grep mongod

# Output (mặc định - chỉ localhost):
# tcp   LISTEN  0  4096  127.0.0.1:27017  0.0.0.0:*  users:(("mongod",pid=12345))
#                       ↑
#                    Chỉ listen localhost
#
# Sau khi config bindIp: 0.0.0.0 ở BƯỚC 6, output sẽ là:
# tcp   LISTEN  0  4096  0.0.0.0:27017    0.0.0.0:*  users:(("mongod",pid=12345))
#                       ↑
#                    Listen tất cả interfaces (kết hợp với UFW)
```

---

## 🔐 BƯỚC 5: BẢO MẬT MONGODB

### **MongoDB mặc định KHÔNG CÓ AUTHENTICATION! **

```
⚠️ NGUY HIỂM:
Mặc định, MongoDB cho phép kết nối không cần password!
Phải enable authentication ngay!
```

### **5.1 - Kết nối MongoDB lần đầu:**

```bash
# Kết nối vào MongoDB Shell
mongosh

# Output:
# Current Mongosh Log ID: ...
# Connecting to:   mongodb://127.0.0.1:27017/? directConnection=true
# Using MongoDB:   7.0.x
# Using Mongosh:  2.x. x
#
# test>

# → Bạn đã vào MongoDB shell
# Prompt:  test> (đang ở database "test")
```

### **5.2 - Tạo Admin User:**

```javascript
// Trong mongosh:

// Switch sang admin database
use admin

// Output:  switched to db admin

// Tạo admin user
db.createUser({
  user: "admin",
  pwd: "YOUR_STRONG_PASSWORD_HERE",  // ĐỔI PASSWORD NÀY!
  roles: [
    { role: "root", db: "admin" }
  ]
})

// Output:
// { ok: 1 }

// Verify user đã tạo
db.getUsers()

// Output:
// {
//   users: [
//     {
//       _id: 'admin.admin',
//       user: 'admin',
//       db: 'admin',
//       roles: [ { role: 'root', db: 'admin' } ]
//     }
//   ],
//   ok: 1
// }

// Thoát mongosh
exit
```

### **📝 GHI CHÚ QUAN TRỌNG:**

```
═══════════════════════════════════════════════════════
MONGODB CREDENTIALS
═══════════════════════════════════════════════════════

Admin User: admin
Admin Password: ___________________________________
                     ↑ GHI VÀO ĐÂY VÀ CẤT KỸ!

Connection String:
mongodb://admin:PASSWORD@localhost:27017/admin?authSource=admin

═══════════════════════════════════════════════════════
```

---

## 🔒 BƯỚC 6: ENABLE AUTHENTICATION

```bash
# Stop MongoDB
sudo systemctl stop mongod

# Backup config gốc
sudo cp /etc/mongod.conf /etc/mongod.conf.backup

# Edit config
sudo nano /etc/mongod.conf
```

```yaml
# ──────────────────────────────────────────────────────────
# FILE: /etc/mongod.conf
# ──────────────────────────────────────────────────────────

# Where and how to store data.
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true

# Where to write logging data.
systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log

# Network interfaces
net:
  port: 27017
  bindIp: 0.0.0.0 # ← Listen tất cả interfaces (cho phép remote access)

# ═══════════════════════════════════════════════════════════════════════════
# 📌 GIẢI THÍCH bindIp:
# ═══════════════════════════════════════════════════════════════════════════
#
# OPTION A: Chỉ localhost (AN TOÀN NHẤT)
#   bindIp: 127.0.0.1
#   → Chỉ app trên server mới kết nối được
#   → Không thể dùng MongoDB Compass từ máy dev
#
# OPTION B: 0.0.0.0 - Listen tất cả (KHUYẾN NGHỊ với Firewall) ⭐
#   bindIp: 0.0.0.0
#   → Cho phép kết nối từ bất kỳ IP nào
#   → NHƯNG: UFW đã chặn, chỉ các IP được phép trong UFW mới kết nối được
#   → Đã config ở File 03: 192.168.5.200, 192.168.5.136, 192.168.5.212
#   → Vừa linh hoạt vừa an toàn
#
# OPTION C: Chỉ định cụ thể (KIỂM SOÁT CHẶT)
#   bindIp: 127.0.0.1,192.168.1.243
#   → Chỉ localhost và IP server
#   → Phải restart MongoDB mỗi khi thêm IP
#
# 🎯 KHUYẾN NGHỊ:
# Dùng 0.0.0.0 kết hợp với UFW firewall (đã config ở File 03)
# → MongoDB sẵn sàng nhận connections
# → UFW quyết định ai được phép kết nối
# → Dễ quản lý hơn (chỉ sửa UFW, không cần restart MongoDB)
#
# ⚠️ BẮT BUỘC:
# - PHẢI enable authentication (security.authorization: enabled)
# - PHẢI config UFW cho port 27017 (đã làm ở File 03)
# - PHẢI dùng strong password cho users
#
# ═══════════════════════════════════════════════════════════════════════════

# Process management options
processManagement:
  timeZoneInfo: /usr/share/zoneinfo

# Security
security:
  authorization: enabled # ← THÊM DÒNG NÀY!


# Replication (sẽ config ở file tiếp theo)
#replication:
#  replSetName: "rs0"

# ──────────────────────────────────────────────────────────
```

```bash
# Save:  Ctrl+O → Enter → Ctrl+X

# Start lại MongoDB
sudo systemctl start mongod

# Kiểm tra status
sudo systemctl status mongod

# Kiểm tra logs nếu có lỗi
sudo tail -f /var/log/mongodb/mongod.log

# Nhấn Ctrl+C để thoát
```

---

## 🧪 BƯỚC 7: TEST AUTHENTICATION

### **Test connection không có password (phải fail):**

```bash
# Thử kết nối không auth
mongosh

# Trong mongosh, thử query
show dbs

# Output:
# MongoServerError: command listDatabases requires authentication
#   ↑ ĐÚNG!  Không có auth không làm được gì ✅

# Thoát
exit
```

### **Test connection với admin user:**

```bash
# Kết nối với authentication
mongosh -u admin -p --authenticationDatabase admin

# Nhập password khi được hỏi
# Output:
# Enter password:  ********
# ...
# admin>

# Thử query
show dbs

# Output:
# admin   180.00 KiB
# config   60.00 KiB
# local    72.00 KiB
#   ↑ Thành công! ✅

# Thoát
exit
```

### **Test với connection string:**

```bash
# Cách khác:  dùng connection string
mongosh "mongodb://admin:YOUR_PASSWORD@localhost:27017/admin? authSource=admin"

# Thay YOUR_PASSWORD bằng password thật

# Nếu vào được → OK ✅
```

---

## 👤 BƯỚC 8: TẠO APPLICATION USER

### **Không nên dùng admin user cho application! **

```bash
# Connect bằng admin
mongosh -u admin -p --authenticationDatabase admin

# Trong mongosh:

// Switch sang admin database
use admin

// Tạo user cho application
db.createUser({
  user: "appuser",
  pwd: "APP_USER_PASSWORD_HERE",  // ĐỔI PASSWORD!
  roles: [
    { role: "readWrite", db:  "ticketdb" },  // Database của bạn
    { role: "readWrite", db: "ticketdb_test" }  // Test database
  ]
})

// Output:
// { ok: 1 }

// Verify
db.getUsers()

// Thoát
exit
```

### **📝 GHI CHÚ:**

```
═══════════════════════════════════════════════════════
APPLICATION USER
═══════════════════════════════════════════════════════

App User: appuser
App Password:  _____________________________________

Database name: ticketdb (production)
Test Database: ticketdb_test

Connection String (cho Node.js):
mongodb://appuser:PASSWORD@localhost:27017/ticketdb?authSource=admin

═══════════════════════════════════════════════════════
```

---

## 🔌 BƯỚC 9: TEST TỪ NODE.JS

### **Cài MongoDB driver:**

```bash
# Tạo test folder
cd ~
mkdir mongodb-test
cd mongodb-test

# Init npm
npm init -y

# Cài mongodb driver
npm install mongodb

# Tạo test file
nano test-connection.js
```

```javascript
// ──────────────────────────────────────────────────────────
// FILE: test-connection.js
// ──────────────────────────────────────────────────────────

const { MongoClient } = require("mongodb");

// Connection string
const uri =
  "mongodb://appuser:APP_USER_PASSWORD_HERE@localhost:27017/ticketdb? authSource=admin";
// ↑ THAY APP_USER_PASSWORD_HERE bằng password thật!

const client = new MongoClient(uri);

async function testConnection() {
  try {
    // Connect
    await client.connect();
    console.log("✅ Connected to MongoDB!");

    // Get database
    const db = client.db("ticketdb");

    // Get collections list
    const collections = await db.listCollections().toArray();
    console.log("📁 Collections:", collections);

    // Insert test document
    const testCollection = db.collection("test");
    const result = await testCollection.insertOne({
      message: "Hello MongoDB!",
      timestamp: new Date(),
    });
    console.log("📝 Inserted document ID:", result.insertedId);

    // Query test document
    const doc = await testCollection.findOne({ message: "Hello MongoDB!" });
    console.log("📄 Found document:", doc);

    // Count documents
    const count = await testCollection.countDocuments();
    console.log("🔢 Total documents:", count);
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await client.close();
    console.log("👋 Disconnected from MongoDB");
  }
}

testConnection();

// ──────────────────────────────────────────────────────────
```

```bash
# Save: Ctrl+O → Enter → Ctrl+X

# Chạy test
node test-connection.js

# Output mong muốn:
# ✅ Connected to MongoDB!
# 📁 Collections: []
# 📝 Inserted document ID: new ObjectId('.. .')
# 📄 Found document: {
#   _id: new ObjectId('... '),
#   message: 'Hello MongoDB!',
#   timestamp: 2025-12-26T10:30:00.000Z
# }
# 🔢 Total documents: 1
# 👋 Disconnected from MongoDB
```

---

## 🗑️ BƯỚC 10: XÓA TEST DATA

```bash
# Connect MongoDB
mongosh -u appuser -p --authenticationDatabase admin ticketdb

# Trong mongosh:

// Xóa test collection
db.test.drop()

// Output:  true

// Verify
show collections

// Output:  (rỗng)

// Thoát
exit
```

---

## 🛠️ TROUBLESHOOTING

### **Lỗi: `Failed to connect...  Authentication failed`**

```bash
# Kiểm tra user/password
mongosh -u admin -p --authenticationDatabase admin

# Nếu vào được → Password đúng
# Nếu lỗi → Reset password

# Reset password admin:
# 1. Stop MongoDB
sudo systemctl stop mongod

# 2. Tạm thời disable auth
sudo nano /etc/mongod.conf
# Comment dòng:   # authorization: enabled

# 3. Start MongoDB
sudo systemctl start mongod

# 4. Connect không auth
mongosh

# 5. Đổi password
use admin
db.changeUserPassword("admin", "NEW_PASSWORD")

# 6. Thoát, enable lại auth, restart
```

### **Lỗi: `MongoServerError: command ...  requires authentication`**

```
✅ Đây là ĐÚNG khi chưa authenticate!

Giải pháp: Login với user có quyền
mongosh -u admin -p --authenticationDatabase admin
```

### **MongoDB không start:**

```bash
# Xem logs
sudo tail -100 /var/log/mongodb/mongod.log

# Thường gặp:
# - Permission denied → Fix permissions
sudo chown -R mongodb:mongodb /var/lib/mongodb
sudo chown mongodb:mongodb /tmp/mongodb-27017.sock

# - Port đã bị chiếm
sudo lsof -i :27017
# Kill process khác đang dùng port

# - Config syntax error
sudo mongod --config /etc/mongod.conf --configExpand rest
```

### **Connection timeout từ Node.js:**

```javascript
// Thêm timeout options
const client = new MongoClient(uri, {
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
});
```

---

## 📊 MONGODB COMMANDS REFERENCE

### **Trong mongosh:**

```javascript
// Database commands
show dbs                  // List databases
use mydb                  // Switch database
db.getName()              // Current database
db.dropDatabase()         // Delete database (cẩn thận!)

// Collection commands
show collections          // List collections
db.createCollection('users')
db.users.drop()          // Delete collection

// CRUD operations
db.users.insertOne({ name: 'John' })
db.users.insertMany([{ name: 'Jane' }, { name: 'Bob' }])
db.users.find()          // Get all
db.users.findOne({ name: 'John' })
db.users.updateOne({ name: 'John' }, { $set: { age: 30 } })
db.users.deleteOne({ name: 'John' })
db.users.countDocuments()

// Indexes
db.users.createIndex({ email: 1 })  // 1 = ascending
db.users.getIndexes()

// Stats
db.stats()
db.users.stats()
```

---

## ✅ CHECKLIST HOÀN THÀNH

```
□ MongoDB 7.0 đã cài đặt
□ MongoDB service đang chạy
□ Đã tạo admin user với password mạnh
□ Đã enable authentication trong mongod.conf
□ Đã config bindIp: 0.0.0.0 (cho phép remote access)
□ Đã verify UFW cho phép port 27017 từ IP dev (File 03)
□ Đã tạo appuser cho application
□ Đã test connection với mongosh
□ Đã test connection từ Node.js
□ Đã test connection từ máy dev (MongoDB Compass)
□ Đã ghi lại credentials ở nơi an toàn

CREDENTIALS ĐÃ GHI:
Admin User: admin
Admin Password: ____________________

App User: appuser
App Password: ____________________

Database: ticketdb

Connection String (từ server):
mongodb://appuser:PASSWORD@localhost:27017/ticketdb?authSource=admin

Connection String (từ máy dev):
mongodb://appuser:PASSWORD@192.168.1.243:27017/ticketdb?authSource=admin

📌 GHI CHÚ QUAN TRỌNG:
─────────────────────
Config hiện tại:
├─ bindIp: 0.0.0.0 (Listen tất cả interfaces) ✅
├─ Authentication: ENABLED ✅
├─ UFW cho phép: localhost + IP dev (192.168.5.200/136/212) ✅
├─ Admin user: admin / [PASSWORD]
└─ App user: appuser / [PASSWORD]

💡 Lợi ích:
   - App server: Kết nối qua localhost (nhanh, không qua network)
   - Dev machines: Dùng MongoDB Compass qua LAN để debug
   - Bảo mật: UFW (firewall) + Authentication (2 lớp bảo vệ)

⚠️ LƯU Ý BẢO MẬT:
   - KHÔNG BAO GIỜ expose MongoDB ra Internet không có VPN/SSH tunnel
   - Luôn dùng strong password (ít nhất 16 ký tự, mix chữ/số/ký tự đặc biệt)
   - Chỉ cấp quyền cần thiết cho app user (readWrite, KHÔNG phải root)
   - Review UFW rules định kỳ, xóa IP không còn dùng
   - Backup thường xuyên
   - Monitor logs: sudo tail -f /var/log/mongodb/mongod.log

🔗 Tham khảo thêm:
   - File 03 (UFW): Đã config port 27017 cho IP dev
   - Connection từ máy dev: Xem hướng dẫn bên dưới

→ Sẵn sàng chuyển sang File 06-MONGODB-REPLICA-SET.md
```

---

## 🖥️ BONUS: KẾT NỐI TỪ MÁY DEV (MONGODB COMPASS)

> **📌 YÊU CẦU:** Máy dev phải có IP đã được phép trong UFW (File 03)

### Bước 1: Cài MongoDB Compass

```
Download từ: https://www.mongodb.com/try/download/compass
Chọn version phù hợp với OS (Windows/Mac/Linux)
```

### Bước 2: Kết nối

```
1. Mở MongoDB Compass
2. Click "New Connection"
3. Điền connection string:
   mongodb://appuser:PASSWORD@192.168.1.243:27017/ticketdb?authSource=admin

   Hoặc điền từng field:
   - Host: 192.168.1.243
   - Port: 27017
   - Authentication: Username/Password
   - Username: appuser
   - Password: [APP PASSWORD]
   - Authentication Database: admin

4. Click "Connect"
```

### Bước 3: Test kết nối

```bash
# Nếu KHÔNG kết nối được, kiểm tra:

# 1. MongoDB có đang chạy không?
sudo systemctl status mongod

# 2. MongoDB có listen 0.0.0.0 không?
sudo ss -tulpn | grep 27017
# Phải thấy: 0.0.0.0:27017

# 3. UFW có cho phép IP của bạn không?
sudo ufw status | grep 27017
# Phải thấy IP máy bạn

# 4. Test telnet từ máy dev
telnet 192.168.1.243 27017
# Nếu "Connected" → Network OK
# Nếu timeout → Firewall block

# 5. Check MongoDB logs
sudo tail -50 /var/log/mongodb/mongod.log
# Tìm dòng có IP máy bạn
```

---

**⏭️ TIẾP THEO: File 06-MONGODB-REPLICA-SET.md**
