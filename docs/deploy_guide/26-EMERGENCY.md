# 📘 PHẦN 26: EMERGENCY PROCEDURES - QUY TRÌNH XỬ LÝ KHẨN CẤP

> **📌 FILE NÀY DÙNG KHI:**
>
> - 🔴 Hệ thống DOWN hoàn toàn
> - 🔴 Data loss / corruption
> - 🔴 Security breach
> - 🔴 Cần rollback khẩn cấp

---

## 🚨 EMERGENCY CONTACTS

```
╔═══════════════════════════════════════════════════════════════════════════╗
║  DANH SÁCH LIÊN HỆ KHẨN CẤP                                               ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  IT System Admin:     ________________________   ___________________     ║
║  Database Admin:      ________________________   ___________________     ║
║  Network Admin:       ________________________   ___________________     ║
║  Security Team:       ________________________   ___________________     ║
║  Management:          ________________________   ___________________     ║
║                                                                           ║
║  EXTERNAL:                                                                ║
║  Cloudflare Support:  https://support.cloudflare.com                     ║
║  Domain (TenTen):     1900-xxxx                                          ║
║  ISP Support:         ________________________                           ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

## 🔴 EMERGENCY 1: COMPLETE SYSTEM DOWN

### **Triệu chứng:**

- Không access được qua Internet và LAN
- SSH không được

### **Quy trình:**

```bash
# ═══════════════════════════════════════════════════════════════════════════
# BƯỚC 1: PHYSICAL ACCESS
# ═══════════════════════════════════════════════════════════════════════════
# Nếu không SSH được, cần physical access hoặc console access

# ═══════════════════════════════════════════════════════════════════════════
# BƯỚC 2: CHECK POWER & NETWORK
# ═══════════════════════════════════════════════════════════════════════════
# - Server có bật không?
# - Network cable có cắm không?
# - Switch/Router có hoạt động không?

# ═══════════════════════════════════════════════════════════════════════════
# BƯỚC 3: CHECK FROM CONSOLE
# ═══════════════════════════════════════════════════════════════════════════
# Đăng nhập từ console (keyboard + monitor trực tiếp)

# Check network
ip a
ping 192.168.1.1  # Gateway

# Check disk
df -h

# Check services
systemctl status sshd
systemctl status mongod

# ═══════════════════════════════════════════════════════════════════════════
# BƯỚC 4: RESTART SERVICES
# ═══════════════════════════════════════════════════════════════════════════
# Restart SSH
sudo systemctl restart sshd

# Restart Network
sudo systemctl restart NetworkManager
# hoặc
sudo systemctl restart systemd-networkd

# Restart all apps
pm2 restart all
sudo systemctl restart mongod

# ═══════════════════════════════════════════════════════════════════════════
# BƯỚC 5: FULL REBOOT (Last resort)
# ═══════════════════════════════════════════════════════════════════════════
sudo reboot

# Sau reboot, verify:
pm2 list
sudo systemctl status mongod
curl localhost:3000
```

---

## 🔴 EMERGENCY 2: DATABASE CORRUPTION

### **Triệu chứng:**

- MongoDB không start được
- Lỗi "WiredTiger" trong logs
- Data inconsistency

### **Quy trình:**

```bash
# ═══════════════════════════════════════════════════════════════════════════
# BƯỚC 1: STOP EVERYTHING
# ═══════════════════════════════════════════════════════════════════════════
pm2 stop all
sudo systemctl stop mongod

# ═══════════════════════════════════════════════════════════════════════════
# BƯỚC 2: CHECK LOGS
# ═══════════════════════════════════════════════════════════════════════════
sudo tail -100 /var/log/mongodb/mongod.log

# ═══════════════════════════════════════════════════════════════════════════
# BƯỚC 3: TRY REPAIR (Minor issues)
# ═══════════════════════════════════════════════════════════════════════════
# Remove lock files
sudo rm /var/lib/mongodb/mongod.lock
sudo rm /var/lib/mongodb/WiredTiger.lock

# Try start
sudo systemctl start mongod

# ═══════════════════════════════════════════════════════════════════════════
# BƯỚC 4: REPAIR DATABASE (If still failing)
# ═══════════════════════════════════════════════════════════════════════════
# ⚠️ BACKUP FIRST!
sudo cp -r /var/lib/mongodb /var/lib/mongodb.backup.$(date +%Y%m%d)

