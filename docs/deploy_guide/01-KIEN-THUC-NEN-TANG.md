# 📘 PHẦN 1: KIẾN THỨC NỀN TẢNG LINUX UBUNTU

## 🎯 MỤC TIÊU

Sau phần này bạn sẽ: 
- ✅ Hiểu cơ bản về Linux Ubuntu Server
- ✅ Biết các lệnh cơ bản để điều hướng
- ✅ Quản lý files và folders
- ✅ Hiểu về users và permissions
- ✅ Cài đặt và gỡ bỏ phần mềm

---

## 📊 KIẾN TRÚC LINUX CƠ BẢN

```
┌─────────────────────────────────────────────────────────┐
│                   LINUX SYSTEM                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [User Layer - Tầng người dùng]                         │
│  ├─ Applications (ứng dụng của bạn)                     │
│  ├─ Shell (terminal - nơi gõ lệnh)                      │
│  └─ Users & Permissions                                 │
│                                                         │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  [Kernel - Nhân hệ điều hành]                           │
│  ├─ Process Management (quản lý tiến trình)             │
│  ├─ Memory Management (quản lý RAM)                     │
│  ├─ File System (quản lý files)                         │
│  └─ Device Drivers (điều khiển phần cứng)              │
│                                                         │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  [Hardware - Phần cứng]                                 │
│  ├─ CPU (8 cores)                                       │
│  ├─ RAM (16GB)                                          │
│  ├─ Disk (HDD/SSD)                                      │
│  └─ Network Card                                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🖥️ ĐĂNG NHẬP SERVER LẦN ĐẦU

### **Hiện tại:  Đăng nhập qua giao diện (GUI)**

```
Bạn đang ở đây: 
┌──────────────────────────────────────┐
│  [Monitor kết nối trực tiếp server]  │
│                                      │
│  Username: _______                   │
│  Password: *******                   │
│                                      │
│  [Login]                             │
└──────────────────────────────────────┘

Sau khi login, bạn thấy:
- Desktop (nếu cài GUI)
- Hoặc Terminal đen (command line)
```

### **Kiểm tra thông tin hệ thống:**

```bash
# Xem phiên bản Ubuntu
lsb_release -a

# Output mong muốn:
# Distributor ID: Ubuntu
# Description:     Ubuntu 22.04.x LTS
# Release:        22.04
# Codename:       jammy

# Xem thông tin CPU
lscpu | grep "Model name"

# Xem RAM
free -h

# Output: 
#               total        used        free
# Mem:           15Gi        2.0Gi       10Gi

# Xem disk space
df -h

# Output: 
# Filesystem      Size  Used Avail Use% Mounted on
# /dev/sda1       100G   10G   85G  11% /

# Xem IP address
ip addr show

# Tìm dòng có:  inet 192.168.1.243
```

### **📝 GHI CHÚ QUAN TRỌNG:**

Lấy notepad ghi lại: 

```
═══════════════════════════════════════════════════════
THÔNG TIN SERVER
═══════════════════════════════════════════════════════

Ngày setup: ___________

Ubuntu Version: ___________ (từ lsb_release -a)

IP nội bộ: 192.168.1.243

IP Public: ___________ (hỏi IT hoặc check trên router)

Username hiện tại: ___________ (gõ:  whoami)

Password:  ___________ (GHI VÀO ĐÂY, cất kỹ!)

SSH Port: 22 (mặc định)

