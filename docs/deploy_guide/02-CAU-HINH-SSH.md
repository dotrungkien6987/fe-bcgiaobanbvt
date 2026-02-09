# 📘 PHẦN 2: CÀI ĐẶT & CẤU HÌNH SSH

## 🎯 MỤC TIÊU

Sau phần này bạn sẽ: 
- ✅ Hiểu SSH là gì và tại sao cần dùng
- ✅ Tạo SSH key pair (public/private key)
- ✅ Kết nối từ máy tính cá nhân vào server
- ✅ Cấu hình SSH an toàn hơn
- ✅ Disable password login (chỉ dùng key)

---

## 🔐 SSH LÀ GÌ?

```
SSH = Secure Shell

┌─────────────────────────────────────────────────────────┐
│  TRƯỚC ĐÂY (Telnet):                                    │
├─────────────────────────────────────────────────────────┤
│  Máy tính của bạn ──[plain text]──→ Server              │
│  • Password gửi không mã hóa                            │
│  • Ai cũng có thể đọc được                              │
│  • KHÔNG AN TOÀN ❌                                      │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  BÂY GIỜ (SSH):                                          │
├─────────────────────────────────────────────────────────┤
│  Máy tính của bạn ══[encrypted]══→ Server               │
│  • Mọi thứ được mã hóa                                  │
│  • Không ai đọc được                                    │
│  • AN TOÀN ✅                                            │
└─────────────────────────────────────────────────────────┘

SSH cho phép bạn: 
├─ Điều khiển server từ xa (như ngồi trước server)
├─ Chuyển files (SCP/SFTP)
├─ Tạo tunnel (port forwarding)
└─ Git operations (git clone qua SSH)
```

---

## 🔑 SSH KEYS - KHÁI NIỆM

```
SSH Key Authentication = Dùng "chìa khóa" thay vì password

┌─────────────────────────────────────────────────────────┐
│  CÁCH HOẠT ĐỘNG:                                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. Bạn tạo 1 cặp key:                                   │
│     ├─ Private Key (chìa khóa riêng) 🔐               │
│     │  → Giữ trên máy tính của bạn                     │
│     │  → TUYỆT ĐỐI KHÔNG share cho ai                  │
│     │                                                   │
│     └─ Public Key (chìa khóa công khai) 🔓            │
│        → Copy lên server                               │
│        → Công khai, ai biết cũng OK                    │
│                                                         │
│  2. Khi kết nối:                                        │
│     Server:   "Chứng minh bạn có private key?"          │
│     Bạn:     [Ký bằng private key]                     │
│     Server:  [Verify bằng public key]                  │
│     Server:  "OK, vào đi!" ✅                           │
│                                                         │
└─────────────────────────────────────────────────────────┘

Ưu điểm so với password: 
✅ An toàn hơn nhiều (không brute-force được)
✅ Tiện hơn (không cần gõ password)
✅ Có thể dùng cho automation (scripts)
```

---

## 💻 BƯỚC 1: KIỂM TRA SSH SERVER

### **Trên server (192.168.1.243):**

```bash
# Kiểm tra SSH service có chạy không
sudo systemctl status ssh

# Output mong muốn:
# ● ssh.service - OpenBSD Secure Shell server
#    Loaded: loaded (/lib/systemd/system/ssh.service; enabled)
#    Active: active (running) ✅

# Nếu không chạy, start nó: 
sudo systemctl start ssh

# Enable để tự động chạy khi boot
sudo systemctl enable ssh

# Kiểm tra port SSH (mặc định 22)
sudo ss -tulpn | grep :22

# Output:
# tcp   LISTEN  0  128  0.0.0.0:22   0.0.0.0:*   users:(("sshd",pid=1234))
```

### **Nếu chưa cài SSH server:**

```bash
# Cài OpenSSH Server
sudo apt update
sudo apt install openssh-server -y

# Start service
sudo systemctl start ssh
sudo systemctl enable ssh

# Kiểm tra lại
sudo systemctl status ssh
```

