# 📘 PHẦN 29: CHECKLISTS - DANH SÁCH KIỂM TRA

> **📌 MỤC ĐÍCH:**
>
> Tổng hợp tất cả checklists để đảm bảo không bỏ sót bước nào

---

## ✅ CHECKLIST 1: PRE-DEPLOYMENT (TRƯỚC KHI TRIỂN KHAI)

```
╔═══════════════════════════════════════════════════════════════════════════╗
║  CHUẨN BỊ TRƯỚC KHI BẮT ĐẦU                                               ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  📋 THÔNG TIN CẦN CÓ:                                                     ║
║  □ IP server: _________________                                           ║
║  □ Username SSH: ______________                                           ║
║  □ Password/SSH key: __________                                           ║
║  □ Domain: ____________________                                           ║
║  □ DNS login (TenTen): ________                                           ║
║  □ Cloudflare account: ________                                           ║
║  □ MongoDB version: ___________                                           ║
║  □ Node.js version: ___________                                           ║
║                                                                           ║
║  📦 VẬT LIỆU:                                                             ║
║  □ Source code (Git repo URL)                                             ║
║  □ Environment variables (.env)                                           ║
║  □ SSL certificates (nếu có sẵn)                                         ║
║  □ Database backup (nếu migration)                                        ║
║                                                                           ║
║  🔧 TOOLS:                                                                 ║
║  □ SSH client (Terminal/Putty)                                           ║
║  □ Notepad để ghi chú                                                     ║
║  □ Browser để test                                                        ║
║  □ Điện thoại 4G để test từ ngoài                                        ║
║                                                                           ║
║  📞 CONTACTS:                                                              ║
║  □ IT Network (để NAT ports)                                              ║
║  □ Người có quyền domain                                                  ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

## ✅ CHECKLIST 2: SERVER SETUP (NGÀY 1-2)

```
╔═══════════════════════════════════════════════════════════════════════════╗
║  PHASE 1: SETUP MÔI TRƯỜNG                                                ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  📁 FILE 01 - LINUX BASICS:                                               ║
║  □ Đã đọc và hiểu các commands cơ bản                                    ║
║  □ Đã test SSH connect được vào server                                   ║
║                                                                           ║
║  🔐 FILE 02 - SSH CONFIG:                                                 ║
║  □ Đã tạo SSH key pair                                                    ║
║  □ Đã copy public key lên server                                          ║
║  □ Đã test login bằng key (không password)                               ║
║  □ Đã disable password login (optional)                                   ║
║  □ Đã đổi SSH port (optional)                                            ║
║                                                                           ║
║  🔥 FILE 03 - FIREWALL:                                                   ║
║  □ UFW enabled                                                            ║
║  □ SSH port allowed                                                       ║
║  □ Port 3000, 8000 allowed cho LAN                                       ║
║  □ Port 27017 allowed cho localhost/LAN                                  ║
║  □ Test: sudo ufw status                                                  ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

## ✅ CHECKLIST 3: STACK INSTALLATION (NGÀY 2-3)

```
╔═══════════════════════════════════════════════════════════════════════════╗
║  PHASE 2: CÀI ĐẶT STACK                                                   ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  📦 FILE 04 - NODE.JS:                                                    ║
║  □ NVM installed                                                          ║
║  □ Node.js 20.x installed                                                 ║
║  □ npm working                                                            ║
║  □ Test: node -v && npm -v                                               ║
║                                                                           ║
║  🍃 FILE 05 - MONGODB:                                                    ║
║  □ MongoDB 7.0 installed                                                  ║
║  □ Service running: systemctl status mongod                               ║
║  □ Can connect: mongosh                                                   ║
║  □ Authentication enabled (optional)                                      ║
║                                                                           ║
║  🔗 FILE 06 - REPLICA SET:                                                ║
║  □ Replica set configured (if needed)                                     ║
║  □ Test: rs.status()                                                      ║
║                                                                           ║
║  💾 FILE 07 - BACKUP:                                                     ║
║  □ Backup script created                                                  ║
║  □ Cron job setup                                                         ║
║  □ Test backup: mongodump                                                 ║
║  □ Test restore: mongorestore                                             ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

## ✅ CHECKLIST 4: CLOUDFLARE TUNNEL (NGÀY 3-4)

```
╔═══════════════════════════════════════════════════════════════════════════╗
║  PHASE 3: CLOUDFLARE TUNNEL (PHASE 1)                                     ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  🌐 FILE 08 - DOMAIN:                                                     ║
║  □ Domain purchased/owned                                                  ║
║  □ Nameservers changed to Cloudflare                                      ║
║  □ DNS propagated                                                         ║
║                                                                           ║
║  ☁️  FILE 09 - CLOUDFLARE:                                                ║
║  □ Cloudflare account created                                             ║
║  □ Domain added to Cloudflare                                             ║
║  □ SSL mode: Full (strict)                                               ║
║                                                                           ║
║  🔗 FILE 10 - TUNNEL:                                                     ║
║  □ cloudflared installed                                                  ║
║  □ Tunnel created                                                         ║
║  □ config.yml configured                                                  ║
║  □ Service running: systemctl --user status cloudflared                  ║
║  □ DNS routes configured in Cloudflare                                    ║
║  □ Test: curl https://yourdomain.com                                     ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

