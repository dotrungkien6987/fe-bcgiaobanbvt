# 📘 PHẦN 14:  QUẢN LÝ ENVIRONMENT VARIABLES

## 🎯 MỤC TIÊU

Sau phần này bạn sẽ:    
- ✅ Hiểu environment variables và tại sao quan trọng
- ✅ Quản lý . env files an toàn
- ✅ Separate configs cho dev/staging/production
- ✅ Best practices cho secrets management
- ✅ Update env vars không downtime

---

## 🔐 ENVIRONMENT VARIABLES LÀ GÌ?

```
Environment Variables = Biến môi trường
                      = Config values bên ngoài code
                      = Thay đổi được theo môi trường

╔═══════════════════════════════════════════════════════════╗
║  TẠI SAO KHÔNG NÊN HARDCODE:                               ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  ❌ const dbUrl = "mongodb://admin:pass123@localhost"     ║
║                                                           ║
║  Vấn đề:                                                  ║
║  • Password lộ trong code                                 ║
║  • Khó thay đổi (phải sửa code, rebuild)                  ║
║  • Dev và Production dùng chung config                    ║
║  • Git history chứa secrets                               ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

╔═══════════════════════════════════════════════════════════╗
║  NÊN DÙNG ENV VARS:                                         ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  ✅ const dbUrl = process.env. MONGODB_URI                 ║
║                                                           ║
║  Ưu điểm:                                                 ║
║  • Secrets không trong code                               ║
║  • Dễ thay đổi (không cần rebuild)                        ║
║  • Dev, Staging, Production khác config                   ║
║  • .  env file không commit vào Git                         ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

---

## 📂 BƯỚC 1: REVIEW CURRENT . ENV FILES

```bash
# SSH vào server
ssh youruser@192.168.1.243

# Backend . env
cd ~/projects/backend
cat .env

# Frontend .env
cd ~/projects/frontend
cat .env

# ⚠️ QUAN TRỌNG:   Verify . env files có trong . gitignore
cat ~/projects/backend/.gitignore | grep . env
cat ~/projects/frontend/. gitignore | grep .env

# Output phải có:
# . env
# .env.local
# .env.*. local
```

---

## 🔐 BƯỚC 2: SECURE . ENV FILES

```bash
# Set permissions (chỉ owner đọc được)
chmod 600 ~/projects/backend/.env
chmod 600 ~/projects/frontend/.env

# Verify
ls -la ~/projects/backend/.env
ls -la ~/projects/frontend/.env

# Output:
# -rw------- 1 user user 1234 Dec 26 12:00 .env
#  ↑ rw- cho owner, --- cho group và others
```

---

## 📋 BƯỚC 3: ENVIRONMENT-SPECIFIC CONFIGS

### **3.1 - Backend multi-environment setup:**

```bash
cd ~/projects/backend

# Tạo các file env cho từng môi trường
nano .env.example
```

```bash
# ──────────────────────────────────────────────────────────
# FILE: .env.example (Template - commit vào Git)
# ──────────────────────────────────────────────────────────

# Environment
NODE_ENV=production

# Server
PORT=8000
HOST=localhost

# Database
MONGODB_URI=mongodb://user:password@localhost:27017/dbname? authSource=admin&replicaSet=rs0

# JWT
JWT_SECRET=change-this-secret-key
JWT_EXPIRE=7d

# CORS
FRONTEND_URL=https://yourdomain.com
ALLOWED_ORIGINS=https://yourdomain.com,https://api.yourdomain.com

# API
API_BASE_URL=https://api.yourdomain.com

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# Email (optional)
SMTP_HOST=smtp.gmail. com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Firebase (optional)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

# Logging
LOG_LEVEL=info

# ──────────────────────────────────────────────────────────
```

```bash
# Tạo . env.development (local development)
nano .env.development
```

```bash
# ──────────────────────────────────────────────────────────
# FILE: . env.development
# ──────────────────────────────────────────────────────────

NODE_ENV=development
PORT=8000
HOST=localhost

