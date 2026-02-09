# 📘 PHẦN 9: CẤU HÌNH CLOUDFLARE

## 🎯 MỤC TIÊU

Sau phần này bạn sẽ:

- ✅ Cấu hình SSL/TLS trên Cloudflare
- ✅ Setup các security settings
- ✅ Optimize performance
- ✅ Chuẩn bị cho Cloudflare Tunnel
- ✅ Understand Cloudflare dashboard

```
╔═══════════════════════════════════════════════════════════╗
║  ⚠️  QUAN TRỌNG: File này CHỈ cấu hình Cloudflare          ║
║                                                           ║
║  DNS records sẽ TỰ ĐỘNG tạo ở File 10 (Cloudflare Tunnel)║
║  KHÔNG cấu hình DNS manual tại đây!                       ║
╚═══════════════════════════════════════════════════════════╝

LƯU Ý:
• File này cấu hình: SSL, Security, Cache, Performance
• DNS A/CNAME records: TỰ ĐỘNG tạo khi setup Tunnel (File 10)
• KHÔNG cần thêm DNS records manual
```

---

## 🔐 BƯỚC 1: CẤU HÌNH SSL/TLS

### **1. 1 - Chọn SSL Mode:**

```
Cloudflare Dashboard → SSL/TLS → Overview

┌─────────────────────────────────────────────────────────┐
│ SSL/TLS encryption mode                                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ○ Off (not secure)                                      │
│   → Không khuyến nghị ❌                                │
│                                                         │
│ ◉ Flexible ← CHỌN CÁI NÀY cho bây giờ                   │
│   → User ↔ Cloudflare:   HTTPS ✅                         │
│   → Cloudflare ↔ Server: HTTP                           │
│   → OK cho development                                  │
│                                                         │
│ ○ Full                                                  │
│   → Cả 2 đoạn HTTPS                                     │
│   → Server cần SSL cert (self-signed OK)                │
│                                                         │
│ ○ Full (strict)                                         │
│   → HTTPS + Cert phải valid                             │
│   → Production mode (sau này)                           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### **1.2 - Enable Always Use HTTPS:**

```
SSL/TLS → Edge Certificates

┌─────────────────────────────────────────────────────────┐
│ Always Use HTTPS                                        │
│ [x] Redirect all requests with scheme "http" to        │
│     "https"                                             │
└─────────────────────────────────────────────────────────┘

→ Toggle ON ✅
```

### **1.3 - Enable Automatic HTTPS Rewrites:**

```
SSL/TLS → Edge Certificates

┌─────────────────────────────────────────────────────────┐
│ Automatic HTTPS Rewrites                                │
│ [x] Help fix mixed content by changing "http"  to       │
│     "https" for resources on your site                  │
└─────────────────────────────────────────────────────────┘

→ Toggle ON ✅
```

### **1.4 - Minimum TLS Version:**

```
SSL/TLS → Edge Certificates

┌─────────────────────────────────────────────────────────┐
│ Minimum TLS Version                                     │
│ [ TLS 1.2 ▼]  ← Chọn TLS 1.2 (balanced security)       │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 BƯỚC 2: CẤU HÌNH SPEED/PERFORMANCE

### **2.1 - Enable Auto Minify:**

```
Speed → Optimization

┌─────────────────────────────────────────────────────────┐
│ Auto Minify                                             │
│                                                         │
│ [x] JavaScript                                          │
│ [x] CSS                                                 │
│ [x] HTML                                                │
│                                                         │
│ → Giảm file size, tăng tốc độ load                      │
└─────────────────────────────────────────────────────────┘
```

### **2.2 - Enable Brotli:**

```
Speed → Optimization

┌─────────────────────────────────────────────────────────┐
│ Brotli                                                  │
│ [x] Speeds up page load times for visitors by          │
│     applying Brotli compression                         │
└─────────────────────────────────────────────────────────┘

→ Toggle ON ✅
```

### **2.3 - Enable HTTP/2, HTTP/3:**

```
Network

┌─────────────────────────────────────────────────────────┐
│ HTTP/2                                                  │
│ [x] Enabled                                             │
│                                                         │
│ HTTP/3 (with QUIC)                                      │
│ [x] Enabled                                             │
└─────────────────────────────────────────────────────────┘
```

---

## 🛡️ BƯỚC 3: SECURITY SETTINGS

### **3.1 - Security Level:**

```
Security → Settings

┌─────────────────────────────────────────────────────────┐
│ Security Level                                          │
│                                                         │
│ ○ Essentially Off (enterprise only)                    │
│ ○ Low                                                   │
│ ◉ Medium  ← Recommended cho bây giờ                     │
│ ○ High                                                  │
│ ○ I'm Under Attack!   (khi bị DDoS)                      │
└─────────────────────────────────────────────────────────┘
```