═══════════════════════════════════════════════════════
```

---

## 📂 CẤU TRÚC THƯ MỤC LINUX

```
/                          ← Root (gốc, quan trọng nhất)
│
├── /home                  ← Thư mục của users
│   └── /youruser          ← Thư mục của bạn
│       ├── Documents
│       ├── Downloads
│       └── projects       ← Nơi để code (sẽ tạo sau)
│
├── /root                  ← Thư mục của root user (admin)
│
├── /etc                   ← Config files của hệ thống
│   ├── nginx              ← Config Nginx (sau này)
│   ├── ssh                ← Config SSH
│   └── systemd            ← Services
│
├── /var                   ← Variable data
│   ├── /log               ← LOG FILES (quan trọng!)
│   │   ├── syslog         ← System logs
│   │   ├── nginx/         ← Nginx logs
│   │   └── mongodb/       ← MongoDB logs
│   └── /www               ← Web files (không dùng)
│
├── /usr                   ← User programs
│   ├── /bin               ← Binary executables
│   └── /local             ← Locally installed software
│
├── /opt                   ← Optional software
│
└── /tmp                   ← Temporary files (tự xóa)
```

---

## 🔤 LỆNH CƠ BẢN - NAVIGATION

### **1. Xem bạn đang ở đâu:**

```bash
pwd

# Output:  /home/youruser
# Nghĩa là:  Bạn đang ở thư mục home của youruser
```

### **2. Liệt kê files/folders:**

```bash
# Liệt kê đơn giản
ls

# Liệt kê chi tiết (recommended)
ls -la

# Output:
# drwxr-xr-x  5 user user 4096 Dec 26 10:00 .
# drwxr-xr-x  3 root root 4096 Dec 20 09:00 ..
# -rw-r--r--  1 user user  220 Dec 20 09:00 .bash_logout
# drwxr-xr-x  2 user user 4096 Dec 26 10:00 Documents

# Giải thích:
# d          = directory (thư mục)
# -          = file
# rwxr-xr-x  = permissions (quyền hạn)
# user user  = owner và group
# 4096       = size (bytes)
# Dec 26     = ngày sửa
```

### **3. Di chuyển giữa các thư mục:**

```bash
# Vào thư mục Documents
cd Documents

# Kiểm tra
pwd
# Output: /home/youruser/Documents

# Quay lại thư mục cha (parent)
cd ..

pwd
# Output:   /home/youruser

# Về thư mục home (dù đang ở đâu)
cd ~

# Hoặc chỉ gõ: 
cd

# Về thư mục trước đó
cd -

# Vào thư mục tuyệt đối (absolute path)
cd /var/log

pwd
# Output: /var/log
```

### **4. Tạo thư mục mới:**

```bash
# Tạo thư mục projects
mkdir projects

# Tạo thư mục lồng nhau (nested)
mkdir -p projects/backend/config

# Kiểm tra
ls -la

# Vào thư mục vừa tạo
cd projects
pwd
# Output: /home/youruser/projects
```

---

## 📄 QUẢN LÝ FILES

### **1. Tạo file mới:**

```bash
# Tạo file trống
touch test.txt

# Kiểm tra
ls -la
# Thấy: -rw-r--r--  1 user user    0 Dec 26 10:05 test.txt

# Tạo file với nội dung
echo "Hello World" > hello.txt

# Xem nội dung
cat hello.txt
# Output: Hello World
```

### **2. Xem nội dung file:**

```bash
# Xem toàn bộ (file ngắn)
cat hello.txt

# Xem từng trang (file dài)
less /var/log/syslog

# Trong less: 
#   Space = next page
#   b = previous page
#   q = quit

# Xem 10 dòng đầu
head hello.txt

# Xem 10 dòng cuối
tail hello. txt

# Xem realtime (theo dõi log)
tail -f /var/log/syslog
# Ctrl+C để thoát
```

### **3. Chỉnh sửa file:**

```bash
# Dùng nano (dễ nhất cho người mới)
nano test.txt

# Giao diện nano: 
┌────────────────────────────────────┐
│  GNU nano 6.2      test.txt        │
├────────────────────────────────────┤
│                                    │
│  [Gõ nội dung ở đây]               │
│                                    │
├────────────────────────────────────┤
│ ^G Help    ^O Write Out  ^X Exit  │
└────────────────────────────────────┘