---

## 🖥️ BƯỚC 2: TẠO SSH KEY TRÊN MÁY TÍNH CÁ NHÂN

### **Trên Windows:**

#### **Option 1: Dùng Git Bash (Khuyến nghị)**

```bash
# 1. Download Git for Windows (nếu chưa có)
#    https://git-scm.com/download/win

# 2. Mở Git Bash

# 3. Tạo SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# Output:
# Generating public/private ed25519 key pair.
# Enter file in which to save the key (C:/Users/YourName/.ssh/id_ed25519):
#   → Nhấn Enter (dùng mặc định)

# Enter passphrase (empty for no passphrase):
#   → GÕ PASSWORD BẢO VỆ KEY (hoặc Enter để bỏ qua)
#   → Nếu gõ, phải nhớ password này! 

# Enter same passphrase again:
#   → Gõ lại password

# Output:
# Your identification has been saved in C:/Users/YourName/.ssh/id_ed25519
# Your public key has been saved in C:/Users/YourName/.ssh/id_ed25519.pub
# The key fingerprint is:
# SHA256:abc123xyz...  your_email@example.com

# 4. Xem public key
cat ~/. ssh/id_ed25519.pub

# Output (1 dòng dài):
# ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIGq...  your_email@example.com
#   ↑ COPY TOÀN BỘ DÒNG NÀY
```

#### **Option 2: Dùng PuTTYgen**

```
1. Download PuTTY: 
   https://www.putty.org/

2. Mở PuTTYgen

3. Click "Generate"
   → Di chuyển chuột random để tạo entropy

4. Sau khi generate xong: 
   • Key comment: Điền email
   • Key passphrase:  Điền password (hoặc để trống)
   • Confirm passphrase: Điền lại

5. Click "Save private key"
   → Lưu thành:  id_rsa. ppk

6. Copy toàn bộ text trong khung "Public key for pasting..."
   → Dán vào Notepad, lưu lại
```

### **Trên macOS/Linux:**

```bash
# Mở Terminal

# Tạo SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# Tương tự Windows Git Bash ở trên

# Xem public key
cat ~/.ssh/id_ed25519.pub

# Copy output
```

---

## 📤 BƯỚC 3: COPY PUBLIC KEY LÊN SERVER

### **Cách 1: Dùng ssh-copy-id (macOS/Linux/Git Bash)**

```bash
# Syntax: 
ssh-copy-id youruser@192.168.1.243

# Ví dụ:
ssh-copy-id admin@192.168.1.243

# Output:
# /usr/bin/ssh-copy-id: INFO: attempting to log in... 
# admin@192.168.1.243's password: 
#   → GÕ PASSWORD CỦA USER TRÊN SERVER

# Output:
# Number of key(s) added: 1
# 
# Now try logging into the machine with:
#   ssh 'admin@192.168.1.243'
```

### **Cách 2: Copy thủ công (Windows không có ssh-copy-id)**

```bash
# 1. Trên máy tính, xem public key
cat ~/.ssh/id_ed25519.pub

# 2. COPY toàn bộ output (1 dòng dài bắt đầu bằng ssh-ed25519...)

# 3. SSH vào server (lần này vẫn dùng password)
ssh youruser@192.168.1.243
# → Nhập password

# 4. Trên server, tạo thư mục .ssh (nếu chưa có)
mkdir -p ~/.ssh

# Set permissions
chmod 700 ~/.ssh

# 5. Mở/tạo file authorized_keys
nano ~/.ssh/authorized_keys

# 6. DÁN public key vào (Ctrl+Shift+V hoặc Right-click → Paste)
#    → MỖI KEY 1 DÒNG

# 7. Save:  Ctrl+O → Enter → Ctrl+X

# 8. Set permissions
chmod 600 ~/.ssh/authorized_keys

# 9. Thoát server
exit
```

