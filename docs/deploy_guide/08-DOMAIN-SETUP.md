# 📘 PHẦN 8: THIẾT LẬP DOMAIN VỚI TENTEN

## 🎯 MỤC TIÊU

Sau phần này bạn sẽ:

- ✅ Hiểu domain và DNS hoạt động như thế nào
- ✅ Quản lý domain trên TenTen. vn
- ✅ Đổi nameserver sang Cloudflare
- ✅ Verify domain ownership
- ✅ Chuẩn bị cho Cloudflare Tunnel

---

## 🌐 DOMAIN VÀ DNS LÀ GÌ?

```
╔═══════════════════════════════════════════════════════════╗
║  DOMAIN = TÊN DỄ NHỚ thay vì IP                            ║
╚═══════════════════════════════════════════════════════════╝

Thay vì nhớ:   103.123.45.67 (IP PUBLIC)
Bạn dùng:      hospital.vn

┌─────────────────────────────────────────────────────────┐
│  DNS (Domain Name System) = "Danh bạ điện thoại"       │
│                              của Internet               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  User gõ:   hospital.vn                                  │
│      │                                                  │
│      ↓                                                  │
│  [DNS Resolver] → Tìm trong DNS records                 │
│      │                                                  │
│      ↓                                                  │
│  DNS trả về:   103.123.45.67 (IP PUBLIC)                │
│      │          HOẶC Cloudflare IP (nếu dùng Tunnel)   │
│      ↓                                                  │
│  Browser kết nối:  103.123.45.67 (hoặc Cloudflare)      │
│                                                         │
└─────────────────────────────────────────────────────────┘

⚠️  LƯU Ý QUAN TRỌNG:
┌─────────────────────────────────────────────────────────┐
│  192.168.1.243 = IP PRIVATE (chỉ trong mạng LAN)        │
│  103.123.45.67 = IP PUBLIC (truy cập từ Internet)       │
│                                                         │
│  ❌ KHÔNG THỂ dùng IP private làm DNS record!           │
│  ✅ CHỈ dùng IP public HOẶC Cloudflare Tunnel           │
└─────────────────────────────────────────────────────────┘
```

---

## 🏗️ KIẾN TRÚC MẠNG - 2 PHƯƠNG ÁN TRIỂN KHAI

```
╔═══════════════════════════════════════════════════════════╗
║  TÀI LIỆU NÀY SỬ DỤNG: CLOUDFLARE TUNNEL (PHƯƠNG ÁN B)    ║
║  → KHÔNG CẦN IP PUBLIC!                                   ║
║  → KHÔNG CẦN MỞ PORT 443 TRÊN FIREWALL!                   ║
╚═══════════════════════════════════════════════════════════╝
```

### **PHƯƠNG ÁN A: CÓ IP PUBLIC (Truyền thống)**

```
┌─────────────────────────────────────────────────────────┐
│                        INTERNET                         │
└───────────────────────┬─────────────────────────────────┘
                        │
                        │ User truy cập: hospital.vn
                        ↓
┌─────────────────────────────────────────────────────────┐
│  DNS LOOKUP                                             │
│  hospital.vn → 103.123.45.67 (IP PUBLIC của công ty)    │
└───────────────────────┬─────────────────────────────────┘
                        │
                        │ Connect tới IP public
                        ↓
┌─────────────────────────────────────────────────────────┐
│  ROUTER CÔNG TY (IP: 103.123.45.67)                     │
│  ┌───────────────────────────────────────────────────┐  │
│  │ NAT Port Forwarding:                              │  │
│  │ Port 80  → 192.168.1.243:80                       │  │
│  │ Port 443 → 192.168.1.243:443                      │  │
│  └───────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────┘
                        │
                        │ Forward to internal server
                        ↓
┌─────────────────────────────────────────────────────────┐
│  FIREWALL / UFW                                         │
│  • Port 443 phải MỞ cho inbound traffic                 │
│  • SSL certificate phải cài trên server                  │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ↓
┌─────────────────────────────────────────────────────────┐
│  SERVER (192.168.1.243 - LAN IP)                        │
│  • Nginx/Apache xử lý HTTPS                             │
│  • App chạy trên localhost:3000, :8000                   │
└─────────────────────────────────────────────────────────┘

YÊU CẦU:
☑ Có IP public từ ISP (VD: 103.123.45.67)
☑ IT phải cấu hình NAT trên router
☑ IT phải mở port 80, 443 inbound
☑ Cấu hình DNS A record: hospital.vn → 103.123.45.67
☑ Cài SSL certificate trên server (Let's Encrypt/certbot)
☑ Cấu hình Nginx/Apache reverse proxy

❌ PHỤ THUỘC IT department
❌ Rủi ro khi thay đổi network
❌ Phức tạp khi troubleshoot
```

