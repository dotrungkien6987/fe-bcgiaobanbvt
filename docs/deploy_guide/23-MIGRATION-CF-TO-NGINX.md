# 📘 PHẦN 23: MIGRATION TỪ CLOUDFLARE TUNNEL SANG NGINX

> **📌 FILE NÀY SỬ DỤNG KHI:**
>
> - ✅ Phase 1 đang chạy ổn định (Cloudflare Tunnel)
> - ✅ Phase 2 đã chuẩn bị xong (Máy C + Nginx + SSL)
> - ✅ IT đã NAT port 80/443 về Máy C
> - ✅ Sẵn sàng chuyển đổi chính thức

---

## 🎯 MỤC TIÊU

```
╔═══════════════════════════════════════════════════════════════════════════╗
║  MIGRATION: Cloudflare Tunnel → Nginx Reverse Proxy                      ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  TRƯỚC (Phase 1):                                                         ║
║  ─────────────────                                                        ║
║  [User] → [Cloudflare] → [CF Tunnel] → [Máy A :3000/:8000]               ║
║                                                                           ║
║  SAU (Phase 2):                                                           ║
║  ────────────────                                                         ║
║  [User] → [Máy C :443] → [Nginx Proxy] → [Máy A :3000/:8000]             ║
║                                                                           ║
║  THAY ĐỔI CHÍNH:                                                          ║
║  1. DNS: Từ Cloudflare Proxy → IP Public bệnh viện                       ║
║  2. Traffic: Đi qua Máy C thay vì CF Tunnel                              ║
║  3. SSL: Let's Encrypt thay vì Cloudflare                                ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

## 📋 PRE-MIGRATION CHECKLIST

### **Trước khi bắt đầu, đảm bảo:**

```
✅ MÁY C (NGINX):
□ Nginx đang chạy (systemctl status nginx)
□ SSL certificate đã lấy (sudo certbot certificates)
□ UFW mở port 80/443 (sudo ufw status)
□ Config frontend + backend đã test

