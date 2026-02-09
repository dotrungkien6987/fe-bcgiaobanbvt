# 📘 PHẦN 24: SWITCH GUIDE - CHUYỂN ĐỔI GIỮA CF TUNNEL VÀ NGINX

> **📌 FILE NÀY DÙNG ĐỂ:**
>
> - 🔄 Chuyển nhanh giữa Cloudflare Tunnel và Nginx
> - 🚨 Emergency rollback khi một phương thức gặp sự cố
> - 📊 So sánh và quyết định dùng phương thức nào

---

## 🎯 KHI NÀO CẦN SWITCH?

```
╔═══════════════════════════════════════════════════════════════════════════╗
║  SCENARIOS CẦN SWITCH                                                     ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  SWITCH TỪ NGINX → CF TUNNEL (Rollback):                                 ║
║  ─────────────────────────────────────────                                ║
║  • Máy C gặp sự cố phần cứng                                             ║
║  • SSL certificate hết hạn và không renew được                           ║
║  • IT cần NAT port 80/443 đi chỗ khác tạm thời                          ║
║  • Nginx config bị lỗi và không fix được nhanh                          ║
║                                                                           ║
║  SWITCH TỪ CF TUNNEL → NGINX (Primary):                                  ║
║  ─────────────────────────────────────                                    ║
║  • Cloudflare service outage                                             ║
║  • Cần giảm latency                                                       ║
║  • Cần load balancing                                                     ║
║  • Sau khi fix xong vấn đề Nginx                                         ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

## 📋 QUICK REFERENCE

```
╔═══════════════════════════════════════════════════════════════════════════╗
║  QUICK SWITCH COMMANDS                                                    ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  SWITCH TO CF TUNNEL:                                                     ║
║  ────────────────────                                                     ║
║  1. Đổi DNS về Cloudflare CNAME                                          ║
║  2. ssh may-a && systemctl --user start cloudflared                      ║
║  3. Test: curl https://hospital.vn                                       ║
║                                                                           ║
║  SWITCH TO NGINX:                                                         ║
║  ────────────────                                                         ║
║  1. Đổi DNS về IP public (A record)                                      ║
║  2. ssh may-a && systemctl --user stop cloudflared                       ║
║  3. Test: curl https://hospital.vn                                       ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

## 🔧 SCRIPTS TỰ ĐỘNG HÓA

### **Tạo thư mục scripts trên Máy A:**

```bash
# SSH vào Máy A
ssh yourusername@192.168.1.243

# Tạo thư mục
mkdir -p ~/scripts
cd ~/scripts
```

### **Script 1: switch-to-cftunnel.sh**

```bash
nano ~/scripts/switch-to-cftunnel.sh
```

```bash
#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# Script: switch-to-cftunnel.sh
# Mục đích: Chuyển traffic về Cloudflare Tunnel (Emergency/Backup)
# Chạy trên: Máy A (192.168.1.243)
# ═══════════════════════════════════════════════════════════════════════════

set -e  # Exit on error

echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║  SWITCHING TO CLOUDFLARE TUNNEL                                            ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
echo ""

# ─────────────────────────────────────────────────────────────────────────────
# STEP 1: Check cloudflared installed
# ─────────────────────────────────────────────────────────────────────────────
echo "🔍 Checking cloudflared..."
if ! command -v cloudflared &> /dev/null; then
    echo "❌ ERROR: cloudflared not installed!"
    echo "   Please install cloudflared first."
    exit 1
fi
echo "✅ cloudflared found"

# ─────────────────────────────────────────────────────────────────────────────
# STEP 2: Check config exists
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "🔍 Checking config file..."
if [ ! -f ~/.cloudflared/config.yml ]; then
    echo "❌ ERROR: Config file not found at ~/.cloudflared/config.yml"
    exit 1
fi
echo "✅ Config file found"

# ─────────────────────────────────────────────────────────────────────────────
# STEP 3: Start Cloudflare Tunnel service
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "🚀 Starting Cloudflare Tunnel service..."
systemctl --user start cloudflared

# Wait a bit for service to start
sleep 3

# ─────────────────────────────────────────────────────────────────────────────
# STEP 4: Verify service running
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "🔍 Verifying service status..."
if systemctl --user is-active --quiet cloudflared; then
    echo "✅ Cloudflare Tunnel is RUNNING"
else
    echo "❌ ERROR: Service failed to start!"
    systemctl --user status cloudflared
    exit 1
fi

# ─────────────────────────────────────────────────────────────────────────────
# STEP 5: Reminder for DNS
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║  ⚠️  MANUAL STEP REQUIRED: UPDATE DNS                                     ║"
echo "╠═══════════════════════════════════════════════════════════════════════════╣"
echo "║                                                                           ║"
echo "║  1. Go to Cloudflare Dashboard (https://dash.cloudflare.com)             ║"
echo "║  2. Select domain: hospital.vn                                           ║"
echo "║  3. Go to DNS settings                                                    ║"
echo "║  4. Change records:                                                       ║"
echo "║     - hospital.vn → CNAME → [tunnel-id].cfargotunnel.com                ║"
echo "║     - api.hospital.vn → CNAME → [tunnel-id].cfargotunnel.com            ║"
echo "║  5. Enable Proxy (orange cloud)                                          ║"
echo "║                                                                           ║"
echo "║  Or at TenTen.vn (if not using CF for DNS):                              ║"
echo "║  Update nameservers to Cloudflare nameservers                            ║"
echo "║                                                                           ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "✅ Script completed! Remember to update DNS."
echo ""
echo "📊 Current status:"
systemctl --user status cloudflared --no-pager
```

