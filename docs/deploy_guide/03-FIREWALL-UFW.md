# 📘 PHẦN 3: CÀI ĐẶT VÀ CẤU HÌNH FIREWALL (UFW)

## 🎯 MỤC TIÊU

Sau phần này bạn sẽ:

- ✅ Hiểu firewall là gì và tại sao cần
- ✅ Cài đặt và cấu hình UFW
- ✅ Mở các ports cần thiết
- ✅ Kiểm tra firewall rules
- ✅ Biết cách troubleshoot khi bị block

---

## 🔥 FIREWALL LÀ GÌ?

```
Firewall = Bức tường lửa = Bảo vệ chống truy cập trái phép

┌─────────────────────────────────────────────────────────┐
│                    INTERNET                             │
│              (Hackers, Bots, Attackers)                 │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ Tất cả cố gắng kết nối
                     ↓
         ┌───────────────────────────┐
         │      FIREWALL (UFW)       │
         ├───────────────────────────┤
         │  ✅ Port 22 (SSH)         │ ← Cho phép
         │  ✅ Port 80 (HTTP)        │ ← Cho phép
         │  ✅ Port 443 (HTTPS)      │ ← Cho phép
         │  ❌ Port 3306 (MySQL)     │ ← Chặn
         │  ❌ Port 27017 (MongoDB)  │ ← Chặn
         │  ❌ Tất cả ports khác     │ ← Chặn
         └───────────────────────────┘
                     │
                     ↓
         ┌───────────────────────────┐
         │    SERVER (192.168.1.243) │
         │    Applications           │
         └───────────────────────────┘

UFW = Uncomplicated Firewall
    = Firewall đơn giản (wrapper của iptables)
```

---

## 📦 BƯỚC 1: CÀI ĐẶT UFW

```bash
# SSH vào server
ssh youruser@192.168.1.243

# Kiểm tra UFW đã cài chưa
which ufw

# Output:
# /usr/sbin/ufw
#   → Đã cài ✅

# Nếu chưa cài:
sudo apt update
sudo apt install ufw -y

# Kiểm tra version
sudo ufw version

# Output:
# ufw 0.36.x
```

---

## 🚀 BƯỚC 2: CẤU HÌNH UFW CƠ BẢN

### **⚠️ QUAN TRỌNG: Thiết lập SSH TRƯỚC KHI ENABLE UFW! **

```bash
# NẾU KHÔNG MỞ SSH TRƯỚC, BẠN SẼ BỊ KHÓA NGOÀI SERVER!

# 1. Kiểm tra status hiện tại
sudo ufw status

# Output:
# Status:  inactive
#   → UFW chưa chạy (an toàn để config)

# 2. Set default policies (chính sách mặc định)
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Giải thích:
# - deny incoming  = Chặn tất cả kết nối VÀO (mặc định)
# - allow outgoing = Cho phép tất cả kết nối RA (để server có thể download, update)

# Output:
# Default incoming policy changed to 'deny'
# Default outgoing policy changed to 'allow'

# 3. CHO PHÉP SSH (PORT 22) - BƯỚC QUAN TRỌNG NHẤT!
sudo ufw allow 22/tcp

# Output:
# Rules updated
# Rules updated (v6)

# Hoặc dùng tên service:
sudo ufw allow ssh

# Hoặc chỉ cho phép từ mạng nội bộ (an toàn hơn):
sudo ufw allow from 192.168.1.0/24 to any port 22

# 4. Kiểm tra rules trước khi enable
sudo ufw show added

# Output:
# Added user rules:
# ufw allow 22/tcp
```

---

## 🔓 BƯỚC 3: MỞ CÁC PORTS CẦN THIẾT

```bash
# HTTP (port 80) - cho web
sudo ufw allow 80/tcp

# HTTPS (port 443) - cho web SSL
sudo ufw allow 443/tcp

# Ports cho app của bạn (trong giai đoạn dev/test)
# Port 3000 - React dev server
sudo ufw allow 3000/tcp

# Port 8000 - Node.js backend
sudo ufw allow 8000/tcp

# MongoDB (27017) - CHỈ cho phép từ localhost
sudo ufw allow from 127.0.0.1 to any port 27017

# Hoặc chỉ từ mạng nội bộ:
sudo ufw allow from 192.168.1.0/24 to any port 27017

# Kiểm tra các rules đã thêm
sudo ufw show added

# Output:
# Added user rules:
# ufw allow 22/tcp
# ufw allow 80/tcp
# ufw allow 443/tcp
# ufw allow 3000/tcp
# ufw allow 8000/tcp
# ufw allow from 127.0.0.1 to any port 27017
```

---

## ✅ BƯỚC 4: ENABLE UFW

### **⚠️ ĐẢM BẢO ĐÃ MỞ PORT SSH (22) TRƯỚC KHI ENABLE! **

```bash
# Kiểm tra lần cuối có rule SSH chưa
sudo ufw show added | grep 22

# Output phải có:
# ufw allow 22/tcp

# Enable UFW
sudo ufw enable

# Output:
# Command may disrupt existing ssh connections. Proceed with operation (y|n)?
#   → Gõ:  y

# Output:
# Firewall is active and enabled on system startup

# Kiểm tra status
sudo ufw status

# Output:
# Status: active
#
# To                         Action      From
# --                         ------      ----
# 22/tcp                     ALLOW       Anywhere
# 80/tcp                     ALLOW       Anywhere
# 443/tcp                    ALLOW       Anywhere
# 3000/tcp                   ALLOW       Anywhere
# 8000/tcp                   ALLOW       Anywhere
# 27017                      ALLOW       127.0.0.1

# Kiểm tra verbose (chi tiết hơn)
sudo ufw status verbose

# Output:
# Status: active
# Logging: on (low)
# Default: deny (incoming), allow (outgoing), disabled (routed)
# New profiles: skip
```

---

## 🔍 BƯỚC 5: XEM VÀ QUẢN LÝ RULES

### **Xem rules:**