## ✅ CHECKLIST 5: DEPLOYMENT (NGÀY 4-5)

```
╔═══════════════════════════════════════════════════════════════════════════╗
║  PHASE 4: DEPLOY APPLICATIONS                                             ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  🔧 FILE 11 - BACKEND:                                                    ║
║  □ Git clone thành công                                                   ║
║  □ npm install thành công                                                 ║
║  □ .env configured                                                        ║
║  □ PM2 running: pm2 list                                                  ║
║  □ API responding: curl localhost:8000                                   ║
║  □ MongoDB connected (check logs)                                         ║
║                                                                           ║
║  🎨 FILE 12 - FRONTEND:                                                   ║
║  □ Git clone thành công                                                   ║
║  □ npm install thành công                                                 ║
║  □ .env configured (REACT_APP_BACKEND_API)                               ║
║  □ npm run build thành công                                               ║
║  □ PM2 serving: serve -s build                                           ║
║  □ Frontend loading: curl localhost:3000                                 ║
║                                                                           ║
║  ⚙️  FILE 13 - PM2:                                                       ║
║  □ ecosystem.config.js created                                            ║
║  □ All apps online: pm2 list                                             ║
║  □ Startup script: pm2 startup && pm2 save                               ║
║  □ Test after reboot                                                      ║
║                                                                           ║
║  🔑 FILE 14 - ENV VARIABLES:                                              ║
║  □ Backend .env complete                                                  ║
║  □ Frontend .env complete                                                 ║
║  □ Secrets secure (not in git)                                           ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

## ✅ CHECKLIST 6: PWA & FCM (NGÀY 5-6)

```
╔═══════════════════════════════════════════════════════════════════════════╗
║  PHASE 5: PWA & PUSH NOTIFICATIONS                                        ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  📱 FILE 15 - SERVICE WORKER:                                             ║
║  □ Service worker registered                                              ║
║  □ manifest.json configured                                               ║
║  □ Icons added (192x192, 512x512)                                        ║
║  □ PWA installable on mobile                                              ║
║                                                                           ║
║  🔔 FILE 16 - FCM:                                                        ║
║  □ Firebase project created                                               ║
║  □ FCM credentials in .env                                               ║
║  □ Push notifications working                                             ║
║  □ Tested on Android/iOS                                                  ║
║                                                                           ║
║  🧪 FILE 17 - TESTING:                                                    ║
║  □ Lighthouse PWA score > 90                                             ║
║  □ Offline mode working                                                   ║
║  □ Push notifications received                                            ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

## ✅ CHECKLIST 7: MONITORING (NGÀY 6-7)

```
╔═══════════════════════════════════════════════════════════════════════════╗
║  PHASE 6: MONITORING & MAINTENANCE                                        ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  📊 FILE 18 - SYSTEM MONITORING:                                          ║
║  □ htop/glances installed                                                 ║
║  □ system-health.sh script created                                        ║
║  □ Alert cron job setup                                                   ║
║                                                                           ║
║  📝 FILE 19 - LOGS:                                                       ║
║  □ Biết vị trí log files                                                  ║
║  □ Log rotation configured                                                ║
║  □ find-errors.sh script created                                          ║
║                                                                           ║
║  📈 FILE 20 - PM2 MONITORING:                                             ║
║  □ pm2 monit working                                                      ║
║  □ ecosystem.config.js optimized                                          ║
║  □ Auto-restart configured                                                ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

## ✅ CHECKLIST 8: NGINX MIGRATION (PHASE 2)

```
╔═══════════════════════════════════════════════════════════════════════════╗
║  PHASE 7: NGINX REVERSE PROXY (Khi có Máy C)                              ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  🖥️  FILE 21 - MÁY C SETUP:                                               ║
║  □ Ubuntu Server installed                                                 ║
║  □ SSH configured                                                          ║
║  □ UFW configured (80, 443 public)                                        ║
║  □ Nginx installed                                                         ║
║  □ Certbot installed                                                       ║
║  □ IT đã NAT port 80/443                                                  ║
║                                                                           ║
║  ⚙️  FILE 22 - NGINX CONFIG:                                               ║
║  □ Frontend site config created                                            ║
║  □ Backend site config created (with WebSocket)                           ║
║  □ Sites enabled (symlinks)                                                ║
║  □ nginx -t passed                                                         ║
║  □ SSL certificate obtained (certbot)                                     ║
║  □ HTTPS redirect working                                                  ║
║  □ Auto-renewal configured                                                 ║
║                                                                           ║
║  🔄 FILE 23 - MIGRATION:                                                   ║
║  □ Pre-migration checks passed                                             ║
║  □ Users notified                                                          ║
║  □ DNS changed to direct IP                                                ║
║  □ DNS propagated                                                          ║
║  □ All tests passed                                                        ║
║  □ CF Tunnel stopped                                                       ║
║  □ Users notified of completion                                            ║
║                                                                           ║
║  🔀 FILE 24 - SWITCH SCRIPTS:                                              ║
║  □ switch-to-cftunnel.sh created                                          ║
║  □ switch-to-nginx.sh created                                              ║
║  □ check-status.sh created                                                 ║
║  □ Scripts tested                                                          ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