# Phím tắt:
# Ctrl+O = Save (Write Out)
#   → Nhấn Enter để confirm
# Ctrl+X = Exit
# Ctrl+K = Cắt dòng
# Ctrl+U = Dán
# Ctrl+W = Tìm kiếm

# Gõ vài dòng, sau đó: 
# 1. Ctrl+O → Enter (save)
# 2. Ctrl+X (exit)

# Xem lại
cat test.txt
```

### **4. Copy, Move, Delete:**

```bash
# Copy file
cp test.txt test_backup.txt

# Copy folder (recursive)
cp -r projects projects_backup

# Move (đổi tên)
mv test.txt test_renamed.txt

# Move vào thư mục khác
mv test_renamed.txt ~/Documents/

# Xóa file
rm test_backup.txt

# Xóa folder (cẩn thận!)
rm -r projects_backup

# Xóa folder (hỏi confirm từng file)
rm -ri projects_backup
```

---

## 👤 USERS & PERMISSIONS

### **1. Kiểm tra user hiện tại:**

```bash
# Xem username
whoami

# Xem user ID
id

# Output:
# uid=1000(youruser) gid=1000(youruser) groups=1000(youruser),27(sudo)

# Giải thích:
# uid = user ID
# gid = group ID
# groups = các nhóm user thuộc về
#   27(sudo) = user này có quyền sudo (admin)
```

### **2. Root user vs Regular user:**

```
┌─────────────────────────────────────────────────────┐
│  ROOT USER (superuser)                              │
├─────────────────────────────────────────────────────┤
│  • Quyền cao nhất, làm được mọi thứ                 │
│  • Nguy hiểm nếu dùng sai                           │
│  • Prompt:   # (dấu thăng)                            │
│  • Không nên login trực tiếp                        │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  REGULAR USER (youruser)                            │
├─────────────────────────────────────────────────────┤
│  • Quyền hạn chế                                    │
│  • An toàn hơn                                      │
│  • Prompt:  $ (dấu đô la)                            │
│  • Dùng sudo khi cần quyền admin                    │
└─────────────────────────────────────────────────────┘
```

### **3. Dùng sudo:**

```bash
# Lệnh thường (không cần quyền cao)
ls /home

# Lệnh cần quyền admin
ls /root
# Output: Permission denied

# Dùng sudo (chạy với quyền root)
sudo ls /root
# → Hệ thống hỏi password
# → Nhập password của youruser (không phải root)
# → Lệnh chạy

# Cài phần mềm (cần sudo)
sudo apt update

# Chỉnh sửa file hệ thống (cần sudo)
sudo nano /etc/ssh/sshd_config
```

### **4. Permissions (quyền hạn):**

```bash
ls -la

# Output:
# -rw-r--r--  1 user user  220 test. txt
#  ↑
#  Permissions

# Giải thích permissions:
# -rw-r--r--
# │└┬┘└┬┘└┬┘
# │ │  │  └─ Others (người khác): r-- (chỉ đọc)
# │ │  └──── Group (nhóm): r-- (chỉ đọc)
# │ └─────── Owner (chủ): rw- (đọc và ghi)
# └────────── Type:  - (file), d (directory)

# r = read (đọc)
# w = write (ghi/xóa)
# x = execute (chạy)

# Thay đổi permissions: 
chmod 644 test.txt    # rw-r--r--
chmod 755 script.sh   # rwxr-xr-x (cho file script)

# Thay đổi owner: 
sudo chown youruser: youruser test.txt
```

---

## 📦 QUẢN LÝ PHẦN MỀM (APT)

### **APT là gì?**

```
APT (Advanced Package Tool) = App Store của Ubuntu

┌─────────────────────────────────────────┐
│  Kho phần mềm (Repository)              │
│  - Ubuntu Official Repo                 │
│  - 50,000+ packages                     │
└─────────────────────────────────────────┘
           │
           ↓ apt install
