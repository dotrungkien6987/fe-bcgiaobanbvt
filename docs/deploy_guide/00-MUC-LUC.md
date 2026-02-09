# 📚 MỤC LỤC TÀI LIỆU TRIỂN KHAI HỆ THỐNG

## Hệ thống Quản lý Ticket/KPI

**ReactJS + Node.js + MongoDB + Cloudflare Tunnel / Nginx**

---

## 🎯 THÔNG TIN HỆ THỐNG

```yaml
Cấu hình:
  Máy A (App Server):
    OS: Ubuntu Server 22.04
    IP nội bộ: 192.168.1.243
    Ports: 3000 (React), 8000 (Backend), 27017 (MongoDB)

  Máy B (KHÔNG kiểm soát): Hiện đang chiếm port 80/443

  Máy C (Nginx - Tương lai):
    OS: Ubuntu Server 22.04
    IP nội bộ: ~192.168.1.250 (TBD)
    Ports: 80, 443

Stack:
  Frontend: React (CRA) - Port 3000
  Backend: Express.js + Socket.io - Port 8000
  Database: MongoDB 7.0 (Replica Set)
  Auth: JWT
  Notifications: FCM (Web + Mobile)

Domain: TenTen.vn (2 subdomains)
Deployment:
  Phase 1: Cloudflare Tunnel + PM2 (hiện tại)
  Phase 2: Nginx Reverse Proxy + Let's Encrypt (sau ~2 tuần)
```

> 📖 **ĐỌC THÊM:** [File 00.1 - Hiện Trạng Hạ Tầng](00.1-HIEN-TRANG-HA-TANG.md) để hiểu rõ kiến trúc 2 phase

---

## 📖 CÁC PHẦN CHÍNH

### **PHẦN 0: TỔNG QUAN HẠ TẦNG** ⭐ ĐỌC ĐẦU TIÊN

- [00.1 - Hiện Trạng Hạ Tầng Bệnh Viện](00.1-HIEN-TRANG-HA-TANG.md) ← **ĐỌC TRƯỚC KHI BẮT ĐẦU**

### **PHẦN 1: CHUẨN BỊ MÔI TRƯỜNG** (Ngày 1-2)

- [01 - Kiến thức nền tảng Linux Ubuntu](01-KIEN-THUC-NEN-TANG.md)
- [02 - Cấu hình SSH & Bảo mật](02-CAU-HINH-SSH.md)
- [03 - Cài đặt Firewall (ufw)](03-FIREWALL-UFW.md)

### **PHẦN 2: CÀI ĐẶT STACK** (Ngày 2-3)

- [04 - Cài đặt Node.js & npm](04-CAI-DAT-NODEJS.md)
- [05 - Cài đặt MongoDB 7.0](05-CAI-DAT-MONGODB.md)
- [06 - Cấu hình MongoDB Replica Set](06-MONGODB-REPLICA-SET.md)
- [07 - Backup & Restore MongoDB](07-MONGODB-BACKUP.md)

### **PHẦN 3: CLOUDFLARE TUNNEL - PHASE 1** (Ngày 3-4)

- [08 - Thiết lập Domain trên TenTen](08-DOMAIN-SETUP.md)
- [09 - Cấu hình Cloudflare](09-CLOUDFLARE-SETUP.md)
- [10 - Cài đặt Cloudflare Tunnel](10-CLOUDFLARE-TUNNEL.md)

### **PHẦN 4: DEPLOYMENT** (Ngày 4-5)

- [11 - Deploy Backend (Express + Socket.io)](11-DEPLOY-BACKEND.md)
- [12 - Deploy Frontend (React)](12-DEPLOY-FRONTEND.md)
- [13 - Cài đặt PM2](13-PM2-SETUP.md)
- [14 - Environment Variables](14-ENV-VARIABLES.md)

### **PHẦN 5: PWA & FCM** (Ngày 5-6)

- [15 - Service Worker Setup](15-SERVICE-WORKER.md)
- [16 - Firebase Cloud Messaging](16-FCM-SETUP.md)
- [17 - PWA Testing](17-PWA-TESTING.md)

### **PHẦN 6: MONITORING** (Ngày 6-7)