```bash
# Xem numbered list (có số thứ tự)
sudo ufw status numbered

# Output:
#      To                         Action      From
#      --                         ------      ----
# [ 1] 22/tcp                     ALLOW IN    Anywhere
# [ 2] 80/tcp                     ALLOW IN    Anywhere
# [ 3] 443/tcp                    ALLOW IN    Anywhere
# [ 4] 3000/tcp                   ALLOW IN    Anywhere
# [ 5] 8000/tcp                   ALLOW IN    Anywhere
# [ 6] 27017                      ALLOW IN    127.0.0.1
```

### **Xóa rule:**

```bash
# Cách 1: Xóa theo số thứ tự
sudo ufw delete 5

# Confirm:
# Deleting:
#  allow 8000/tcp
# Proceed with operation (y|n)? y

# Cách 2: Xóa theo rule cụ thể
sudo ufw delete allow 8000/tcp

# Cách 3: Xóa rule từ IP cụ thể
sudo ufw delete allow from 192.168.1.100
```

### **Thêm rule nâng cao:**

```bash
# Cho phép từ IP cụ thể
sudo ufw allow from 192.168.1.100

# Cho phép từ subnet
sudo ufw allow from 192.168.1.0/24

# Cho phép IP cụ thể đến port cụ thể
sudo ufw allow from 192.168.1.100 to any port 22

# Cho phép range ports
sudo ufw allow 3000:3010/tcp

# Deny (chặn) IP cụ thể
sudo ufw deny from 192.168.1.200

# Limit (chống brute force SSH)
sudo ufw limit ssh
# → Chặn IP nếu có >6 connections trong 30 giây
```

---

## 📊 BƯỚC 6: LOGGING

```bash
# Enable logging
sudo ufw logging on

# Output:
# Logging enabled

# Set log level
sudo ufw logging low
# Levels: off, low, medium, high, full

# Xem logs
sudo tail -f /var/log/ufw.log

# Output (example):
# Dec 26 10:30:15 server kernel: [UFW BLOCK] IN=eth0 OUT= SRC=1.2.3.4 DST=192.168.1.243 PROTO=TCP DPT=3306

# Giải thích:
# [UFW BLOCK] = Bị chặn
# SRC=1.2.3.4 = Từ IP 1.2.3.4
# DST=192.168.1.243 = Đến server của bạn
# PROTO=TCP = Protocol TCP
# DPT=3306 = Destination port 3306 (MySQL)
#   → Có ai đó đang scan MySQL port, đã bị chặn ✅
```

---

## 🎨 BƯỚC 7: CHIẾN LƯỢC FIREWALL THEO GIAI ĐOẠN TRIỂN KHAI

> **📌 ĐỌC TRƯỚC:** Nếu chưa hiểu tại sao có 2 giai đoạn,
> hãy đọc [File 00.1-HIEN-TRANG-HA-TANG.md](00.1-HIEN-TRANG-HA-TANG.md) trước!

### **Tổng quan chiến lược:**

```
╔═══════════════════════════════════════════════════════════════════════════╗
║  Firewall config KHÁC NHAU giữa 2 giai đoạn triển khai:                  ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  GIAI ĐOẠN 1: CLOUDFLARE TUNNEL              GIAI ĐOẠN 2: NGINX          ║
║  (Hiện tại - dùng ngay)                      (Sau ~2 tuần - khi có Máy C)║
║                                                                           ║
║  ┌─────────────────────────────────┐   ┌─────────────────────────────────┐║
║  │ Port 80:  ❌ KHÔNG MỞ           │   │ Port 80:  ❌ KHÔNG MỞ           │║
║  │ Port 443: ❌ KHÔNG MỞ           │   │ Port 443: ❌ KHÔNG MỞ           │║
║  │ Port 22:  ✅ Mạng nội bộ        │   │ Port 22:  ✅ Mạng nội bộ        │║
║  │ Port 3000: localhost + LAN     │   │ Port 3000: ✅ Chỉ từ Máy C      │║
║  │ Port 8000: localhost + LAN     │   │ Port 8000: ✅ Chỉ từ Máy C      │║
║  │ Port 27017: localhost only     │   │ Port 27017: localhost only     │║
║  │                                 │   │                                 │║
║  │ Traffic:                        │   │ Traffic:                        │║
║  │ CF Edge → Tunnel → localhost   │   │ Máy C (Nginx) → Máy A          │║
║  └─────────────────────────────────┘   └─────────────────────────────────┘║
║                                                                           ║
║  📌 BẠN ĐANG Ở ĐÂY: GIAI ĐOẠN 1 (làm bước 7.1 bên dưới)                  ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

### **7.1 - CẤU HÌNH CHO GIAI ĐOẠN 1: CLOUDFLARE TUNNEL** ⭐ LÀM NGAY

> **Tại sao dùng config này?**
>
> Cloudflare Tunnel hoạt động khác biệt:
>
> - Bình thường: User kết nối VÀO server (cần mở port)
> - CF Tunnel: Server kết nối RA Cloudflare (không cần mở port inbound)
>
> Vì vậy chúng ta có thể "đóng cửa" tất cả, chỉ cho phép:
>
> - SSH từ mạng nội bộ (để bạn quản trị)
> - App ports cho localhost (CF Tunnel daemon sẽ proxy)
> - Hoặc App ports cho LAN (để test trực tiếp không qua CF)

```bash
# ═══════════════════════════════════════════════════════════════════════════
# GIAI ĐOẠN 1: CẤU HÌNH FIREWALL CHO CLOUDFLARE TUNNEL
# ═══════════════════════════════════════════════════════════════════════════
#
# Áp dụng cho: Máy A (192.168.1.243)
# Thời điểm:   Bây giờ (trước khi setup CF Tunnel)
# Mục đích:    Bảo mật tối đa, chỉ cho phép traffic cần thiết
#
# ═══════════════════════════════════════════════════════════════════════════

