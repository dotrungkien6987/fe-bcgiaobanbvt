# 📘 PHẦN 22: CẤU HÌNH NGINX REVERSE PROXY + SSL

> **📌 ĐIỀU KIỆN TIÊN QUYẾT:**
>
> Trước khi làm file này, đảm bảo:
>
> - ✅ Đã hoàn thành [File 21](21-SETUP-MAY-C.md) (Máy C đã setup)
> - ✅ Nginx đang chạy trên Máy C
> - ✅ IT đã NAT port 80/443 đến Máy C
> - ✅ Domain đã trỏ về IP public của bệnh viện

---

## 🎯 MỤC TIÊU

Sau phần này bạn sẽ:

- ✅ Hiểu Reverse Proxy là gì và hoạt động như thế nào
- ✅ Cấu hình Nginx proxy đến Máy A (React + Backend)
- ✅ Lấy SSL certificate từ Let's Encrypt
- ✅ Cấu hình HTTPS redirect
- ✅ Cấu hình WebSocket proxy (cho Socket.io)
- ✅ Tối ưu performance

---

## 📚 REVERSE PROXY LÀ GÌ?

```
╔═══════════════════════════════════════════════════════════════════════════╗
║  REVERSE PROXY = Trung gian giữa User và Backend Servers                 ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  KHÔNG CÓ REVERSE PROXY (trực tiếp):                                     ║
║  ─────────────────────────────────────                                    ║
║  [User] ──→ [App Server :3000]                                           ║
║  [User] ──→ [App Server :8000]                                           ║
║                                                                           ║
║  Vấn đề:                                                                  ║
║  • Phải expose nhiều ports                                                ║
║  • Không có SSL tập trung                                                 ║
║  • Khó load balance                                                       ║
║  • Khó quản lý                                                            ║
║                                                                           ║
║  ═══════════════════════════════════════════════════════════════════════ ║
║                                                                           ║
║  CÓ REVERSE PROXY (Nginx):                                                ║
║  ─────────────────────────                                                ║
║                                                                           ║
║  [User]                                                                   ║
║     │                                                                     ║
║     │ https://hospital.vn                                                ║
║     │ https://api.hospital.vn                                            ║
║     ↓                                                                     ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │                    NGINX REVERSE PROXY                              │ ║
║  │                       (Máy C)                                        │ ║
║  │  ┌───────────────────────────────────────────────────────────────┐ │ ║
║  │  │  SSL Termination (xử lý HTTPS ở đây)                          │ │ ║
║  │  │  ├─ hospital.vn      → proxy_pass http://192.168.1.243:3000  │ │ ║
║  │  │  └─ api.hospital.vn  → proxy_pass http://192.168.1.243:8000  │ │ ║
║  │  └───────────────────────────────────────────────────────────────┘ │ ║
║  └──────────────────────────────┬──────────────────────────────────────┘ ║
║                                 │                                        ║
║                                 │ HTTP nội bộ (không cần HTTPS)         ║
║                                 ↓                                        ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │                         MÁY CHỦ A                                   │ ║
║  │  ├─ React :3000                                                    │ ║
║  │  └─ Backend :8000                                                  │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  Lợi ích:                                                                 ║
║  ✅ Chỉ expose port 80/443                                               ║
║  ✅ SSL tập trung (dễ quản lý)                                           ║
║  ✅ Có thể load balance                                                  ║
║  ✅ Có thể cache                                                         ║
║  ✅ Có thể thêm nhiều app servers                                        ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

## 🔧 BƯỚC 1: CHUẨN BỊ

### **1.1 - Thông tin cần có:**

```bash
# Ghi lại thông tin:

# Domain chính (frontend):
FRONTEND_DOMAIN="hospital.vn"

# Domain API (backend):
API_DOMAIN="api.hospital.vn"

# IP Máy A (App server):
APP_SERVER_IP="192.168.1.243"

# Ports trên Máy A:
REACT_PORT="3000"
BACKEND_PORT="8000"

# Email (cho Let's Encrypt):
CERT_EMAIL="your-email@example.com"
```

### **1.2 - Kiểm tra DNS:**

```bash
# Kiểm tra DNS đã trỏ đúng chưa
# Từ máy tính có Internet (không phải mạng bệnh viện)

nslookup hospital.vn
# → Phải trả về IP public của bệnh viện

nslookup api.hospital.vn
# → Phải trả về IP public của bệnh viện

# Hoặc dùng online tool:
# https://dnschecker.org/
```

---

## 📝 BƯỚC 2: TẠO NGINX CONFIG CHO FRONTEND

### **2.1 - Tạo config file:**

```bash
# SSH vào Máy C
ssh yourusername@192.168.1.250

# Tạo config file cho frontend
sudo nano /etc/nginx/sites-available/hospital.vn
```

### **2.2 - Nội dung config (HTTP trước, HTTPS sau):**

```nginx
# ═══════════════════════════════════════════════════════════════════════════
# NGINX CONFIG: hospital.vn (Frontend React)
# ═══════════════════════════════════════════════════════════════════════════
#
# File: /etc/nginx/sites-available/hospital.vn
# Mục đích: Proxy requests đến React app trên Máy A
#
# ═══════════════════════════════════════════════════════════════════════════