┌─────────────────────────────────────────┐
│  Server của bạn                         │
│  - Tự động download                     │
│  - Tự động cài đặt                      │
│  - Quản lý dependencies                 │
└─────────────────────────────────────────┘
```

### **Các lệnh APT cơ bản:**

```bash
# 1. Update danh sách packages (LUÔN LÀM ĐẦU TIÊN)
sudo apt update

# Output:
# Hit:1 http://archive.ubuntu.com/ubuntu jammy InRelease
# Get:2 http://security.ubuntu.com/ubuntu jammy-security InRelease
# Fetched 1,234 kB in 2s (617 kB/s)
# Reading package lists... Done

# 2. Upgrade các packages đã cài
sudo apt upgrade

# Hệ thống sẽ hỏi:  Do you want to continue? [Y/n]
# Gõ:  Y và Enter

# 3. Cài package mới
sudo apt install curl

# 4. Gỡ package
sudo apt remove curl

# 5. Gỡ package + config files
sudo apt purge curl

# 6. Xóa packages không cần thiết
sudo apt autoremove

# 7. Tìm package
apt search nginx

# 8. Xem thông tin package
apt show nginx
```

### **Cài một vài tools cần thiết:**

```bash
# Update trước
sudo apt update

# Cài các tools hữu ích
sudo apt install -y \
  curl \
  wget \
  git \
  htop \
  net-tools \
  ufw \
  nano \
  vim

# Giải thích:
# curl, wget = download files
# git = quản lý code
# htop = xem CPU/RAM realtime
# net-tools = network tools (ifconfig, netstat)
# ufw = firewall
# nano, vim = text editors

# Kiểm tra đã cài: 
which curl
# Output: /usr/bin/curl

which git
# Output: /usr/bin/git
```

---

## 🔍 MONITORING CƠ BẢN

### **1. Xem CPU và RAM:**

```bash
# Cách 1: top (cơ bản)
top

# Giao diện top:
┌────────────────────────────────────────────────┐
│ top - 10: 30:25 up 5 days,  2:15,  1 user       │
│ Tasks:  120 total,   1 running, 119 sleeping    │
│ %Cpu(s):  2.3 us,  1.2 sy,  0.0 ni, 96.5 id    │
│ MiB Mem :   16000.0 total,  12000.0 free         │
│                                                │
│   PID USER      PR  NI    VIRT    RES  %CPU    │
│   123 user      20   0  500000  50000   5.2    │
└────────────────────────────────────────────────┘

# Nhấn q để thoát

# Cách 2: htop (đẹp hơn, dễ nhìn hơn)
htop

# Phím tắt trong htop:
#   F6 = Sắp xếp
#   F9 = Kill process
#   F10/q = Thoát
```

### **2. Xem disk space:**

```bash
# Xem tổng quan
df -h

# Output:
# Filesystem      Size  Used Avail Use% Mounted on
# /dev/sda1       100G   15G   80G  16% /
# /dev/sda2       500G  200G  280G  42% /data

# Xem size của folder cụ thể
du -sh /home/youruser

# Output:
# 2.5G    /home/youruser

