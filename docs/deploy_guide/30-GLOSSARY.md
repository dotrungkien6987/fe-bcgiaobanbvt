# 📘 PHẦN 30: GLOSSARY - THUẬT NGỮ

> **📌 MỤC ĐÍCH:**
>
> Giải thích các thuật ngữ kỹ thuật được sử dụng trong tài liệu này

---

## A

### **A Record (Address Record)**

Bản ghi DNS trỏ domain trực tiếp đến IP address.

```
Ví dụ: hospital.vn → 203.0.113.50
```

### **API (Application Programming Interface)**

Giao diện cho phép các ứng dụng giao tiếp với nhau. Backend cung cấp API để frontend gọi lấy dữ liệu.

### **Auto-restart**

Tính năng tự động khởi động lại ứng dụng khi bị crash.

---

## B

### **Backend**

Phần server-side của ứng dụng, xử lý logic nghiệp vụ, database. Trong project này là Express.js chạy trên port 8000.

### **Backup**

Sao lưu dữ liệu để phòng trường hợp mất mát.

### **Build**

Quá trình biên dịch source code thành file production. Với React: `npm run build` tạo folder `build/`.

---

## C

### **Certbot**

Tool miễn phí để lấy và quản lý SSL certificates từ Let's Encrypt.

### **Cloudflare**

Dịch vụ CDN, DNS, bảo mật web. Trong project này dùng Cloudflare Tunnel.

### **Cloudflare Tunnel**

Kết nối an toàn từ server nội bộ ra Cloudflare mà không cần mở ports trực tiếp ra Internet.

### **CNAME Record**

Bản ghi DNS trỏ domain đến domain khác (alias).

```
Ví dụ: www.hospital.vn → hospital.vn
```

### **Cluster Mode**

Chế độ chạy nhiều instances của Node.js app song song để tận dụng multi-core CPU.

### **CRA (Create React App)**

Tool tạo project React với cấu hình sẵn.

### **Cron / Crontab**

Hệ thống lập lịch chạy commands tự động trên Linux.

```bash
# Chạy script mỗi ngày lúc 2 AM
0 2 * * * /path/to/script.sh
```

---

## D

### **Daemon**

Process chạy nền (background) trên server.

### **DNS (Domain Name System)**

Hệ thống chuyển đổi domain names (hospital.vn) thành IP addresses.

### **Docker**

Platform containerization, đóng gói ứng dụng với dependencies.

### **Domain**

Tên miền website, ví dụ: hospital.vn

---

## E

### **Environment Variables (.env)**

Biến môi trường chứa cấu hình như database URL, API keys. Không commit vào git.

### **Express.js**

Framework Node.js để xây dựng web server và API.

---

## F

### **FCM (Firebase Cloud Messaging)**

Dịch vụ của Google để gửi push notifications đến mobile/web.

### **Firewall**

Tường lửa, kiểm soát traffic vào/ra server. Linux dùng UFW.

### **Fork Mode**

Chế độ chạy PM2 với 1 instance duy nhất.

### **Frontend**

Phần client-side của ứng dụng, chạy trên browser. Trong project này là React chạy trên port 3000.

---

## G

### **Git**

Version control system, quản lý source code.

### **Graceful Reload**

Restart ứng dụng mà không làm gián đoạn requests đang xử lý.

---

## H

### **HTTPS**

HTTP Secure - HTTP được mã hóa bằng SSL/TLS.

### **htop**

Tool Linux để monitor processes, CPU, RAM realtime.

---

## I

### **IP Address**

Địa chỉ mạng của thiết bị. Có IP public (Internet) và IP private (LAN).

---

## J

### **journalctl**

Command xem logs của systemd services.

### **JWT (JSON Web Token)**

Token để xác thực user, thường dùng trong API authentication.

---

## K

### **Keepalive**

Giữ connection mở để tái sử dụng, tăng performance.

---

## L

### **Let's Encrypt**

Dịch vụ cung cấp SSL certificates miễn phí.

### **Load Balancing**

Phân tải requests đến nhiều servers/instances.

### **Log Rotation**

Tự động chia nhỏ và xóa log files cũ để tránh disk full.

### **LAN (Local Area Network)**

Mạng nội bộ, ví dụ: 192.168.1.x

---

## M

### **Middleware**

Code xử lý giữa request và response trong Express.js.

### **MongoDB**

NoSQL database dùng JSON-like documents.

### **mongodump / mongorestore**

Commands backup và restore MongoDB.

### **mongosh**

MongoDB shell - CLI để tương tác với MongoDB.

---

## N

### **NAT (Network Address Translation)**

Chuyển đổi địa chỉ IP, cho phép nhiều thiết bị chia sẻ 1 IP public.

### **Nginx**

Web server và reverse proxy phổ biến.

### **Node.js**

JavaScript runtime để chạy JavaScript ngoài browser.