### **PHƯƠNG ÁN B: CLOUDFLARE TUNNEL (Tài liệu này) ✅**

```
┌─────────────────────────────────────────────────────────┐
│                        INTERNET                         │
└───────────────────────┬─────────────────────────────────┘
                        │
                        │ User truy cập: hospital.vn
                        ↓
┌─────────────────────────────────────────────────────────┐
│  DNS LOOKUP (TỰ ĐỘNG TẠO Ở FILE 10)                     │
│  hospital.vn → CNAME → xyz.cfargotunnel.com             │
│              → Cloudflare Edge IP (104.x.x.x)            │
└───────────────────────┬─────────────────────────────────┘
                        │
                        │ HTTPS request
                        ↓
┌─────────────────────────────────────────────────────────┐
│  CLOUDFLARE EDGE SERVERS                                │
│  • Xử lý HTTPS (SSL termination)                        │
│  • DDoS protection                                      │
│  • Caching                                              │
│  • Firewall rules                                       │
└───────────────────────┬─────────────────────────────────┘
                        │
                        │ Encrypted Tunnel (TLS)
                        │ Outbound connection!
                        ↓
┌─────────────────────────────────────────────────────────┐
│  FIREWALL / ROUTER                                      │
│  ✅ KHÔNG CẦN mở port 443 inbound!                       │
│  ✅ Chỉ cần cho phép outbound connection (port 7844)     │
└───────────────────────┬─────────────────────────────────┘
                        │
                        │ cloudflared daemon connects out
                        ↓
┌─────────────────────────────────────────────────────────┐
│  SERVER (192.168.1.243 - LAN IP)                        │
│  ┌───────────────────────────────────────────────────┐  │
│  │ cloudflared daemon (service)                      │  │
│  │ • Tự động kết nối tới Cloudflare                  │  │
│  │ • Listen tunnel từ Cloudflare Edge                │  │
│  │ • Forward traffic tới localhost                   │  │
│  └───────────────────┬───────────────────────────────┘  │
│                      │                                   │
│                      ├→ localhost:3000 (Frontend)        │
│                      └→ localhost:8000 (Backend)         │
└─────────────────────────────────────────────────────────┘

YÊU CẦU:
✅ CHỈ CẦN Internet connection
✅ KHÔNG cần IP public
✅ KHÔNG cần mở port 443 inbound
✅ KHÔNG cần IT mở port
✅ DNS records tự động tạo (File 10)
✅ SSL tự động (Cloudflare)
✅ DDoS protection miễn phí

🎯 ĐỘC LẬP HOÀN TOÀN!
```

---

## 📋 FLOW TRIỂN KHAI THEO TÀI LIỆU