server {
    # ─────────────────────────────────────────────────────────────────────
    # LISTEN: Port 80 (HTTP) - Sẽ redirect sang HTTPS sau khi có SSL
    # ─────────────────────────────────────────────────────────────────────
    listen 80;
    listen [::]:80;

    # ─────────────────────────────────────────────────────────────────────
    # SERVER NAME: Domain của bạn
    # ─────────────────────────────────────────────────────────────────────
    server_name hospital.vn www.hospital.vn;

    # ─────────────────────────────────────────────────────────────────────
    # LOCATION /: Proxy tất cả requests đến React app
    # ─────────────────────────────────────────────────────────────────────
    location / {
        # Proxy đến Máy A, port 3000
        proxy_pass http://192.168.1.243:3000;

        # Headers quan trọng
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Cache settings
        proxy_cache_bypass $http_upgrade;
    }

    # ─────────────────────────────────────────────────────────────────────
    # LOGS
    # ─────────────────────────────────────────────────────────────────────
    access_log /var/log/nginx/hospital.vn.access.log;
    error_log /var/log/nginx/hospital.vn.error.log;
}
```

### **2.3 - Enable config:**

```bash
# Tạo symlink để enable site
sudo ln -s /etc/nginx/sites-available/hospital.vn /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Output phải là:
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful

# Reload Nginx
sudo systemctl reload nginx
```

---

## 📝 BƯỚC 3: TẠO NGINX CONFIG CHO BACKEND (API)

### **3.1 - Tạo config file:**

```bash
sudo nano /etc/nginx/sites-available/api.hospital.vn
```

### **3.2 - Nội dung config:**

```nginx
# ═══════════════════════════════════════════════════════════════════════════
# NGINX CONFIG: api.hospital.vn (Backend Node.js + Socket.io)
# ═══════════════════════════════════════════════════════════════════════════
#
# File: /etc/nginx/sites-available/api.hospital.vn
# Mục đích: Proxy requests đến Backend app trên Máy A
# Đặc biệt: Có WebSocket support cho Socket.io
#
# ═══════════════════════════════════════════════════════════════════════════

# Upstream định nghĩa backend server
upstream backend_servers {
    # Có thể thêm nhiều servers để load balance
    server 192.168.1.243:8000;

    # Ví dụ load balance (tương lai):
    # server 192.168.1.243:8000 weight=3;
    # server 192.168.1.244:8000 weight=2;

    # Keepalive connections (tăng performance)
    keepalive 32;
}