# BƯỚC 1: Reset tất cả rules cũ (bắt đầu từ đầu)
# ──────────────────────────────────────────────
# ⚠️ QUAN TRỌNG: Hiểu rõ về 'ufw --force reset'
#
# Q: Lệnh này có an toàn không?
# A: CÓ an toàn NHƯNG cần hiểu rõ:
#    - Reset sẽ XÓA tất cả rules hiện có
#    - Reset sẽ TẮT firewall (disable UFW)
#    - Nếu đang SSH: KHÔNG bị ngắt kết nối ngay lập tức
#    - Sau reset, server ở trạng thái "không có firewall" cho đến khi enable lại
#
# Q: Có cần tắt UFW trước không?
# A: KHÔNG cần! Lệnh 'reset' sẽ tự động:
#    1. Disable UFW (tắt firewall)
#    2. Xóa tất cả rules
#    3. Trả về trạng thái mặc định
#
#    Nếu bạn chạy 'ufw disable' trước rồi mới 'reset' → thừa 1 bước
#
# Q: Khi nào an toàn nhất để chạy lệnh này?
# A: An toàn nhất khi:
#    - Đang SSH từ mạng LAN (nội bộ)
#    - HOẶC có quyền truy cập vật lý vào server (màn hình/keyboard)
#    - KHÔNG nên làm khi SSH từ Internet và không có cách backup vào
#
# Tại sao: Đảm bảo không có rules cũ gây conflict
# Lưu ý:   Sau reset, firewall = DISABLED, mọi port đều MỞ cho đến khi enable lại!

sudo ufw --force reset

# Output:
# Resetting all rules to installed defaults. This may disrupt existing
# ssh connections. Proceed with operation (y|n)?
#   → Flag --force bỏ qua câu hỏi này, tự động = 'y'
# Firewall stopped and disabled on system startup
#
# ✅ Đã reset xong, bây giờ UFW = inactive (tắt)

# BƯỚC 2: Thiết lập chính sách mặc định
# ──────────────────────────────────────────────
# deny incoming  = Chặn TẤT CẢ kết nối từ bên ngoài VÀO (mặc định)
# allow outgoing = Cho phép TẤT CẢ kết nối từ server RA ngoài
#                  (cần thiết cho CF Tunnel, apt update, v.v.)
sudo ufw default deny incoming
sudo ufw default allow outgoing

# BƯỚC 3: Cho phép SSH từ mạng nội bộ + các IP cụ thể
# ──────────────────────────────────────────────
# Tại sao "từ mạng nội bộ" thay vì "từ anywhere"?
# → An toàn hơn: Chỉ máy trong bệnh viện mới SSH được
# → Chặn hackers từ Internet brute-force SSH
#
# SUBNET 192.168.1.0/24 = Tất cả IP từ 192.168.1.1 đến 192.168.1.254
sudo ufw allow from 192.168.1.0/24 to any port 22 comment 'SSH from LAN 192.168.1.x'

# THÊM CÁC IP CỤ THỂ (máy tính admin, máy IT, v.v.)
# Nếu có máy tính từ subnet khác cần SSH, thêm từng IP:
sudo ufw allow from 192.168.5.200 to any port 22 comment 'SSH from Admin PC 1'
sudo ufw allow from 192.168.5.136 to any port 22 comment 'SSH from Admin PC 2'
sudo ufw allow from 192.168.5.212 to any port 22 comment 'SSH from IT PC'

# Giải thích:
# - 192.168.1.0/24: Toàn bộ subnet chính (máy A đang ở đây)
# - 192.168.5.x:    Subnet khác (có thể là mạng văn phòng/admin)
# - Có thể thêm nhiều IP nếu cần (mỗi lệnh = 1 IP hoặc 1 subnet)

# BƯỚC 4: Cho phép App ports
# ──────────────────────────────────────────────
# ⚠️ QUAN TRỌNG: Chọn chiến lược phù hợp với nhu cầu của bạn
#
# Có 3 LỰA CHỌN, chọn 1 trong 3:

# ═══════════════════════════════════════════════════════════════════════════
# OPTION A: Chỉ localhost (AN TOÀN NHẤT - dành cho production)
# ═══════════════════════════════════════════════════════════════════════════
# Ưu điểm:
# ✅ An toàn nhất - chỉ CF Tunnel daemon (localhost) mới truy cập được
# ✅ Chặn mọi truy cập trực tiếp từ LAN
#
# Nhược điểm:
# ❌ Không thể truy cập trực tiếp từ máy tính trong LAN (dù cùng 192.168.x.x)
# ❌ Nếu Internet/CF Tunnel lỗi → Không thể dùng app được
# ❌ Khó debug từ máy tính khác
#
# Khi nào dùng:
# → Khi hệ thống đã stable, production
# → Khi bảo mật là ưu tiên số 1
# → Khi luôn có Internet ổn định
#
# sudo ufw allow from 127.0.0.1 to any port 3000 comment 'React - localhost only'
# sudo ufw allow from 127.0.0.1 to any port 8000 comment 'Backend - localhost only'

# ═══════════════════════════════════════════════════════════════════════════
# OPTION B: localhost + 1 subnet (VỪA PHẢI - dành cho dev/test subnet đơn)
# ═══════════════════════════════════════════════════════════════════════════
# Ưu điểm:
# ✅ Có thể test trực tiếp từ máy tính trong subnet 192.168.1.x
# ✅ CF Tunnel vẫn hoạt động bình thường
# ✅ Dễ debug
#
# Nhược điểm:
# ❌ CHỈ cho phép 1 subnet (192.168.1.0/24)
# ❌ Các máy từ subnet khác (192.168.2.x, 192.168.3.x, ...) BỊ CHẶN
# ❌ Nếu Internet lỗi, chỉ máy trong subnet 192.168.1.x mới truy cập được
#
# Khi nào dùng:
# → Khi chỉ có 1 subnet cần truy cập
# → Khi các subnet khác không cần dùng app
#
# sudo ufw allow from 127.0.0.1 to any port 3000 comment 'React - localhost'
# sudo ufw allow from 127.0.0.1 to any port 8000 comment 'Backend - localhost'
# sudo ufw allow from 192.168.1.0/24 to any port 3000 comment 'React - LAN 192.168.1.x'
# sudo ufw allow from 192.168.1.0/24 to any port 8000 comment 'Backend - LAN 192.168.1.x'

