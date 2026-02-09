# 📘 PHẦN 10: CLOUDFLARE TUNNEL SETUP

## 🎯 MỤC TIÊU

Sau phần này bạn sẽ:

- ✅ Hiểu Cloudflare Tunnel hoạt động như thế nào
- ✅ Cài đặt cloudflared trên server
- ✅ Tạo và cấu hình tunnel
- ✅ Route traffic đến ứng dụng
- ✅ Test HTTPS hoạt động
- ✅ Monitor tunnel status

---

## 🌐 CLOUDFLARE TUNNEL LÀ GÌ?

```
╔═══════════════════════════════════════════════════════════╗
║  CLOUDFLARE TUNNEL = Kết nối server → Cloudflare           ║
║                      KHÔNG CẦN mở port 443 public!         ║
║                      KHÔNG CẦN IP public!                  ║
╚═══════════════════════════════════════════════════════════╝

CÁCH TRUYỀN THỐNG (cần IP public + mở port 443):
┌─────────────────────────────────────────────────────────┐
│  [User từ Internet]                                     │
│    ↓ HTTPS request                                      │
│  [DNS: hospital.vn → 103.x.x.x] ← IP PUBLIC             │
│    ↓                                                    │
│  [Router công ty: IP public 103.x.x.x]                  │
│    ↓ NAT: port 443 → 192.168.1.243:443                  │
│  [Firewall - Port 443 phải MỞ inbound] ❌               │
│    ↓                                                    │
│  [Server: 192.168.1.243 - LAN IP]                       │
│    ↓                                                    │
│  [App: localhost:3000, :8000]                           │
└─────────────────────────────────────────────────────────┘

YÊU CẦU:
❌ Phải có IP public từ ISP
❌ IT phải mở port 443 inbound trên firewall
❌ Cấu hình NAT trên router
❌ Cài SSL certificate trên server
❌ Phức tạp, phụ thuộc IT

CLOUDFLARE TUNNEL (tài liệu này):
┌─────────────────────────────────────────────────────────┐
│  [User từ Internet]                                     │
│    ↓ HTTPS request                                      │
│  [DNS: hospital.vn → xyz.cfargotunnel.com] ← TỰ ĐỘNG!   │
│    ↓ Resolve to Cloudflare Edge IP (104.x.x.x)          │
│  [Cloudflare Edge - Xử lý HTTPS]                        │
│    ↓ Encrypted Tunnel (TLS over port 7844)              │
│  [Firewall - KHÔNG CẦN mở port 443 inbound] ✅          │
│    ↓ Outbound connection (server → Cloudflare)          │
│  [Server: 192.168.1.243 - LAN IP]                       │
│    ├─ cloudflared daemon (kết nối ra ngoài)             │
│    │                                                    │
│    ├→ localhost:3000 (Frontend React)                   │
│    └→ localhost:8000 (Backend Node.js)                  │
└─────────────────────────────────────────────────────────┘

YÊU CẦU:
✅ CHỈ CẦN Internet connection
✅ KHÔNG cần IP public
✅ KHÔNG cần mở port 443 inbound
✅ DNS tự động tạo khi setup tunnel
✅ SSL tự động (Cloudflare)
✅ DDoS protection miễn phí

FLOW HOẠT ĐỘNG CHI TIẾT:
═══════════════════════════════════════════════════════════

1. SERVER KHỞI ĐỘNG:
   └─ cloudflared daemon start
      └─ Kết nối TỰ ĐỘNG ra Cloudflare Edge (outbound)
         └─ Dùng port 7844 (HTTPS)
         └─ Giữ persistent connection

2. USER TRUY CẬP:
   User gõ: https://hospital.vn
      │
      ↓ DNS lookup
   DNS trả về: xyz.cfargotunnel.com → 104.x.x.x (Cloudflare IP)
      │
      ↓ Browser connect
   [Cloudflare Edge Server 104.x.x.x]
      │
      ↓ Tìm tunnel connection tương ứng
   [Tunnel Connection từ 192.168.1.243]
      │
      ↓ Forward request qua tunnel
   [Server 192.168.1.243]
      │
      ↓ cloudflared forward to
   [localhost:3000] → React App
      │
      ↓ Response ngược lại
   User nhận được webpage ✅

3. API REQUEST:
   Frontend gọi: https://api.hospital.vn/api/users
      │
      ↓ DNS lookup
   api.hospital.vn → xyz.cfargotunnel.com
      │
      ↓ Cloudflare Edge
   [Tìm tunnel route: api.hospital.vn → localhost:8000]
      │
      ↓ Forward qua tunnel
   [Server: localhost:8000] → Node.js Backend
      │
      ↓ Backend xử lý
   Query MongoDB → Return JSON
      │
      ↓ Response
   Frontend nhận data ✅

ĐIỂM QUAN TRỌNG:
════════════════
• Connection là OUTBOUND từ server → Cloudflare
  → Firewall cho phép outbound by default
  → KHÔNG cần mở port inbound

• DNS records TỰ ĐỘNG tạo khi setup Public Hostname
  → File 08 CHỈ add domain vào Cloudflare
  → File này (10) mới TẠO DNS records

• SSL certificate tự động (Cloudflare Edge xử lý)
  → Server chạy HTTP (localhost:3000, :8000)
  → User nhận HTTPS

• IP 192.168.1.243 KHÔNG BAO GIỜ exposed ra Internet
  → An toàn hơn

Ưu điểm:
✅ Không cần NAT port forwarding
✅ Không cần IP public
✅ Tự động HTTPS (SSL)
✅ DDoS protection miễn phí
✅ Dễ setup (15 phút)
✅ Độc lập, không phụ thuộc IT department

Nhược điểm:
⚠️ Latency cao hơn direct connection (~50-100ms)
⚠️ WebSocket có giới hạn số connection đồng thời (Free plan)
⚠️ Phụ thuộc Cloudflare (nếu Cloudflare down → app down)
⚠️ Throughput giới hạn với Free plan
```

---

## 🔐 BƯỚC 1: TRUY CẬP ZERO TRUST DASHBOARD

```
1. Login Cloudflare Dashboard
   https://dash.cloudflare.com/

2. Sidebar → "Zero Trust"
   (Có thể phải click "Access" hoặc "Cloudflare One")

3. Lần đầu tiên sẽ hỏi tạo team name:
   ┌────────────────────────────────────────┐
   │ Create your Zero Trust organization    │
   │                                        │
   │ Team name:                              │
   │ ┌────────────────────────────────────┐ │
   │ │ hospital                           │ │
   │ └────────────────────────────────────┘ │
   │                                        │
   │ → Team domain:  hospital.cloudflareaccess.com │
   │                                        │
   │ [ Continue ]                           │
   └────────────────────────────────────────┘

4. Chọn plan:   Free ✅

5. Bây giờ ở Zero Trust Dashboard
```