```bash
# Make executable
chmod +x ~/scripts/switch-to-cftunnel.sh
```

### **Script 2: switch-to-nginx.sh**

```bash
nano ~/scripts/switch-to-nginx.sh
```

```bash
#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# Script: switch-to-nginx.sh
# Mục đích: Chuyển traffic về Nginx Reverse Proxy (Primary)
# Chạy trên: Máy A (192.168.1.243)
# ═══════════════════════════════════════════════════════════════════════════

set -e  # Exit on error

echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║  SWITCHING TO NGINX (MÁY C)                                               ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
echo ""

# ─────────────────────────────────────────────────────────────────────────────
# STEP 1: Check if Máy C is reachable
# ─────────────────────────────────────────────────────────────────────────────
MAYC_IP="192.168.1.250"  # ← Thay IP Máy C thực tế

echo "🔍 Checking connectivity to Máy C ($MAYC_IP)..."
if ping -c 1 $MAYC_IP &> /dev/null; then
    echo "✅ Máy C is reachable"
else
    echo "❌ ERROR: Cannot reach Máy C at $MAYC_IP"
    echo "   Please check network connectivity."
    exit 1
fi

# ─────────────────────────────────────────────────────────────────────────────
# STEP 2: Check Nginx on Máy C (requires SSH access)
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "🔍 Checking Nginx on Máy C..."
# Uncomment if you have SSH key setup to Máy C:
# if ssh yourusername@$MAYC_IP "systemctl is-active nginx" 2>/dev/null; then
#     echo "✅ Nginx is running on Máy C"
# else
#     echo "⚠️  WARNING: Cannot verify Nginx status on Máy C"
# fi

echo "ℹ️  Please manually verify Nginx is running on Máy C"
echo "   Command: ssh yourusername@$MAYC_IP 'systemctl status nginx'"

# ─────────────────────────────────────────────────────────────────────────────
# STEP 3: Stop Cloudflare Tunnel
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "🛑 Stopping Cloudflare Tunnel..."
if systemctl --user is-active --quiet cloudflared 2>/dev/null; then
    systemctl --user stop cloudflared
    echo "✅ Cloudflare Tunnel stopped"
else
    echo "ℹ️  Cloudflare Tunnel was not running"
fi

# ─────────────────────────────────────────────────────────────────────────────
# STEP 4: Verify tunnel stopped
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "🔍 Verifying Cloudflare Tunnel stopped..."
if ! systemctl --user is-active --quiet cloudflared 2>/dev/null; then
    echo "✅ Cloudflare Tunnel is STOPPED"
else
    echo "⚠️  WARNING: Tunnel might still be running"
fi

# ─────────────────────────────────────────────────────────────────────────────
# STEP 5: Reminder for DNS
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║  ⚠️  MANUAL STEP REQUIRED: UPDATE DNS                                     ║"
echo "╠═══════════════════════════════════════════════════════════════════════════╣"
echo "║                                                                           ║"
echo "║  1. Go to TenTen.vn (or your DNS provider)                               ║"
echo "║  2. Select domain: hospital.vn                                           ║"
echo "║  3. Update DNS records to A records:                                     ║"
echo "║     - hospital.vn     → A → [IP_PUBLIC_BENH_VIEN]                       ║"
echo "║     - www.hospital.vn → A → [IP_PUBLIC_BENH_VIEN]                       ║"
echo "║     - api.hospital.vn → A → [IP_PUBLIC_BENH_VIEN]                       ║"
echo "║  4. Set TTL to 300 (5 minutes)                                           ║"
echo "║                                                                           ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "✅ Script completed! Remember to update DNS."
```

