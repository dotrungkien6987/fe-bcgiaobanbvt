# 📘 PHẦN 25: TROUBLESHOOTING - XỬ LÝ SỰ CỐ THƯỜNG GẶP

> **📌 MỤC ĐÍCH:**
>
> Hướng dẫn debug và khắc phục các lỗi thường gặp:
>
> - Lỗi kết nối (network, database)
> - Lỗi ứng dụng (crash, slow)
> - Lỗi hệ thống (disk full, memory)
> - Lỗi SSL/HTTPS

---

## 🔍 QUY TRÌNH DEBUG CHUẨN

```
╔═══════════════════════════════════════════════════════════════════════════╗
║  DEBUG WORKFLOW                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  1️⃣  XÁC ĐỊNH VẤN ĐỀ                                                     ║
║     • User báo gì? Lúc nào? Ở đâu?                                       ║
║     • Có thể reproduce không?                                             ║
║                                                                           ║
║  2️⃣  KIỂM TRA NHANH                                                      ║
║     • pm2 list → Apps có online?                                         ║
║     • systemctl status mongod → MongoDB có chạy?                         ║
║     • curl localhost:8000 → Backend phản hồi?                            ║
║                                                                           ║
║  3️⃣  XEM LOGS                                                            ║
║     • pm2 logs backend --err → Lỗi gì?                                   ║
║     • journalctl -u mongod → MongoDB logs                                ║
║     • /var/log/nginx/error.log → Nginx logs                              ║
║                                                                           ║
║  4️⃣  KHẮC PHỤC                                                           ║
║     • Áp dụng fix phù hợp                                                 ║
║     • Test lại                                                            ║
║     • Document để tránh lặp lại                                           ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

## 🔴 LỖI 1: APP KHÔNG TRUY CẬP ĐƯỢC

### **Triệu chứng:**

- Mở browser → "This site can't be reached"
- curl → "Connection refused"

### **Kiểm tra:**

```bash
# 1. Kiểm tra PM2
pm2 list
# → Nếu status = errored hoặc stopped

# 2. Kiểm tra process đang chạy
ss -tuln | grep -E "3000|8000"
# → Phải thấy port 3000 và 8000 LISTEN

# 3. Kiểm tra từ localhost
curl http://localhost:3000
curl http://localhost:8000/api/health

# 4. Kiểm tra firewall
sudo ufw status
```

### **Khắc phục:**

```bash
# Nếu PM2 stopped/errored:
pm2 restart all
pm2 logs --err  # Xem lỗi gì

# Nếu port không LISTEN:
pm2 start ecosystem.config.js

# Nếu firewall block:
sudo ufw allow 3000
sudo ufw allow 8000
```

---

## 🔴 LỖI 2: MONGODB CONNECTION REFUSED

### **Triệu chứng:**

- Backend báo: "MongoNetworkError: connect ECONNREFUSED"
- "MongooseServerSelectionError"

### **Kiểm tra:**

```bash
# 1. Kiểm tra MongoDB service
sudo systemctl status mongod

# 2. Kiểm tra MongoDB port
ss -tuln | grep 27017

# 3. Kiểm tra MongoDB logs
sudo tail -100 /var/log/mongodb/mongod.log

# 4. Test connection
mongosh
```

### **Khắc phục:**

```bash
# Nếu MongoDB stopped:
sudo systemctl start mongod
sudo systemctl enable mongod

# Nếu lỗi lock file:
sudo rm /var/lib/mongodb/mongod.lock
sudo systemctl restart mongod

# Nếu lỗi permissions:
sudo chown -R mongodb:mongodb /var/lib/mongodb
sudo chown -R mongodb:mongodb /var/log/mongodb
sudo systemctl restart mongod

# Nếu lỗi WiredTiger:
# ⚠️ Cẩn thận - có thể mất data
sudo rm /var/lib/mongodb/WiredTiger.lock
sudo systemctl restart mongod
```

---

## 🔴 LỖI 3: DISK FULL

### **Triệu chứng:**

- "No space left on device"
- Apps crash liên tục
- Không ghi được log

### **Kiểm tra:**

```bash
# Kiểm tra disk usage
df -h