---

## 🚇 BƯỚC 2: TẠO TUNNEL

```
Zero Trust Dashboard → Networks → Tunnels

┌─────────────────────────────────────────────────────────┐
│ Tunnels                                                 │
│                                                         │
│ No tunnels found                                        │
│                                                         │
│ [ Create a tunnel ]                                     │
└─────────────────────────────────────────────────────────┘

Click "Create a tunnel"

┌─────────────────────────────────────────────────────────┐
│ Select your tunnel type                                 │
│                                                         │
│ ◉ Cloudflared  ← Chọn cái này                           │
│   Lightweight daemon for your server                    │
│                                                         │
│ ○ WARP Connector                                        │
│   For entire networks                                   │
│                                                         │
│ [ Next ]                                                │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Name your tunnel                                        │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ hospital-tunnel                                     │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ [ Save tunnel ]                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 💾 BƯỚC 3: CÀI CLOUDFLARED TRÊN SERVER

### **Cloudflare sẽ hiển thị instructions:**

```
┌─────────────────────────────────────────────────────────┐
│ Install and run a connector                             │
│                                                         │
│ Choose your environment:                                │
│ [ Debian ] [ Docker ] [ macOS ] [ Windows ]             │
│                                                         │
│ → Chọn Debian (Ubuntu là Debian-based)                  │
└─────────────────────────────────────────────────────────┘
```

### **3.1 - Kiểm tra Architecture Server:**

```bash
# SSH vào server
ssh youruser@192.168.1.243

# Kiểm tra architecture (CPU type)
uname -m

# Các output có thể gặp:
# x86_64   → Intel/AMD 64-bit (phổ biến nhất)
# aarch64  → ARM 64-bit (Raspberry Pi, AWS Graviton)
# armv7l   → ARM 32-bit (Raspberry Pi cũ)

# Kiểm tra OS version
cat /etc/os-release

# Output:
# NAME="Ubuntu"
# VERSION="22.04.x LTS (Jammy Jellyfish)"
# ...

# Kiểm tra chi tiết CPU
lscpu | grep Architecture

# Output:
# Architecture:        x86_64
#   hoặc:
# Architecture:        aarch64

💡 Lưu ý:
- x86_64 = amd64 (cùng architecture)
- aarch64 = arm64 (cùng architecture)
```

### **3.2 - Cài Cloudflared (KHUYẾN KHÍCH - Dùng APT Repository):**

```bash
# Phương pháp này TỰ ĐỘNG chọn đúng architecture
# Và tự động update khi chạy apt update

# 1. Add Cloudflare GPG key
sudo mkdir -p --mode=0755 /usr/share/keyrings
curl -fsSL https://pkg.cloudflare.com/cloudflare-public-v2.gpg | sudo tee /usr/share/keyrings/cloudflare-public-v2.gpg >/dev/null

# 2. Add Cloudflare repository
echo 'deb [signed-by=/usr/share/keyrings/cloudflare-public-v2.gpg] https://pkg.cloudflare.com/cloudflared any main' | sudo tee /etc/apt/sources.list.d/cloudflared.list

# 3. Update và cài đặt
sudo apt-get update && sudo apt-get install cloudflared

# Output:
# Reading package lists... Done
# Building dependency tree... Done
# ...
# Setting up cloudflared (2024.x.x) ...
# ✅ apt tự động chọn đúng package cho architecture của bạn!

# 4. Verify
cloudflared --version

# Output:
# cloudflared version 2024.x.x (built 2024-xx-xx)

✅ Ưu điểm phương pháp này:
   • Tự động chọn đúng architecture (x86_64, arm64)
   • Tự động update khi chạy apt update
   • Chính thức từ Cloudflare
   • Dễ quản lý, dễ gỡ cài đặt
```

### **3.3 - Phương Pháp 2 (MANUAL - Nếu apt không dùng được):**

```bash
# CHỈ DÙNG NẾU:
# - Không thể dùng apt (firewall chặn)
# - Muốn cài version cụ thể
# - Không có quyền add repository

# Kiểm tra architecture trước
ARCH=$(uname -m)
echo "Architecture: $ARCH"

# Download cloudflared theo architecture
if [ "$ARCH" = "x86_64" ]; then
    # Intel/AMD 64-bit
    curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o cloudflared.deb
elif [ "$ARCH" = "aarch64" ]; then
    # ARM 64-bit
    curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64.deb -o cloudflared.deb
else
    echo "Architecture không được hỗ trợ: $ARCH"
    exit 1
fi

# Cài đặt
sudo dpkg -i cloudflared.deb

# Verify
cloudflared --version

⚠️ Nhược điểm:
   • Phải update manual khi có version mới
   • Không tự động chọn architecture
   • Phức tạp hơn
```

### **3.4 - Troubleshooting Cài Đặt:**

```bash
# Lỗi: dpkg: dependency problems
# Giải pháp:
sudo apt-get install -f

# Lỗi: curl command not found
sudo apt-get install curl

# Lỗi: Permission denied
# → Cần dùng sudo

# Check cloudflared đã cài chưa
which cloudflared
# Output: /usr/bin/cloudflared

# Xem version detail
cloudflared version

# Xem help
cloudflared --help
```

---

## 🔗 BƯỚC 4: AUTHENTICATE & START TUNNEL

```
╔═══════════════════════════════════════════════════════════╗
║  2 CÁCH CHẠY TUNNEL:                                      ║
║                                                           ║
║  OPTION 1 (KHUYẾN KHÍCH): Service - Tự động khởi động     ║
║  • Tunnel chạy background                                 ║
║  • Tự động start khi server reboot                        ║
║  • Dễ quản lý với systemctl                               ║
║                                                           ║
║  OPTION 2 (DEV/TEST): Manual - Chạy trong terminal        ║
║  • Tunnel chỉ chạy khi terminal mở                        ║
║  • Tắt terminal → Tunnel tắt                              ║
║  • Dùng cho dev/test                                      ║
╚═══════════════════════════════════════════════════════════╝
```

### **4.1 - Lấy Token từ Cloudflare Dashboard:**

```
Trên page "Install and run a connector"
→ Sẽ thấy 2 commands:

┌─────────────────────────────────────────────────────────┐
│ After you have installed cloudflared on your machine,  │
│ you can install a service to automatically run your     │
│ tunnel whenever your machine starts:                    │
│                                                         │
│ $ sudo cloudflared service install eyJhIjoiZjU5...     │
│                                     ↑                   │
│                               LONG TOKEN (Option 1)     │
│                                                         │
│ OR run the tunnel manually in your current terminal    │
│ session only:                                           │
│                                                         │
│ $ cloudflared tunnel run --token eyJhIjoiZjU5...       │
│                                   ↑                     │
│                             SAME TOKEN (Option 2)       │
└─────────────────────────────────────────────────────────┘