```bash
# Make executable
chmod +x ~/scripts/switch-to-nginx.sh
```

### **Script 3: check-status.sh**

```bash
nano ~/scripts/check-status.sh
```

```bash
#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# Script: check-status.sh
# Mục đích: Kiểm tra trạng thái của cả 2 hệ thống
# ═══════════════════════════════════════════════════════════════════════════

MAYC_IP="192.168.1.250"  # ← Thay IP Máy C thực tế
DOMAIN="hospital.vn"     # ← Thay domain thực tế

echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║  SYSTEM STATUS CHECK                                                       ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
echo ""

# ─────────────────────────────────────────────────────────────────────────────
# CHECK 1: Local services on Máy A
# ─────────────────────────────────────────────────────────────────────────────
echo "📍 MÁY A (Local Services):"
echo "──────────────────────────────"

# React app
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "  ✅ React app    (port 3000) - RUNNING"
else
    echo "  ❌ React app    (port 3000) - NOT RESPONDING"
fi

# Backend
if curl -s http://localhost:8000 > /dev/null 2>&1; then
    echo "  ✅ Backend      (port 8000) - RUNNING"
else
    echo "  ❌ Backend      (port 8000) - NOT RESPONDING"
fi

# MongoDB
if mongosh --quiet --eval "db.runCommand('ping').ok" > /dev/null 2>&1; then
    echo "  ✅ MongoDB      (port 27017) - RUNNING"
else
    echo "  ❌ MongoDB      (port 27017) - NOT RESPONDING"
fi

# Cloudflare Tunnel
echo ""
echo "📍 CLOUDFLARE TUNNEL:"
echo "──────────────────────────────"
if systemctl --user is-active --quiet cloudflared 2>/dev/null; then
    echo "  ✅ cloudflared service - RUNNING"
else
    echo "  ⚪ cloudflared service - STOPPED"
fi

# ─────────────────────────────────────────────────────────────────────────────
# CHECK 2: Máy C (Nginx)
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "📍 MÁY C ($MAYC_IP):"
echo "──────────────────────────────"

if ping -c 1 $MAYC_IP > /dev/null 2>&1; then
    echo "  ✅ Network connectivity - OK"

    # Try to check Nginx via HTTP
    if curl -s http://$MAYC_IP > /dev/null 2>&1; then
        echo "  ✅ Nginx (port 80) - RESPONDING"
    else
        echo "  ⚪ Nginx (port 80) - NOT RESPONDING from here"
    fi
else
    echo "  ❌ Network connectivity - FAILED"
fi

# ─────────────────────────────────────────────────────────────────────────────
# CHECK 3: DNS Status
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "📍 DNS STATUS:"
echo "──────────────────────────────"
DNS_IP=$(nslookup $DOMAIN 2>/dev/null | grep -A1 "Name:" | grep "Address" | awk '{print $2}' | head -1)

if [ -n "$DNS_IP" ]; then
    echo "  Domain: $DOMAIN"
    echo "  Points to: $DNS_IP"

    # Detect which system is active
    if [[ "$DNS_IP" == *"cfargotunnel"* ]] || [[ "$DNS_IP" == "104."* ]] || [[ "$DNS_IP" == "172."* ]]; then
        echo "  🔵 Currently using: CLOUDFLARE TUNNEL"
    else
        echo "  🟢 Currently using: NGINX (direct IP)"
    fi
else
    echo "  ❌ Could not resolve DNS for $DOMAIN"
fi

# ─────────────────────────────────────────────────────────────────────────────
# CHECK 4: HTTPS Test (from Internet)
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "📍 HTTPS STATUS:"
echo "──────────────────────────────"
HTTPS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN 2>/dev/null || echo "000")

if [ "$HTTPS_STATUS" == "200" ]; then
    echo "  ✅ https://$DOMAIN - HTTP $HTTPS_STATUS"
elif [ "$HTTPS_STATUS" == "000" ]; then
    echo "  ❌ https://$DOMAIN - Connection failed"
else
    echo "  ⚠️  https://$DOMAIN - HTTP $HTTPS_STATUS"
fi

# ─────────────────────────────────────────────────────────────────────────────
# SUMMARY
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║  SUMMARY                                                                   ║"
echo "╠═══════════════════════════════════════════════════════════════════════════╣"
if systemctl --user is-active --quiet cloudflared 2>/dev/null; then
    echo "║  Active System: CLOUDFLARE TUNNEL                                        ║"
else
    echo "║  Active System: NGINX (Máy C)                                            ║"
fi
echo "║  Timestamp: $(date)                               ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
```