# ═══════════════════════════════════════════════════════════════════════════
# OPTION C: localhost + TẤT CẢ subnet nội bộ (KHUYẾN NGHỊ - backup Internet lỗi) ⭐
# ═══════════════════════════════════════════════════════════════════════════
# Ưu điểm:
# ✅ Tất cả máy trong mạng bệnh viện (192.168.x.x) đều truy cập được
# ✅ Nếu Internet/CF Tunnel lỗi → Vẫn dùng app được bằng IP nội bộ
# ✅ Gõ trực tiếp http://192.168.1.243:3000 từ BẤT KỲ máy nào trong LAN
# ✅ CF Tunnel vẫn hoạt động bình thường
# ✅ Dễ debug, dễ test
#
# Nhược điểm:
# ⚠️ Ít bảo mật hơn Option A (nhưng vẫn OK trong mạng nội bộ)
# ⚠️ Nếu có hacker trong mạng nội bộ → có thể truy 0.0/16 (React - All LANs)│
# │ 8000                       ALLOW IN    192.168.0.0/16 (Backend-All LANs)
# Khi nào dùng:
# → Khi có NHIỀU subnet nội bộ (192.168.1.x, 192.168.2.x, 192.168.3.x, ...)
# → Khi muốn backup cho trường hợp Internet lỗi
# → Khi cần linh hoạt, cho phép nhân viên truy cập từ nhiều phòng ban
# → Khi mạng nội bộ đã được bảo vệ bởi firewall chính của bệnh viện
#
# CÁCH 1: Dùng supernet 192.168.0.0/16 (bao gồm TẤT CẢ 192.168.x.x)
sudo ufw allow from 127.0.0.1 to any port 3000 comment 'React - localhost'
sudo ufw allow from 127.0.0.1 to any port 8000 comment 'Backend - localhost'
sudo ufw allow from 192.168.0.0/16 to any port 3000 comment 'React - All internal LANs'
sudo ufw allow from 192.168.0.0/16 to any port 8000 comment 'Backend - All internal LANs'

# CÁCH 2: Liệt kê từng subnet (nếu muốn kiểm soát chặt hơn)
# Chỉ dùng cách này nếu không muốn mở cho TẤT CẢ 192.168.x.x
# sudo ufw allow from 127.0.0.1 to any port 3000 comment 'React - localhost'
# sudo ufw allow from 127.0.0.1 to any port 8000 comment 'Backend - localhost'
# sudo ufw allow from 192.168.1.0/24 to any port 3000 comment 'React - LAN 1'
# sudo ufw allow from 192.168.1.0/24 to any port 8000 comment 'Backend - LAN 1'
# sudo ufw allow from 192.168.2.0/24 to any port 3000 comment 'React - LAN 2'
# sudo ufw allow from 192.168.2.0/24 to any port 8000 comment 'Backend - LAN 2'
# sudo ufw allow from 192.168.3.0/24 to any port 3000 comment 'React - LAN 3'
# sudo ufw allow from 192.168.3.0/24 to any port 8000 comment 'Backend - LAN 3'
# sudo ufw allow from 192.168.4.0/24 to any port 3000 comment 'React - LAN 4'
# sudo ufw allow from 192.168.4.0/24 to any port 8000 comment 'Backend - LAN 4'
# sudo ufw allow from 192.168.5.0/24 to any port 3000 comment 'React - LAN 5'
# sudo ufw allow from 192.168.5.0/24 to any port 8000 comment 'Backend - LAN 5'
# sudo ufw allow from 192.168.6.0/24 to any port 3000 comment 'React - LAN 6'
# sudo ufw allow from 192.168.6.0/24 to any port 8000 comment 'Backend - LAN 6'

# ═══════════════════════════════════════════════════════════════════════════
# 📌 KHUYẾN NGHỊ CỦA TÔI:
# ═══════════════════════════════════════════════════════════════════════════
# Dùng OPTION C - CÁCH 1 (192.168.0.0/16) vì:
# 1. Đơn giản, chỉ 4 lệnh thay vì 14+ lệnh
# 2. Backup tốt khi Internet lỗi - nhân viên vẫn làm việc được
# 3. Linh hoạt - không cần thêm rule mỗi khi có subnet mới
# 4. Vẫn an toàn - chỉ mạng nội bộ, không phải Internet
# 5. Phù hợp môi trường bệnh viện với nhiều phòng ban/tầng
#
# Giải thích 192.168.0.0/16:
# - /16 = 16 bits đầu cố định (192.168)
# - 16 bits sau tự do (0-255.0-255)
# - Kết quả: Bao gồm từ 192.168.0.0 đến 192.168.255.255
# - Nghĩa là: 192.168.1.x, 192.168.2.x, ... 192.168.6.x, ... TẤT CẢ đều OK
# ═══════════════════════════════════════════════════════════════════════════

# BƯỚC 5: MongoDB - Cho phép localhost + các IP dev cụ thể
# ──────────────────────────────────────────────
# ⚠️ QUAN TRỌNG: Database là tài nguyên nhạy cảm nhất!
#
# Có 2 LỰA CHỌN:

# ═══════════════════════════════════════════════════════════════════════════
# OPTION A: CHỈ localhost (AN TOÀN NHẤT - khuyến nghị cho production)
# ═══════════════════════════════════════════════════════════════════════════
# Ưu điểm:
# ✅ An toàn tuyệt đối - chỉ app trên server mới truy cập được
# ✅ Nếu hacker vào được LAN, vẫn không thể access DB
#
# Nhược điểm:
# ❌ Không thể dùng MongoDB Compass/Studio 3T từ máy tính để debug
# ❌ Khó troubleshoot khi có vấn đề về data
#
# Khi nào dùng:
# → Production, sau khi đã stable
# → Khi không cần remote debug
#
# sudo ufw allow from 127.0.0.1 to any port 27017 comment 'MongoDB - localhost only'

