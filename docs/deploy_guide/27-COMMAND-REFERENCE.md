# 📘 PHẦN 27: COMMAND REFERENCE - TRA CỨU LỆNH NHANH

> **📌 MỤC ĐÍCH:**
>
> Tra cứu nhanh các lệnh thường dùng trong quản trị hệ thống

---

## 🐧 LINUX BASICS

### **File & Directory:**

```bash
# Navigation
pwd                          # Xem đường dẫn hiện tại
ls                           # List files
ls -la                       # List chi tiết + hidden files
cd /path/to/dir              # Change directory
cd ..                        # Up one level
cd ~                         # Home directory

# File operations
cp file1 file2               # Copy file
cp -r dir1 dir2              # Copy directory
mv file1 file2               # Move/rename
rm file                      # Delete file
rm -rf dir                   # Delete directory (⚠️ cẩn thận!)
mkdir dirname                # Create directory
mkdir -p a/b/c               # Create nested directories

# Viewing files
cat file                     # Xem toàn bộ file
less file                    # Xem với scroll
head -20 file                # Xem 20 dòng đầu
tail -20 file                # Xem 20 dòng cuối
tail -f file                 # Follow mode (realtime)

# Editing
nano file                    # Editor đơn giản
vim file                     # Editor powerful

# Permissions
chmod 755 file               # rwxr-xr-x
chmod 600 file               # rw-------
chown user:group file        # Change owner
chown -R user:group dir      # Recursive
```

### **Searching:**

```bash
# Find files
find /path -name "*.log"              # Tìm theo tên
find /path -type f -size +100M        # Files > 100MB
find /path -mtime -1                  # Modified trong 24h

# Search in files
grep "pattern" file                    # Tìm trong file
grep -r "pattern" /path/               # Tìm recursive
grep -i "pattern" file                 # Case insensitive
grep -E "pat1|pat2" file               # Multiple patterns
```

### **Disk & Memory:**

```bash
# Disk
df -h                        # Disk usage overview
du -sh /path                 # Size của folder
du -sh /* 2>/dev/null | sort -hr | head -10  # Top 10 folders

# Memory
free -h                      # RAM usage
top                          # Process monitor
htop                         # Better process monitor
```

### **Network:**

```bash
# Connections
ss -tuln                     # Listening ports
netstat -an                  # All connections
curl http://url              # HTTP request
wget http://url              # Download file
ping hostname                # Test connectivity
nslookup domain              # DNS lookup

# IP
ip a                         # Show IP addresses
ip r                         # Show routes
```

---

## 🔧 SYSTEMD (SERVICE MANAGEMENT)

```bash
# Status
systemctl status servicename
systemctl is-active servicename
systemctl is-enabled servicename

# Control
systemctl start servicename
systemctl stop servicename
systemctl restart servicename
systemctl reload servicename

# Enable/Disable on boot
systemctl enable servicename
systemctl disable servicename

# Logs
journalctl -u servicename
journalctl -u servicename -f         # Follow
journalctl -u servicename --since "1 hour ago"
journalctl -u servicename --since today

# Common services
sudo systemctl status mongod         # MongoDB
sudo systemctl status nginx          # Nginx
sudo systemctl status sshd           # SSH
sudo systemctl status ufw            # Firewall
systemctl --user status cloudflared  # CF Tunnel (user service)
```

---

## 🔥 UFW (FIREWALL)

```bash
# Status
sudo ufw status
sudo ufw status verbose
sudo ufw status numbered

# Enable/Disable
sudo ufw enable
sudo ufw disable

# Allow
sudo ufw allow 22                     # Allow port
sudo ufw allow 22/tcp                 # TCP only
sudo ufw allow from 192.168.1.0/24    # From subnet
sudo ufw allow from 192.168.1.100 to any port 22  # Specific IP

# Deny
sudo ufw deny 23
sudo ufw deny from 192.168.1.100

# Delete rule
sudo ufw delete allow 22
sudo ufw delete 3                     # By number

# Reset
sudo ufw reset
```

---

## 📦 PM2 (PROCESS MANAGER)

```bash
# Process management
pm2 start app.js                      # Start app
pm2 start app.js --name myapp         # With name
pm2 start ecosystem.config.js         # From config file
pm2 stop myapp                        # Stop
pm2 restart myapp                     # Restart
pm2 reload myapp                      # Zero-downtime reload
pm2 delete myapp                      # Remove from PM2
pm2 stop all                          # Stop all
pm2 restart all                       # Restart all

# Monitoring
pm2 list                              # List all processes
pm2 show myapp                        # Details
pm2 monit                             # Dashboard
pm2 logs                              # All logs
pm2 logs myapp                        # Specific app logs
pm2 logs myapp --err                  # Error logs only
pm2 logs --lines 200                  # Last 200 lines

# Maintenance
pm2 flush                             # Clear all logs
pm2 reset myapp                       # Reset restart count
pm2 save                              # Save process list
pm2 startup                           # Generate startup script
pm2 update                            # Update PM2 daemon
```

