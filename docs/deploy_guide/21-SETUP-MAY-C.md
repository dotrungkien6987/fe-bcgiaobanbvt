# 📘 PHẦN 21: SETUP MÁY CHỦ C (NGINX REVERSE PROXY SERVER)

> **📌 KHI NÀO ĐỌC FILE NÀY?**
>
> Đọc file này khi:
>
> - ✅ Đã hoàn thành Giai đoạn 1 (CF Tunnel đang chạy)
> - ✅ IT đã cấp Máy C mới
> - ✅ IT sẵn sàng NAT port 80/443 đến Máy C
> - ✅ Muốn chuyển sang giải pháp Nginx (Giai đoạn 2)

---

## 🎯 MỤC TIÊU

Sau phần này bạn sẽ:

- ✅ Cài đặt Ubuntu Server trên Máy C
- ✅ Cấu hình SSH để quản trị từ xa
- ✅ Cấu hình Firewall cho reverse proxy server
- ✅ Cài đặt Nginx
- ✅ Cài đặt Certbot (Let's Encrypt SSL)
- ✅ Sẵn sàng cho bước cấu hình Nginx (File 22)

---

## 📊 VỊ TRÍ CỦA MÁY C TRONG HỆ THỐNG

```
╔═══════════════════════════════════════════════════════════════════════════╗
║  SAU KHI HOÀN THÀNH FILE NÀY:                                            ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  [Internet]                                                               ║
║      │                                                                    ║
║      │ Port 80/443                                                       ║
║      ↓                                                                    ║
║  ┌─────────────────┐                                                     ║
║  │ Firewall BV     │  ← IT đã NAT port 80/443 đến Máy C                  ║
║  └────────┬────────┘                                                     ║
║           │                                                               ║
║           ↓                                                               ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │                         MÁY CHỦ C (Mới)                             │ ║
║  │                       192.168.1.??? (Ví dụ: 192.168.1.250)          │ ║
║  │  ┌───────────────────────────────────────────────────────────────┐ │ ║
║  │  │  ✅ Ubuntu Server 22.04                                       │ │ ║
║  │  │  ✅ SSH (port 22) - Từ LAN                                    │ │ ║
║  │  │  ✅ Nginx (port 80/443) - Từ Internet                         │ │ ║
║  │  │  ✅ Certbot (Let's Encrypt)                                   │ │ ║
║  │  │  ✅ UFW Firewall                                              │ │ ║
║  │  └───────────────────────────────────────────────────────────────┘ │ ║
║  └──────────────────────────────┬──────────────────────────────────────┘ ║
║                                 │                                        ║
║                                 │ Proxy Pass (HTTP nội bộ)              ║
║                                 ↓                                        ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │                         MÁY CHỦ A (Đã có)                           │ ║
║  │                         192.168.1.243                               │ ║
║  │  ┌─ React :3000                                                    │ ║
║  │  ├─ Backend :8000                                                  │ ║
║  │  └─ MongoDB :27017                                                 │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

## 📋 THÔNG TIN MÁY C (ĐIỀN VÀO)

Trước khi bắt đầu, ghi lại thông tin Máy C:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  THÔNG TIN MÁY CHỦ C                                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Hostname:        _______________________ (ví dụ: nginx-proxy)         │
│  IP Address:      _______________________ (ví dụ: 192.168.1.250)       │
│  Ubuntu Version:  _______________________ (ví dụ: 22.04 LTS)           │
│  CPU:             _______________________                               │
│  RAM:             _______________________                               │
│  Disk:            _______________________                               │
│                                                                         │
│  User admin:      _______________________                               │
│  SSH Port:        22 (default)                                          │
│                                                                         │
│  IT đã NAT port 80/443: □ Chưa  □ Đã xong                              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🖥️ BƯỚC 1: CÀI ĐẶT UBUNTU SERVER

> **Nếu IT đã cài sẵn Ubuntu:** Bỏ qua bước này, chuyển đến Bước 2.

### **1.1 - Download Ubuntu Server:**

```
1. Truy cập: https://ubuntu.com/download/server
2. Download: Ubuntu Server 22.04 LTS (Jammy Jellyfish)
3. Tạo USB bootable (dùng Rufus hoặc Etcher)
```

### **1.2 - Cài đặt:**

```
Các bước cài đặt cơ bản:
1. Boot từ USB
2. Chọn ngôn ngữ: English
3. Keyboard: Vietnamese hoặc English
4. Network: Cấu hình IP tĩnh (quan trọng!)
   ├─ IP: 192.168.1.250 (hoặc IP IT cấp)
   ├─ Subnet: 255.255.255.0
   ├─ Gateway: 192.168.1.1
   └─ DNS: 8.8.8.8, 8.8.4.4
5. Proxy: Bỏ trống (hoặc theo IT)
6. Mirror: Mặc định
7. Storage: Dùng toàn bộ disk
8. User:
   ├─ Name: Your Name
   ├─ Server name: nginx-proxy
   ├─ Username: yourusername
   └─ Password: ******** (ghi nhớ!)
9. SSH: ✅ Install OpenSSH server
10. Packages: Không chọn gì thêm
11. Hoàn tất và reboot
```

---

## 🔐 BƯỚC 2: CẤU HÌNH SSH

### **2.1 - Test SSH từ máy tính:**

```bash
# Từ máy tính cá nhân (cùng mạng LAN)
ssh yourusername@192.168.1.250

# Lần đầu sẽ hỏi fingerprint:
# Are you sure you want to continue connecting (yes/no)?
# → Gõ: yes

# Nhập password
# → Đã vào server!
```

### **2.2 - Copy SSH key (nếu đã có từ Máy A):**

```bash
# Từ máy tính cá nhân
ssh-copy-id yourusername@192.168.1.250

# Hoặc copy thủ công:
# 1. Xem public key
cat ~/.ssh/id_ed25519.pub

# 2. SSH vào Máy C
ssh yourusername@192.168.1.250

# 3. Thêm key
mkdir -p ~/.ssh
chmod 700 ~/.ssh
nano ~/.ssh/authorized_keys
# → Paste public key
# → Ctrl+O, Enter, Ctrl+X

chmod 600 ~/.ssh/authorized_keys
```

### **2.3 - Bảo mật SSH:**

```bash
# Trên Máy C
sudo nano /etc/ssh/sshd_config

# Tìm và sửa các dòng:
PermitRootLogin no
PasswordAuthentication no  # Chỉ bật sau khi đã test key!
MaxAuthTries 3

# Save: Ctrl+O, Enter, Ctrl+X

# Test config
sudo sshd -t

# Restart SSH
sudo systemctl restart ssh

# ⚠️ GIỮ SESSION HIỆN TẠI MỞ!
# Mở terminal mới test SSH bằng key trước khi đóng session này
```

---

## 🔥 BƯỚC 3: CẤU HÌNH FIREWALL (UFW)

> **Khác biệt so với Máy A:**
>
> - Máy C cần mở port 80/443 PUBLIC (nhận traffic từ Internet)
> - Máy A chỉ mở port 3000/8000 cho Máy C

```bash
# ═══════════════════════════════════════════════════════════════════════════
# FIREWALL CHO MÁY C (NGINX REVERSE PROXY)
# ═══════════════════════════════════════════════════════════════════════════

# Cài UFW (nếu chưa có)
sudo apt update
sudo apt install ufw -y

# Reset
sudo ufw --force reset

# Default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# SSH: Chỉ từ mạng nội bộ (quản trị)
sudo ufw allow from 192.168.1.0/24 to any port 22 comment 'SSH from LAN'
sudo ufw limit ssh

# HTTP/HTTPS: PUBLIC (đây là điểm khác với Máy A!)
# Nginx cần nhận traffic từ Internet
sudo ufw allow 80/tcp comment 'HTTP - Nginx'
sudo ufw allow 443/tcp comment 'HTTPS - Nginx'

# Enable
sudo ufw enable

# Kiểm tra
sudo ufw status verbose

# OUTPUT MONG ĐỢI:
# ┌──────────────────────────────────────────────────────────────────────────┐
# │ Status: active                                                          │
# │                                                                          │
# │ To                         Action      From                              │
# │ --                         ------      ----                              │
# │ 22                         ALLOW IN    192.168.1.0/24                   │
# │ 22/tcp                     LIMIT IN    Anywhere                         │
# │ 80/tcp                     ALLOW IN    Anywhere       ← PUBLIC          │
# │ 443/tcp                    ALLOW IN    Anywhere       ← PUBLIC          │
# └──────────────────────────────────────────────────────────────────────────┘
```

---

## 📦 BƯỚC 4: CÀI ĐẶT NGINX

### **4.1 - Cài đặt:**

```bash
# Update packages
sudo apt update

# Cài Nginx
sudo apt install nginx -y

# Kiểm tra version
nginx -v
# Output: nginx version: nginx/1.18.x

# Kiểm tra status
sudo systemctl status nginx

# Output:
# ● nginx.service - A high performance web server...
#    Active: active (running) ✅

# Enable auto-start khi boot
sudo systemctl enable nginx
```

### **4.2 - Test Nginx:**

```bash
# Test từ chính Máy C
curl http://localhost

# Output: HTML của trang Welcome to nginx!

# Test từ máy tính cá nhân (cùng LAN)
# Mở browser: http://192.168.1.250
# → Phải thấy trang "Welcome to nginx!"
```

### **4.3 - Cấu trúc thư mục Nginx:**

```
/etc/nginx/                    ← Thư mục config chính
├── nginx.conf                 ← Config chính
├── sites-available/           ← Các site configs (available)
│   └── default                ← Config mặc định
├── sites-enabled/             ← Các site đang active (symlinks)
│   └── default → ../sites-available/default
├── conf.d/                    ← Configs phụ
└── snippets/                  ← Các snippet dùng chung

/var/www/                      ← Thư mục web files
└── html/                      ← Document root mặc định
    └── index.nginx-debian.html

/var/log/nginx/                ← Logs
├── access.log                 ← Log truy cập
└── error.log                  ← Log lỗi
```

### **4.4 - Các lệnh Nginx thường dùng:**

```bash
# Kiểm tra config syntax
sudo nginx -t

# Output nếu OK:
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful

# Reload config (không downtime)
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx

# Stop Nginx
sudo systemctl stop nginx

# Start Nginx
sudo systemctl start nginx

# Xem logs realtime
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 🔒 BƯỚC 5: CÀI ĐẶT CERTBOT (LET'S ENCRYPT)

> **Certbot là gì?**
>
> Certbot là công cụ tự động lấy và renew SSL certificates từ Let's Encrypt (miễn phí).
> Thay vì phải mua SSL ($50-100/năm), bạn dùng Let's Encrypt miễn phí!

### **5.1 - Cài đặt Certbot:**

```bash
# Cài Certbot và Nginx plugin
sudo apt install certbot python3-certbot-nginx -y

# Kiểm tra version
certbot --version
# Output: certbot 1.x.x
```

### **5.2 - Lấy SSL Certificate (SAU KHI ĐÃ CÓ DOMAIN):**

```bash
# ⚠️ CHỈ CHẠY SAU KHI:
# 1. DNS domain đã trỏ về IP public của bệnh viện
# 2. IT đã NAT port 80/443 đến Máy C
# 3. Đã cấu hình Nginx server block (File 22)

# Lấy certificate cho domain
sudo certbot --nginx -d yourdomain.vn -d www.yourdomain.vn

# Certbot sẽ hỏi:
# 1. Email: your-email@example.com (để nhận thông báo renew)
# 2. Agree Terms: A
# 3. Share email: N (hoặc Y)
# 4. Redirect HTTP to HTTPS: 2 (Redirect - recommended)

# Nếu thành công:
# Congratulations! Your certificate and chain have been saved at:
# /etc/letsencrypt/live/yourdomain.vn/fullchain.pem
```

### **5.3 - Kiểm tra auto-renewal:**

```bash
# Test dry-run renewal
sudo certbot renew --dry-run

# Nếu OK:
# Congratulations, all renewals succeeded.

# Certbot tự động tạo cron job để renew certificates
# Kiểm tra:
sudo systemctl status certbot.timer

# Output:
# ● certbot.timer - Run certbot twice daily
#    Active: active (waiting)
```

---

## 🧪 BƯỚC 6: KIỂM TRA TỔNG HỢP

```bash
# ═══════════════════════════════════════════════════════════════════════════
# CHECKLIST KIỂM TRA MÁY C
# ═══════════════════════════════════════════════════════════════════════════

# 1. Kiểm tra Ubuntu version
lsb_release -a
# → Ubuntu 22.04.x LTS

# 2. Kiểm tra IP
ip addr show
# → 192.168.1.250 (hoặc IP của bạn)

# 3. Kiểm tra SSH
sudo systemctl status ssh
# → active (running)

# 4. Kiểm tra UFW
sudo ufw status
# → active, port 22/80/443 allow

# 5. Kiểm tra Nginx
sudo systemctl status nginx
# → active (running)

nginx -t
# → syntax is ok

# 6. Kiểm tra Certbot
certbot --version
# → certbot 1.x.x

# 7. Test từ LAN
# Mở browser: http://192.168.1.250
# → Thấy trang Nginx welcome

# 8. Test từ Internet (nếu IT đã NAT)
# Truy cập từ 4G (không phải WiFi bệnh viện)
# http://your-public-ip
# → Thấy trang Nginx welcome = IT đã NAT thành công!
```

---

## ✅ CHECKLIST HOÀN THÀNH

```
□ Ubuntu Server đã cài đặt trên Máy C
□ IP tĩnh đã cấu hình (192.168.1.???)
□ SSH hoạt động từ LAN
□ SSH key đã copy (không dùng password)
□ UFW đã enable với rules đúng:
  □ SSH từ LAN (192.168.1.0/24)
  □ HTTP/HTTPS public (80/443)
□ Nginx đã cài đặt và đang chạy
□ Test http://192.168.1.??? thấy Nginx welcome
□ Certbot đã cài đặt
□ IT đã NAT port 80/443 đến Máy C (hoặc đang chờ)

📌 GHI CHÚ:
─────────────────────
Máy C IP: _______________________
Máy A IP: 192.168.1.243
Domain:   _______________________

⚠️ SSL certificate sẽ lấy ở File 22 sau khi config Nginx!

→ Sẵn sàng chuyển sang File 22-NGINX-REVERSE-PROXY.md
```

---

## 🔗 LIÊN KẾT

| Trước                                                    | Tiếp theo                                              |
| -------------------------------------------------------- | ------------------------------------------------------ |
| [00.1-HIEN-TRANG-HA-TANG.md](00.1-HIEN-TRANG-HA-TANG.md) | [22-NGINX-REVERSE-PROXY.md](22-NGINX-REVERSE-PROXY.md) |

---

**⏭️ TIẾP THEO: [File 22-NGINX-REVERSE-PROXY.md](22-NGINX-REVERSE-PROXY.md)**