# ═══════════════════════════════════════════════════════════════════════════
# OPTION B: localhost + các IP dev cụ thể (KHUYẾN NGHỊ cho dev/staging) ⭐
# ═══════════════════════════════════════════════════════════════════════════
# Ưu điểm:
# ✅ Có thể dùng MongoDB Compass/Robo 3T/Studio 3T từ máy dev
# ✅ Dễ debug, xem data, chạy queries phức tạp
# ✅ Vẫn an toàn - CHỈ các IP cụ thể được chỉ định
#
# Nhược điểm:
# ⚠️ Ít bảo mật hơn Option A một chút
# ⚠️ Cần quản lý danh sách IP
#
# Khi nào dùng:
# → Giai đoạn dev/staging/testing
# → Khi cần remote debug thường xuyên
# → Khi có team dev cần truy cập DB

# Cho phép localhost (app server)
sudo ufw allow from 127.0.0.1 to any port 27017 comment 'MongoDB - localhost'

# Cho phép các IP dev cụ thể (máy tính developer)
sudo ufw allow from 192.168.5.200 to any port 27017 comment 'MongoDB - Dev PC 1'
sudo ufw allow from 192.168.5.136 to any port 27017 comment 'MongoDB - Dev PC 2'
sudo ufw allow from 192.168.5.212 to any port 27017 comment 'MongoDB - Dev PC 3'

# ═══════════════════════════════════════════════════════════════════════════
# 📌 KHUYẾN NGHỊ:
# ═══════════════════════════════════════════════════════════════════════════
# - HIỆN TẠI: Dùng Option B (có IP dev) để dễ phát triển
# - SAU NÀY: Khi lên production, chuyển sang Option A (chỉ localhost)
#
# Cách chuyển từ Option B → Option A:
# 1. Xóa các rules IP dev:
#    sudo ufw delete allow from 192.168.5.200 to any port 27017
#    sudo ufw delete allow from 192.168.5.136 to any port 27017
#    sudo ufw delete allow from 192.168.5.212 to any port 27017
#
# 2. Giữ lại rule localhost:
#    sudo ufw allow from 127.0.0.1 to any port 27017
#
# 3. Kiểm tra:
#    sudo ufw status | grep 27017
#
# ⚠️ LƯU Ý BẢO MẬT:
# - KHÔNG BAO GIỜ dùng: sudo ufw allow 27017
#   (Điều này mở MongoDB cho TẤT CẢ, rất nguy hiểm!)
# - Chỉ thêm IP tin cậy (máy dev team, không phải máy tùy tiện)
# - Nên đổi MongoDB default port (27017) sang port khác để tăng bảo mật
# - Bật MongoDB authentication (username/password) là BẮT BUỘC!
# ═══════════════════════════════════════════════════════════════════════════

# BƯỚC 6: Rate limiting cho SSH (chống brute force)
# ──────────────────────────────────────────────
# Tại sao cần?
# → Nếu có ai đó thử đăng nhập sai nhiều lần → tự động block
# → Bảo vệ chống tấn công đoán mật khẩu
#
# Rule: Chặn IP nếu có > 6 connections trong 30 giây
sudo ufw limit ssh comment 'Rate limit SSH'

# BƯỚC 7: Enable UFW
# ──────────────────────────────────────────────
# ⚠️ QUAN TRỌNG: Đảm bảo đã có rule SSH trước khi enable!
sudo ufw enable
# Khi hỏi "Proceed with operation (y|n)?" → Gõ: y

# BƯỚC 8: Kiểm tra kết quả
# ──────────────────────────────────────────────
sudo ufw status verbose

# OUTPUT MONG ĐỢI:
# ┌──────────────────────────────────────────────────────────────────────────┐
# │ Status: active                                                          │
# │ Logging: on (low)                                                       │
# │ Default: deny (incoming), allow (outgoing), disabled (routed)           │
# │                                                                          │
# │ To                         Action      From                              │
# │ --                         ------      ----                              │
# │ 22                         ALLOW IN    192.168.1.0/24 (SSH from LAN)    │
# │ 22                         ALLOW IN    192.168.5.200 (SSH from Admin 1) │
# │ 22                         ALLOW IN    192.168.5.136 (SSH from Admin 2) │
# │ 22                         ALLOW IN    192.168.5.212 (SSH from IT PC)   │
# │ 22/tcp                     LIMIT IN    Anywhere (Rate limit SSH)        │
# │ 3000                       ALLOW IN    127.0.0.1 (React - localhost)    │
# │ 8000                       ALLOW IN    127.0.0.1 (Backend - localhost)  │
# │ 3000                       ALLOW IN    192.168.1.0/24 (React - LAN test)│
# │ 8000                       ALLOW IN    192.168.1.0/24 (Backend - LAN)   │
# │ 27017                      ALLOW IN    127.0.0.1 (MongoDB - localhost)  │
# │ 27017                      ALLOW IN    192.168.5.200 (MongoDB - Dev 1)  │
# │ 27017                      ALLOW IN    192.168.5.136 (MongoDB - Dev 2)  │
# │ 27017                      ALLOW IN    192.168.5.212 (MongoDB - Dev 3)  │
# └──────────────────────────────────────────────────────────────────────────┘

# BƯỚC 9: Test ngay!
# ──────────────────────────────────────────────
# Từ các máy tính khác nhau trong mạng nội bộ, thử:

# Test SSH từ subnet chính (192.168.1.x):
# ssh youruser@192.168.1.243
# → Phải vào được ✅

# Test SSH từ subnet khác (ví dụ 192.168.5.x):
# ssh youruser@192.168.1.243  # (từ máy 192.168.5.200)
# → Phải vào được ✅

# Test port 3000 từ subnet chính (sau khi có app chạy):
# curl http://192.168.1.243:3000
# → Phải có response ✅

# Test port 3000 từ subnet khác (ví dụ từ máy 192.168.2.x, 192.168.5.x):
# curl http://192.168.1.243:3000
# → Phải có response ✅ (nếu dùng OPTION C với 192.168.0.0/16)
# → Bị chặn ❌ (nếu dùng OPTION B với chỉ 192.168.1.0/24)

# Test bằng trình duyệt từ máy bất kỳ trong LAN:
# Mở browser, gõ: http://192.168.1.243:3000
# → Phải thấy app ✅ (nếu dùng OPTION C)