---

## 🍃 MONGODB

```bash
# Service
sudo systemctl start mongod
sudo systemctl stop mongod
sudo systemctl restart mongod
sudo systemctl status mongod

# Shell
mongosh                               # Connect to shell
mongosh --eval "db.stats()"           # Run command
mongosh --eval "db.serverStatus()"    # Server status

# Inside mongosh
show dbs                              # List databases
use dbname                            # Switch database
show collections                      # List collections
db.collection.find()                  # Query
db.collection.find().limit(10)        # Limit results
db.collection.countDocuments()        # Count
db.stats()                            # Database stats

# Backup/Restore
mongodump --out=/backup/              # Backup all
mongodump --db=mydb --out=/backup/    # Backup specific db
mongorestore /backup/                 # Restore all
mongorestore --db=mydb /backup/mydb/  # Restore specific db
```

---

## 🔒 SSH

```bash
# Connect
ssh user@hostname
ssh user@hostname -p 2222             # Custom port
ssh -i ~/.ssh/mykey user@hostname     # With key

# Key management
ssh-keygen -t ed25519                 # Generate key
ssh-copy-id user@hostname             # Copy key to server
cat ~/.ssh/id_ed25519.pub             # View public key

# Config file (~/.ssh/config)
# Host myserver
#     HostName 192.168.1.243
#     User myuser
#     Port 22
#     IdentityFile ~/.ssh/mykey

# Then connect with:
ssh myserver

# SCP (copy files)
scp file.txt user@host:/path/         # Upload
scp user@host:/path/file.txt ./       # Download
scp -r folder user@host:/path/        # Upload folder
```

---

## ☁️ CLOUDFLARE TUNNEL

```bash
# Service (user mode)
systemctl --user status cloudflared
systemctl --user start cloudflared
systemctl --user stop cloudflared
systemctl --user restart cloudflared

# Logs
journalctl --user -u cloudflared -f

# Tunnel management
cloudflared tunnel list
cloudflared tunnel info <tunnel-name>
cloudflared tunnel run <tunnel-name>

# Auth
cloudflared tunnel login
```

---

## 🌐 NGINX

```bash
# Service
sudo systemctl start nginx
sudo systemctl stop nginx
sudo systemctl restart nginx
sudo systemctl reload nginx           # Graceful reload

# Test config
sudo nginx -t

# Sites management
sudo ln -s /etc/nginx/sites-available/mysite /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/mysite  # Disable

# Logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 🔐 CERTBOT (SSL)

```bash
# Get certificate
sudo certbot --nginx -d domain.com
sudo certbot --nginx -d domain.com -d www.domain.com

# Renew
sudo certbot renew
sudo certbot renew --dry-run          # Test renewal
sudo certbot renew --force-renewal    # Force renew

# List certificates
sudo certbot certificates

# Delete certificate
sudo certbot delete --cert-name domain.com
```

---

## 📦 APT (PACKAGE MANAGER)

```bash
# Update
sudo apt update                       # Update package list
sudo apt upgrade                      # Upgrade packages
sudo apt full-upgrade                 # Full upgrade

# Install/Remove
sudo apt install package              # Install
sudo apt remove package               # Remove
sudo apt purge package                # Remove + config
sudo apt autoremove                   # Remove unused

# Search
apt search keyword                    # Search packages
apt show package                      # Package info

# Clean
sudo apt clean                        # Clean cache
sudo apt autoclean                    # Clean old cache
```

---

## 📊 NODE.JS & NPM

```bash
# Node version
node -v
npm -v

# NVM (Node Version Manager)
nvm ls                                # List installed versions
nvm install 20                        # Install Node 20
nvm use 20                            # Use Node 20
nvm alias default 20                  # Set default

# NPM
npm install                           # Install dependencies
npm install package                   # Install package
npm install -g package                # Install globally
npm update                            # Update packages
npm cache clean --force               # Clear cache
npm run build                         # Run build script
npm start                             # Start app
```

---

## 🔍 QUICK TROUBLESHOOTING

```bash
# System health
uptime                                # System uptime
df -h                                 # Disk space
free -h                               # Memory
top                                   # Processes

# Check what's using a port
sudo lsof -i :8000
sudo ss -tlnp | grep 8000

# Check what's using disk
sudo du -sh /* 2>/dev/null | sort -hr | head -10

# Check network connectivity
ping google.com
curl -I https://google.com

# Recent system logs
journalctl -xe
dmesg | tail -50
```

---

## 🔗 LIÊN KẾT

| Trước                              | Tiếp theo                      |
| ---------------------------------- | ------------------------------ |
| [26-EMERGENCY.md](26-EMERGENCY.md) | [28-SCRIPTS.md](28-SCRIPTS.md) |