MONGODB_URI=mongodb://appuser:devpassword@localhost:27017/ticketdb_dev?authSource=admin

JWT_SECRET=dev-secret-not-secure
JWT_EXPIRE=30d

FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000

API_BASE_URL=http://localhost:8000

LOG_LEVEL=debug

# ──────────────────────────────────────────────────────────
```

```bash
# Tạo . env.production (production - server)
nano .env.production
```

```bash
# ──────────────────────────────────────────────────────────
# FILE: .env.production
# ──────────────────────────────────────────────────────────

NODE_ENV=production
PORT=8000
HOST=localhost

MONGODB_URI=mongodb://appuser: STRONG_PASSWORD@localhost:27017/ticketdb? authSource=admin&replicaSet=rs0

JWT_SECRET=SUPER_STRONG_SECRET_KEY_CHANGE_THIS
JWT_EXPIRE=7d

FRONTEND_URL=https://hospital.vn
ALLOWED_ORIGINS=https://hospital.vn,https://api.hospital.vn

API_BASE_URL=https://api.hospital.vn

LOG_LEVEL=info

# ──────────────────────────────────────────────────────────
```

```bash
# Set permissions
chmod 600 .env.*

# Symlink . env → .env.production (production server)
ln -sf .env.production .env

# Verify
ls -la . env
# Output:  . env -> .env.production
```

### **3.2 - Frontend multi-environment setup:**

```bash
cd ~/projects/frontend

# Create env files
nano .env.development
```

```bash
# ──────────────────────────────────────────────────────────
# FILE: .env.development
# ──────────────────────────────────────────────────────────

REACT_APP_ENV=development
REACT_APP_API_URL=http://localhost:8000
REACT_APP_WS_URL=ws://localhost:8000

REACT_APP_NAME=Hospital System (Dev)
REACT_APP_VERSION=1.0.0-dev

REACT_APP_ENABLE_PWA=false
REACT_APP_ENABLE_NOTIFICATIONS=false

# ──────────────────────────────────────────────────────────
```

```bash
nano .env.production
```

```bash
# ──────────────────────────────────────────────────────────
# FILE: . env.production
# ──────────────────────────────────────────────────────────

REACT_APP_ENV=production
REACT_APP_API_URL=https://api.hospital.vn
REACT_APP_WS_URL=wss://api.hospital.vn

REACT_APP_NAME=Hospital Ticket System
REACT_APP_VERSION=1.0.0

REACT_APP_ENABLE_PWA=true
REACT_APP_ENABLE_NOTIFICATIONS=true

# Firebase (sẽ config sau)
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
REACT_APP_FIREBASE_VAPID_KEY=

# ──────────────────────────────────────────────────────────
```

```bash
# Symlink
ln -sf .env.production . env

# Set permissions
chmod 600 .env.*
```

---

## 🔄 BƯỚC 4: UPDATE ENV VARS KHÔNG DOWNTIME

### **4.1 - Update backend env:**

```bash
cd ~/projects/backend

# Edit .env
nano .env

# Thay đổi values cần thiết
# Save:  Ctrl+O → Enter → Ctrl+X

# Reload PM2 với env mới (zero-downtime nếu cluster mode)
pm2 reload backend --update-env

# Hoặc restart (có downtime ngắn)
pm2 restart backend --update-env

# Verify env loaded
pm2 describe backend | grep -A 10 "env"
```

### **4.2 - Update frontend env (cần rebuild):**

```bash
cd ~/projects/frontend

# Edit .env
nano .env

# Rebuild
npm run build

# Restart PM2
pm2 restart frontend

# Verify
curl https://hospital.vn | grep "REACT_APP"
# (không nên thấy REACT_APP_ trong production build)
```

---

## 🛡️ BƯỚC 5: SECRETS MANAGEMENT

### **5.1 - Generate strong secrets:**

```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Output: 
# a1b2c3d4e5f6...  (128 characters)