# Test port từ Internet (nếu có cách test):
# → Phải bị chặn ❌ (đúng mong đợi)

# ═══════════════════════════════════════════════════════════════════════════
# 💡 MẸO: Nếu dùng OPTION C, bạn có thể thử kịch bản "Internet lỗi":
# ═══════════════════════════════════════════════════════════════════════════
# 1. Tắt CF Tunnel tạm thời:
#    sudo systemctl stop cloudflared
#
# 2. Từ máy tính BẤT KỲ trong LAN (192.168.x.x), gõ:
#    http://192.168.1.243:3000
#
# 3. App vẫn hoạt động bình thường ✅
#    (Chỉ mất tính năng truy cập từ bên ngoài qua domain)
#
# 4. Bật lại CF Tunnel:
#    sudo systemctl start cloudflared
#
# → Đây là lý do tại sao OPTION C rất hữu ích trong môi trường bệnh viện!

# ═══════════════════════════════════════════════════════════════════════════
# 💡 MẸO: Test MongoDB từ máy dev (nếu đã mở IP dev ở BƯỚC 5)
# ═══════════════════════════════════════════════════════════════════════════
# Từ máy 192.168.5.200, 192.168.5.136, hoặc 192.168.5.212:
#
# Cách 1: Dùng MongoDB Compass (GUI tool)
# 1. Download MongoDB Compass: https://www.mongodb.com/try/download/compass
# 2. Connection string: mongodb://192.168.1.243:27017
# 3. Click "Connect"
# → Phải kết nối được và thấy databases ✅
#
# Cách 2: Dùng mongosh (command line)
# mongosh "mongodb://192.168.1.243:27017"
# → Phải vào được mongo shell ✅
#
# Cách 3: Test bằng telnet (kiểm tra port mở)
# telnet 192.168.1.243 27017
# → Nếu "Connected" → Port mở ✅
# → Nếu "Connection refused/timeout" → Bị firewall block ❌
#
# ⚠️ Nếu không kết nối được, kiểm tra:
# 1. MongoDB có đang chạy không?
#    sudo systemctl status mongod
#
# 2. MongoDB có bind đúng IP không?
#    grep bindIp /etc/mongod.conf
#    → Phải là: bindIp: 0.0.0.0 (hoặc 192.168.1.243)
#    → KHÔNG phải: bindIp: 127.0.0.1 (chỉ localhost)
#
# 3. Firewall có rule chưa?
#    sudo ufw status | grep 27017
#    → Phải thấy IP dev của bạn
```

**Lưu config này để sau có thể khôi phục:**

```bash
# Lưu lại config hiện tại
sudo ufw status numbered > ~/ufw-phase1-config.txt
echo "Saved at: $(date)" >> ~/ufw-phase1-config.txt

# Xem lại:
cat ~/ufw-phase1-config.txt
```

---

### **7.2 - PREVIEW: CẤU HÌNH CHO GIAI ĐOẠN 2 (NGINX)**

> **⚠️ CHƯA LÀM BƯỚC NÀY!** Chỉ đọc để hiểu trước.
>
> Khi nào làm? Sau khi:
>
> 1. Có Máy C (~2 tuần)
> 2. IT đã NAT port 80/443 đến Máy C
> 3. Đã setup Nginx trên Máy C (File 22)
> 4. Sẵn sàng migration (File 23)

```bash
# ═══════════════════════════════════════════════════════════════════════════
# GIAI ĐOẠN 2: CẤU HÌNH FIREWALL KHI DÙNG NGINX (SAU NÀY)
# ═══════════════════════════════════════════════════════════════════════════
#
# KHÁC BIỆT CHÍNH:
# - Giai đoạn 1: Traffic từ CF Edge → localhost (cloudflared daemon)
# - Giai đoạn 2: Traffic từ Máy C (Nginx) → Máy A
#
# Vì vậy cần:
# - Cho phép Máy C kết nối đến port 3000, 8000
# - Chặn LAN khác (tùy chọn, tăng bảo mật)
# - Không còn cần localhost rules cho app (đã có Máy C)
#
# ═══════════════════════════════════════════════════════════════════════════

# Giả sử Máy C có IP: 192.168.1.250

# Xóa rules cũ cho LAN (optional)
# sudo ufw delete allow from 192.168.1.0/24 to any port 3000
# sudo ufw delete allow from 192.168.1.0/24 to any port 8000

# Chỉ cho phép từ Máy C (Nginx server)
# sudo ufw allow from 192.168.1.250 to any port 3000 comment 'React - from Nginx'
# sudo ufw allow from 192.168.1.250 to any port 8000 comment 'Backend - from Nginx'

# Giữ nguyên:
# - SSH từ LAN (để quản trị)
# - MongoDB localhost only
# - Rate limiting SSH
```

**So sánh 2 config:**

| Port     | Giai đoạn 1 (CF Tunnel) | Giai đoạn 2 (Nginx)           |
| -------- | ----------------------- | ----------------------------- |
| 22 (SSH) | LAN: 192.168.1.0/24     | LAN: 192.168.1.0/24           |
| 3000     | localhost + LAN         | Chỉ Máy C (192.168.1.250)     |
| 8000     | localhost + LAN         | Chỉ Máy C (192.168.1.250)     |
| 27017    | localhost only          | localhost only                |
| 80       | ❌ Không mở             | ❌ Không mở (Máy A không cần) |
| 443      | ❌ Không mở             | ❌ Không mở (Máy A không cần) |

> **Chi tiết migration:** Xem [File 23-MIGRATION-CF-TO-NGINX.md](23-MIGRATION-CF-TO-NGINX.md)

---

### **7.3 - SCRIPTS SWITCH NHANH GIỮA 2 CONFIGS**

> **Tại sao cần scripts này?**
>
> Sau khi đã setup xong cả 2 giai đoạn, bạn có thể cần switch qua lại:
>
> - CF Tunnel gặp vấn đề → Switch sang Nginx
> - Máy C bảo trì → Tạm thời dùng CF Tunnel
> - Test tính năng mới → Dùng CF Tunnel trước
>
> Scripts giúp switch nhanh chóng (~5 phút) thay vì gõ lại từng lệnh.

**Tạo script switch (chạy sau khi đã có cả 2 giai đoạn):**

```bash
# Tạo thư mục scripts
mkdir -p ~/scripts