# Run repair
sudo -u mongodb mongod --dbpath /var/lib/mongodb --repair

# Start normally
sudo systemctl start mongod

# ═══════════════════════════════════════════════════════════════════════════
# BƯỚC 5: RESTORE FROM BACKUP (If repair fails)
# ═══════════════════════════════════════════════════════════════════════════
# Xem File 07-MONGODB-BACKUP.md để restore

# Tìm backup gần nhất
ls -la /backup/mongodb/

# Restore
mongorestore --drop /backup/mongodb/YYYY-MM-DD/
```

---

## 🔴 EMERGENCY 3: SECURITY BREACH

### **Triệu chứng:**

- Phát hiện unauthorized access
- Files bị modify bất thường
- Processes lạ đang chạy

### **Quy trình:**

```bash
# ═══════════════════════════════════════════════════════════════════════════
# BƯỚC 1: ISOLATE IMMEDIATELY
# ═══════════════════════════════════════════════════════════════════════════
# Disconnect từ Internet (nhưng giữ LAN nếu cần access)
# Thông báo IT Network team

# Hoặc block all incoming từ firewall:
sudo ufw default deny incoming
sudo ufw reload

# ═══════════════════════════════════════════════════════════════════════════
# BƯỚC 2: DOCUMENT EVERYTHING
# ═══════════════════════════════════════════════════════════════════════════
# Ghi lại thời gian phát hiện
# Screenshot evidence

# Lưu running processes
ps aux > ~/incident/processes_$(date +%Y%m%d_%H%M%S).txt

# Lưu network connections
ss -tuln > ~/incident/connections_$(date +%Y%m%d_%H%M%S).txt
netstat -an > ~/incident/netstat_$(date +%Y%m%d_%H%M%S).txt

# Lưu last logins
last > ~/incident/logins_$(date +%Y%m%d_%H%M%S).txt
lastb > ~/incident/failed_logins_$(date +%Y%m%d_%H%M%S).txt

# ═══════════════════════════════════════════════════════════════════════════
# BƯỚC 3: CHECK COMPROMISE
# ═══════════════════════════════════════════════════════════════════════════
# Check unauthorized SSH keys
cat ~/.ssh/authorized_keys
cat /root/.ssh/authorized_keys

# Check cron jobs
crontab -l
sudo crontab -l
ls -la /etc/cron.d/

# Check recently modified files
find / -mtime -1 -type f 2>/dev/null | grep -v "/proc\|/sys"

# Check listening ports
ss -tuln

# ═══════════════════════════════════════════════════════════════════════════
# BƯỚC 4: CHANGE CREDENTIALS
# ═══════════════════════════════════════════════════════════════════════════
# Change all passwords
passwd  # Your user
sudo passwd root

# Regenerate SSH keys
rm ~/.ssh/authorized_keys
# Add lại key mới từ máy trusted

# Change MongoDB password
# Change JWT secret
# Change all API keys

# ═══════════════════════════════════════════════════════════════════════════
# BƯỚC 5: RESTORE FROM CLEAN BACKUP
# ═══════════════════════════════════════════════════════════════════════════
# Nếu compromise nghiêm trọng, restore từ backup sạch
# hoặc rebuild server từ đầu
```

---

## 🔴 EMERGENCY 4: ROLLBACK DEPLOYMENT

### **Khi cần rollback:**

- Deploy mới bị lỗi
- App crash sau deploy
- Cần revert về version cũ

### **Quy trình:**

```bash
# ═══════════════════════════════════════════════════════════════════════════
# BƯỚC 1: IDENTIFY PREVIOUS VERSION
# ═══════════════════════════════════════════════════════════════════════════
cd ~/giaobanbv-be

# Xem git history
git log --oneline -10

# Xem tag nếu có
git tag -l

# ═══════════════════════════════════════════════════════════════════════════
# BƯỚC 2: ROLLBACK CODE
# ═══════════════════════════════════════════════════════════════════════════
# Rollback về commit cụ thể
git checkout <commit-hash>

# Hoặc rollback về tag
git checkout v1.0.0

# Hoặc revert commit mới nhất
git revert HEAD

# ═══════════════════════════════════════════════════════════════════════════
# BƯỚC 3: REINSTALL DEPENDENCIES (nếu cần)
# ═══════════════════════════════════════════════════════════════════════════
npm install