### **3.2 - Challenge Passage:**

```
Security → Settings

┌─────────────────────────────────────────────────────────┐
│ Challenge Passage                                       │
│ [ 30 minutes ▼]                                         │
│                                                         │
│ → Sau khi user pass challenge, không hỏi lại trong 30m │
└─────────────────────────────────────────────────────────┘
```

### **3.3 - Bot Fight Mode (Free Plan):**

```
Security → Bots

┌─────────────────────────────────────────────────────────┐
│ Bot Fight Mode                                          │
│ [x] Block bad bots                                      │
└─────────────────────────────────────────────────────────┘

→ Toggle ON ✅
```

---

## 🔥 BƯỚC 4: FIREWALL RULES (OPTIONAL)

### **Tạo rule block countries (nếu cần):**

```
Security → WAF → Firewall rules

Click "Create firewall rule"

┌─────────────────────────────────────────────────────────┐
│ Rule name:  Block non-Vietnam                            │
│                                                         │
│ When incoming requests match:                            │
│   Field:      [Country ▼]                                │
│   Operator:  [does not equal ▼]                         │
│   Value:     [VN]                                       │
│                                                         │
│ Then take action:                                       │
│   [Block ▼]                                             │
│                                                         │
│ [ Save and Deploy ]                                     │
└─────────────────────────────────────────────────────────┘

⚠️ CHỈ BẬT NẾU APP CHỈ DÙNG TRONG NƯỚC!
```

---

## 📊 BƯỚC 5: CACHING

### **5.1 - Caching Level:**

```
Caching → Configuration

┌─────────────────────────────────────────────────────────┐
│ Caching Level                                           │
│                                                         │
│ ○ No Query String                                       │
│ ◉ Standard  ← Recommended                               │
│ ○ Ignore Query String                                   │
└─────────────────────────────────────────────────────────┘
```

### **5.2 - Browser Cache TTL:**

```
Caching → Configuration

┌─────────────────────────────────────────────────────────┐
│ Browser Cache TTL                                       │
│ [ 4 hours ▼]                                            │
│                                                         │
│ → Thời gian browser cache static files                  │
└─────────────────────────────────────────────────────────┘
```

### **5.3 - Development Mode (khi dev):**

```
Caching → Configuration

┌─────────────────────────────────────────────────────────┐
│ Development Mode                                        │
│ [ ] Temporarily bypass cache (3 hours)                  │
│                                                         │
│ → Bật khi đang dev, tắt khi production                  │
└─────────────────────────────────────────────────────────┘

Khi dev:   Toggle ON → Cache tạm thời disabled
Khi done: Toggle OFF → Cache hoạt động lại
```

### **5.4 - Purge Cache:**

```
Caching → Configuration

┌─────────────────────────────────────────────────────────┐
│ Purge Cache                                             │
│                                                         │
│ [ Purge Everything ]    ← Xóa toàn bộ cache            │
│ [ Custom Purge ]        ← Xóa URLs cụ thể              │
└─────────────────────────────────────────────────────────┘

Dùng khi:  Deploy code mới, cần clear cache ngay
```

---

## 🌐 BƯỚC 6: PAGE RULES (ADVANCED - OPTIONAL)

### **Tạo rule cho API (không cache):**

```
Rules → Page Rules → Create Page Rule

┌─────────────────────────────────────────────────────────┐
│ If the URL matches:                                     │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ api.hospital.vn/*                                   │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Then the settings are:                                   │
│ + Add a Setting                                         │
│   [Cache Level ▼] = [Bypass]                            │
│                                                         │
│ [ Save and Deploy ]                                     │
└─────────────────────────────────────────────────────────┘

→ API không bị cache
→ Always get fresh data
```

---

## 📱 BƯỚC 7: MOBILE OPTIMIZATION (OPTIONAL)

```
Speed → Optimization

┌─────────────────────────────────────────────────────────┐
│ Mirage                                                  │
│ [ ] Optimize image loading for mobile                  │
│                                                         │
│ → Pro plan feature (skip for now)                       │
└─────────────────────────────────────────────────────────┘
```

---

## 🔍 BƯỚC 8: ANALYTICS & MONITORING

### **8.1 - Web Analytics:**

```
Analytics & Logs → Web Analytics

┌─────────────────────────────────────────────────────────┐
│ Web Analytics (Beta)                                    │
│                                                         │
│ [Enable Web Analytics]                                  │
│                                                         │
│ → Free, privacy-friendly analytics                      │
│ → Alternative to Google Analytics                       │
└─────────────────────────────────────────────────────────┘

Click Enable → Lấy tracking code
```

### **8.2 - Traffic Analytics:**