---

## 🔌 BƯỚC 4: TEST KẾT NỐI SSH

### **Từ máy tính cá nhân:**

```bash
# Thử kết nối
ssh youruser@192.168.1.243

# Lần đầu sẽ hỏi: 
# The authenticity of host '192.168.1.243' can't be established.
# ED25519 key fingerprint is SHA256:abc123... 
# Are you sure you want to continue connecting (yes/no/[fingerprint])?
#   → Gõ:  yes

# Nếu bạn set passphrase cho key:
#   → Nhập passphrase

# Nếu thành công:
# Welcome to Ubuntu 22.04.x LTS
# youruser@server:~$ 
#   ↑ BẠN ĐÃ VÀO SERVER! 

# Kiểm tra
whoami
# Output: youruser

hostname
# Output: server-name

# Thoát
exit
```

### **Troubleshooting nếu không connect được:**

```bash
# Thử với verbose mode
ssh -v youruser@192.168.1.243

# Xem debug info: 
# ... 
# debug1: Authentications that can continue: publickey,password
# debug1: Next authentication method: publickey
# debug1: Offering public key: /home/you/.ssh/id_ed25519
# debug1: Server accepts key: ... 
# ... 

# Nếu thấy "Permission denied (publickey)":

# 1. Kiểm tra permissions trên server
ssh youruser@192.168.1.243  # dùng password
ls -la ~/.ssh
# Phải thấy: 
# drwx------  . ssh/
# -rw-------  authorized_keys

# 2. Nếu sai, fix: 
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys

# 3. Kiểm tra nội dung authorized_keys
cat ~/.ssh/authorized_keys
# → Phải có public key của bạn

# 4. Restart SSH service
sudo systemctl restart ssh

# 5. Thử lại từ máy tính
```

---

## 🔒 BƯỚC 5: BẢO MẬT SSH

### **Cấu hình SSH server an toàn hơn:**

```bash
# 1. SSH vào server
ssh youruser@192.168.1.243

# 2. Backup config gốc
sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup

# 3. Mở file config
sudo nano /etc/ssh/sshd_config

# 4. Tìm và sửa các dòng sau:
```

```bash
# ──────────────────────────────────────────────────────────
# FILE: /etc/ssh/sshd_config
# ──────────────────────────────────────────────────────────

# Port SSH (đổi nếu muốn - advanced)
Port 22
# → Có thể đổi thành port khác (vd: 2222) để tránh scan tự động
# → Nhưng trong giai đoạn đầu, giữ 22 cho đơn giản

# Chỉ cho phép SSH Protocol 2 (an toàn hơn)
Protocol 2

# Không cho phép login bằng root
PermitRootLogin no
# ↑ QUAN TRỌNG!  Bắt buộc phải dùng user thường

# Chỉ cho phép user cụ thể (optional)
AllowUsers youruser
# → Chỉ user "youruser" mới login được
# → Thêm user khác:  AllowUsers user1 user2

# Disable password authentication (CHỈ DÙNG KEY)
PasswordAuthentication no
# ↑ CHỈ BẬT SAU KHI ĐÃ TEST KEY THÀNH CÔNG! 

# Disable empty passwords
PermitEmptyPasswords no

# Disable X11 forwarding (không cần cho server)
X11Forwarding no

# Max authentication tries
MaxAuthTries 3

# Login grace time (thời gian chờ login)
LoginGraceTime 60

# Client alive interval (giữ connection)
ClientAliveInterval 300
ClientAliveCountMax 2

# ──────────────────────────────────────────────────────────
```