### **npm (Node Package Manager)**

Quản lý packages cho Node.js.

### **NVM (Node Version Manager)**

Tool quản lý nhiều versions của Node.js.

---

## O

### **OOM (Out of Memory)**

Hết RAM, Linux kernel có thể kill processes.

---

## P

### **PM2 (Process Manager 2)**

Tool quản lý Node.js processes với auto-restart, monitoring, logs.

### **Port**

Số định danh dịch vụ mạng. Ví dụ: 80 (HTTP), 443 (HTTPS), 22 (SSH).

### **Process**

Chương trình đang chạy trên hệ thống.

### **Production**

Môi trường triển khai thực tế cho users.

### **Proxy**

Server trung gian giữa client và server khác.

### **PWA (Progressive Web App)**

Web app có thể cài như native app, hoạt động offline.

---

## R

### **RAM (Random Access Memory)**

Bộ nhớ tạm của máy tính.

### **Replica Set**

Nhóm MongoDB servers đồng bộ data với nhau để high availability.

### **Reverse Proxy**

Server nhận requests từ client và forward đến backend servers.

### **Rollback**

Quay lại version trước khi có lỗi.

---

## S

### **SCP (Secure Copy)**

Copy files qua SSH.

### **Service Worker**

JavaScript chạy background trong browser, cho phép offline caching.

### **Socket.io**

Library cho real-time bidirectional communication (WebSocket).

### **SSH (Secure Shell)**

Protocol kết nối an toàn đến server từ xa.

### **SSL/TLS**

Mã hóa traffic giữa client và server.

### **Subdomain**

Domain con, ví dụ: api.hospital.vn

### **sudo**

"Super User Do" - chạy command với quyền admin.

### **Swap**

Disk space được dùng như RAM khi hết RAM.

### **systemctl**

Command quản lý systemd services.

### **systemd**

Hệ thống init và quản lý services trên Linux.

---

## T

### **TCP (Transmission Control Protocol)**

Protocol truyền dữ liệu đáng tin cậy.

### **TLS (Transport Layer Security)**

Protocol mã hóa, phiên bản mới của SSL.

### **TTL (Time To Live)**

Thời gian cache DNS record trước khi refresh.

### **Tunnel**

Kết nối bảo mật qua một kênh mã hóa.

---

## U

### **UFW (Uncomplicated Firewall)**

Tool firewall đơn giản trên Ubuntu.

### **Upstream**

Nhóm servers backend trong cấu hình Nginx.

### **Uptime**

Thời gian server/app đã chạy liên tục.

---

## V

### **VPS (Virtual Private Server)**

Server ảo hóa, có IP riêng.

---

## W

### **WebSocket**

Protocol cho phép communication 2 chiều realtime giữa client và server.

### **WiredTiger**

Storage engine mặc định của MongoDB.

---

## Y

### **YAML**

Format file cấu hình dễ đọc, dùng trong Cloudflare Tunnel config.

---

## Z

### **Zero-downtime Deployment**

Triển khai mà không gián đoạn service.

---

## 📊 QUICK REFERENCE: PORTS

| Port  | Service | Description          |
| ----- | ------- | -------------------- |
| 22    | SSH     | Secure Shell         |
| 80    | HTTP    | Web traffic          |
| 443   | HTTPS   | Secure web traffic   |
| 3000  | React   | Frontend app (dev)   |
| 8000  | Express | Backend API          |
| 27017 | MongoDB | Database             |
| 19999 | Netdata | Monitoring dashboard |

---

## 📊 QUICK REFERENCE: PATHS

| Path                | Description              |
| ------------------- | ------------------------ |
| `/var/log/`         | System logs              |
| `~/.pm2/logs/`      | PM2 application logs     |
| `/var/lib/mongodb/` | MongoDB data             |
| `/etc/nginx/`       | Nginx configuration      |
| `/etc/letsencrypt/` | SSL certificates         |
| `~/.cloudflared/`   | Cloudflare Tunnel config |
| `~/.ssh/`           | SSH keys and config      |

---

## 🔗 LIÊN KẾT

| Trước                                | Quay lại đầu                   |
| ------------------------------------ | ------------------------------ |
| [29-CHECKLISTS.md](29-CHECKLISTS.md) | [00-MUC-LUC.md](00-MUC-LUC.md) |

---

**🎉 HOÀN THÀNH TÀI LIỆU TRIỂN KHAI!**

Bạn đã có đầy đủ kiến thức để:

1. ✅ Setup server Ubuntu từ đầu
2. ✅ Deploy ứng dụng React + Node.js + MongoDB
3. ✅ Cấu hình Cloudflare Tunnel (Phase 1)
4. ✅ Migrate sang Nginx Reverse Proxy (Phase 2)
5. ✅ Monitor và maintain hệ thống
6. ✅ Xử lý sự cố và emergency

Chúc bạn deploy thành công! 🚀