💡 CHÚ Ý:
   • 2 commands dùng CÙNG TOKEN
   • Chỉ chọn 1 trong 2 cách
   • Production → Dùng Option 1 (service install)
   • Dev/Test → Dùng Option 2 (manual run)
```

### **4.2 - OPTION 1: Service Install (KHUYẾN KHÍCH cho Production):**

```bash
# ⚠️ QUAN TRỌNG: Ở Việt Nam/Môi trường công ty
# Nếu gặp lỗi "control stream encountered a failure"
# → Firewall chặn QUIC (UDP) → Cần thêm --protocol http2

# ══════════════════════════════════════════════════════════
# CÁCH 1: CÀI ĐẶT THƯỜNG (Thử trước)
# ══════════════════════════════════════════════════════════

# Paste command từ Cloudflare (service install)
sudo cloudflared service install eyJhIjoiZjU5NTg5NzQ3YjE1NGM3NWI5NjMzMzE1YTk3MjkyYTgiLCJ0IjoiOWM0ZGEyOTItYWFmNC00ZDVmLTkwYmMtYThjODYzMzQxNjYxIiwicyI6Ik1qQXlOQzB4TWkweU5pQXdPVG95TkRvek1DNHlNalF6TURJciJ9

# Kiểm tra service status
sudo systemctl status cloudflared

# Nếu thấy "Active: active (running)" → OK! ✅
# Nếu lỗi hoặc không kết nối được → Đọc CÁCH 2 bên dưới


# ══════════════════════════════════════════════════════════
# CÁCH 2: CÀI ĐẶT VỚI HTTP/2 (Nếu CÁCH 1 lỗi)
# ══════════════════════════════════════════════════════════

# 🔥 KHUYẾN KHÍCH CHO VIỆT NAM & MÔI TRƯỜNG CÔNG TY!

# Bước 1: Dừng và gỡ service cũ (nếu có)
sudo systemctl stop cloudflared
sudo cloudflared service uninstall

# Bước 2: Cài lại với --protocol http2
sudo cloudflared service install --protocol http2 eyJhIjoiZjU5NTg5NzQ3YjE1NGM3NWI5NjMzMzE1YTk3MjkyYTgiLCJ0IjoiOWM0ZGEyOTItYWFmNC00ZDVmLTkwYmMtYThjODYzMzQxNjYxIiwicyI6Ik1qQXlOQzB4TWkweU5pQXdPVG95TkRvek1DNHlNalF6TURJciJ9
#                                ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
#                         Thêm flag này vào giữa!

# Output:
# 2026-02-07T11:00:00Z INF Thank you for trying Cloudflare Tunnel.
# 2026-02-07T11:00:00Z INF Using protocol: http2  ← ✅ Quan trọng!
# 2026-02-07T11:00:00Z INF Registered tunnel connection
# 2026-02-07T11:00:01Z INF Starting tunnel
# ...
# Successfully installed cloudflared service

# Service TỰ ĐỘNG start và enable (auto-start on boot)

# Kiểm tra service status
sudo systemctl status cloudflared

# Output:
# ● cloudflared.service - cloudflared
#    Loaded: loaded (/etc/systemd/system/cloudflared.service; enabled)
#    Active: active (running) since Fri 2026-02-07 11:00:00 +07; 1min ago
#    Main PID: 12345 (cloudflared)
#    Tasks: 10 (limit: 4915)
#    Memory: 15.2M
#    CGroup: /system.slice/cloudflared.service
#            └─12345 /usr/bin/cloudflared tunnel run --protocol http2 --token=eyJh...
#                                                      ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
#                                                 Thấy --protocol http2 ✅
#
# Feb 07 11:00:00 server cloudflared[12345]: INF Connection established
# Feb 07 11:00:00 server cloudflared[12345]: INF Registered tunnel connection

✅ Active: active (running) → Service đang chạy!
✅ enabled → Tự động start khi reboot!

# Các lệnh quản lý service:
sudo systemctl stop cloudflared     # Tạm dừng
sudo systemctl start cloudflared    # Khởi động
sudo systemctl restart cloudflared  # Khởi động lại
sudo systemctl status cloudflared   # Xem status

# Xem logs realtime
sudo journalctl -u cloudflared -f

# Xem logs 50 dòng gần nhất
sudo journalctl -u cloudflared -n 50


# ══════════════════════════════════════════════════════════
# TẠI SAO CẦN --protocol http2?
# ══════════════════════════════════════════════════════════
```

```
╔═══════════════════════════════════════════════════════════╗
║  ⚠️ VẤN ĐỀ PHỔ BIẾN Ở VIỆT NAM & MÔI TRƯỜNG CÔNG TY      ║
╚═══════════════════════════════════════════════════════════╝

QUIC (Default Protocol):
├─ Dùng UDP port 7844
├─ Nhanh hơn, hiệu quả hơn
├─ ❌ THƯỜNG BỊ CHẶN bởi:
│  ├─ Firewall công ty/bệnh viện
│  ├─ Router không hỗ trợ UDP traffic lớn
│  └─ ISP Việt Nam (FPT, Viettel, VNPT)
└─ Lỗi: "control stream encountered a failure"

HTTP/2 (Fallback Protocol):
├─ Dùng TCP port 443 (như HTTPS bình thường)
├─ Chậm hơn QUIC một chút (~10ms, không đáng kể)
├─ ✅ HIẾM KHI BỊ CHẶN:
│  ├─ Giống traffic web thường
│  └─ Firewall luôn cho phép port 443 TCP
└─ Giải pháp cho môi trường có firewall gắt

KHUYẾN NGHỊ:
• Môi trường công ty/bệnh viện → Dùng http2 ngay
• ISP Việt Nam → Thử default, nếu lỗi → http2
• Không có firewall gắt → Dùng default (QUIC nhanh hơn)

KHI NÀO BIẾT CẦN http2?
• Tunnel status: UNHEALTHY trên Dashboard
• Logs báo: "control stream encountered a failure"
• Logs báo: "Initial protocol quic"
• Service running nhưng domain không load
```

### **4.3 - OPTION 2: Manual Run (Cho Dev/Test):**

```bash
# CÁCH 1: Chạy manual thường (thử trước)
cloudflared tunnel run --token eyJhIjoiZjU5NTg5NzQ3YjE1NGM3NWI5NjMzMzE1YTk3MjkyYTgiLCJ0IjoiOWM0ZGEyOTItYWFmNC00ZDVmLTkwYmMtYThjODYzMzQxNjYxIiwicyI6Ik1qQXlOQzB4TWkweU5pQXdPVG95TkRvek1DNHlNalF6TURJciJ9