```bash
chmod +x ~/scripts/check-status.sh
```

---

## 📚 RUNBOOK: EMERGENCY PROCEDURES

### **Scenario 1: Nginx (Máy C) Down - Rollback to CF Tunnel**

```bash
# 1. SSH vào Máy A
ssh yourusername@192.168.1.243

# 2. Run switch script
~/scripts/switch-to-cftunnel.sh

# 3. Update DNS (manual step - see script output)
#    → Go to Cloudflare Dashboard
#    → Change to CNAME records

# 4. Wait 5-10 minutes for DNS propagation

# 5. Test
curl -I https://hospital.vn

# 6. Notify users
```

### **Scenario 2: Cloudflare Issue - Switch to Nginx**

```bash
# 1. SSH vào Máy A
ssh yourusername@192.168.1.243

# 2. Verify Máy C is ready
ssh yourusername@192.168.1.250 "systemctl status nginx"
# Phải running

# 3. Run switch script
~/scripts/switch-to-nginx.sh

# 4. Update DNS (manual step - see script output)
#    → Go to TenTen.vn
#    → Change to A records

# 5. Wait 5-10 minutes for DNS propagation

# 6. Test
curl -I https://hospital.vn

# 7. Notify users
```

### **Scenario 3: Both Systems Down - Full Troubleshoot**

```bash
# 1. Check status
~/scripts/check-status.sh

# 2. Fix Máy A services first
sudo systemctl status mongod
sudo systemctl restart mongod

pm2 status
pm2 restart all

# 3. Decide which route to use
#    - If Máy C up → use Nginx
#    - If Máy C down → use CF Tunnel

# 4. Follow appropriate scenario above
```

---

## 📊 DECISION MATRIX

```
╔═══════════════════════════════════════════════════════════════════════════╗
║  KHI NÀO DÙNG PHƯƠNG THỨC NÀO?                                           ║
╠══════════════════════════════════╦═══════════════╦════════════════════════╣
║  Tình huống                      ║ CF Tunnel     ║ Nginx (Máy C)         ║
╠══════════════════════════════════╬═══════════════╬════════════════════════╣
║  Normal operation                ║               ║ ✅ Primary             ║
║  Máy C down                      ║ ✅ Backup      ║                        ║
║  SSL cert issue on Máy C         ║ ✅ Backup      ║                        ║
║  Cloudflare outage               ║               ║ ✅ Use this            ║
║  Need load balancing             ║               ║ ✅ Only option         ║
║  Testing new config              ║ ✅ Safer       ║                        ║
║  IT maintenance on Máy C         ║ ✅ Use this    ║                        ║
║  High traffic expected           ║               ║ ✅ Better performance  ║
╚══════════════════════════════════╩═══════════════╩════════════════════════╝
```

---

## ✅ CHECKLIST

```
□ Scripts đã tạo trên Máy A:
  □ ~/scripts/switch-to-cftunnel.sh
  □ ~/scripts/switch-to-nginx.sh
  □ ~/scripts/check-status.sh
□ Scripts đã chmod +x
□ Đã test mỗi script (dry run)
□ Đã document IP thực tế trong scripts
□ Đã có access vào DNS management (TenTen/Cloudflare)
□ Emergency contacts documented

📌 CONTACTS:
──────────────────────────────
IT Support: ________________
DNS Login: ________________
Cloudflare: ________________
```

---

## 🔗 LIÊN KẾT

| Trước                                                      | Tiếp theo                                     |
| ---------------------------------------------------------- | --------------------------------------------- |
| [23-MIGRATION-CF-TO-NGINX.md](23-MIGRATION-CF-TO-NGINX.md) | [00-MUC-LUC.md](00-MUC-LUC.md) (Quay lại đầu) |

---

**🎉 HOÀN THÀNH PHASE 2 DOCUMENTATION!**

Bạn đã có đầy đủ hướng dẫn để:

1. ✅ Setup Máy C (File 21)
2. ✅ Cấu hình Nginx + SSL (File 22)
3. ✅ Migration từ CF Tunnel (File 23)
4. ✅ Scripts chuyển đổi nhanh (File 24)