```
FILE 08 (này):
┌─────────────────────────────────────────────────────────┐
│ 1. Add domain vào Cloudflare                           │
│ 2. Thay đổi nameserver (TenTen → Cloudflare)           │
│                                                         │
│ ❌ KHÔNG cấu hình DNS records tại đây!                  │
│    (DNS sẽ tự động tạo ở File 10)                       │
└─────────────────────────────────────────────────────────┘
         │
         ↓
FILE 09: Cấu hình Cloudflare
┌─────────────────────────────────────────────────────────┐
│ • SSL/TLS settings                                      │
│ • Security settings                                     │
│ • Cache settings                                        │
│ • Performance optimization                              │
└─────────────────────────────────────────────────────────┘
         │
         ↓
FILE 10: Setup Cloudflare Tunnel ⭐ QUAN TRỌNG
┌─────────────────────────────────────────────────────────┐
│ 1. Tạo tunnel                                           │
│ 2. Cài cloudflared trên server                          │
│ 3. Tạo PUBLIC HOSTNAME:                                 │
│    • hospital.vn → localhost:3000                       │
│    • api.hospital.vn → localhost:8000                   │
│                                                         │
│ 🎉 CLOUDFLARE TỰ ĐỘNG TẠO DNS RECORDS:                  │
│    • hospital.vn → CNAME → xyz.cfargotunnel.com         │
│    • api.hospital.vn → CNAME → xyz.cfargotunnel.com     │
│                                                         │
│ ✅ KHÔNG CẦN cấu hình DNS manual!                        │
└─────────────────────────────────────────────────────────┘
         │
         ↓
FILE 11: Deploy Backend (localhost:8000)
         │
         ↓
FILE 12: Deploy Frontend (localhost:3000)
         │
         ↓
🎉 HOÀN THÀNH!
   https://hospital.vn → hoạt động!
```

---

## ❓ CÂU HỎI THƯỜNG GẶP

**Q1: Tại sao không thấy bước cấu hình DNS trỏ về IP?**

A: Vì dùng Cloudflare Tunnel! DNS records được tạo **TỰ ĐỘNG** khi bạn setup public hostname ở File 10. KHÔNG CẦN cấu hình manual.

**Q2: 192.168.1.243 là gì?**

A: Đó là IP private của server trong mạng LAN bệnh viện. IP này KHÔNG thể truy cập từ Internet, chỉ dùng nội bộ.

**Q3: Vậy user từ Internet truy cập như thế nào?**

A: User → Cloudflare Edge (IP public) → Tunnel → Server (192.168.1.243 private). Cloudflare làm cầu nối!

**Q4: Có cần IP public không?**

A: KHÔNG! Đó chính là lợi ích của Cloudflare Tunnel.

**Q5: DNS records được tạo khi nào?**

A: Tự động tạo khi bạn thêm public hostname trong Cloudflare Tunnel (File 10, Bước 5).

---

### **Các loại DNS Records:**

```
╔═══════════════════════════════════════════════════════════╗
║  A Record                                                 ║
╠═══════════════════════════════════════════════════════════╣
║  Domain → IPv4 Address (PUBLIC IP)                        ║
║  ✅ Ví dụ: hospital.vn → 103.123.45.67                     ║
║  ❌ SAI:   hospital.vn → 192.168.1.243 (private IP)        ║
╚═══════════════════════════════════════════════════════════╝

╔═══════════════════════════════════════════════════════════╗
║  CNAME Record (Cloudflare Tunnel dùng loại này)          ║
╠═══════════════════════════════════════════════════════════╣
║  Domain → Domain khác (alias)                             ║
║  ✅ Ví dụ: hospital.vn → xyz.cfargotunnel.com              ║
║  ✅ Ví dụ: www.hospital.vn → hospital.vn                   ║
╚═══════════════════════════════════════════════════════════╝

╔═══════════════════════════════════════════════════════════╗
║  MX Record                                                ║
╠═══════════════════════════════════════════════════════════╣
║  Email routing                                            ║
║  Ví dụ: @hospital.vn → mail.google.com                    ║
╚═══════════════════════════════════════════════════════════╝

╔═══════════════════════════════════════════════════════════╗
║  TXT Record                                               ║
╠═══════════════════════════════════════════════════════════╣
║  Verification, SPF, DKIM                                  ║
║  Ví dụ: _verification=abc123                              ║
╚═══════════════════════════════════════════════════════════╝
```

---

## 🏢 BƯỚC 1: ĐĂNG NHẬP TENTEN. VN

```
1. Truy cập:   https://www.tenten.vn/

2. Click "Đăng nhập"

3. Nhập:
   - Email: _______________________
   - Password: ____________________

4. Click "Đăng nhập"

5. Vào "Quản lý tên miền"
```