# Output (realtime logs):
# 2026-02-07T11:00:00Z INF Thank you for trying Cloudflare Tunnel.
# 2026-02-07T11:00:00Z INF Registered tunnel connection
# 2026-02-07T11:00:01Z INF Connection established connIndex=0
# ...
# ^C ← Nhấn Ctrl+C để thoát

# ══════════════════════════════════════════════════════════
# CÁCH 2: Nếu bị lỗi kết nối, dùng http2
# ══════════════════════════════════════════════════════════

cloudflared tunnel run --protocol http2 --token eyJhIjoiZjU5NTg5NzQ3YjE1NGM3NWI5NjMzMzE1YTk3MjkyYTgiLCJ0IjoiOWM0ZGEyOTItYWFmNC00ZDVmLTkwYmMtYThjODYzMzQxNjYxIiwicyI6Ik1qQXlOQzB4TWkweU5pQXdPVG95TkRvek1DNHlNalF6TURJciJ9
#                      ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑

# Output (realtime logs):
# 2026-02-07T11:00:00Z INF Thank you for trying Cloudflare Tunnel.
# 2026-02-07T11:00:00Z INF Using protocol: http2  ← ✅ Xác nhận dùng http2
# 2026-02-07T11:00:00Z INF Registered tunnel connection
# 2026-02-07T11:00:01Z INF Connection established connIndex=0
# 2026-02-07T11:00:01Z INF Starting metrics server on 127.0.0.1:47977
# 2026-02-07T11:00:05Z INF Connection established connIndex=1
# 2026-02-07T11:00:10Z INF Connection established connIndex=2
# 2026-02-07T11:00:15Z INF Connection established connIndex=3
# ^C ← Nhấn Ctrl+C để thoát

⚠️ Lưu ý:
   • Tunnel CHỈ chạy khi terminal này mở
   • Đóng terminal → Tunnel tắt → Domain không load
   • KHÔNG dùng cho production!

# Nếu muốn chạy background (vẫn manual, không auto-start):
# Với http2:
nohup cloudflared tunnel run --protocol http2 --token eyJh... > /tmp/cloudflared.log 2>&1 &

# Xem logs
tail -f /tmp/cloudflared.log

# Dừng tunnel
# Tìm process ID
ps aux | grep cloudflared
# Kill process
kill <PID>
```

### **4.4 - So Sánh 2 Options:**

```
┌─────────────────────────────────────────────────────────────┐
│                  Service Install  │  Manual Run             │
├─────────────────────────────────────────────────────────────┤
│ Auto-start boot     ✅             │  ❌                      │
│ Background          ✅             │  ❌ (hoặc dùng nohup)    │
│ Quản lý systemctl   ✅             │  ❌                      │
│ Production          ✅ Khuyến khích │  ❌ Không nên           │
│ Dev/Test            ❌             │  ✅                      │
│ Xem logs            journalctl     │  Terminal output        │
│ Dừng tunnel         systemctl stop│  Ctrl+C hoặc kill       │
└─────────────────────────────────────────────────────────────┘

🎯 KHUYẾN KHÍCH:
   • Production/Server thật → Dùng Option 1 (service install)
   • Dev/Test/Thử nghiệm → Dùng Option 2 (manual run)
```

### **4.5 - Verify Tunnel Connection:**

```bash
# Kiểm tra tunnel đang chạy không
# Option 1 (service):
sudo systemctl status cloudflared | grep Active

# Output:
# Active: active (running) ← ✅ OK

# Option 2 (manual):
ps aux | grep cloudflared | grep -v grep

# Output:
# user  12345  0.5  0.8 123456  32768 ?  Sl  11:00  0:01 cloudflared tunnel run...
#       ↑↑↑↑↑ Thấy process → Đang chạy

# Kiểm tra tunnel trên Cloudflare Dashboard
# Zero Trust → Networks → Tunnels
# → Thấy "hospital-tunnel" status: HEALTHY ✅
```

---

## 🎯 BƯỚC 5: CẤU HÌNH PUBLIC HOSTNAMES

```
╔═══════════════════════════════════════════════════════════╗
║  ⭐ QUAN TRỌNG: Đây là bước TẠO DNS RECORDS TỰ ĐỘNG!      ║
║                                                           ║
║  Khi bạn thêm public hostname:                            ║
║  • Cloudflare TỰ ĐỘNG tạo DNS CNAME record               ║
║  • KHÔNG CẦN cấu hình DNS manual!                         ║
║  • hospital.vn sẽ trỏ về tunnel của bạn                   ║
╚═══════════════════════════════════════════════════════════╝
```

### **Quay lại Cloudflare Dashboard:**

```
Sau khi service install, click "Next"

┌─────────────────────────────────────────────────────────┐
│ Route traffic                                           │
│                                                         │
│ Your connector is online!  ✅                            │
│                                                         │
│ Add a public hostname to route traffic through your     │
│ tunnel                                                  │
│                                                         │
│ [ Add a public hostname ]                               │
└─────────────────────────────────────────────────────────┘
```

### **5.1 - Tạo route cho Frontend:**

```
Click "Add a public hostname"

┌─────────────────────────────────────────────────────────┐
│ Public hostname                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Subdomain (optional):                                   │
│ ┌──────────┐                                            │
│ │          │  (để trống cho root domain)                 │
│ └──────────┘                                            │
│                                                         │
│ Domain:                                                  │
│ ┌──────────────────┐                                    │
│ │ hospital.vn    ▼ │                                    │
│ └──────────────────┘                                    │
│                                                         │
│ Path (optional):                                        │
│ ┌──────────┐                                            │
│ │          │  (để trống)                                 │
│ └──────────┘                                            │
│                                                         │
│ ─────────────────────────────────────────────────────   │
│                                                         │
│ Service                                                 │
│                                                         │
│ Type:                                                    │
│ ┌──────────┐                                            │
│ │ HTTP   ▼ │  ← Chọn HTTP (vì localhost không có HTTPS) │
│ └──────────┘                                            │
│                                                         │
│ URL:                                                    │
│ ┌─────────────────────┐                                 │
│ │ localhost:3000      │  ← Port của React app            │
│ └─────────────────────┘                                 │
│    ↑                                                    │
│    Đây là IP/port TRÊN SERVER (192.168.1.243)          │
│    cloudflared sẽ forward traffic tới đây              │
│                                                         │
│ Additional application settings:                        │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [x] No TLS Verify                                   │ │
│ │     ✅ BẮT BUỘC check vì localhost không có HTTPS    │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ [ Save hostname ]                                       │
└─────────────────────────────────────────────────────────┘

