# 📘 PHẦN 4: CÀI ĐẶT NODE.JS & NPM

## 🎯 MỤC TIÊU

Sau phần này bạn sẽ:

- ✅ Hiểu Node.js là gì và tại sao cần
- ✅ Cài đặt Node.js bằng NVM (Node Version Manager)
- ✅ Quản lý nhiều phiên bản Node.js
- ✅ Cài đặt npm packages
- ✅ Kiểm tra và test Node.js

---

## 📦 NODE.JS LÀ GÌ

Node.js = JavaScript Runtime = Chạy JavaScript ngoài browser

```
TRƯỚC ĐÂY:
- JavaScript chỉ chạy trong Browser (Chrome, Firefox)
- Không thể viết Backend

BÂY GIỜ (Node.js):
- JavaScript chạy trên Server
- Có thể viết Backend APIs, WebSocket, etc.
- V8 Engine (từ Chrome) + APIs để access file, network, etc.

Stack của bạn:
Frontend:  React (JavaScript) → Browser
Backend:   Express.js (JavaScript) → Node.js → Server
```

---

## 🔧 TẠI SAO DÙNG NVM

NVM = Node Version Manager

```
KHÔNG DÙNG NVM (cài trực tiếp):
- Chỉ có 1 version Node.js
- Khó upgrade/downgrade
- Conflict khi project khác cần version khác
- Cần sudo để cài packages globally

DÙNG NVM (recommended):
- Dễ dàng switch giữa nhiều versions
- Cài/gỡ version trong 1 dòng lệnh
- Mỗi project dùng version riêng
- Không cần sudo
- Industry standard
```

---

## 📥 BƯỚC 0: CÀI ĐẶT CÁC CÔNG CỤ CẦN THIẾT (Dependencies)

> **⚠️ QUAN TRỌNG:** Nếu bỏ qua bước này, `curl: command not found` sẽ xuất hiện!

Lỗi này xảy ra vì Ubuntu base image không có curl/wget/git pre-installed.

```bash
# SSH vào server
ssh youruser@192.168.1.243

# Update package list
sudo apt update

# Cài đặt các công cụ cần thiết
sudo apt install -y curl wget git build-essential

# Kiểm tra curl
curl --version

# Kiểm tra git
git --version
```

**Giải thích các công cụ:**

| Công cụ             | Mục đích                     | Cần cho                                     |
| ------------------- | ---------------------------- | ------------------------------------------- |
| **curl**            | Download files từ Internet   | NVM install script                          |
| **wget**            | Download alternative         | Backup nếu curl lỗi                         |
| **git**             | Version control, clone repos | NVM repository từ GitHub                    |
| **build-essential** | C/C++ compiler               | Native Node modules (bcrypt, sqlite3, etc.) |

### Nếu gặp lỗi "curl: command not found"

```bash
# Cách 1: Cài curl riêng
sudo apt install curl -y

# Cách 2: Dùng wget thay thế
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Cách 3: Cài tất cả cùng lúc (khuyến nghị)
sudo apt install -y curl wget git build-essential
```

---

## 📥 BƯỚC 1: CÀI ĐẶT NVM

> **📌 ĐIỀU KIỆN:** BƯỚC 0 phải hoàn thành xong!
> Nếu bỏ qua BƯỚC 0 → sẽ lỗi: `Command 'curl' not found`

```bash
# SSH vào server
ssh youruser@192.168.1.243

# Kiểm tra nếu đã cài Node.js trước đó (không nên)
which node

# Nếu có output → Gỡ bỏ trước
sudo apt remove nodejs npm

# Cài NVM từ GitHub (dùng curl từ BƯỚC 0)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Output:
# => Downloading nvm from git to '/home/youruser/.nvm'
# => Cloning into '/home/youruser/.nvm'...
# => Appending nvm source string to /home/youruser/.bashrc

# Load NVM vào session hiện tại
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Hoặc reload bash
source ~/.bashrc

# Kiểm tra NVM
nvm --version
# Output: v0.39.7
```

### Troubleshooting: Nếu `nvm: command not found`

```bash
# Thêm vào ~/.bashrc thủ công
nano ~/.bashrc

# Thêm vào cuối file:
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# Save: Ctrl+O → Enter → Ctrl+X

# Reload
source ~/.bashrc

# Test lại
nvm --version
```

---