- [18 - System Monitoring](18-SYSTEM-MONITORING.md)
- [19 - Application Logs](19-APPLICATION-LOGS.md)
- [20 - PM2 Monitoring](20-PM2-MONITORING.md)

### **PHẦN 7: NGINX REVERSE PROXY - PHASE 2** (Khi có Máy C)

> ⏰ Phần này thực hiện SAU khi IT cấp Máy C và NAT port 80/443

- [21 - Setup Máy C (Nginx Server)](21-SETUP-MAY-C.md) ✅
- [22 - Cấu hình Nginx Reverse Proxy + SSL](22-NGINX-REVERSE-PROXY.md) ✅
- [23 - Quy trình Migration CF→Nginx](23-MIGRATION-CF-TO-NGINX.md) ✅
- [24 - Switch Guide (Chuyển đổi nhanh)](24-SWITCH-GUIDE.md) ✅

### **PHẦN 8: TROUBLESHOOTING**

- [25 - Common Issues](25-TROUBLESHOOTING.md)
- [26 - Emergency Procedures](26-EMERGENCY.md)

### **PHỤ LỤC**

- [27 - Command Reference](27-COMMAND-REFERENCE.md)
- [28 - Scripts Collection](28-SCRIPTS.md)
- [29 - Checklists](29-CHECKLISTS.md)
- [30 - Glossary (Thuật ngữ)](30-GLOSSARY.md)

---

## 🚀 QUICK START (ĐỌC ĐẦU TIÊN)

Nếu bạn muốn bắt đầu ngay:

0. **Trước tiên**: Đọc [File 00.1](00.1-HIEN-TRANG-HA-TANG.md) → Hiểu kiến trúc hệ thống
1. **Ngày 1-2**: Đọc File 01-03 → Cài đặt SSH, firewall (Máy A)
2. **Ngày 2-3**: Đọc File 04-07 → Cài Node.js, MongoDB
3. **Ngày 3-4**: Đọc File 08-10 → Setup Cloudflare Tunnel (Phase 1)
4. **Ngày 4-5**: Đọc File 11-14 → Deploy app
5. **Ngày 5-6**: Đọc File 15-17 → PWA & FCM
6. **Ngày 6-7**: Đọc File 18-20 → Monitoring

**Sau ~2 tuần (khi có Máy C):** 7. **Phase 2**: Đọc File 21-24 → Setup Nginx, Migration từ CF Tunnel

---

## ⚠️ LƯU Ý QUAN TRỌNG

```
📌 TRƯỚC KHI BẮT ĐẦU:

✅ Backup toàn bộ data hiện tại (nếu có)
✅ Có notepad để ghi lại passwords/keys
✅ Có máy tính khác để tra cứu khi server bị lỗi
✅ Làm theo đúng thứ tự các file
✅ KHÔNG skip bước nào
✅ Test kỹ từng bước trước khi chuyển bước tiếp

⚠️ Nếu gặp lỗi:
   → Đọc phần Troubleshooting (File 24)
   → Kiểm tra logs theo hướng dẫn
   → Rollback theo emergency procedure (File 25)
```

---

## 📞 HỖ TRỢ

Trong quá trình làm, nếu gặp vấn đề:

1. Check **File 24 (Troubleshooting)** trước
2. Check logs theo **File 19**
3. Tìm error message trong **File 29 (Glossary)**
4. Quay lại hỏi tôi với:
   - File đang làm (số mấy)
   - Bước đang làm
   - Error message đầy đủ
   - Screenshot (nếu có)

---

## ✅ CHECKLIST TỔNG

```
□ Đã đọc File 00.1 (Hiện trạng hạ tầng)
□ Đã đọc toàn bộ Mục lục
□ Đã backup data (nếu có)
□ Đã chuẩn bị notepad ghi chú
□ Đã hiểu rõ 2 phase deployment
□ Sẵn sàng bắt đầu với File 01

→ Bắt đầu với File 00.1-HIEN-TRANG-HA-TANG.md
```

---

**Tác giả**: GitHub Copilot  
**Phiên bản**: 2.0  
**Cập nhật**: 2025  
**Dành cho**: Người mới bắt đầu với Linux Server