💡 SAU KHI CLICK "Save hostname":
═══════════════════════════════════════════════════════════

Cloudflare TỰ ĐỘNG:
1. Tạo DNS CNAME record:
   hospital.vn → <tunnel-id>.cfargotunnel.com

2. Link hostname với tunnel của bạn

3. Bạn có thể verify trong:
   Cloudflare Dashboard → DNS → Records

   Sẽ thấy:
   ┌────────────────────────────────────────────────┐
   │ Type   | Name        | Content                │
   ├────────────────────────────────────────────────┤
   │ CNAME  | hospital.vn | xyz.cfargotunnel.com   │
   │        |             | ↑ Tunnel ID            │
   └────────────────────────────────────────────────┘

🎉 XONG! Domain đã tự động trỏ về tunnel!
   KHÔNG CẦN cấu hình DNS thêm bất kỳ thứ gì!
```

### **5.2 - Tạo route cho Backend API:**

```
Click "Add a public hostname" lần nữa

┌─────────────────────────────────────────────────────────┐
│ Public hostname                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Subdomain:                                               │
│ ┌──────────┐                                            │
│ │ api      │  ← Subdomain cho API                        │
│ └──────────┘                                            │
│                                                         │
│ Domain:                                                 │
│ ┌──────────────────┐                                    │
│ │ hospital.vn    ▼ │                                    │
│ └──────────────────┘                                    │
│    ↓                                                    │
│    Result: api.hospital.vn                              │
│                                                         │
│ ─────────────────────────────────────────────────────   │
│                                                         │
│ Service                                                 │
│                                                         │
│ Type:  [HTTP ▼]                                          │
│                                                         │
│ URL:                                                    │
│ ┌─────────────────────┐                                 │
│ │ localhost:8000      │  ← Port của Node.js backend      │
│ └─────────────────────┘                                 │
│                                                         │
│ [x] No TLS Verify                                       │
│                                                         │
│ [ Save hostname ]                                       │
└─────────────────────────────────────────────────────────┘

💡 SAU KHI CLICK "Save hostname":
═══════════════════════════════════════════════════════════

Cloudflare TỰ ĐỘNG tạo DNS record thứ 2:

   ┌────────────────────────────────────────────────┐
   │ Type   | Name            | Content            │
   ├────────────────────────────────────────────────┤
   │ CNAME  | hospital.vn     | xyz.cfargotunnel..│
   │ CNAME  | api.hospital.vn | xyz.cfargotunnel..│
   └────────────────────────────────────────────────┘

BÂY GIỜ CÓ 2 ROUTES:
├─ https://hospital.vn → localhost:3000 (Frontend)
└─ https://api.hospital.vn → localhost:8000 (Backend)

FLOW REQUEST:
═════════════

User request: https://api.hospital.vn/api/users
   │
   ↓ DNS lookup
api.hospital.vn → xyz.cfargotunnel.com → Cloudflare Edge
   │
   ↓ Cloudflare tìm tunnel route
Tunnel route: api.hospital.vn → localhost:8000
   │
   ↓ Forward qua tunnel
Server 192.168.1.243: cloudflared → localhost:8000
   │
   ↓ Node.js backend xử lý
Express app response JSON
   │
   ↓ Ngược lại qua tunnel
User nhận response ✅
```

### **5.3 - Verify DNS records đã tạo:**

```bash
# Từ máy tính cá nhân, check DNS

# Check frontend
nslookup hospital.vn

# Output:
# Name:    hospital.vn
# Address: xyz.cfargotunnel.com
#          104.x.x.x  ← Cloudflare Edge IP

# Check backend
nslookup api.hospital.vn

# Output:
# Name:    api.hospital.vn
# Address: xyz.cfargotunnel.com
#          104.x.x.x

# Hoặc dùng dig để xem chi tiết
dig hospital.vn

# Output sẽ có:
# hospital.vn.  300  IN  CNAME  xyz.cfargotunnel.com.
#                         ↑↑↑↑↑ CNAME record!

🎉 DNS đã tự động setup!
   Không cần làm gì thêm!
```

---

## 🧪 BƯỚC 6: TEST TUNNEL & DOMAIN

```
╔═══════════════════════════════════════════════════════════╗
║  🎯 MỤC TIÊU: Verify domain ĐÃ LOAD ĐƯỢC!                ║
║                                                           ║
║  Sau BƯỚC 5 (Add Public Hostname):                        ║
║  • DNS records TỰ ĐỘNG được tạo                           ║
║  • Domain sẽ trỏ về tunnel                                ║
║  • HTTPS tự động hoạt động                                ║
║                                                           ║
║  → Bây giờ test xem domain load chưa!                     ║
╚═══════════════════════════════════════════════════════════╝
```

### **6.1 - Verify DNS Records Đã Được Tạo:**

```
Cloudflare Dashboard → DNS → Records

┌────────────────────────────────────────────────────────┐
│ DNS Records for bvdktphutho.io.vn                      │
├────────────────────────────────────────────────────────┤
│ Type   | Name                | Content              │
├────────────────────────────────────────────────────────┤
│ CNAME  | bvdktphutho.io.vn   | xyz.cfargotunnel.com │
│        |                     | ↑ Tunnel ID          │
├────────────────────────────────────────────────────────┤
│ CNAME  | api.bvdktphutho.io.vn | xyz.cfargotunnel.com │
└────────────────────────────────────────────────────────┘

✅ Nếu thấy 2 CNAME records → DNS đã tự động tạo!
✅ Status: Auto (được tạo bởi Cloudflare Tunnel)

❌ Nếu chưa thấy → Quay lại BƯỚC 5, check lại Public Hostname
```

### **6.2 - Test DNS Resolution:**

```bash
# Từ máy tính bất kỳ

# Test frontend domain
nslookup bvdktphutho.io.vn

# Output mong đợi:
# Name:    bvdktphutho.io.vn
# Address: xyz.cfargotunnel.com
#          104.x.x.x  ← Cloudflare Edge IP

# Test API domain
nslookup api.bvdktphutho.io.vn

# Output mong đợi:
# Name:    api.bvdktphutho.io.vn
# Address: xyz.cfargotunnel.com
#          104.x.x.x

# Hoặc dùng dig để xem chi tiết
dig bvdktphutho.io.vn

# Output sẽ có:
# bvdktphutho.io.vn.  300  IN  CNAME  xyz.cfargotunnel.com.
#                              ↑↑↑↑↑ CNAME record!

✅ Nếu thấy CNAME record → DNS đã hoạt động!
```

### **6.3 - Test Tunnel với Simple HTTP Server:**

```bash
# SSH vào server
ssh youruser@192.168.1.243