```
Analytics & Logs → Traffic

Xem:
├─ Requests (số lượng requests)
├─ Bandwidth (data transferred)
├─ Unique visitors
├─ Threats blocked
└─ Status codes (200, 404, 500, etc.)

→ Dữ liệu 24h gần nhất (Free plan)
```

---

## 🎨 BƯỚC 9: CUSTOM PAGES (OPTIONAL)

### **Custom error pages:**

```
Custom Pages

┌─────────────────────────────────────────────────────────┐
│ 500 Internal Server Error                               │
│ [ Customize ]                                           │
│                                                         │
│ 502 Bad Gateway                                         │
│ [ Customize ]                                           │
│                                                         │
│ 503 Service Temporarily Unavailable                     │
│ [ Customize ]                                           │
└─────────────────────────────────────────────────────────┘

→ Có thể customize error pages
→ Skip for now, dùng default
```

---

## 🧪 BƯỚC 10: VERIFY NAMESERVER & DNS STATUS

```
╔═══════════════════════════════════════════════════════════╗
║  ⚠️ QUAN TRỌNG: Ở bước này domain CHƯA LOAD được!         ║
║                                                           ║
║  File 09 CHỈ đổi nameserver → Cloudflare quản lý DNS      ║
║  File 10 mới setup Tunnel → Tạo DNS records → Load được   ║
║                                                           ║
║  → Domain không load là BÌNH THƯỜNG ✅                     ║
╚═══════════════════════════════════════════════════════════╝
```

### **10.1 - Test Nameserver (BẮT BUỘC):**

```bash
# Từ máy tính bất kỳ (Windows/macOS/Linux)

# Test nameserver đã đổi chưa
nslookup -type=NS bvdktphutho.io.vn

# Output mong đợi:
# Server: 8.8.8.8 (hoặc DNS server của bạn)
# Address: 8.8.8.8#53
#
# Non-authoritative answer:
# bvdktphutho.io.vn    nameserver = piotr.ns.cloudflare.com.
# bvdktphutho.io.vn    nameserver = melany.ns.cloudflare.com.
#                       ↑↑↑↑↑ Phải thấy Cloudflare nameservers!

✅ Nếu thấy Cloudflare nameservers → Hoàn thành File 09!
❌ Nếu vẫn thấy nameserver cũ → Chờ 1-2 giờ, test lại
```

**⚠️ Lưu ý DNS propagation:**

- Nameserver change có thể mất **2-48 giờ** để propagate toàn cầu
- Nếu chưa thấy Cloudflare nameservers:
  - Chờ thêm 1-2 giờ
  - Clear DNS cache (xem bên dưới)
  - Thử lại

### **10.2 - Verify DNS Records = Trống (Expected):**

```
Cloudflare Dashboard → DNS → Records

┌────────────────────────────────────────────────┐
│ DNS Records for bvdktphutho.io.vn              │
├────────────────────────────────────────────────┤
│                                                │
│ No DNS records found                           │
│                                                │
│ ← ✅ ĐÂY LÀ ĐÚNG!                               │
│    File 09 chưa tạo DNS records                │
│    File 10 mới tạo                             │
└────────────────────────────────────────────────┘
```

### **10.3 - Test Domain Load (Expected: FAIL):**

```
Mở browser, truy cập:
https://bvdktphutho.io.vn

KỲ VỌNG:
========

❌ "This site can't be reached" ← ✅ BÌNH THƯỜNG!
❌ "DNS_PROBE_FINISHED_NXDOMAIN" ← ✅ BÌNH THƯỜNG!
❌ "Server not found" ← ✅ BÌNH THƯỜNG!

Tại sao?
========

1. Nameserver đã trỏ về Cloudflare ✅
2. NHƯNG Cloudflare DNS chưa có records ❌
3. → Browser không biết IP nào để connect
4. → Domain không load

→ ĐÂY LÀ EXPECTED! KHÔNG PHẢI LỖI!

Khi nào load được?
==================

Sau khi hoàn thành File 10:
• Setup Cloudflare Tunnel
• Add Public Hostname (BƯỚC 5)
• Cloudflare TỰ ĐỘNG tạo DNS records
• → Domain mới load được! ✅
```

### **10.4 - Checklist Hoàn Thành File 09:**

```
✅ Domain đã add vào Cloudflare account:
   □ Dashboard → Websites → Thấy bvdktphutho.io.vn ✅
   □ Status: Active ✅

✅ Nameserver đã đổi thành Cloudflare:
   □ nslookup -type=NS → Thấy Cloudflare nameservers ✅
   □ piotr.ns.cloudflare.com ✅
   □ melany.ns.cloudflare.com ✅

✅ DNS Records = Trống (expected):
   □ Cloudflare Dashboard → DNS → No records ✅

✅ Domain không load (expected):
   □ Browser → "site can't be reached" ✅
   □ ĐÂY LÀ BÌNH THƯỜNG! Chờ File 10 ✅

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 HOÀN THÀNH FILE 09!

⏭️ TIẾP TỤC: File 10-CLOUDFLARE-TUNNEL.md
   → Setup tunnel
   → Tạo DNS records TỰ ĐỘNG
   → Domain sẽ load được! ✅

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 📧 BƯỚC 11: EMAIL ROUTING (OPTIONAL)

### **Nếu muốn email forwarding:**

```
Email → Email Routing