### **📝 GHI CHÚ:**

```
═══════════════════════════════════════════════════════
TENTEN.VN ACCOUNT
═══════════════════════════════════════════════════════

Email: ________________________________________

Password: _____________________________________

Domain:   ______________________________________
         (Ví dụ: hospital.vn)

Ngày hết hạn: _________________________________

═══════════════════════════════════════════════════════
```

---

## 🔍 BƯỚC 2: KIỂM TRA DOMAIN HIỆN TẠI

### **Trên TenTen Dashboard:**

```
┌─────────────────────────────────────────────────────┐
│  Quản lý tên miền                                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Tên miền:  hospital.vn                             │
│  Trạng thái:  Active ✅                              │
│  Ngày hết hạn:   26/12/2026                           │
│                                                     │
│  [Quản lý DNS]  [Đổi Nameserver]  [Gia hạn]        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### **Kiểm tra từ terminal (optional):**

```bash
# Từ máy tính cá nhân hoặc server

# Kiểm tra domain đang trỏ đâu
nslookup hospital.vn

# Output:
# Server:    8.8.8.8
# Address:  8.8.8.8#53
#
# Name:    hospital.vn
# Address:  x.x.x.x  ← IP hiện tại

# Xem nameserver hiện tại
nslookup -type=NS hospital.vn

# Output:
# hospital.vn  nameserver = ns1.tenten.vn.
# hospital.vn  nameserver = ns2.tenten.vn.
#                           ↑ Đang dùng TenTen nameserver

# Hoặc dùng dig (chi tiết hơn)
dig hospital.vn

# Hoặc dùng online tool:
# https://www.whatsmydns.net/
```

---

## 📋 BƯỚC 3: BACKUP DNS RECORDS HIỆN TẠI (NẾU CÓ)

```
╔═══════════════════════════════════════════════════════════╗
║  ⚠️  LƯU Ý: Nếu domain CHƯA có DNS records (mới mua)       ║
║            → Bỏ qua bước này, không có gì để backup       ║
║                                                           ║
║  Nếu domain ĐÃ có website cũ đang chạy:                   ║
║  → BẮT BUỘC phải backup DNS records!                      ║
╚═══════════════════════════════════════════════════════════╝
```

### **⚠️ QUAN TRỌNG: Backup trước khi thay đổi!**

```
Trên TenTen Dashboard → Quản lý DNS

GHI LẠI TẤT CẢ RECORDS:

┌──────────────────────────────────────────────────┐
│ Type  | Name | Value          | TTL  | Priority │
├──────────────────────────────────────────────────┤
│ A     | @    | x.x.x.x        | 3600 | -        │
│ A     | www  | x.x.x.x        | 3600 | -        │
│ MX    | @    | mail.google...  | 3600 | 10       │
│ TXT   | @    | v=spf1...       | 3600 | -        │
│ ...                                               │
└──────────────────────────────────────────────────┘

→ Screenshot hoặc ghi vào notepad!

💡 LƯU Ý:
• Nếu thấy A record trỏ về IP private (192.168.x.x) → SAI!
• Nếu thấy A record trỏ về IP public (103.x.x.x) → Có thể có website cũ
• MX records (email): Cần copy sang Cloudflare sau (nếu có)
```

---

## 🔄 BƯỚC 4: TẠO TÀI KHOẢN CLOUDFLARE

```
1. Truy cập: https://dash.cloudflare.com/sign-up

2. Điền thông tin:
   ┌────────────────────────────────────────┐
   │ Email:     _________________________    │
   │ Password: _________________________    │
   │                                        │
   │ [x] I agree to Cloudflare's Terms     │
   │                                        │
   │ [ Sign Up ]                            │
   └────────────────────────────────────────┘

3. Verify email
   → Check email inbox
   → Click link xác nhận

4. Login vào Cloudflare Dashboard
```

### **📝 GHI CHÚ:**

```
═══════════════════════════════════════════════════════
CLOUDFLARE ACCOUNT
═══════════════════════════════════════════════════════