# ═══════════════════════════════════════════════════════════════════════════
# BƯỚC 4: RESTART
# ═══════════════════════════════════════════════════════════════════════════
pm2 restart backend

# Verify
pm2 logs backend
curl localhost:8000/api/health

# ═══════════════════════════════════════════════════════════════════════════
# BƯỚC 5: ROLLBACK FRONTEND (nếu cần)
# ═══════════════════════════════════════════════════════════════════════════
cd ~/fe-bcgiaobanbvt
git checkout <commit-hash>
npm install
npm run build
pm2 restart frontend
```

---

## 🔴 EMERGENCY 5: DNS/DOMAIN ISSUES

### **Triệu chứng:**

- Domain không resolve
- SSL lỗi sau domain change

### **Quy trình:**

```bash
# ═══════════════════════════════════════════════════════════════════════════
# BƯỚC 1: CHECK DNS STATUS
# ═══════════════════════════════════════════════════════════════════════════
nslookup yourdomain.com
dig yourdomain.com

# Check từ nhiều nguồn:
# https://dnschecker.org/
# https://www.whatsmydns.net/

# ═══════════════════════════════════════════════════════════════════════════
# BƯỚC 2: VERIFY DNS SETTINGS
# ═══════════════════════════════════════════════════════════════════════════
# Login vào TenTen.vn (hoặc DNS provider)
# Kiểm tra A records, CNAME records

# ═══════════════════════════════════════════════════════════════════════════
# BƯỚC 3: IF USING CLOUDFLARE
# ═══════════════════════════════════════════════════════════════════════════
# Login Cloudflare Dashboard
# Check DNS settings
# Check SSL/TLS settings
# Check if any security rules blocking

# ═══════════════════════════════════════════════════════════════════════════
# BƯỚC 4: TEMPORARY WORKAROUND
# ═══════════════════════════════════════════════════════════════════════════
# Nếu cần access ngay, dùng IP trực tiếp
# Hoặc add vào /etc/hosts (client side)
echo "192.168.1.243 yourdomain.com" | sudo tee -a /etc/hosts

# ═══════════════════════════════════════════════════════════════════════════
# BƯỚC 5: WAIT FOR PROPAGATION
# ═══════════════════════════════════════════════════════════════════════════
# DNS changes có thể mất 24-48 giờ để propagate globally
# Giảm TTL trước khi thay đổi để nhanh hơn
```

---

## 📋 EMERGENCY CHECKLIST

```
╔═══════════════════════════════════════════════════════════════════════════╗
║  EMERGENCY RESPONSE CHECKLIST                                             ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  □ 1. Stay calm                                                          ║
║  □ 2. Document: Thời gian, triệu chứng, actions taken                    ║
║  □ 3. Notify: Thông báo stakeholders phù hợp                             ║
║  □ 4. Assess: Xác định severity và impact                                ║
║  □ 5. Isolate: Ngăn vấn đề lan rộng (nếu cần)                           ║
║  □ 6. Fix: Áp dụng fix hoặc rollback                                     ║
║  □ 7. Verify: Test kỹ sau khi fix                                        ║
║  □ 8. Communicate: Thông báo khi resolved                                ║
║  □ 9. Post-mortem: Phân tích nguyên nhân và prevention                  ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

## 📞 COMMUNICATION TEMPLATES

### **Initial Notification:**

```
🔴 INCIDENT ALERT

Time: [HH:MM DD/MM/YYYY]
System: [Tên hệ thống]
Status: [DOWN/DEGRADED/INVESTIGATING]
Impact: [Mô tả impact]
ETA: [Dự kiến restore]

Team đang xử lý. Cập nhật tiếp sau [X] phút.
```

### **Resolution Notification:**

```
✅ INCIDENT RESOLVED

Time resolved: [HH:MM DD/MM/YYYY]
Duration: [X giờ X phút]
Root cause: [Nguyên nhân]
Resolution: [Cách fix]

Hệ thống đã hoạt động bình thường.
```

---

## 🔗 LIÊN KẾT

| Trước                                          | Tiếp theo                                          |
| ---------------------------------------------- | -------------------------------------------------- |
| [25-TROUBLESHOOTING.md](25-TROUBLESHOOTING.md) | [27-COMMAND-REFERENCE.md](27-COMMAND-REFERENCE.md) |