# Tìm folder chiếm nhiều nhất
sudo du -sh /* 2>/dev/null | sort -hr | head -10

# Tìm files lớn
sudo find / -type f -size +100M 2>/dev/null
```

### **Khắc phục:**

```bash
# 1. Dọn logs cũ
sudo journalctl --vacuum-size=100M
sudo truncate -s 0 /var/log/syslog.1
pm2 flush

# 2. Dọn apt cache
sudo apt clean
sudo apt autoremove -y

# 3. Xóa old kernels
sudo apt autoremove --purge

# 4. Dọn tmp
sudo rm -rf /tmp/*

# 5. Dọn npm cache
npm cache clean --force

# 6. Kiểm tra MongoDB journal
sudo ls -lh /var/lib/mongodb/journal/
# Nếu quá lớn, có thể compact (cần downtime)
```

---

## 🔴 LỖI 4: MEMORY EXHAUSTED

### **Triệu chứng:**

- "JavaScript heap out of memory"
- System rất chậm
- OOM killer kill processes

### **Kiểm tra:**

```bash
# Kiểm tra RAM
free -h

# Xem process nào dùng nhiều RAM
ps aux --sort=-%mem | head -10

# Xem PM2 memory
pm2 list
```

### **Khắc phục:**

```bash
# 1. Restart apps để giải phóng RAM
pm2 restart all

# 2. Giới hạn memory trong ecosystem.config.js
# max_memory_restart: '500M'

# 3. Tăng Node.js heap (nếu cần)
# node_args: '--max-old-space-size=1024'

# 4. Thêm swap (nếu chưa có)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Thêm vào fstab để persist
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## 🔴 LỖI 5: SSL CERTIFICATE EXPIRED

### **Triệu chứng:**

- Browser báo "Your connection is not private"
- "NET::ERR_CERT_DATE_INVALID"

### **Kiểm tra:**

```bash
# Kiểm tra certificate expiry
sudo certbot certificates

# Check từ bên ngoài
echo | openssl s_client -connect yourdomain.com:443 2>/dev/null | openssl x509 -noout -dates
```

### **Khắc phục:**

```bash
# Renew certificate
sudo certbot renew

# Nếu lỗi, renew với force
sudo certbot renew --force-renewal

# Reload nginx sau khi renew
sudo systemctl reload nginx

# Setup auto-renewal (nếu chưa có)
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

---

## 🔴 LỖI 6: CLOUDFLARE TUNNEL DISCONNECTED 🔵

> **🔵 Chỉ áp dụng cho Phase 1 (Cloudflare Tunnel)**

### **Triệu chứng:**

- Site không truy cập được từ Internet
- Nhưng LAN vẫn access được

### **Kiểm tra:**

```bash
# Check tunnel service
systemctl --user status cloudflared

# Check tunnel logs
journalctl --user -u cloudflared -f

# Check từ Cloudflare Dashboard
# https://dash.cloudflare.com → Zero Trust → Tunnels
```

### **Khắc phục:**

```bash
# Restart tunnel
systemctl --user restart cloudflared

# Nếu lỗi credential
cloudflared tunnel login
cloudflared tunnel run <tunnel-name>

# Nếu cần tạo lại service
cloudflared service install
systemctl --user daemon-reload
systemctl --user start cloudflared
```

---

## 🔴 LỖI 7: 502 BAD GATEWAY (NGINX) 🟢

> **🟢 Chỉ áp dụng cho Phase 2 (Nginx reverse proxy trên Máy C: 192.168.1.250)**

### **Triệu chứng:**

- Nginx trả về "502 Bad Gateway"

### **Kiểm tra:**

```bash
# Nginx có thể connect đến backend?
curl http://192.168.1.243:3000  # từ Máy C
curl http://192.168.1.243:8000

# Kiểm tra nginx logs
sudo tail -50 /var/log/nginx/error.log

# Kiểm tra nginx config
sudo nginx -t
```

### **Khắc phục:**

```bash
# 1. Kiểm tra backend có chạy
ssh user@192.168.1.243 "pm2 list"

# 2. Kiểm tra firewall Máy A
ssh user@192.168.1.243 "sudo ufw status"
# Phải cho phép từ Máy C

# 3. Kiểm tra proxy_pass trong nginx config
sudo cat /etc/nginx/sites-available/yourdomain.com
# Đảm bảo IP và port đúng

# 4. Reload nginx
sudo systemctl reload nginx
```

---

## 🔴 LỖI 8: WEBSOCKET/SOCKET.IO KHÔNG HOẠT ĐỘNG

### **Triệu chứng:**

- Real-time notifications không nhận được
- NotificationBell không cập nhật badge
- Console báo WebSocket errors
- DevTools → Network → WS: không thấy connection

### **Kiểm tra chung:**

```bash
# 1. Kiểm tra backend Socket.IO có chạy
pm2 logs backend --lines 50 | grep -i socket
# Phải thấy: "Socket.IO server initialized"

# 2. Kiểm tra từ localhost
curl -I http://localhost:8000/socket.io/?EIO=4&transport=polling
# Phải trả về 200 OK

# 3. Frontend: DevTools → Network → WS filter
# Phải thấy connection /socket.io/ với status 101
```

### **🔵 Khắc phục — Cloudflare Tunnel (Phase 1):**

```bash
# CF Tunnel thường tự động hỗ trợ WebSocket
# Nếu vẫn lỗi:

# 1. Kiểm tra cloudflared version (cần >= 2023.x)
cloudflared --version

# 2. Restart tunnel
systemctl --user restart cloudflared

# 3. Kiểm tra Cloudflare Dashboard:
# Zero Trust → Tunnels → Public Hostname
# Đảm bảo api.hospital.vn → http://localhost:8000
# (QUAN TRỌNG: http:// không phải https://)

# 4. Nếu Socket.IO fallback sang polling (chậm nhưng vẫn hoạt động):
# Đây là behavior bình thường của Socket.IO
# Xem Console: "Socket connected" là OK
```

### **🟢 Khắc phục — Nginx (Phase 2):**

```bash
# Kiểm tra nginx config cho WebSocket
grep -A5 "socket.io" /etc/nginx/sites-available/api.hospital.vn
```

```nginx
# Đảm bảo nginx config có (file trên Máy C: 192.168.1.250):
location /socket.io/ {
    proxy_pass http://192.168.1.243:8000;

    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;

    proxy_connect_timeout 7d;
    proxy_send_timeout 7d;
    proxy_read_timeout 7d;
}
```

```bash
# Reload nginx
sudo nginx -t
sudo systemctl reload nginx

# Verify: DevTools → Network → WS → /socket.io/ → 101 ✅
```

---

## 🔴 LỖI 9: PM2 APP CRASH LOOP

### **Triệu chứng:**

- App restart liên tục
- Cột ↺ trong pm2 list tăng nhanh

### **Kiểm tra:**

```bash
# Xem restart count
pm2 list

# Xem error logs
pm2 logs --err

# Xem chi tiết
pm2 show backend
```

### **Khắc phục:**

```bash
# 1. Xem logs để biết lỗi gì
pm2 logs backend --err --lines 200

# 2. Fix lỗi trong code hoặc config

# 3. Reset restart count
pm2 reset backend

# 4. Restart
pm2 restart backend

# 5. Nếu do memory, tăng limit
# Trong ecosystem.config.js:
# max_memory_restart: '1G'
```

---

## 🔴 LỖI 10: PERMISSION DENIED

### **Triệu chứng:**

- "EACCES: permission denied"
- Cannot read/write file

### **Kiểm tra:**

```bash
# Kiểm tra owner của file/folder
ls -la /path/to/file

# Kiểm tra user đang chạy PM2
pm2 show backend | grep "exec mode\|user"
```

### **Khắc phục:**

```bash
# Fix ownership
sudo chown -R $USER:$USER /home/$USER/

# Fix permissions
chmod -R 755 /home/$USER/app/
chmod 600 /home/$USER/.env

# Nếu port < 1024 cần sudo hoặc:
sudo setcap 'cap_net_bind_service=+ep' $(which node)
```

---

## 🔴 LỖI 11: PWA / SERVICE WORKER KHÔNG HOẠT ĐỘNG

### **Triệu chứng:**

- DevTools → Application → Service Workers: không có SW nào
- App không installable (không thấy install prompt)
- Cache không update sau deploy
- Offline không hoạt động

### **Kiểm tra:**

```bash
# 1. Kiểm tra service-worker.js có trong build
ls -la ~/projects/frontend/build/service-worker.js

# 2. Kiểm tra serve trả về đúng
curl -I http://localhost:3000/service-worker.js
# Phải trả về: Content-Type: application/javascript

# 3. Kiểm tra manifest.json
curl http://localhost:3000/manifest.json
# Phải thấy: {"short_name":"BC Bệnh viện",...}
```

### **Khắc phục:**

```bash
# SW không đăng ký:
# → Nguyên nhân 1: Không phải HTTPS (SW yêu cầu HTTPS trừ localhost)
# → Nguyên nhân 2: Đang ở development mode (SW chỉ chạy trong production)
# → Nguyên nhân 3: Build lỗi → npm run build lại

# Cache không update:
# → Sửa CACHE_NAME trong service-worker.js (tăng version)
# → Build lại: npm run build && pm2 restart frontend

# Force clear cache từ browser:
# DevTools → Application → Storage → Clear site data

# 🟢 Nginx: SW bị cache quá mạnh:
location = /service-worker.js {
    proxy_pass http://192.168.1.243:3000;
    expires off;
    add_header Cache-Control "no-store, no-cache, must-revalidate";
}
```

---

## 🔴 LỖI 12: THÔNG BÁO / NOTIFICATION KHÔNG HOẠT ĐỘNG

### **Triệu chứng:**

- NotificationBell không cập nhật khi có thông báo mới
- Không thấy toast notification
- Badge số không đổi

### **Kiểm tra:**

```bash
# 1. Kiểm tra Socket.IO kết nối (xem LỖI 8)
# DevTools → Network → WS → /socket.io/ có không?

# 2. Kiểm tra backend notification service
pm2 logs backend --lines 100 | grep -i notification

# 3. Kiểm tra Notification permission trong browser
# DevTools → Console:
# > Notification.permission
# Phải là "granted"

# 4. Kiểm tra Redux state
# DevTools → Redux DevTools → State → notification
# → Kiểm tra items, unreadCount
```

### **Khắc phục:**

```bash
# Socket.IO không kết nối:
# → Xem LỖI 8 (WebSocket/Socket.IO)

# Notification permission bị block:
# → User phải tự bật lại:
#    Chrome: Click 🔒 bên trái URL → Notifications → Allow
#    Hoặc: Settings → Privacy → Site settings → Notifications

# NotificationBell không render:
# → Kiểm tra layout components (DashboardLayout/MainLayout)
# → Kiểm tra SocketProvider wrap quanh App

# Thông báo không gửi được từ backend:
# → Kiểm tra NotificationType và NotificationTemplate trong DB
# → Admin → Quản lý thông báo → Kiểm tra template config
# → Kiểm tra recipient là NhanVienID (KHÔNG phải User._id)

# Windows Focus Assist chặn notification:
# → Windows Settings → System → Focus Assist → Off
# → Hoặc thêm hospital.vn vào Priority list
```

---

## 📚 QUICK REFERENCE TABLE

| Lỗi                | Check nhanh                           | Fix nhanh                               |
| ------------------ | ------------------------------------- | --------------------------------------- |
| App không truy cập | `pm2 list`                            | `pm2 restart all`                       |
| MongoDB lỗi        | `systemctl status mongod`             | `sudo systemctl restart mongod`         |
| Disk full          | `df -h`                               | `pm2 flush && sudo apt clean`           |
| Memory exhausted   | `free -h`                             | `pm2 restart all`                       |
| SSL expired        | `certbot certificates`                | `sudo certbot renew`                    |
| 🔵 CF Tunnel down  | `systemctl --user status cloudflared` | `systemctl --user restart cloudflared`  |
| 🟢 502 Bad Gateway | `curl localhost:3000`                 | Check backend + firewall + HOST=0.0.0.0 |
| WebSocket lỗi      | DevTools → Network → WS               | 🔵 restart tunnel / 🟢 nginx WS config  |
| Crash loop         | `pm2 logs --err`                      | Fix code, `pm2 reset`                   |
| Permission denied  | `ls -la`                              | `chown -R $USER:$USER`                  |
| PWA/SW lỗi         | DevTools → Application → SW           | Clear site data, rebuild                |
| Notification lỗi   | DevTools → Network → WS               | Check Socket.IO + permission            |

---

## ✅ CHECKLIST KHI GẶP LỖI

```
□ Xác định vấn đề cụ thể (user báo gì?)
□ Check services: pm2 list, systemctl status mongod
□ Check logs: pm2 logs --err, journalctl
□ Check resources: df -h, free -h
□ Check network: curl localhost:port
□ Check firewall: ufw status
□ Áp dụng fix
□ Test lại
□ Document lỗi và cách fix
```

---

## 🔗 LIÊN KẾT

| Trước                                    | Tiếp theo                          |
| ---------------------------------------- | ---------------------------------- |
| [24-SWITCH-GUIDE.md](24-SWITCH-GUIDE.md) | [26-EMERGENCY.md](26-EMERGENCY.md) |