Email: ________________________________________

Password: _____________________________________

2FA: __________________________________________
     (Nếu enable - khuyến nghị)

═══════════════════════════════════════════════════════
```

---

## ➕ BƯỚC 5: THÊM DOMAIN VÀO CLOUDFLARE

### **Trên Cloudflare Dashboard:**

```
1. Click "+ Add site"

2. Nhập domain:
   ┌────────────────────────────────────────┐
   │ Enter your site                        │
   │ ┌────────────────────────────────────┐ │
   │ │ hospital.vn                        │ │
   │ └────────────────────────────────────┘ │
   │                                        │
   │ [ Add site ]                           │
   └────────────────────────────────────────┘

3. Chọn plan:  FREE ✅
   ┌────────────────────────────────────────┐
   │ Select a plan                          │
   │                                        │
   │ ○ Enterprise ($$$)                     │
   │ ○ Business ($$)                        │
   │ ○ Pro ($)                              │
   │ ◉ Free ($0) ← Chọn cái này             │
   │                                        │
   │ [ Continue ]                           │
   └────────────────────────────────────────┘

4. Cloudflare sẽ scan DNS records hiện tại
   → Chờ ~30 giây

5. Review DNS records:
   ┌────────────────────────────────────────┐
   │ Cloudflare found these records:         │
   │                                        │
   │ [x] A     @    x.x.x. x                 │
   │ [x] A     www  x.x.x.x                 │
   │ [x] MX    @    mail.google.com         │
   │ [ ] ...                                 │
   │                                        │
   │ ⚠️  Verify tất cả records đúng!         │
   │                                        │
   │ [ Continue ]                           │
   └────────────────────────────────────────┘

6. Cloudflare sẽ cung cấp nameservers:
   ┌────────────────────────────────────────┐
   │ Change your nameservers                │
   │                                        │
   │ Remove:  ns1.tenten.vn                  │
   │         ns2.tenten.vn                  │
   │                                        │
   │ Add:     kate.ns.cloudflare.com         │
   │         mark.ns.cloudflare.com         │
   │                                        │
   │ ⚠️  GHI LẠI 2 NAMESERVERS NÀY!         │
   │                                        │
   │ [ Done, check nameservers ]            │
   └────────────────────────────────────────┘
```

### **📝 GHI LẠI NAMESERVERS:**

```
═══════════════════════════════════════════════════════
CLOUDFLARE NAMESERVERS
═══════════════════════════════════════════════════════

Nameserver 1: _____________________________________

Nameserver 2: _____________________________________

(Ví dụ: kate.ns.cloudflare.com, mark.ns.cloudflare.com)

═══════════════════════════════════════════════════════
```

---

## 🔧 BƯỚC 6: ĐỔI NAMESERVER TRÊN TENTEN

### **Quay lại TenTen. vn:**

```
1. Đăng nhập TenTen.vn

2. Vào "Quản lý tên miền"

3. Click vào domain (hospital.vn)

4. Click "Đổi Nameserver" hoặc "Change Nameserver"

5. Điền nameservers từ Cloudflare:
   ┌────────────────────────────────────────┐
   │ Nameserver 1:                          │
   │ ┌────────────────────────────────────┐ │
   │ │ kate.ns.cloudflare.com             │ │
   │ └────────────────────────────────────┘ │
   │                                        │
   │ Nameserver 2:                          │
   │ ┌────────────────────────────────────┐ │
   │ │ mark.ns.cloudflare. com             │ │
   │ └────────────────────────────────────┘ │
   │                                        │
   │ [ Xác nhận ]                           │
   └────────────────────────────────────────┘

6. Confirm thay đổi

7. Thông báo:
   "Nameserver đã được cập nhật.
    Thay đổi có thể mất 24-48 giờ để có hiệu lực."
