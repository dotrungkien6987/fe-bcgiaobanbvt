# 📚 IMPLEMENTATION GUIDES - HOSPITAL MANAGEMENT SYSTEM

## 📌 Overview

Bộ tài liệu hướng dẫn triển khai chi tiết cho các tính năng lớn của hệ thống Quản lý Công việc & KPI - Bệnh viện Đa khoa Tỉnh Phú Thọ.

**Target Audience:** AI Agents, Developers  
**Purpose:** Cung cấp hướng dẫn từng bước, code mẫu, và checklist để triển khai nhanh chóng  
**Last Updated:** November 26, 2025

---

## 🗂️ Document Structure

### [01-PWA](./01-PWA/) - Progressive Web App Conversion

**Status:** ✅ Ready for Implementation  
**Estimated Time:** 1-2 days  
**Priority:** HIGH (Required for Notification System)

**Documents:**

- [`PWA_IMPLEMENTATION_PLAN.md`](./01-PWA/PWA_IMPLEMENTATION_PLAN.md) - Complete guide

**Deliverables:**

- Installable web app
- Service Worker active
- Offline basic support
- Native-like UX

---

### [02-Notification-System](./02-Notification-System/) - Hybrid Notification System

**Status:** 📝 In Planning  
**Estimated Time:** 5-7 days  
**Priority:** HIGH  
**Dependencies:** 01-PWA (for FCM)

**Documents:**

- `ARCHITECTURE.md` - System design & database schemas
- `SOCKET_IO_SETUP.md` - Realtime notification via WebSocket
- `FCM_SETUP.md` - Push notification via Firebase
- `UI_INTEGRATION.md` - Frontend components & user settings

**Deliverables:**

- Socket.IO realtime notifications (in-app)
- FCM push notifications (background)
- Smart routing logic (online/offline)
- User notification preferences
- Admin notification templates

---

### [03-Ticket-System](./03-Ticket-System/) - Internal Request Management

**Status:** 📝 In Planning  
**Estimated Time:** 7-10 days  
**Priority:** MEDIUM  
**Dependencies:** 02-Notification-System

**Documents:**

- `DESIGN.md` - Business requirements & workflow
- `IMPLEMENTATION.md` - Technical implementation guide

**Deliverables:**

- Ticket CRUD operations
- Department-to-department requests
- Assignment & dispatch workflow
- Comments & attachments
- Link to KPI evaluation

---

### [04-Integration](./04-Integration/) - Notification Integration

**Status:** 📝 In Planning  
**Estimated Time:** 2-3 days  
**Priority:** HIGH  
**Dependencies:** 02-Notification-System

**Documents:**

- `NOTIFICATION_INTEGRATION.md` - How to integrate notifications into existing modules

**Deliverables:**

- Notifications for Work Management (Công việc)
- Notifications for KPI evaluation
- Notifications for Ticket system
- 2-line integration per trigger point

---

## 🛤️ IMPLEMENTATION ROADMAP

### Phase 1: Foundation (Week 1)

```
Day 1-2: 01-PWA
  └─ PWA Conversion (HTTPS, Service Worker, Manifest)
```

### Phase 2: Notification Core (Week 2)

```
Day 3-5: 02-Notification-System (Backend)
  ├─ Database schemas
  ├─ Socket.IO server
  └─ FCM integration

Day 6-7: 02-Notification-System (Frontend)
  ├─ Socket.IO client
  ├─ FCM Service Worker
  └─ Redux notification slice
```

### Phase 3: Notification UI (Week 3)

```
Day 8-10: 02-Notification-System (UI)
  ├─ Notification dropdown
  ├─ User settings page
  └─ Admin templates page
```

### Phase 4: Integration (Week 3-4)

```
Day 11-12: 04-Integration
  ├─ Integrate into Work Management
  ├─ Integrate into KPI
  └─ Seed notification templates
```

### Phase 5: Ticket System (Week 4-5)

```
Day 13-20: 03-Ticket-System
  ├─ Backend (Models, Controllers, Routes)
  ├─ Frontend (Components, Pages)
  └─ Notification integration
```

---

## 📋 PREREQUISITES

### Development Environment

- Node.js 16+ & npm/yarn
- MongoDB 5+
- Git
- VS Code (recommended)

### Production Requirements

- HTTPS domain (for PWA & FCM)
- Server: 4GB RAM, 4 vCPU minimum
- Bandwidth: 50-100 Mbps
- Firebase account (free tier)

### Knowledge Requirements

- React 18 (Hooks, Redux Toolkit)
- Node.js + Express
- MongoDB + Mongoose
- Socket.IO basics
- Service Worker concepts (will be taught)

---

## 🎯 SUCCESS CRITERIA

### After Phase 1 (PWA)

- [ ] App can be installed on mobile/desktop
- [ ] Service Worker registered successfully
- [ ] Lighthouse PWA score ≥ 80

### After Phase 2-4 (Notification)

- [ ] Realtime notification when user online
- [ ] Push notification when user offline
- [ ] User can customize notification preferences
- [ ] Admin can manage notification templates
- [ ] No notification spam (rate limiting works)

### After Phase 5 (Ticket)

- [ ] Users can create cross-department requests
- [ ] Admins can assign tickets
- [ ] Tickets linked to KPI evaluation
- [ ] Full notification integration

---

## 📞 SUPPORT & FEEDBACK

### For AI Agents

- Read documents in order (01 → 02 → 03 → 04)
- Follow step-by-step instructions
- Use verification checklists after each step
- Check troubleshooting section if stuck

### For Developers

- Clone repository & create feature branch
- Reference existing code patterns (see `.github/copilot-instructions.md`)
- Test locally before deploying
- Update this README if you add new documents

---

## 🔄 DOCUMENT UPDATES

| Date       | Document | Change               | Author       |
| ---------- | -------- | -------------------- | ------------ |
| 2025-11-26 | All      | Initial creation     | AI Assistant |
| 2025-11-26 | 01-PWA   | Full content written | AI Assistant |

---

## 🚀 QUICK START

**For new AI Agent:**

```bash
# 1. Read this README
# 2. Navigate to 01-PWA
cd 01-PWA
# 3. Open PWA_IMPLEMENTATION_PLAN.md
# 4. Follow step-by-step
```

**For developer:**

```bash
# 1. Pull latest code
git pull origin main

# 2. Create feature branch
git checkout -b feature/pwa-conversion

# 3. Follow guide in 01-PWA/
# 4. Test & commit
```

---

**Ready to start? Navigate to [01-PWA](./01-PWA/) →**
