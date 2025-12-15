# 🚀 Quick Start Guide - Role-Based Views

**Last Updated:** December 11, 2025

## ⚡ 5-Minute Setup

### Step 1: Start Services

```powershell
# Terminal 1 - Backend
cd d:\project\webBV\giaobanbv-be
npm start

# Terminal 2 - Frontend
cd d:\project\webBV\fe-bcgiaobanbvt
npm start
```

### Step 2: Add Database Indexes (First Time Only)

```powershell
# Terminal 3
cd d:\project\webBV\giaobanbv-be
node scripts\addYeuCauIndexes.js
```

Expected output:

```
✅ Connected to MongoDB
📊 Creating YeuCau indexes...
  ✓ idx_nguoiduocdieuphoi_trangthai_deleted
  ✓ idx_nguoixuly_trangthai_deleted
  ...
✅ All indexes created successfully!
```

### Step 3: Test the Features

1. Open browser: `http://localhost:3000`
2. Login as any user
3. Navigate to sidebar: **Quản lý yêu cầu**
4. You should see new menu items:
   - ✅ Yêu cầu tôi gửi
   - ✅ Xử lý
   - ✅ Điều phối (if you're a dispatcher)
   - ✅ Quản lý khoa (if you're a manager)

### Step 4: Verify Badge Counts & Filter Logic

1. Create a new request at `/yeu-cau`
2. Wait 30 seconds
3. Badge numbers should appear next to menu items
4. Click menu items to see filtered views
5. **NEW**: Test tab-specific filters (e.g., "Mới đến" only shows KHOA requests)

---

## 📚 Documentation Index

| Document                                                         | Purpose                                        | Audience      |
| ---------------------------------------------------------------- | ---------------------------------------------- | ------------- |
| [FILTER_LOGIC_DOCUMENTATION.md](./FILTER_LOGIC_DOCUMENTATION.md) | **⭐ Complete filter logic & MongoDB queries** | Developers    |
| [IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md)       | Implementation summary & changelog             | All           |
| [ROLE_BASED_VIEWS.md](./ROLE_BASED_VIEWS.md)                     | Architecture & design decisions                | Architects    |
| [BACKEND_API_EXTENSIONS.md](./BACKEND_API_EXTENSIONS.md)         | API specs with examples                        | Backend devs  |
| [TAB_CONFIG_SYSTEM.md](./TAB_CONFIG_SYSTEM.md)                   | Tab config Single Source of Truth              | Frontend devs |
| [QUICK_START.md](./QUICK_START.md)                               | This file - Quick setup                        | Everyone      |

---

## 🎯 What Each View Does

### Yêu cầu tôi gửi (`/yeu-cau/toi-gui`)

**For:** All employees  
**Shows:** Requests I created  
**Tabs:** Chờ phản hồi | Đang xử lý | Chờ đánh giá | Đã đóng | Bị từ chối

### Xử lý (`/yeu-cau/xu-ly`)

**For:** Assigned handlers  
**Shows:** Requests assigned to me  
**Tabs:** Cần xử lý | Đang xử lý | Chờ đánh giá | Đã hoàn thành  
**Metrics:** Tổng xử lý, Trung bình sao, Tỷ lệ đúng hạn

### Điều phối (`/yeu-cau/dieu-phoi`)

**For:** Dispatchers only  
**Shows:** All requests to my department  
**Tabs:** Chưa điều phối | Đã điều phối | Đang xử lý | Quá hạn | Đã hoàn thành  
**Dashboard:** Mới hôm nay, Đang chờ, Quá hạn

### Quản lý khoa (`/yeu-cau/quan-ly-khoa`)

**For:** Department managers  
**Shows:** Overview of department requests  
**Tabs:** Chưa xử lý | Đang xử lý | Đã hoàn thành | Báo cáo  
**Summary:** Tổng đến, Tổng gửi, Quá hạn, Rating stats

---

## 🔧 Configuration

### Setup Dispatchers

1. Login as admin
2. Go to: **Quản lý yêu cầu → Cấu hình Khoa**
3. Select department
4. Add employees to "Danh sách người điều phối"
5. Save

### Setup Department Managers

Same as above, add to "Danh sách quản lý khoa"

---

## 🐛 Common Issues

### "Menu items not showing"

**Solution:** Configure user permissions in Cấu hình Khoa

### "Badge counts not updating"

**Solution:** Wait 30 seconds for polling cycle, or refresh page

### "Performance slow"

**Solution:** Run database index script: `node scripts\addYeuCauIndexes.js`

---

## 📚 Full Documentation

- **Architecture:** `ROLE_BASED_VIEWS.md`
- **API Specs:** `BACKEND_API_EXTENSIONS.md`
- **Complete Guide:** `IMPLEMENTATION_COMPLETE.md`
- **Database Indexes:** `../../giaobanbv-be/modules/workmanagement/DATABASE_INDEXES.md`

---

**That's it! You're ready to use role-based views. 🎉**