## ✅ CHECKLIST 9: FINAL VERIFICATION

```
╔═══════════════════════════════════════════════════════════════════════════╗
║  FINAL VERIFICATION CHECKLIST                                             ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  🌐 ACCESS TESTS:                                                          ║
║  □ Frontend loads from LAN                                                 ║
║  □ Frontend loads from Internet (4G)                                      ║
║  □ Backend API responds                                                    ║
║  □ HTTPS working (no certificate errors)                                  ║
║                                                                           ║
║  🔐 AUTHENTICATION:                                                        ║
║  □ Login works                                                             ║
║  □ Logout works                                                            ║
║  □ JWT tokens refreshing                                                   ║
║                                                                           ║
║  📊 FEATURES:                                                              ║
║  □ Data loads correctly                                                    ║
║  □ CRUD operations work                                                    ║
║  □ File uploads work                                                       ║
║  □ Real-time features work (Socket.io)                                    ║
║  □ Push notifications work                                                 ║
║                                                                           ║
║  📱 MOBILE:                                                                ║
║  □ PWA installable                                                         ║
║  □ Works on Android                                                        ║
║  □ Works on iOS                                                            ║
║                                                                           ║
║  🛡️  SECURITY:                                                             ║
║  □ Firewall active                                                         ║
║  □ SSH key-only (optional)                                                ║
║  □ MongoDB secured                                                         ║
║  □ Environment secrets not exposed                                        ║
║                                                                           ║
║  💾 BACKUP & RECOVERY:                                                     ║
║  □ Backup scripts working                                                  ║
║  □ Backup cron jobs active                                                 ║
║  □ Tested restore procedure                                                ║
║  □ Emergency procedures documented                                         ║
║                                                                           ║
║  📈 MONITORING:                                                            ║
║  □ System health script working                                            ║
║  □ PM2 monitoring setup                                                    ║
║  □ Alert system active                                                     ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

## ✅ CHECKLIST 10: HANDOVER DOCUMENTATION

```
╔═══════════════════════════════════════════════════════════════════════════╗
║  DOCUMENTATION FOR HANDOVER                                               ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  📋 INFORMATION DOCUMENTED:                                                ║
║  □ Server IP addresses                                                     ║
║  □ SSH credentials/keys location                                          ║
║  □ Domain management access                                                ║
║  □ Cloudflare access                                                       ║
║  □ Database credentials                                                    ║
║  □ API keys and secrets location                                          ║
║                                                                           ║
║  📁 FILES LOCATION:                                                        ║
║  □ Application directories                                                 ║
║  □ Environment files                                                       ║
║  □ Backup directories                                                      ║
║  □ Script directories                                                      ║
║  □ Log files                                                               ║
║                                                                           ║
║  📞 CONTACTS:                                                              ║
║  □ IT support contacts                                                     ║
║  □ Domain registrar support                                               ║
║  □ Cloudflare support                                                      ║
║                                                                           ║
║  📚 DOCUMENTATION:                                                         ║
║  □ This deploy guide complete                                              ║
║  □ Emergency procedures known                                              ║
║  □ Common issues and solutions                                            ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

## 🔗 LIÊN KẾT

| Trước                          | Tiếp theo                        |
| ------------------------------ | -------------------------------- |
| [28-SCRIPTS.md](28-SCRIPTS.md) | [30-GLOSSARY.md](30-GLOSSARY.md) |