```

---

## ⏰ BƯỚC 7: CHỜ DNS PROPAGATION

```
╔═══════════════════════════════════════════════════════════╗
║  DNS PROPAGATION = Quá trình cập nhật DNS toàn cầu         ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  Thời gian:   5 phút - 48 giờ                               ║
║  Thường:      1-4 giờ                                      ║
║                                                           ║
║  Trong khi chờ:                                           ║
║  • Domain có thể không truy cập được                      ║
║  • Hoặc vẫn trỏ về IP cũ                                  ║
║  • Một số nơi thấy mới, nơi khác thấy cũ                  ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

### **Kiểm tra propagation:**

```bash
# Cách 1: nslookup
nslookup -type=NS hospital.vn

# Output khi ĐÃ ĐỔI:
# hospital.vn  nameserver = kate.ns.cloudflare.com.
# hospital.vn  nameserver = mark.ns.cloudflare.com.

# Output khi CHƯA ĐỔI:
# hospital.vn  nameserver = ns1.tenten.vn.
# hospital. vn  nameserver = ns2.tenten.vn.

# Cách 2: Online tool
# https://www.whatsmydns.net/
# Nhập domain → Chọn NS (Nameserver)
# Xem propagation trên nhiều locations

# Cách 3: Cloudflare dashboard
# Cloudflare sẽ hiển thị status:
# ⏳ Pending nameserver update
# hoặc
# ✅ Active (khi đã xong)
```

---

## ✅ BƯỚC 8: VERIFY TRÊN CLOUDFLARE

### **Sau khi nameserver đã đổi (1-4 giờ):**

```
1. Login Cloudflare Dashboard

2. Vào site (hospital.vn)

3. Kiểm tra status:
   ┌────────────────────────────────────────┐
   │ hospital.vn                            │
   │                                        │
   │ Status:  ✅ Active                      │
   │                                        │
   │ Plan:  Free                             │
   │                                        │
   └────────────────────────────────────────┘

4. Nếu vẫn Pending:
   → Click "Re-check now"
   → Chờ thêm

5. Nếu Active:
   → Success! ✅
   → Có thể config Cloudflare Tunnel
```

---

## 🔧 BƯỚC 9: CẤU HÌNH DNS CƠ BẢN

### **Trên Cloudflare Dashboard → DNS:**

```
1. Click tab "DNS" → "Records"

2. Xem các records đã import:
   ┌──────────────────────────────────────────────────┐
   │ Type | Name | Content        | Proxy | TTL      │
   ├──────────────────────────────────────────────────┤
   │ A    | @    | x.x. x.x        | ☁️    | Auto     │
   │ A    | www  | x.x. x.x        | ☁️    | Auto     │
   │ MX   | @    | mail.google...  | DNS   | Auto     │
   └──────────────────────────────────────────────────┘

3. Giải thích Proxy status:
   ☁️ Proxied      = Traffic qua Cloudflare (DDoS protection, CDN)
   🌐 DNS only     = Chỉ DNS, không qua Cloudflare

4. Tạm thời GIỮ NGUYÊN records hiện tại
   (Sẽ config lại khi setup Cloudflare Tunnel)
```

---

## 🛠️ TROUBLESHOOTING

### **Nameserver không đổi sau 24h:**

```
1. Kiểm tra lại trên TenTen:
   → Vào Quản lý tên miền
   → Xem Nameserver có đúng không

2. Nếu sai → Đổi lại

3. Nếu đúng nhưng nslookup vẫn thấy cũ:
   → DNS cache trên máy bạn
   → Clear DNS cache:

   # Windows:
   ipconfig /flushdns

   # macOS:
   sudo dscacheutil -flushcache

   # Linux:
   sudo systemd-resolve --flush-caches

4. Thử nslookup với DNS server khác:
   nslookup hospital.vn 8.8.8.8
   nslookup hospital.vn 1.1.1.1
```

### **Domain không truy cập được sau đổi nameserver:**

```
⚠️ Bình thường!

Trong quá trình propagation (1-4 giờ), domain có thể:
• Không resolve được
• Trỏ về IP cũ
• Hoạt động bất ổn

→ CHỜ ít nhất 4 giờ
→ Kiểm tra trên https://www.whatsmydns.net/
```

### **Email không hoạt động sau đổi nameserver:**