✅ NETWORK:
□ IT đã NAT port 80 → Máy C:80
□ IT đã NAT port 443 → Máy C:443
□ Đã test từ ngoài Internet vào Máy C (http://ip-public → Nginx welcome page)

✅ DNS:
□ Đã biết A record hiện tại (Cloudflare proxy)
□ Đã có IP public của bệnh viện

✅ COMMUNICATION:
□ Đã thông báo users về thời gian maintenance
□ Có kế hoạch rollback nếu fail

✅ TIMING:
□ Chọn thời điểm ít users (sáng sớm/tối muộn)
□ Dự kiến downtime: ~15-30 phút
```

---

## 🕐 TIMELINE MIGRATION

```
╔═══════════════════════════════════════════════════════════════════════════╗
║  MIGRATION TIMELINE (Ước tính 30-60 phút)                                ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  00:00 - 00:05  │ Pre-migration checks                                   ║
║  00:05 - 00:10  │ Thông báo users, backup config                         ║
║  00:10 - 00:15  │ Đổi DNS từ CF → IP public                              ║
║  00:15 - 00:25  │ Chờ DNS propagation                                    ║
║  00:25 - 00:35  │ Test từ nhiều nguồn                                    ║
║  00:35 - 00:45  │ Monitor logs, fix issues                               ║
║  00:45 - 00:50  │ Tắt Cloudflare Tunnel (nếu OK)                         ║
║  00:50 - 01:00  │ Final verification, thông báo hoàn thành               ║
║                                                                           ║
║  ⚠️ NẾU CÓ VẤN ĐỀ: Rollback ngay (đổi DNS về Cloudflare)                ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

## 🚀 BƯỚC 1: PRE-MIGRATION (00:00 - 00:10)

### **1.1 - Final checks trên Máy C:**

```bash
# SSH vào Máy C
ssh yourusername@192.168.1.250

# Check Nginx running
sudo systemctl status nginx
# → Active: active (running)

# Check SSL certificates
sudo certbot certificates
# → Certificate Name: hospital.vn
# → Expiry Date: xxxx-xx-xx

# Check config syntax
sudo nginx -t
# → syntax is ok

# Check ports open
sudo ufw status
# → 80, 443 ALLOW

# Check Nginx can reach Máy A
curl -I http://192.168.1.243:3000
# → 200 OK
curl -I http://192.168.1.243:8000/api/health
# → 200 OK (hoặc endpoint bạn có)
```

### **1.2 - Backup current state:**

```bash
# Trên Máy A - backup Cloudflare Tunnel config
cp ~/.cloudflared/config.yml ~/.cloudflared/config.yml.backup-$(date +%Y%m%d)

# Ghi lại DNS hiện tại
nslookup hospital.vn > ~/dns-backup-$(date +%Y%m%d).txt
cat ~/dns-backup-$(date +%Y%m%d).txt
```

### **1.3 - Thông báo users:**

```
📢 THÔNG BÁO:
Hệ thống sẽ bảo trì từ [GIỜ] ngày [NGÀY].
Dự kiến: ~30 phút.
Liên hệ: [SĐT IT] nếu cần hỗ trợ.
```

---

## 🌐 BƯỚC 2: ĐỔI DNS (00:10 - 00:15)

### **2.1 - Đăng nhập TenTen.vn:**

```
1. Vào https://tenten.vn
2. Đăng nhập tài khoản
3. Chọn domain: hospital.vn
4. Vào phần Quản lý DNS
```

### **2.2 - Đổi A records:**

```
╔═══════════════════════════════════════════════════════════════════════════╗
║  THAY ĐỔI DNS RECORDS                                                     ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  RECORD 1: Frontend                                                       ║
║  ──────────────────                                                       ║
║  Type: A                                                                  ║
║  Name: @ (hoặc hospital.vn)                                              ║
║  Value: [IP_PUBLIC_BENH_VIEN]  ← Thay IP public thực tế                  ║
║  TTL: 300 (5 phút - để dễ rollback)                                      ║
║                                                                           ║
║  RECORD 2: www subdomain                                                  ║
║  ────────────────────────                                                 ║
║  Type: A (hoặc CNAME)                                                    ║
║  Name: www                                                                ║
║  Value: [IP_PUBLIC_BENH_VIEN]                                            ║
║  TTL: 300                                                                 ║
║                                                                           ║
║  RECORD 3: API subdomain                                                  ║
║  ────────────────────────                                                 ║
║  Type: A                                                                  ║
║  Name: api                                                                ║
║  Value: [IP_PUBLIC_BENH_VIEN]                                            ║
║  TTL: 300                                                                 ║
║                                                                           ║
║  ⚠️ XÓA các CNAME records cũ trỏ về Cloudflare                           ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

### **2.3 - Xác nhận thay đổi:**

```bash
# Screenshot lại config DNS mới
# Lưu vào folder backup
```

---

## ⏳ BƯỚC 3: CHỜ DNS PROPAGATION (00:15 - 00:25)

### **3.1 - Monitor propagation:**

```bash
# Kiểm tra từ terminal (Máy C hoặc máy có mạng ngoài)
watch -n 30 "nslookup hospital.vn"

# Hoặc dùng online tools:
# https://dnschecker.org/
# https://www.whatsmydns.net/
```

### **3.2 - TTL cũ có thể cache:**

```
💡 GHI NHỚ:
- TTL cũ của DNS có thể là 3600 (1 giờ) hoặc lâu hơn
- Một số ISP cache lâu hơn TTL
- Thường mất 15-30 phút để phần lớn đã chuyển
- Có thể test bằng 4G phone (ISP khác)
```

---

## ✅ BƯỚC 4: KIỂM TRA (00:25 - 00:35)

### **4.1 - Test từ nhiều nguồn:**

```bash
# Test 1: Từ điện thoại 4G (không phải WiFi bệnh viện)
# Mở browser: https://hospital.vn
# → Phải load React app

# Test 2: Từ terminal có Internet
curl -I https://hospital.vn
# → 200 OK

curl -I https://api.hospital.vn/api/health
# → 200 OK

# Test 3: Check SSL
echo | openssl s_client -connect hospital.vn:443 2>/dev/null | openssl x509 -noout -issuer
# → O = Let's Encrypt (KHÔNG PHẢI Cloudflare)
```

### **4.2 - Test WebSocket:**

```bash
# Đăng nhập vào app, test tính năng real-time
# Ví dụ: notification, chat, etc.
```

### **4.3 - Check logs trên Máy C:**

```bash
# SSH vào Máy C
ssh yourusername@192.168.1.250

# Watch Nginx access log
sudo tail -f /var/log/nginx/hospital.vn.access.log

# Watch error log (quan trọng!)
sudo tail -f /var/log/nginx/hospital.vn.error.log
```

---

## 🔧 BƯỚC 5: XỬ LÝ VẤN ĐỀ (NẾU CÓ)

### **5.1 - Lỗi 502 Bad Gateway:**

```bash
# Nguyên nhân: Nginx không connect được Máy A
# Fix:
ssh yourusername@192.168.1.250

# Check Máy A có phản hồi không
curl http://192.168.1.243:3000
curl http://192.168.1.243:8000

# Nếu không được → check firewall Máy A
ssh yourusername@192.168.1.243
sudo ufw status
# Phải có: 3000, 8000 ALLOW from 192.168.1.250
```

### **5.2 - Lỗi SSL:**

```bash
# Check certificate
sudo certbot certificates

# Nếu hết hạn
sudo certbot renew

# Nếu lỗi config
sudo nginx -t
# Đọc lỗi và fix
```

### **5.3 - WebSocket không hoạt động:**

```bash
# Check config có đúng không
sudo cat /etc/nginx/sites-available/api.hospital.vn

# Đảm bảo có section /socket.io/ với:
# - proxy_http_version 1.1;
# - proxy_set_header Upgrade $http_upgrade;
# - proxy_set_header Connection "upgrade";
```

---

## ⚠️ ROLLBACK (NẾU CẦN)

### **Nếu có vấn đề không giải quyết được:**

```bash
# BƯỚC 1: Đổi DNS về Cloudflare (TenTen.vn)
# Thay A records về CNAME records cũ trỏ về Cloudflare

# BƯỚC 2: Đảm bảo Cloudflare Tunnel vẫn chạy
ssh yourusername@192.168.1.243
systemctl --user status cloudflared
# Nếu stopped:
systemctl --user start cloudflared

# BƯỚC 3: Chờ DNS propagation (15-30 phút)

# BƯỚC 4: Test lại
curl -I https://hospital.vn
```

---

## 🎉 BƯỚC 6: HOÀN TẤT (00:45 - 01:00)

### **6.1 - Tắt Cloudflare Tunnel (sau khi mọi thứ OK):**

```bash
# SSH vào Máy A
ssh yourusername@192.168.1.243

# Stop Cloudflare Tunnel service
systemctl --user stop cloudflared
systemctl --user disable cloudflared

# Hoặc chỉ stop (giữ enable để dễ khởi động lại nếu cần)
systemctl --user stop cloudflared

# Verify
systemctl --user status cloudflared
# → inactive (dead)
```

### **6.2 - Cập nhật firewall Máy A:**

```bash
# Không còn cần mở port cho CF Tunnel
# Nhưng vẫn giữ port cho Nginx

# Verify rules hiện tại
sudo ufw status

# Nếu muốn strict hơn (chỉ cho Máy C access):
# Xem lại File 03-FIREWALL-UFW phần 7.3
```

### **6.3 - Update .env frontend (nếu cần):**

```bash
# Nếu frontend đang dùng CF URL, đổi sang domain mới
# File: .env.production

REACT_APP_BACKEND_API=https://api.hospital.vn/api
```

### **6.4 - Thông báo hoàn thành:**

```
📢 THÔNG BÁO:
Bảo trì hệ thống đã hoàn tất.
Hệ thống hoạt động bình thường.
Liên hệ: [SĐT IT] nếu gặp vấn đề.
```

---

## 📊 SO SÁNH TRƯỚC/SAU

```
╔═══════════════════════════════════════════════════════════════════════════╗
║  SO SÁNH PHASE 1 vs PHASE 2                                               ║
╠════════════════════╦════════════════════════╦═════════════════════════════╣
║  Tiêu chí          ║  Phase 1 (CF Tunnel)   ║  Phase 2 (Nginx)           ║
╠════════════════════╬════════════════════════╬═════════════════════════════╣
║  SSL               ║  Cloudflare            ║  Let's Encrypt             ║
║  DNS               ║  Cloudflare proxy      ║  Direct A record           ║
║  Traffic path      ║  Qua Internet → CF     ║  Direct đến bệnh viện      ║
║  Latency           ║  Cao hơn               ║  Thấp hơn                  ║
║  Dependencies      ║  Cloudflare service    ║  Tự host (Máy C)           ║
║  Control           ║  Phụ thuộc CF          ║  Toàn quyền kiểm soát      ║
║  Load balancing    ║  Không                 ║  Có thể (nginx upstream)   ║
║  Cost              ║  Free                  ║  Free (nếu có Máy C)       ║
╚════════════════════╩════════════════════════╩═════════════════════════════╝
```

---

## ✅ POST-MIGRATION CHECKLIST

```
□ DNS đã trỏ về IP public bệnh viện
□ HTTPS hoạt động (Let's Encrypt cert)
□ Frontend load bình thường
□ Backend API hoạt động
□ WebSocket/Socket.io hoạt động
□ Login/Logout hoạt động
□ File upload hoạt động
□ Users LAN access OK
□ Users Internet access OK
□ Cloudflare Tunnel đã stop/disable
□ Thông báo users hoàn thành
□ Documentation updated

📌 GHI CHÚ:
─────────────────────
Migration date: ______________
Performed by: _______________
Downtime actual: ____________
Issues encountered: _________
```

---

## 🔗 LIÊN KẾT

| Trước                                                  | Tiếp theo                                |
| ------------------------------------------------------ | ---------------------------------------- |
| [22-NGINX-REVERSE-PROXY.md](22-NGINX-REVERSE-PROXY.md) | [24-SWITCH-GUIDE.md](24-SWITCH-GUIDE.md) |

---

**⏭️ TIẾP THEO: [File 24-SWITCH-GUIDE.md](24-SWITCH-GUIDE.md)**