```bash
# 5. Save file: Ctrl+O → Enter → Ctrl+X

# 6. Test config (QUAN TRỌNG!)
sudo sshd -t

# Output mong muốn:
# (không có gì = OK)

# Nếu có lỗi: 
# sshd: /etc/ssh/sshd_config line 25: Bad configuration option
#   → Sửa lại dòng 25

# 7. TRƯỚC KHI RESTART, MỞ SESSION SSH THỨ 2! 
#    (Để nếu lỗi, vẫn vào được)

# Từ máy tính, mở terminal thứ 2:
ssh youruser@192.168.1.243

# → GIỮ TERMINAL NÀY MỞ! 

# 8. Quay lại terminal thứ nhất, restart SSH
sudo systemctl restart ssh

# 9. Kiểm tra service
sudo systemctl status ssh
# → Phải thấy "active (running)"

# 10. Từ máy tính, mở terminal thứ 3 để test
ssh youruser@192.168.1.243

# Nếu vào được → OK!  ✅
# Nếu không vào được → Dùng terminal thứ 2 để fix

# 11. Sau khi confirm OK, đóng terminal thứ 2 và 3
```

---

## 🚫 BƯỚC 6: DISABLE PASSWORD LOGIN (QUAN TRỌNG!)

**⚠️ CHỈ LÀM BƯỚC NÀY SAU KHI:**
- ✅ Đã test SSH key thành công
- ✅ Đã có ít nhất 2 sessions SSH mở
- ✅ Đã backup key ra chỗ an toàn

```bash
# 1. Đảm bảo đang có 2 SSH sessions mở

# 2. Trong session 1:
sudo nano /etc/ssh/sshd_config

# 3. Tìm dòng: 
PasswordAuthentication yes

# 4. Đổi thành:
PasswordAuthentication no

# 5. Save: Ctrl+O → Enter → Ctrl+X

# 6. Test config
sudo sshd -t

# 7. Restart SSH
sudo systemctl restart ssh

# 8. Trong session 2, kiểm tra vẫn online không? 
whoami
# Output: youruser
#   → OK, session 2 vẫn sống ✅

# 9. Từ máy tính, mở terminal mới test
ssh youruser@192.168.1.243

# Phải vào được KHÔNG CẦN PASSWORD ✅

# 10. Thử từ máy tính khác (không có key)
ssh youruser@192.168.1.243

# Output:
# youruser@192.168.1.243: Permission denied (publickey).
#   → ĐÚNG! Không có key không vào được ✅
```

---

## 📱 BONUS: KẾT NỐI TỪ MOBILE

### **Android:  Termux**

```bash
# 1. Cài Termux từ F-Droid (không phải Play Store)
#    https://f-droid.org/en/packages/com.termux/

# 2. Trong Termux:
pkg update
pkg install openssh

# 3. Tạo SSH key
ssh-keygen -t ed25519

# 4. Xem public key
cat ~/.ssh/id_ed25519.pub

# 5. Copy key lên server (thủ công)
#    → Làm như Bước 3, Cách 2

# 6. Kết nối
ssh youruser@192.168.1.243
```

### **iOS: Terminus**

```
1. Cài "Terminus" từ App Store (free)

2. Mở app → Add Host

3. Điền: 
   Hostname: 192.168.1.243
   Port: 22
   Username: youruser
   Authentication: Key
   
4. Generate Key trong app

5. Copy public key từ app

6. Paste vào server (qua máy tính)

7. Connect từ app
```

---

## 🔐 BƯỚC 7: QUẢN LÝ KEYS

### **Backup keys:**

```bash
# Trên máy tính

# 1. Tìm thư mục keys
ls ~/. ssh

# Output:
# id_ed25519      ← Private key (QUAN TRỌNG!)
# id_ed25519.pub  ← Public key
# known_hosts     ← Các server đã kết nối
# config          ← SSH config (nếu có)

# 2. Backup keys
# Windows: 
cp -r ~/.ssh /d/Backups/ssh_keys_backup_2025-12-26

# macOS: 
cp -r ~/.ssh ~/Documents/ssh_keys_backup

# 3. Lưu backup ra: 
#    • USB drive
#    • Cloud storage (encrypted!)
#    • Password manager
```