┌─────────────────────────────────────────────────────────┐
│ Route emails to your personal inbox                     │
│                                                         │
│ Forward:  admin@hospital.vn                              │
│ To:       your.email@gmail.com                           │
│                                                         │
│ [ Enable Email Routing ]                                │
└─────────────────────────────────────────────────────────┘

→ Free email forwarding
→ Không cần mail server
```

---

## 🛠️ TROUBLESHOOTING

### **Nameserver chưa đổi:**

```bash
# Check nameserver status
nslookup -type=NS bvdktphutho.io.vn

# Nếu vẫn thấy nameserver cũ:
# → Chờ 1-2 giờ (DNS propagation)
# → Clear DNS cache (xem bên dưới)

# Verify trên online tool:
# https://www.whatsmydns.net/
# → Nhập: bvdktphutho.io.vn
# → Type: NS
# → Check global propagation status
```

### **Clear DNS Cache:**

```bash
# Windows
ipconfig /flushdns

# macOS
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder

# Linux (systemd-resolved)
sudo systemd-resolve --flush-caches

# Linux (nscd)
sudo /etc/init.d/nscd restart

# Browser cache
# Chrome: chrome://net-internals/#dns → Clear host cache
# Firefox: about:networking#dns → Clear DNS Cache
```

### **Too Many Redirects Error:**

```
Nguyên nhân: SSL mode sai

Giải pháp:
SSL/TLS → Overview → Encryption mode
→ Đổi thành "Flexible"
→ Chờ 5 phút
→ Clear browser cache
→ Thử lại
```

### **Mixed Content Warnings:**

```
Nguyên nhân: Page có resources load qua HTTP

Giải pháp:
SSL/TLS → Edge Certificates
→ Enable "Automatic HTTPS Rewrites"
→ Purge Cache
→ Reload page
```

### **Cache not working:**

```
Kiểm tra:
1.  Caching → Configuration → Caching Level = Standard
2. Development Mode = OFF
3. Check response headers:
   curl -I https://hospital.vn
   → Tìm header:  cf-cache-status:  HIT
```

### **Site slow sau khi bật Cloudflare:**

```
Nguyên nhân: Cache chưa warm up

Giải pháp:
1.  Chờ 24h cho cache build up
2. Enable:
   - Brotli
   - Auto Minify
   - HTTP/3
3. Purge cache và reload
4. Check Argo Smart Routing (paid feature)
```

---

## 📊 BEST PRACTICES

### **Recommended settings cho production:**

```yaml
SSL/TLS:
  Encryption mode: Full (strict) # Sau khi có SSL cert trên server
  Always Use HTTPS: ON
  Automatic HTTPS Rewrites: ON
  Minimum TLS: 1.2

Speed:
  Auto Minify: JS, CSS, HTML = ON
  Brotli: ON
  HTTP/2: ON
  HTTP/3: ON

Security:
  Security Level: Medium
  Bot Fight Mode: ON
  Challenge Passage: 30 minutes

Caching:
  Caching Level: Standard
  Browser Cache TTL: 4 hours
  Development Mode: OFF (production)

Page Rules:
  - API endpoints: Cache Level = Bypass
  - Static assets: Cache Level = Cache Everything
```

---

## ✅ CHECKLIST HOÀN THÀNH

```
□ SSL/TLS Mode:   Flexible ✅
□ Always Use HTTPS:  ON ✅
□ Auto Minify:  ON ✅
□ Brotli: ON ✅
□ HTTP/2:  ON ✅
□ HTTP/3: ON ✅
□ Security Level:   Medium ✅
□ Bot Fight Mode: ON ✅
□ Caching Level:  Standard ✅
□ Development Mode: OFF ✅
□ Test domain: https://hospital.vn load được ✅
□ SSL hoạt động (ổ khóa xanh 🔒) ✅
□ Response headers có "server: cloudflare" ✅
□ Đã check Analytics có data

SETTINGS SUMMARY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Domain: hospital.vn
Status: Active ✅
SSL Mode: Flexible
Proxied: Yes (☁️)
Analytics: Enabled
Cache Status: Working

→ Sẵn sàng chuyển sang File 10-CLOUDFLARE-TUNNEL. md
```

---

**⏭️ TIẾP THEO: File 10-CLOUDFLARE-TUNNEL.md**