# Tạo test folder
mkdir ~/tunnel-test
cd ~/tunnel-test

# Tạo simple HTML
nano index.html
```

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Tunnel Test</title>
  </head>
  <body>
    <h1>✅ Cloudflare Tunnel Working!</h1>
    <p>Domain: <strong>bvdktphutho.io.vn</strong></p>
    <p>Tunnel Status: <strong style="color: green;">CONNECTED</strong></p>
    <p>
      Server time:
      <script>
        document.write(new Date());
      </script>
    </p>
    <hr />
    <p>✅ DNS records: Auto-created by Cloudflare Tunnel</p>
    <p>✅ HTTPS: Automatic SSL by Cloudflare</p>
    <p>✅ Server IP: 192.168.1.243 (NOT exposed)</p>
  </body>
</html>
```

```bash
# Save:  Ctrl+O → Enter → Ctrl+X

# Start simple HTTP server trên port 3000
python3 -m http.server 3000

# Output:
# Serving HTTP on 0.0.0.0 port 3000 (http://0.0.0.0:3000/) ...

# GIỮ TERMINAL NÀY MỞ!
```

### **6.4 - Test Frontend Domain (LẦN ĐẦU LOAD ĐƯỢC!):**

```
Mở browser, truy cập:
https://bvdktphutho.io.vn

✅ KỲ VỌNG:
═══════════════════════════════════════════════════════════

1. Thấy page "✅ Cloudflare Tunnel Working!" ✅

2. URL bar:
   ┌──────────────────────────────────┐
   │ 🔒 https://bvdktphutho.io.vn         │
   │     ↑ Ổ khóa xanh = HTTPS working!   │
   └──────────────────────────────────┘

3. Click ổ khóa → Certificate:
   • Issued by: Cloudflare
   • Valid dates: OK
   • Domain: bvdktphutho.io.vn

4. Mở DevTools (F12) → Tab Network → Reload page
   → Click request đầu tiên → Tab Headers
   → Response Headers:

   ┌────────────────────────────────────────┐
   │ server: cloudflare        ← ✅         │
   │ cf-ray: xxxxx-xxxxx       ← ✅         │
   │        ↑ Chứng tỏ đi qua Cloudflare    │
   └────────────────────────────────────────┘

→ Nếu TẤT CẢ OK → Frontend tunnel hoạt động! 🎉

❌ Nếu lỗi:
═══════════════════════════════════════════════════════════

• 502 Bad Gateway:
  → Backend chưa chạy (python3 -m http.server 3000)
  → Hoặc sai port trong Public Hostname config

• "site can't be reached":
  → DNS chưa propagate
  → Chờ 5-10 phút, clear DNS cache, thử lại

• Xem Troubleshooting bên dưới
```

### **6.5 - Test API Endpoint:**

```bash
# Mở terminal mới, SSH vào server
ssh youruser@192.168.1.243

# Tạo simple API server
cd ~/tunnel-test
nano api-test.js
```

```javascript
const http = require("http");

const server = http.createServer((req, res) => {
  res.writeHead(200, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  });

  res.end(
    JSON.stringify({
      status: "success",
      message: "API Tunnel Working!",
      domain: "api.bvdktphutho.io.vn",
      tunnel: "Cloudflare Tunnel",
      timestamp: new Date(),
      path: req.url,
      server: "192.168.1.243 (private IP)",
    }),
  );
});

server.listen(8000, () => {
  console.log("✅ API test server running on port 8000");
});
```

```bash
# Save và chạy
node api-test.js

# Output:
# ✅ API test server running on port 8000

# GIỮ TERMINAL NÀY MỞ!
```

### **6.6 - Test API từ Browser:**

```
Truy cập: https://api.bvdktphutho.io.vn

✅ Output mong đợi:
{
  "status": "success",
  "message": "API Tunnel Working!",
  "domain": "api.bvdktphutho.io.vn",
  "tunnel": "Cloudflare Tunnel",
  "timestamp": "2026-02-07T11:30:00.000Z",
  "path": "/",
  "server": "192.168.1.243 (private IP)"
}

→ API tunnel hoạt động! ✅

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Test từ terminal (curl)
curl https://api.bvdktphutho.io.vn

# Hoặc test với path
curl https://api.bvdktphutho.io.vn/api/test

# Output:
{
  "status": "success",
  ...
  "path": "/api/test"  ← ✅ Path được forward đúng
}
```

### **6.7 - Verify Tunnel Status:**

```bash
# Trên server, check cloudflared logs
sudo journalctl -u cloudflared -n 50

# Output mong đợi:
# ... Connection established ...
# ... Registered tunnel connection ...
# ... Request: GET / from 104.x.x.x ...
# ... Request: GET / from 172.x.x.x ...
#       ↑↑↑ Thấy requests từ Cloudflare Edge

# Check service status
sudo systemctl status cloudflared

# Output:
# ● cloudflared.service - cloudflared
#    Active: active (running) ✅
#    ...
```

### **6.8 - Checklist Hoàn Thành:**

```
✅ DNS Records đã được tạo tự động:
   □ Cloudflare Dashboard → DNS → Thấy 2 CNAME records ✅

✅ DNS Resolution:
   □ nslookup bvdktphutho.io.vn → 104.x.x.x (Cloudflare) ✅
   □ nslookup api.bvdktphutho.io.vn → 104.x.x.x ✅

✅ Frontend Domain:
   □ https://bvdktphutho.io.vn → Load được! ✅
   □ URL có ổ khóa 🔒 (HTTPS) ✅
   □ Certificate: Cloudflare ✅
   □ DevTools Headers: server: cloudflare ✅

✅ API Domain:
   □ https://api.bvdktphutho.io.vn → JSON response ✅
   □ CORS headers working ✅

✅ Tunnel Service:
   □ sudo systemctl status cloudflared → active ✅
   □ Logs show requests ✅

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎉 DOMAIN ĐÃ HOẠT ĐỘNG!

⏭️ TIẾP TỤC: File 11-DEPLOY-BACKEND.md
   → Deploy ứng dụng thật
   → Thay thế test servers

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 📊 BƯỚC 7: MONITOR TUNNEL

### **Trên Cloudflare Dashboard:**

```
Zero Trust → Networks → Tunnels

┌─────────────────────────────────────────────────────────┐
│ hospital-tunnel                                         │
│                                                         │
│ Status:   ✅ HEALTHY                                      │
│ Connectors: 1 active                                    │
│                                                         │
│ Public hostnames:                                       │
│ • https://hospital.vn → localhost:3000                   │
│ • https://api.hospital.vn → localhost:8000               │
│                                                         │
│ Traffic (last 24h):                                     │
│ • Requests: 123                                         │
│ • Data: 1.2 MB                                          │
└─────────────────────────────────────────────────────────┘
```

### **Trên server (logs):**

```bash
# Xem cloudflared logs
sudo journalctl -u cloudflared -f