## 🚀 BƯỚC 2: CÀI ĐẶT NODE.JS

### Chọn phiên bản Node.js

```bash
# Xem các versions có sẵn
nvm list-remote

# Giải thích:
# LTS = Long Term Support (khuyến nghị cho production)
# Latest = Phiên bản mới nhất (có thể chưa ổn định)
```

### Cài phiên bản LTS (khuyến nghị)

```bash
# Cài Node.js LTS mới nhất
nvm install --lts

# Output:
# Downloading and installing node v20.10.0...
# Now using node v20.10.0 (npm v10.2.3)

# Hoặc cài version cụ thể
nvm install 20.10.0

# Hoặc cài version mới nhất
nvm install node
```

### Kiểm tra cài đặt

```bash
# Kiểm tra Node.js version
node --version
# Output: v20.10.0

# Kiểm tra npm version
npm --version
# Output: 10.2.3

# Test Node.js
node -e "console.log('Hello Node.js!')"
# Output: Hello Node.js!

# Vào Node.js REPL (interactive mode)
node

# Gõ:
console.log('Testing Node.js')
# Output: Testing Node.js

# Thoát REPL
.exit
```

### Cài nhiều versions (optional)

```bash
# Cài 2 versions khác nhau
nvm install 18.20.0
nvm install 16.20.0

# Switch giữa các versions
nvm use 20.10.0
nvm use 18.20.0

# Xem danh sách
nvm list
```

---

## 🧪 BƯỚC 3: TEST NPM (PACKAGE MANAGER)

```bash
# Tạo thư mục test
mkdir -p ~/test-node
cd ~/test-node

# Init project
npm init -y

# Cài 1 package test
npm install lodash

# Tạo file test
cat > index.js << 'EOF'
const _ = require('lodash');

const arr = [1, 2, 2, 3, 3, 3];
const unique = _.uniq(arr);

console.log('Original:', arr);
console.log('Unique:', unique);
EOF

# Chạy test
node index.js

# Output:
# Original: [ 1, 2, 2, 3, 3, 3 ]
# Unique: [ 1, 2, 3 ]
```

✅ Nếu thấy output trên → Node.js & npm hoạt động bình thường!

---

## ✅ CHECKLIST HOÀN THÀNH

```
BƯỚC 0:
□ Chạy sudo apt update
□ Chạy sudo apt install -y curl wget git build-essential
□ Kiểm tra curl --version
□ Kiểm tra git --version

BƯỚC 1:
□ Chạy curl install NVM
□ Reload bash (source ~/.bashrc)
□ Kiểm tra nvm --version

BƯỚC 2:
□ Chạy nvm install --lts
□ Kiểm tra node --version
□ Kiểm tra npm --version

BƯỚC 3:
□ Tạo test project
□ Cài npm package
□ Test chạy node script thành công

📌 GHI CHÚ QUAN TRỌNG:
─────────────────────
- BƯỚC 0 là ĐIỀU KIỆN BẮT BUỘC, không thể bỏ qua!
- Nếu gặp lỗi "curl: command not found" → quay lại BƯỚC 0
- Node.js LTS là phiên bản ổn định, dùng cho production
- NVM giúp dễ dàng switch giữa nhiều versions
- build-essential cần thiết nếu dùng native modules (bcrypt, sqlite3)

→ Sẵn sàng chuyển sang File 05-CAI-DAT-MONGODB.md
```

---

## 🔗 LIÊN KẾT ĐẾN CÁC FILE KHÁC

| Chủ đề            | File                                               | Ghi chú             |
| ----------------- | -------------------------------------------------- | ------------------- |
| Firewall UFW      | [03-FIREWALL-UFW.md](03-FIREWALL-UFW.md)           | Đã cài ở phần trước |
| MongoDB           | [05-CAI-DAT-MONGODB.md](05-CAI-DAT-MONGODB.md)     | Tiếp theo           |
| PM2               | [06-CAI-DAT-PM2.md](06-CAI-DAT-PM2.md)             | Quản lý processes   |
| Cloudflare Tunnel | [10-CLOUDFLARE-TUNNEL.md](10-CLOUDFLARE-TUNNEL.md) | Setup CF Tunnel     |

---

**⏭️ TIẾP THEO: [File 05-CAI-DAT-MONGODB.md](05-CAI-DAT-MONGODB.md)**