# Tạo script switch sang CF Tunnel config
cat > ~/scripts/ufw-switch-to-cf-tunnel.sh << 'EOF'
#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# SWITCH FIREWALL: Nginx → Cloudflare Tunnel
# ═══════════════════════════════════════════════════════════════

echo "🔄 Switching UFW to Cloudflare Tunnel config..."

# Backup current config
sudo ufw status numbered > ~/ufw-backup-$(date +%Y%m%d-%H%M%S).txt

# Reset
sudo ufw --force reset

# Default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# SSH from LAN
sudo ufw allow from 192.168.1.0/24 to any port 22 comment 'SSH from LAN'
sudo ufw limit ssh

# App ports: localhost + LAN (cho CF Tunnel + LAN test)
sudo ufw allow from 127.0.0.1 to any port 3000 comment 'React - localhost'
sudo ufw allow from 127.0.0.1 to any port 8000 comment 'Backend - localhost'
sudo ufw allow from 192.168.1.0/24 to any port 3000 comment 'React - LAN'
sudo ufw allow from 192.168.1.0/24 to any port 8000 comment 'Backend - LAN'

# MongoDB
sudo ufw allow from 127.0.0.1 to any port 27017 comment 'MongoDB'

# Enable
sudo ufw --force enable

echo "✅ Done! Current config:"
sudo ufw status numbered

echo ""
echo "📌 Nhớ kiểm tra:"
echo "   1. cloudflared service đang chạy"
echo "   2. DNS trỏ về Cloudflare (proxied)"
EOF

chmod +x ~/scripts/ufw-switch-to-cf-tunnel.sh
```

```bash
# Tạo script switch sang Nginx config
cat > ~/scripts/ufw-switch-to-nginx.sh << 'EOF'
#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# SWITCH FIREWALL: Cloudflare Tunnel → Nginx
# ═══════════════════════════════════════════════════════════════

# Thay IP của Máy C ở đây:
NGINX_SERVER_IP="192.168.1.250"

echo "🔄 Switching UFW to Nginx config..."
echo "   Nginx server IP: $NGINX_SERVER_IP"

# Backup current config
sudo ufw status numbered > ~/ufw-backup-$(date +%Y%m%d-%H%M%S).txt

# Reset
sudo ufw --force reset

# Default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# SSH from LAN
sudo ufw allow from 192.168.1.0/24 to any port 22 comment 'SSH from LAN'
sudo ufw limit ssh

# App ports: CHỈ từ Nginx server (Máy C)
sudo ufw allow from $NGINX_SERVER_IP to any port 3000 comment 'React - from Nginx'
sudo ufw allow from $NGINX_SERVER_IP to any port 8000 comment 'Backend - from Nginx'

# Optional: Vẫn cho LAN test trực tiếp (bỏ comment nếu cần)
# sudo ufw allow from 192.168.1.0/24 to any port 3000 comment 'React - LAN test'
# sudo ufw allow from 192.168.1.0/24 to any port 8000 comment 'Backend - LAN test'

# MongoDB
sudo ufw allow from 127.0.0.1 to any port 27017 comment 'MongoDB'

# Enable
sudo ufw --force enable

echo "✅ Done! Current config:"
sudo ufw status numbered

echo ""
echo "📌 Nhớ kiểm tra:"
echo "   1. Nginx trên Máy C đang chạy"
echo "   2. DNS trỏ về IP public (không proxied)"
echo "   3. cloudflared service đã STOP (không cần nữa)"
EOF

chmod +x ~/scripts/ufw-switch-to-nginx.sh
```

**Cách sử dụng scripts:**

```bash
# Khi cần switch sang CF Tunnel:
~/scripts/ufw-switch-to-cf-tunnel.sh

# Khi cần switch sang Nginx:
~/scripts/ufw-switch-to-nginx.sh

# Xem các backup đã lưu:
ls -la ~/ufw-backup-*.txt
```

---

## 🛠️ TROUBLESHOOTING

### **Bị khóa ngoài SSH:**

```
⚠️ NẾU BẠN BỊ KHÓA, KHÔNG SSH VÀO ĐƯỢC:

1. Vào server trực tiếp (qua màn hình/keyboard)

2. Login

3. Disable UFW:
   sudo ufw disable

4. Hoặc thêm rule SSH:
   sudo ufw allow 22/tcp
   sudo ufw enable

5. Test SSH từ máy khác

6. Nếu OK, xóa rule cũ sai:
   sudo ufw status numbered
   sudo ufw delete [số rule sai]
```

### **Kiểm tra connection bị block:**

```bash
# Xem logs realtime
sudo tail -f /var/log/ufw.log | grep BLOCK

# Test port từ máy khác
# Từ máy tính cá nhân:
telnet 192.168.1.243 8000

# Nếu "Connection refused" ngay lập tức → Port đóng hoặc app không chạy
# Nếu "Connection timed out" → Firewall block

# Test với nmap (cài trên máy tính)
nmap -p 22,80,443,3000,8000 192.168.1.243

# Output:
# PORT     STATE    SERVICE
# 22/tcp   open     ssh
# 80/tcp   closed   http
# 443/tcp  closed   https
# 3000/tcp filtered unknown  ← Bị firewall block
# 8000/tcp open     http-alt
```

### **Mở port tạm thời để test:**

```bash
# Thêm rule0.0/16 to any port 3000  # All LANs        ║
║  sudo ufw allow from 192.168.0.0/16 to any port 8000  # All LANs