# Output:
# Dec 26 11:30:00 cloudflared[1234]: Connection established
# Dec 26 11:30:15 cloudflared[1234]:  Registered tunnel connection
# Dec 26 11:30:20 cloudflared[1234]:  Serving HTTP proxy
# Dec 26 11:31:00 cloudflared[1234]: Request:  GET / from x.x.x.x

# Nhấn Ctrl+C để thoát

# Check service status
sudo systemctl status cloudflared

# Restart nếu cần
sudo systemctl restart cloudflared
```

---

## 🔧 BƯỚC 8: CẤU HÌNH DNS (AUTO)

### **Cloudflare tự động tạo DNS records:**

```
Cloudflare Dashboard → DNS → Records

Sẽ thấy các records mới (auto-created):

┌──────────────────────────────────────────────────────────┐
│ Type   Name  Content                    Proxy  Status   │
├──────────────────────────────────────────────────────────┤
│ CNAME  @     xxx.cfargotunnel.com       ☁️     Auto     │
│ CNAME  api   xxx.cfargotunnel.com       ☁️     Auto     │
└──────────────────────────────────────────────────────────┘

→ KHÔNG CẦN làm gì!
→ Tự động trỏ về tunnel
```

---

## 🛠️ TROUBLESHOOTING

### **⚠️ LỖI PHỔ BIẾN NHẤT: Tunnel UNHEALTHY / Connection Timeout**

```
╔═══════════════════════════════════════════════════════════╗
║  🔥 LỖI NÀY XẢY RA VỚI ~70% TRIỂN KHAI Ở VIỆT NAM        ║
╚═══════════════════════════════════════════════════════════╝

TRIỆU CHỨNG:
───────────────────────────────────────────────────────────
• Dashboard báo: Status UNHEALTHY ❌
• Logs báo: "control stream encountered a failure"
• Logs báo: "Initial protocol quic"
• Service running nhưng domain không load
• Tunnel không kết nối được Cloudflare

NGUYÊN NHÂN:
───────────────────────────────────────────────────────────
Firewall/ISP chặn giao thức QUIC (UDP port 7844)

Môi trường thường gặp:
├─ Bệnh viện/cơ quan nhà nước: Firewall gắt
├─ Công ty: Firewall chặn UDP
├─ ISP Việt Nam: FPT, Viettel, VNPT giới hạn UDP
└─ Router cũ: Không hỗ trợ UDP traffic tốt

GIẢI PHÁP: Chuyển sang HTTP/2
═══════════════════════════════════════════════════════════

# Bước 1: Dừng service hiện tại
sudo systemctl stop cloudflared

# Bước 2: Gỡ service cũ
sudo cloudflared service uninstall

# Bước 3: Cài lại với --protocol http2
sudo cloudflared service install --protocol http2 eyJhIjoiZjU5...
#                                ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
#                         QUAN TRỌNG: Thêm flag này!

# Bước 4: Khởi động lại
sudo systemctl start cloudflared

# Bước 5: Kiểm tra logs
sudo journalctl -u cloudflared -n 50

# Phải thấy:
# ✅ "tunnel run --protocol http2 --token=..."
# ✅ "Using protocol: http2"
# ✅ "Connection established"
# ✅ "Registered tunnel connection"

# Bước 6: Kiểm tra Dashboard
# Zero Trust → Networks → Tunnels
# Status phải: HEALTHY ✅

🎯 GIẢI THÍCH KỸ THUẬT:
────────────────────────────────────────────────────────

Mặc định cloudflared dùng QUIC (UDP port 7844) vì nhanh hơn.
Tuy nhiên, môi trường Việt Nam:
• Firewall công ty/bệnh viện: Chặn UDP
• Router văn phòng: Không forward UDP tốt
• ISP (FPT/Viettel/VNPT): Giới hạn UDP traffic

Việc chuyển sang HTTP/2 (TCP port 443):
• Giống HTTPS bình thường
• Firewall luôn cho phép
• Chậm hơn QUIC ~10ms (không đáng kể)
• Độ tin cậy cao hơn trong môi trường hạn chế

💡 KHUYẾN NGHỊ:
────────────────────────────────────────────────────────

✅ ĐỐI VỚI VIỆT NAM & MÔI TRƯỜNG CÔNG TY:
   → Nên dùng --protocol http2 NGAY TỪ ĐẦU
   → Tránh mất thời gian debug

✅ ĐỐI VỚI MÔI TRƯỜNG TỰ DO (Home, Cloud):
   → Thử default trước
   → Nếu lỗi mới chuyển sang http2
```

---

### **Lỗi: 502 Bad Gateway**

```
Nguyên nhân: Backend không chạy hoặc sai port

Giải pháp:
1. Kiểm tra app có chạy không:
   curl http://localhost:3000

2. Nếu "Connection refused":
   → App chưa chạy
   → Start app

3. Kiểm tra port trong Cloudflare Dashboard
   → Phải đúng port app đang listen

4. Check cloudflared logs:
   sudo journalctl -u cloudflared -n 50
```

### **Lỗi: Tunnel offline**

```
Kiểm tra:
1. Service status:
   sudo systemctl status cloudflared

2. Nếu inactive:
   sudo systemctl start cloudflared

3. Nếu failed:
   sudo journalctl -u cloudflared -n 100
   → Xem error message

4. Reinstall nếu cần:
   sudo cloudflared service uninstall
   sudo cloudflared service install [TOKEN]
```

### **Lỗi: DNS not resolving**

```
1. Kiểm tra DNS:
   nslookup hospital. vn

2. Phải trả về Cloudflare IP (104.x.x.x hoặc 172.x.x.x)

3. Nếu sai:
   → DNS chưa propagate
   → Chờ thêm 1-2 giờ

4. Clear DNS cache:
   # Browser
   Chrome → Settings → Clear browsing data → Cached images

   # OS
   # Windows
   ipconfig /flushdns

   # macOS
   sudo dscacheutil -flushcache

   # Linux
   sudo systemd-resolve --flush-caches
```

### **WebSocket không hoạt động:**

```
Thêm WebSocket settings:

Cloudflare Dashboard → Public hostname → Edit

Additional settings:
┌─────────────────────────────────────────────────────────┐
│ [x] No TLS Verify                                       │
│ [x] HTTP Host Header                                    │
│     ┌─────────────────┐                                 │
│     │ localhost:8000  │                                 │
│     └─────────────────┘                                 │
│                                                         │
│ [x] Disable Chunked Encoding                            │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 CONFIG FILE REFERENCE