```
Nguyên nhân: MX record chưa import đúng

Giải pháp:
1. Vào Cloudflare → DNS
2. Kiểm tra MX records
3. Nếu thiếu, thêm lại:
   Type: MX
   Name: @
   Mail server: (lấy từ backup)
   Priority: (lấy từ backup)
   TTL: Auto
   Proxy: DNS only (không proxied!)

4. Save và chờ propagation
```

---

## 📊 KIỂM TRA CUỐI CÙNG

```bash
# Checklist verify domain setup:

# 1. Nameserver đã đổi
nslookup -type=NS hospital.vn
# → Phải thấy cloudflare.com

# 2. A record resolve đúng
nslookup hospital.vn
# → Phải trả về IP

# 3. WWW redirect đúng
nslookup www.hospital.vn
# → Phải trả về IP

# 4. MX record (email)
nslookup -type=MX hospital.vn
# → Phải thấy mail server

# 5. Cloudflare dashboard
# → Status: Active ✅

# 6. Test từ nhiều locations
# → https://www.whatsmydns.net/
```

---

## 📋 REFERENCE: DNS RECORDS COMMON

### **A Record:**

```
Type: A
Name: @
Content: 192.168.1.243  (IP public của bạn)
Proxy:  Proxied (☁️) hoặc DNS only (🌐)
TTL: Auto
```

### **CNAME Record:**

```
Type: CNAME
Name: www
Content: hospital.vn
Proxy: Proxied (☁️)
TTL: Auto
```

### **MX Record (Email):**

```
Type: MX
Name: @
Mail server: aspmx.l.google.com  (ví dụ Google Workspace)
Priority: 1
Proxy: DNS only (🌐) - BẮT BUỘC
TTL: Auto
```

### **TXT Record (Verification):**

```
Type: TXT
Name: @
Content: "google-site-verification=abc123..."
TTL: Auto
```

---

## ✅ CHECKLIST HOÀN THÀNH

```
□ Đã đăng nhập TenTen.vn
□ Đã kiểm tra domain hiện tại
□ Đã backup DNS records cũ (nếu có)
□ Đã tạo tài khoản Cloudflare
□ Đã thêm domain vào Cloudflare
□ Đã ghi lại Cloudflare nameservers
□ Đã đổi nameserver trên TenTen
□ Đã đợi DNS propagation (1-4 giờ)
□ Nameserver đã verify (nslookup)
□ Cloudflare dashboard hiển thị Active ✅

⚠️  LƯU Ý QUAN TRỌNG:
═══════════════════════════════════════════════════════════

1. DNS A/CNAME RECORDS:
   ❌ KHÔNG cấu hình tại file này!
   ✅ Sẽ TỰ ĐỘNG tạo ở File 10 (Cloudflare Tunnel)

2. Sau khi hoàn thành file này:
   • Domain đã được add vào Cloudflare
   • Nameserver đã đổi sang Cloudflare
   • NHƯNG domain CHƯA trỏ đến đâu (chưa có DNS records)

3. Domain sẽ hoạt động sau khi:
   • File 09: Cấu hình Cloudflare (SSL, security)
   • File 10: Setup Cloudflare Tunnel
     → DNS records TỰ ĐỘNG tạo tại đây!
   • File 11-12: Deploy app

4. KHÔNG BAO GIỜ thêm DNS A record trỏ về 192.168.1.243
   → Đó là IP private, KHÔNG hoạt động từ Internet!

GHI NHỚ:
─────────
Domain:   hospital.vn
Nameserver: ns1.cloudflare.com, ns2.cloudflare.com
Status:   Active (nhưng chưa có DNS records)
Next:     File 09 → Cấu hình Cloudflare
□ Email vẫn hoạt động (nếu có)

GHI CHÚ:
Domain: ________________________________________
Cloudflare NS1: ________________________________
Cloudflare NS2: ________________________________
Status: Active ✅
Date active: ___________________________________

→ Sẵn sàng chuyển sang File 09-CLOUDFLARE-SETUP.md
```

---

**⏭️ TIẾP THEO: File 09-CLOUDFLARE-SETUP.md**