# Test xong, xóa luôn
sudo ufw delete allow 3000/tcp
```

---

## 📋 CẤU HÌNH KHUYẾN NGHỊ (TÓM TẮT)

### **Bảng tổng hợp:**

```
╔══════════════════════════════════════════════════════════════════════════╗
║                     TÓM TẮT FIREWALL CONFIG                              ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  GIAI ĐOẠN 1 (Cloudflare Tunnel) - ÁP DỤNG NGAY:                        ║
║  ────────────────────────────────────────────────                        ║
║  sudo ufw --force reset                                                  ║
║  sudo ufw default deny incoming                                          ║
║  sudo ufw default allow outgoing                                         ║
║  sudo ufw allow from 192.168.1.0/24 to any port 22                      ║
║  sudo ufw allow from 192.168.5.200 to any port 22  # Admin PC 1         ║
║  sudo ufw allow from 192.168.5.136 to any port 22  # Admin PC 2         ║
║  sudo ufw allow from 192.168.5.212 to any port 22  # IT PC              ║
║  sudo ufw limit ssh                                                      ║
║  sudo ufw allow from 127.0.0.1 to any port 3000                         ║
║  sudo ufw allow from 127.0.0.1 to any port 8000                         ║
║  sudo ufw allow from 192.168.0.0/16 to any port 3000  # All LANs        ║
║  sudo ufw allow from 192.168.0.0/16 to any port 8000  # All LANs        ║
║  sudo ufw allow from 127.0.0.1 to any port 27017  # MongoDB localhost   ║
║  sudo ufw allow from 192.168.5.200 to any port 27017  # MongoDB Dev 1   ║
║  sudo ufw allow from 192.168.5.136 to any port 27017  # MongoDB Dev 2   ║
║  sudo ufw allow from 192.168.5.212 to any port 27017  # MongoDB Dev 3   ║
║  sudo ufw enable                                                         ║
║                                                                          ║
║  GIAI ĐOẠN 2 (Nginx) - SAU KHI CÓ MÁY C:                                ║
║  ──────────────────────────TẤT CẢ subnet nội bộ (192.168.0.0/16) ✅
├─ Backend (8000): localhost + TẤT CẢ subnet nội bộ (192.168.0.0/16) ✅
├─ MongoDB (27017): Chỉ localhost ✅
├─ HTTP (80):    ❌ Không mở (CF Tunnel lo)
└─ HTTPS (443):  ❌ Không mở (CF Tunnel lo)

💡 Lợi ích:
   - Internet OK: Dùng domain qua CF Tunnel
   - Internet lỗi: Dùng http://192.168.1.243:3000 từ BẤT KỲ máy nào trong LAN
   - Bao gồm: 192.168.1.x, 192.168.2.x, 192.168.3.x, 192.168.5.x, 192.168.6.x, ...═════════════════════════════════╝
```

---

## ✅ CHECKLIST HOÀN THÀNH

```
□ Đã đọc File 00.1 hiểu về 2 giai đoạn triển khai
□ UFW đã cài đặt
□ Đã set default policies (deny incoming, allow outgoing)
□ Đã mở port SSH (22) từ mạng nội bộ
□ Đã enable rate limiting cho SSH
□ Đã enable UFW thành công
□ Vẫn SSH vào được sau khi enable
□ Đã mở ports 3000, 8000 (localhost + LAN)
□ MongoDB port cho phép localhost + IP dev cụ thể
□ Đã enable logging
□ Đã test connection từ máy khác trong LAN
□ Đã test MongoDB từ máy dev (nếu mở IP dev)
□ Đã lưu config backup (ufw-phase1-config.txt)
□ Đã tạo scripts switch (optional, có thể làm sau)

📌 GHI CHÚ QUAN TRỌNG:
─────────────────────
Config hiện tại: GIAI ĐOẠN 1 (Cloudflare Tunnel)
├─ SSH (22):     Subnet 192.168.1.0/24 + IP cụ thể (192.168.5.200/136/212) ✅
├─ React (3000): localhost + TẤT CẢ subnet nội bộ (192.168.0.0/16) ✅
├─ Backend (8000): localhost + TẤT CẢ subnet nội bộ (192.168.0.0/16) ✅
├─ MongoDB (27017): localhost + IP dev (192.168.5.200/136/212) ✅
├─ HTTP (80):    ❌ Không mở (CF Tunnel lo)
└─ HTTPS (443):  ❌ Không mở (CF Tunnel lo)

💡 Lợi ích:
   - Internet OK: Dùng domain qua CF Tunnel
   - Internet lỗi: Dùng http://192.168.1.243:3000 từ BẤT KỲ máy nào trong LAN
   - MongoDB: Dùng Compass/Studio 3T từ máy dev để debug
   - Bao gồm: 192.168.1.x, 192.168.2.x, 192.168.3.x, 192.168.5.x, 192.168.6.x, ...

⚠️ Sẽ thay đổi ở File 23 khi migrate sang Nginx!

→ Sẵn sàng chuyển sang File 04-CAI-DAT-NODEJS.md
```

---

## 🔗 LIÊN KẾT ĐẾN CÁC FILE KHÁC

| Chủ đề             | File                                                       | Ghi chú                       |
| ------------------ | ---------------------------------------------------------- | ----------------------------- |
| Hiện trạng hạ tầng | [00.1-HIEN-TRANG-HA-TANG.md](00.1-HIEN-TRANG-HA-TANG.md)   | Đọc trước để hiểu context     |
| Cloudflare Tunnel  | [10-CLOUDFLARE-TUNNEL.md](10-CLOUDFLARE-TUNNEL.md)         | Setup CF Tunnel (Giai đoạn 1) |
| Setup Máy C        | [21-SETUP-MAY-C.md](21-SETUP-MAY-C.md)                     | Khi có Máy C                  |
| Nginx Config       | [22-NGINX-REVERSE-PROXY.md](22-NGINX-REVERSE-PROXY.md)     | Setup Nginx (Giai đoạn 2)     |
| Migration          | [23-MIGRATION-CF-TO-NGINX.md](23-MIGRATION-CF-TO-NGINX.md) | Chuyển từ CF → Nginx          |
| Switch Guide       | [24-SWITCH-GUIDE.md](24-SWITCH-GUIDE.md)                   | Scripts switch qua lại        |

---

**⏭️ TIẾP THEO: [File 04-CAI-DAT-NODEJS.md](04-CAI-DAT-NODEJS.md)**