### **Cloudflared config location:**

```bash
# Config file
cat /etc/cloudflared/config. yml

# Output:
tunnel:  abc123-def456-ghi789-xyz
credentials-file: /root/.cloudflared/abc123-def456-ghi789-xyz. json

ingress:
  - hostname: hospital.vn
    service: http://localhost:3000
  - hostname: api.hospital.vn
    service: http://localhost:8000
  - service: http_status: 404
```

### **Manual config (nếu cần):**

```bash
# Edit config
sudo nano /etc/cloudflared/config.yml

# Thêm options:
tunnel: abc123-def456-ghi789-xyz
credentials-file: /root/.cloudflared/abc123.json

ingress:
  - hostname:  hospital.vn
    service: http://localhost:3000
    originRequest:
      noTLSVerify: true
      connectTimeout: 30s

  - hostname: api.hospital. vn
    service: http://localhost:8000
    originRequest:
      noTLSVerify: true
      disableChunkedEncoding: true

  - service: http_status:404

# Save và restart
sudo systemctl restart cloudflared
```

---

## ✅ CHECKLIST HOÀN THÀNH

```
□ Đã cài cloudflared trên server
□ Đã tạo tunnel trên Cloudflare Dashboard
□ Đã authenticate cloudflared với token
□ Service cloudflared đang chạy (active)
□ Đã tạo public hostname cho frontend (hospital.vn)
□ Đã tạo public hostname cho API (api.hospital.vn)
□ Đã test HTTPS hoạt động (thấy test page)
□ Đã test API endpoint (thấy JSON response)
□ DNS records tự động tạo (CNAME)
□ Tunnel status:  HEALTHY ✅

GHI CHÚ:
Tunnel Name: hospital-tunnel
Tunnel ID: ____________________________________

Public Hostnames:
├─ https://hospital.vn → localhost:3000
└─ https://api.hospital.vn → localhost:8000

Status:  HEALTHY ✅
Connector: 1 active

→ Sẵn sàng deploy ứng dụng thật!
→ Chuyển sang File 11-DEPLOY-BACKEND.md
```

---

**⏭️ TIẾP THEO: File 11-DEPLOY-BACKEND.md**

---

## 📝 TÓM TẮT: DNS VÀ NETWORK ARCHITECTURE

```
╔═══════════════════════════════════════════════════════════╗
║  TỔNG KẾT: DOMAIN ĐÃ HOẠT ĐỘNG NHƯ THẾ NÀO?              ║
╚═══════════════════════════════════════════════════════════╝

TRƯỚC KHI SETUP TUNNEL:
═══════════════════════════════════════════════════════════
• Domain: hospital.vn (đã add vào Cloudflare ở File 08)
• Nameserver: ns1.cloudflare.com, ns2.cloudflare.com
• DNS records: CHƯA CÓ (trống)
• Status: Domain chưa trỏ đến đâu cả

SAU KHI SETUP TUNNEL (File 10):
═══════════════════════════════════════════════════════════
• DNS records: TỰ ĐỘNG được tạo
  ├─ hospital.vn → CNAME → xyz.cfargotunnel.com
  └─ api.hospital.vn → CNAME → xyz.cfargotunnel.com

• xyz.cfargotunnel.com → Cloudflare Edge IPs
  └─ Cloudflare biết tunnel này connect từ server nào
     └─ Forward traffic tới đúng server (192.168.1.243)

FLOW REQUEST HOÀN CHỈNH:
═══════════════════════════════════════════════════════════

1. User gõ: https://hospital.vn
   │
   ↓ DNS Query
2. Browser query DNS: hospital.vn
   │
   ↓ Cloudflare DNS (ns1.cloudflare.com)
3. DNS trả về: hospital.vn → CNAME → xyz.cfargotunnel.com
   │                          └→ 104.18.x.x (Cloudflare Edge)
   ↓ Connect to Cloudflare Edge
4. Browser connect: 104.18.x.x (HTTPS)
   │
   ↓ Cloudflare Edge xử lý request
5. Cloudflare tìm tunnel connection:
   • Tunnel ID: xyz
   • Connected from: 192.168.1.243
   • Route: hospital.vn → localhost:3000
   │
   ↓ Forward qua encrypted tunnel
6. Server (192.168.1.243):
   • cloudflared daemon nhận request
   • Forward tới localhost:3000
   • React app xử lý
   │
   ↓ Response ngược lại
7. React app → cloudflared → Cloudflare Edge → User
   │
   ↓ User nhận webpage
8. Browser render: https://hospital.vn ✅

ĐIỂM QUAN TRỌNG:
═══════════════════════════════════════════════════════════

❌ KHÔNG CẦN:
├─ IP public (103.x.x.x)
├─ Mở port 443 inbound trên firewall
├─ NAT port forwarding trên router
├─ SSL certificate trên server
├─ Cấu hình DNS A record manual
└─ Phụ thuộc IT department

✅ CHỈ CẦN:
├─ Internet connection
├─ Domain đã add vào Cloudflare (File 08)
├─ cloudflared daemon chạy trên server
├─ App chạy trên localhost:3000, :8000
└─ Cloudflare Tunnel đã setup public hostname

🎯 KẾT QUẢ:
• https://hospital.vn → Frontend React
• https://api.hospital.vn → Backend Node.js
• Tất cả qua tunnel, an toàn, không expose IP private
• SSL tự động, DDoS protection miễn phí
```

---

## 🔍 KIỂM TRA DNS (DEBUGGING)

```bash
# Từ máy tính bất kỳ có Internet:

# 1. Check domain có resolve không
nslookup hospital.vn

# Kết quả mong đợi:
# Name:    hospital.vn
# Address: 104.18.x.x  (Cloudflare Edge IP)

# 2. Check DNS record type
dig hospital.vn

# Kết quả mong đợi:
# hospital.vn.  300  IN  CNAME  xyz.cfargotunnel.com.
# xyz.cfargotunnel.com. 300 IN A 104.18.x.x

# 3. Check subdomain
nslookup api.hospital.vn

# Kết quả mong đợi:
# Name:    api.hospital.vn
# Address: 104.18.x.x

# 4. Test HTTPS
curl -I https://hospital.vn

# Kết quả mong đợi:
# HTTP/2 200
# server: cloudflare
# ...

# 5. Online tool (nếu cần):
# https://www.whatsmydns.net/
# → Nhập hospital.vn
# → Xem DNS propagation toàn cầu

# ✅ Nếu tất cả đều OK → DNS đã hoạt động!
```

---

**⏭️ TIẾP THEO: File 11-DEPLOY-BACKEND.md**