# Generate MongoDB password
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Output:
# AbCdEfGh123...  (base64 encoded)
```

### **5.2 - Store secrets securely:**

```bash
# Tạo file riêng chứa secrets (KHÔNG commit Git)
nano ~/.  secrets/hospital-app
```

```bash
# ──────────────────────────────────────────────────────────
# FILE: ~/. secrets/hospital-app
# ──────────────────────────────────────────────────────────

# MongoDB
MONGODB_ADMIN_PASSWORD=... 
MONGODB_APP_PASSWORD=...

# JWT
JWT_SECRET=... 

# Firebase
FIREBASE_PRIVATE_KEY=... 

# Email
SMTP_PASSWORD=...

# Backup Password
BACKUP_ENCRYPTION_KEY=...

# ──────────────────────────────────────────────────────────
```

```bash
# Secure file
chmod 600 ~/.secrets/hospital-app

# Backup encrypted
gpg --symmetric --cipher-algo AES256 ~/. secrets/hospital-app

# → Tạo file ~/. secrets/hospital-app.gpg
# → Backup file . gpg này ra USB/Cloud
```

### **5.3 - Environment variables checklist:**

```
╔═══════════════════════════════════════════════════════════╗
║  SECRETS CHECKLIST:                                        ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  □ Passwords có ít nhất 32 characters                     ║
║  □ JWT secret có ít nhất 64 characters                    ║
║  □ . env files có permissions 600                          ║
║  □ .  env files trong .gitignore                            ║
║  □ . env.example không chứa secrets thật                   ║
║  □ Secrets backup encrypted                               ║
║  □ Rotate secrets mỗi 3-6 tháng                           ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

---

## 📝 BƯỚC 6: VALIDATION & DEBUGGING

### **6.1 - Validate env vars trong code:**

```javascript
// backend/src/config/validateEnv.js

const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'MONGODB_URI',
  'JWT_SECRET',
  'FRONTEND_URL'
];

function validateEnv() {
  const missing = [];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }
  
  if (missing. length > 0) {
    console.error('❌ Missing required environment variables: ');
    missing.forEach(v => console.error(`   - ${v}`));
    process.exit(1);
  }
  
  // Validate formats
  if (! process.env. MONGODB_URI.startsWith('mongodb://')) {
    console.error('❌ Invalid MONGODB_URI format');
    process.exit(1);
  }
  
  if (process.env.JWT_SECRET.length < 32) {
    console.error('⚠️  Warning: JWT_SECRET should be at least 32 characters');
  }
  
  console.log('✅ Environment variables validated');
}

module.exports = validateEnv;
```

```javascript
// backend/server.js

require('dotenv').config();
const validateEnv = require('./src/config/validateEnv');

// Validate env trước khi start app
validateEnv();

// ... rest of server code
```

### **6.2 - Debug env vars:**

```bash
# Print all env vars (CHỈ DÙNG KHI DEBUG!)
pm2 describe backend | grep -A 50 "env"

# Hoặc trong code:
node -e "console.log(process.env)" | grep MONGODB

# Kiểm tra env specific
pm2 start ecosystem.config.js --env production
pm2 logs backend | grep "Environment:"
```

---

## 🔄 BƯỚC 7: DEPLOYMENT WORKFLOW

### **Deploy script với env management:**

```bash
nano ~/deploy-all.sh
```

```bash
#!/bin/bash
# ──────────────────────────────────────────────────────────
# FILE: deploy-all.sh
# ──────────────────────────────────────────────────────────

set -e  # Exit on error

ENV=${1:-production}  # Default to production

echo "🚀 Deploying with environment: $ENV"

# Backend
echo "📦 Deploying Backend..."
cd ~/projects/backend

git pull origin main

# Use correct env file
if [ -f ". env.$ENV" ]; then
  ln -sf .env.$ENV .env
  echo "✅ Using . env.$ENV"
else
  echo "⚠️  . env.$ENV not found, using default . env"
fi

npm install
pm2 reload backend --update-env

# Frontend
echo "📦 Deploying Frontend..."
cd ~/projects/frontend

git pull origin main

# Use correct env file
if [ -f ".env.$ENV" ]; then
  ln -sf .env.$ENV .env
  echo "✅ Using .env.$ENV"
else
  echo "⚠️  .env.$ENV not found, using default .env"
fi

npm install
npm run build
pm2 restart frontend

# Status
echo "📊 PM2 Status:"
pm2 status

echo "✅ Deployment complete!"
echo "🌐 Frontend: https://hospital.vn"
echo "🌐 Backend:   https://api.hospital.vn"

# ──────────────────────────────────────────────────────────
```