server {
    listen 80;
    listen [::]:80;

    server_name api.hospital.vn;

    # ─────────────────────────────────────────────────────────────────────
    # LOCATION /: API endpoints
    # ─────────────────────────────────────────────────────────────────────
    location / {
        proxy_pass http://backend_servers;

        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_cache_bypass $http_upgrade;

        # Timeout settings cho API
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # ─────────────────────────────────────────────────────────────────────
    # LOCATION /socket.io/: WebSocket cho Socket.io
    # ─────────────────────────────────────────────────────────────────────
    location /socket.io/ {
        proxy_pass http://backend_servers;

        # WebSocket headers (QUAN TRỌNG!)
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeout cho WebSocket (dài hơn)
        proxy_connect_timeout 7d;
        proxy_send_timeout 7d;
        proxy_read_timeout 7d;

        # Không buffer WebSocket
        proxy_buffering off;
    }

    # ─────────────────────────────────────────────────────────────────────
    # FILE UPLOADS (nếu có)
    # ─────────────────────────────────────────────────────────────────────
    client_max_body_size 50M;  # Cho phép upload file đến 50MB

    # ─────────────────────────────────────────────────────────────────────
    # LOGS
    # ─────────────────────────────────────────────────────────────────────
    access_log /var/log/nginx/api.hospital.vn.access.log;
    error_log /var/log/nginx/api.hospital.vn.error.log;
}
```

### **3.3 - Enable config:**

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/api.hospital.vn /etc/nginx/sites-enabled/

# Test
sudo nginx -t

# Reload
sudo systemctl reload nginx
```

---

## 🔒 BƯỚC 4: CÀI ĐẶT SSL CERTIFICATE

### **4.1 - Lấy certificate cho cả 2 domains:**

```bash
# ⚠️ ĐẢM BẢO:
# 1. DNS đã trỏ đúng (check bằng nslookup)
# 2. Port 80 đã mở và NAT đến Máy C
# 3. Nginx đang chạy với config ở trên

# Lấy SSL certificate
sudo certbot --nginx -d hospital.vn -d www.hospital.vn -d api.hospital.vn

# Certbot sẽ hỏi:
# 1. Email: your-email@example.com
# 2. Agree Terms: A
# 3. Share email: N
# 4. Redirect HTTP to HTTPS: 2 (Redirect)

# Nếu thành công:
# Congratulations! Your certificate and chain have been saved at:
# /etc/letsencrypt/live/hospital.vn/fullchain.pem
```

### **4.2 - Kiểm tra config sau khi Certbot sửa:**

```bash
# Xem config đã được sửa
sudo cat /etc/nginx/sites-available/hospital.vn

# Certbot đã tự động thêm:
# - listen 443 ssl;
# - ssl_certificate /etc/letsencrypt/live/hospital.vn/fullchain.pem;
# - ssl_certificate_key /etc/letsencrypt/live/hospital.vn/privkey.pem;
# - Redirect từ HTTP sang HTTPS
```

### **4.3 - Config SSL sau khi Certbot chỉnh sửa (tham khảo):**

```nginx
# ═══════════════════════════════════════════════════════════════════════════
# NGINX CONFIG SAU KHI CÓ SSL (Certbot tự động tạo)
# ═══════════════════════════════════════════════════════════════════════════

server {
    listen 80;
    listen [::]:80;
    server_name hospital.vn www.hospital.vn;

    # Redirect tất cả HTTP sang HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;

    server_name hospital.vn www.hospital.vn;

    # SSL certificates (Certbot tự thêm)
    ssl_certificate /etc/letsencrypt/live/hospital.vn/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/hospital.vn/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        proxy_pass http://192.168.1.243:3000;

        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_cache_bypass $http_upgrade;
    }

    access_log /var/log/nginx/hospital.vn.access.log;
    error_log /var/log/nginx/hospital.vn.error.log;
}
```

---

## 🧪 BƯỚC 5: KIỂM TRA

### **5.1 - Test từ Internet:**

```bash
# Từ điện thoại 4G (không phải WiFi bệnh viện)

# Test HTTPS frontend
curl -I https://hospital.vn
# → Phải trả về 200 OK

# Test HTTPS API
curl -I https://api.hospital.vn/api/health
# → Phải trả về 200 OK (nếu có endpoint health)

# Test WebSocket (khó test bằng curl, test bằng app thực tế)
```

### **5.2 - Test SSL:**

```bash
# Kiểm tra SSL certificate
echo | openssl s_client -connect hospital.vn:443 2>/dev/null | openssl x509 -noout -dates

# Output:
# notBefore=Feb  4 00:00:00 2026 GMT
# notAfter=May  5 23:59:59 2026 GMT  ← Hết hạn sau 3 tháng

# Hoặc dùng online tool:
# https://www.ssllabs.com/ssltest/analyze.html?d=hospital.vn
```

### **5.3 - Test auto-renewal:**

```bash
# Dry run renewal
sudo certbot renew --dry-run

# Output:
# Congratulations, all renewals succeeded.
```

---

## ⚡ BƯỚC 6: TỐI ƯU PERFORMANCE (OPTIONAL)

### **6.1 - Thêm Gzip compression:**

```bash
sudo nano /etc/nginx/nginx.conf

# Tìm section http { } và thêm/uncomment:
```

```nginx
http {
    # ... existing config ...

    # Gzip Settings
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript application/rss+xml application/atom+xml image/svg+xml;
}
```

### **6.2 - Thêm caching cho static files:**

```nginx
# Thêm vào server block của frontend
location ~* \.(jpg|jpeg|png|gif|ico|css|js|pdf|txt)$ {
    proxy_pass http://192.168.1.243:3000;

    # Cache static files 7 ngày
    expires 7d;
    add_header Cache-Control "public, immutable";
}
```

### **6.3 - Security headers:**

```nginx
# Thêm vào server block
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
```

```bash
# Sau khi thêm, test và reload
sudo nginx -t
sudo systemctl reload nginx
```

---

## ✅ CHECKLIST HOÀN THÀNH

```
□ Config file cho frontend đã tạo (/etc/nginx/sites-available/hospital.vn)
□ Config file cho backend đã tạo (/etc/nginx/sites-available/api.hospital.vn)
□ Cả 2 sites đã enable (symlink trong sites-enabled)
□ nginx -t không có lỗi
□ SSL certificate đã lấy từ Let's Encrypt
□ HTTP tự động redirect sang HTTPS
□ Test từ Internet thành công:
  □ https://hospital.vn → React app
  □ https://api.hospital.vn → Backend API
  □ WebSocket hoạt động
□ Auto-renewal đã test (certbot renew --dry-run)
□ Đã optimize (gzip, cache, security headers) - optional

📌 GHI CHÚ:
─────────────────────
Frontend: https://hospital.vn → 192.168.1.243:3000
Backend:  https://api.hospital.vn → 192.168.1.243:8000
SSL Cert: /etc/letsencrypt/live/hospital.vn/
Expires:  ______________ (check: sudo certbot certificates)

→ Sẵn sàng chuyển sang File 23-MIGRATION-CF-TO-NGINX.md
```

---

## 🔗 LIÊN KẾT

| Trước                                  | Tiếp theo                                                  |
| -------------------------------------- | ---------------------------------------------------------- |
| [21-SETUP-MAY-C.md](21-SETUP-MAY-C.md) | [23-MIGRATION-CF-TO-NGINX.md](23-MIGRATION-CF-TO-NGINX.md) |

---

**⏭️ TIẾP THEO: [File 23-MIGRATION-CF-TO-NGINX.md](23-MIGRATION-CF-TO-NGINX.md)**