# Xem top 10 folders lớn nhất
du -sh /home/youruser/* | sort -h | tail -10
```

### **3. Xem processes (tiến trình) đang chạy:**

```bash
# Xem tất cả
ps aux

# Tìm process cụ thể
ps aux | grep nginx

# Output:
# user  1234  0.0  0.1  12345  5678 ?   S  10:00  0:00 nginx: master

# Kill process (cẩn thận!)
kill 1234

# Kill force (nếu process không chết)
kill -9 1234
```

---

## 🌐 KIỂM TRA NETWORK

### **1. Xem IP address:**

```bash
# Cách 1 (mới)
ip addr show

# Tìm dòng: 
# inet 192.168.1.243/24

# Cách 2 (cũ, cần net-tools)
ifconfig

# Output:
# enp0s3: flags=4163<UP,BROADCAST,RUNNING>  mtu 1500
#         inet 192.168.1.243  netmask 255.255.255.0
```

### **2. Kiểm tra kết nối internet:**

```bash
# Ping Google DNS
ping 8.8.8.8

# Output:
# 64 bytes from 8.8.8.8: icmp_seq=1 ttl=117 time=15.2 ms
# 64 bytes from 8.8.8.8: icmp_seq=2 ttl=117 time=14.8 ms

# Nhấn Ctrl+C để dừng

# Ping domain
ping google.com

# Nếu thành công → Internet OK
```

### **3. Xem ports đang mở:**

```bash
# Xem tất cả ports
sudo netstat -tulpn

# Output:
# Proto  Local Address   State    PID/Program name
# tcp    0.0.0.0:22      LISTEN   1234/sshd
# tcp    0.0.0.0:80      LISTEN   5678/nginx

# Hoặc dùng ss (modern)
sudo ss -tulpn

# Kiểm tra port cụ thể có mở không
sudo lsof -i : 22

# Output:
# COMMAND  PID  USER   FD   TYPE  DEVICE  SIZE/OFF  NODE  NAME
# sshd     1234 root    3u  IPv4  12345      0t0   TCP *:ssh (LISTEN)
```

---

## 📝 PRACTICES (THỰC HÀNH)

Làm các bước sau để làm quen: 

```bash
# 1. Tạo thư mục practice
cd ~
mkdir practice
cd practice

# 2. Tạo vài files
echo "Hello Ubuntu" > file1.txt
echo "Learning Linux" > file2.txt
touch file3.txt

# 3. List files
ls -la

# 4. Xem nội dung
cat file1.txt

# 5. Copy file
cp file1.txt file1_backup.txt

# 6. Tạo subfolder
mkdir subfolder

# 7. Move file vào subfolder
mv file3.txt subfolder/

# 8. Xem cấu trúc
tree . 

# Nếu chưa có tree:
sudo apt install tree

# Output:
# .
# ├── file1.txt
# ├── file1_backup.txt
# ├── file2.txt
# └── subfolder
#     └── file3.txt

# 9. Xóa backup
rm file1_backup.txt

# 10. Xem CPU/RAM
htop
# Nhấn q để thoát

# 11. Xem disk
df -h

# 12. Xem IP
ip addr show | grep inet

# 13. Ping test
ping -c 3 google.com

# 14. Quay về home
cd ~

# 15. Xóa thư mục practice
rm -r practice
```

---

## ✅ CHECKLIST HOÀN THÀNH

```
□ Đã đăng nhập được server
□ Đã kiểm tra Ubuntu version:  __________
□ Đã ghi lại thông tin server (IP, username, password)
□ Đã biết dùng:  cd, ls, pwd
□ Đã biết tạo/xóa files và folders
□ Đã biết dùng nano để chỉnh sửa file
□ Đã biết dùng sudo
□ Đã cài các tools cần thiết (curl, git, htop, etc.)
□ Đã biết xem CPU/RAM với htop
□ Đã biết xem disk với df -h
□ Đã biết xem IP và ping
□ Đã làm xong bài practice

→ Sẵn sàng chuyển sang File 02-CAU-HINH-SSH.md
```

---

## 📚 GLOSSARY NHANH

| Thuật ngữ | Tiếng Việt | Giải thích |
|-----------|-----------|------------|
| Terminal | Terminal | Cửa sổ gõ lệnh |
| Shell | Shell | Chương trình xử lý lệnh (bash, zsh) |
| Directory | Thư mục | Folder |
| Root | Gốc/Admin | User có quyền cao nhất |
| Sudo | Super User Do | Chạy lệnh với quyền admin |
| Package | Gói phần mềm | Phần mềm đóng gói sẵn |
| Repository | Kho phần mềm | Nguồn download packages |
| Process | Tiến trình | Chương trình đang chạy |

---

**⏭️ TIẾP THEO: File 02-CAU-HINH-SSH.md**