```bash
# Make executable
chmod +x ~/deploy-all.sh

# Usage: 
~/deploy-all.sh                  # Deploy với production env
~/deploy-all.sh development      # Deploy với development env
~/deploy-all.sh staging          # Deploy với staging env
```

---

## 🛠️ TROUBLESHOOTING

### **Env vars không load:**

```bash
# 1. Verify .env file tồn tại
ls -la ~/projects/backend/.env

# 2. Check permissions
ls -la ~/projects/backend/.env
# Phải là -rw------- (600)

# 3. Verify dotenv được load
# Trong code:
console.log('ENV loaded:', !!process.env. MONGODB_URI);

# 4. Check PM2 có load env không
pm2 describe backend | grep "env"

# 5. Restart với --update-env
pm2 restart backend --update-env
```

### **Wrong environment được load:**

```bash
# Check symlink
ls -la ~/projects/backend/.env

# Output:
# . env -> .env.production  ← Phải trỏ đúng

# Nếu sai:
ln -sf .env.production .env

# Restart
pm2 restart backend --update-env
```

### **Secrets lộ trong logs:**

```bash
# Kiểm tra logs
pm2 logs backend | grep -i password
pm2 logs backend | grep -i secret

# Nếu thấy secrets trong logs: 
# → Fix code, không log secrets
# → Clear logs:   pm2 flush

# Best practice:  Mask secrets trong logs
console.log('MongoDB URI:', process.env.MONGODB_URI. replace(/\/\/[^: ]+:[^@]+@/, '//****: ****@'));
```

---

## 📚 BEST PRACTICES

```
╔═══════════════════════════════════════════════════════════╗
║  ENV VARS BEST PRACTICES:                                  ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  ✅ DO:                                                    ║
║  • Use . env files (never hardcode)                        ║
║  • Separate envs (dev, staging, prod)                     ║
║  • Use strong secrets (64+ chars)                         ║
║  • Set permissions 600                                    ║
║  • Add . env to .gitignore                                 ║
║  • Provide . env.example (no secrets)                      ║
║  • Validate env vars on startup                           ║
║  • Rotate secrets regularly                               ║
║  • Backup secrets encrypted                               ║
║                                                           ║
║  ❌ DON'T:                                                 ║
║  • Commit . env to Git                                     ║
║  • Share secrets in Slack/Email                           ║
║  • Use weak passwords                                     ║
║  • Log secrets                                            ║
║  • Hardcode secrets in code                               ║
║  • Use same secrets for dev/prod                          ║
║  • Store secrets in plain text                            ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

---

## ✅ CHECKLIST HOÀN THÀNH

```
□ Backend . env file đã cấu hình
□ Frontend .env file đã cấu hình
□ . env files có permissions 600
□ . env trong .gitignore
□ . env.example đã tạo (no secrets)
□ Multi-environment files tạo (. env.development, .env.production)
□ Secrets được generate strong (64+ chars)
□ Secrets backup encrypted
□ Env validation trong code
□ PM2 load env correctly (pm2 describe)
□ Deploy script với env management
□ Tested env vars update (pm2 reload --update-env)

GHI CHÚ: 
Backend env:   ~/projects/backend/.env → . env.production
Frontend env: ~/projects/frontend/.env → .env.production

Secrets backup:  ~/. secrets/hospital-app. gpg

Deploy script: ~/deploy-all.sh
Usage:   ~/deploy-all.sh [production|development|staging]

→ Sẵn sàng setup Service Worker cho PWA! 
→ Chuyển sang File 15-SERVICE-WORKER.md
```

---

**⏭️ TIẾP THEO: File 15-SERVICE-WORKER. md**