### **Tạo SSH config file (tiện hơn):**

```bash
# Tạo file config
nano ~/.ssh/config

# Nội dung:
```

```
# ──────────────────────────────────────────────────────────
# FILE: ~/.ssh/config
# ──────────────────────────────────────────────────────────

# Server bệnh viện
Host hospital
    HostName 192.168.1.243
    User youruser
    Port 22
    IdentityFile ~/.ssh/id_ed25519
    ServerAliveInterval 60
    ServerAliveCountMax 10

# Alias ngắn gọn hơn
Host hs
    HostName 192.168.1.243
    User youruser
    
# ──────────────────────────────────────────────────────────
```

```bash
# Save:  Ctrl+O → Enter → Ctrl+X

# Set permissions
chmod 600 ~/.ssh/config

# Giờ connect chỉ cần:
ssh hospital

# Hoặc:
ssh hs

# Thay vì:
ssh youruser@192.168.1.243
```

---

## 🛠️ TROUBLESHOOTING

### **Lỗi:  Permission denied (publickey)**

```bash
# 1. Kiểm tra key có đúng không
ssh -v youruser@192.168.1.243 2>&1 | grep "Offering public key"

# Output: 
# debug1: Offering public key: /home/you/. ssh/id_ed25519 RSA ... 

# 2. Kiểm tra trên server
ssh youruser@192.168.1.243  # dùng password từ session khác
cat ~/.ssh/authorized_keys

# Phải thấy key của bạn

# 3. Fix permissions
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys

# 4. Check ownership
ls -la ~/.ssh
# Phải là:
# drwx------  youruser youruser  . ssh/
# -rw-------  youruser youruser  authorized_keys

# Nếu sai: 
sudo chown -R youruser:youruser ~/.ssh

# 5. Check SELinux (nếu có)
restorecon -R ~/.ssh
```

### **Lỗi: Connection refused**

```bash
# 1. Kiểm tra SSH service trên server
sudo systemctl status ssh

# Nếu inactive:
sudo systemctl start ssh

# 2. Kiểm tra firewall
sudo ufw status

# Nếu SSH bị block:
sudo ufw allow 22/tcp
sudo ufw reload

# 3. Kiểm tra port
sudo ss -tulpn | grep : 22
```

### **Lỗi: Connection timeout**

```bash
# 1. Kiểm tra network
ping 192.168.1.243

# Nếu không ping được → vấn đề network

# 2. Kiểm tra có thể telnet không
telnet 192.168.1.243 22

# Nếu không kết nối được → firewall block

# 3. Thử từ máy khác trong cùng mạng
```

### **Quên passphrase của key:**

```
❌ KHÔNG CÓ CÁCH NÀO LẤY LẠI! 

Giải pháp:
1. Tạo key pair mới
2. Copy public key mới lên server
3. Xóa key cũ khỏi server (nếu muốn)
```

---

## ✅ CHECKLIST HOÀN THÀNH

```
□ SSH server đã chạy trên server (192.168.1.243)
□ Đã tạo SSH key pair trên máy tính
□ Đã copy public key lên server
□ Đã test kết nối SSH với key thành công
□ Đã cấu hình /etc/ssh/sshd_config an toàn
□ Đã disable password authentication
□ Đã test từ máy không có key bị từ chối
□ Đã backup private key ra chỗ an toàn
□ Đã tạo ~/. ssh/config (optional)
□ Có thể SSH vào server từ máy tính bất cứ lúc nào

GHI CHÚ QUAN TRỌNG: 
├─ SSH Key location: __________________________
├─ Passphrase (nếu có): _______________________ (cất kỹ!)
├─ Server IP:   192.168.1.243
├─ Server User: _______________________________
└─ SSH Port: 22

→ Sẵn sàng chuyển sang File 03-FIREWALL-UFW.md
```

---

**⏭️ TIẾP THEO: File 03-FIREWALL-UFW.md**