# ✅ TESTING CHECKLIST - Notification Settings Refactor

## 🧪 Manual Testing Guide

### Prerequisites:

- [ ] Backend running on http://localhost:8020
- [ ] Frontend running on http://localhost:3000
- [ ] User logged in with valid account

---

## Test 1: API Response Format

**Endpoint:** `GET /api/notifications/settings`

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "settings": {
      "enableNotifications": true,
      "enablePush": true,
      "quietHours": { "enabled": false, "start": "22:00", "end": "07:00" },
      "typePreferences": {
        "yeucau-tao-moi": { "inapp": true, "push": true }
      }
    },
    "availableTypes": [
      {
        "type": "congviec-giao-viec",
        "name": "Thông báo giao việc mới",
        "description": "Được giao công việc mới",
        "Nhom": "Công việc",
        "templateCount": 2
      }
    ]
  }
}
```

**Check:**

- [ ] `availableTypes` contains objects with `type`, `name`, `description`, `Nhom` fields
- [ ] Each type has `templateCount` field (number)
- [ ] NOT returning `_id`, `typeCode`, `titleTemplate`, etc. (template fields)

---

## Test 2: Frontend Settings Page

**Navigate to:** http://localhost:3000/cai-dat/thong-bao

### Visual Check:

- [ ] Page loads without errors
- [ ] Shows 4 accordions: "Công việc", "Yêu cầu", "KPI", "Hệ thống"
- [ ] Each accordion shows "(X loại)" count
- [ ] Each notification type shows:
  - [ ] Name (e.g., "Thông báo giao việc mới")
  - [ ] Description (e.g., "Được giao công việc mới")
  - [ ] Template count badge (e.g., "2 mẫu") if count > 0
  - [ ] Two switches: "In-app" and "Push"

### Example:

```
┌─────────────────────────────────────────────────┐
│ Công việc (18 loại)                  [▼]       │
├─────────────────────────────────────────────────┤
│ Thông báo giao việc mới  [2 mẫu]               │
│ Được giao công việc mới                         │
│ [✓] In-app    [✓] Push                          │
│ ─────────────────────────────────────────────── │
│ Thông báo bình luận mới  [2 mẫu]               │
│ Có bình luận mới                                │
│ [✓] In-app    [✓] Push                          │
└─────────────────────────────────────────────────┘
```

---

## Test 3: Toggle Settings

### Test 3.1: Toggle In-app for a type

**Steps:**

1. Navigate to settings page
2. Find "Thông báo giao việc mới"
3. Toggle "In-app" OFF
4. Open browser DevTools → Network tab
5. Check PUT request to `/api/notifications/settings`

**Expected Request Body:**

```json
{
  "typePreferences": {
    "congviec-giao-viec": {
      "inapp": false,
      "push": true
    }
  }
}
```

**Check:**

- [ ] Request uses `type code` (e.g., "congviec-giao-viec")
- [ ] NOT using template ID or template name
- [ ] Response 200 OK
- [ ] Switch reflects new state after save

### Test 3.2: Toggle Push for a type

**Steps:**

1. Toggle "Push" OFF for same type
2. Check request body

**Expected:**

```json
{
  "typePreferences": {
    "congviec-giao-viec": {
      "inapp": false,
      "push": false
    }
  }
}
```

---

## Test 4: Multiple Types Same Time

**Steps:**

1. Toggle settings for 2-3 different types
2. Check Redux state in DevTools

**Expected Redux State:**

```javascript
notification: {
  settings: {
    typePreferences: {
      "congviec-giao-viec": { inapp: false, push: true },
      "yeucau-tao-moi": { inapp: true, push: false },
      "kpi-duyet-danh-gia": { inapp: true, push: true }
    }
  },
  availableTypes: [
    { type: "congviec-giao-viec", name: "...", templateCount: 2 },
    // ... more types
  ]
}
```

**Check:**

- [ ] `typePreferences` uses type codes as keys
- [ ] `availableTypes` is array of type objects (not templates)
- [ ] No duplicate types in `availableTypes`

---

## Test 5: End-to-End Notification Flow

### Setup:

1. User A: Enable "Thông báo giao việc mới"
2. User B: Create a new task and assign to User A

**Expected:**

- [ ] User A receives notification (both templates: for NguoiChinhID and NguoiThamGia)
- [ ] Notification appears in bell icon
- [ ] Click notification navigates to task

### Setup:

1. User A: Disable "Thông báo giao việc mới" (toggle both In-app and Push OFF)
2. User B: Create a new task and assign to User A

**Expected:**

- [ ] User A does NOT receive notification
- [ ] Both templates are blocked (because type is disabled)

---

## Test 6: Group By Nhom

**Navigate to:** Settings page

**Check each accordion:**

### Công việc (18 types expected):

- [ ] congviec-giao-viec
- [ ] congviec-huy-giao
- [ ] congviec-tiep-nhan
- [ ] congviec-hoan-thanh
- [ ] congviec-binh-luan
- [ ] ... (total 18)

### Yêu cầu (17 types expected):

- [ ] yeucau-tao-moi
- [ ] yeucau-tiep-nhan
- [ ] yeucau-tu-choi
- [ ] yeucau-dieu-phoi
- [ ] ... (total 17)

### KPI (7 types expected):

- [ ] kpi-tao-danh-gia
- [ ] kpi-tu-danh-gia
- [ ] kpi-duyet-danh-gia
- [ ] ... (total 7)

### Hệ thống (2 types expected):

- [ ] congviec-deadline-overdue
- [ ] congviec-deadline-approaching

---

## Test 7: Template Count Accuracy

**Open:** Settings page

**Sample Check:**

| Type               | Expected Template Count | Actual Count |
| ------------------ | ----------------------- | ------------ |
| congviec-giao-viec | 2                       | [ ]          |
| congviec-binh-luan | 2                       | [ ]          |
| yeucau-nhac-lai    | 3                       | [ ]          |
| yeucau-dieu-phoi   | 3                       | [ ]          |
| kpi-duyet-danh-gia | 1                       | [ ]          |

**Verify:**

- [ ] Count matches number of templates in `notificationTemplates.seed.js`
- [ ] Badge only shows when count > 0

---

## Test 8: Master Toggles

### Test 8.1: Disable all notifications

**Steps:**

1. Toggle "Bật thông báo" OFF
2. Check all type switches

**Expected:**

- [ ] All type switches are disabled (grayed out)
- [ ] Settings saved correctly

### Test 8.2: Disable push only

**Steps:**

1. Enable "Bật thông báo"
2. Toggle "Bật thông báo đẩy" OFF
3. Check type switches

**Expected:**

- [ ] In-app switches enabled
- [ ] Push switches disabled (grayed out)

---

## Test 9: Quiet Hours

**Steps:**

1. Enable "Bật chế độ im lặng"
2. Set start time: 22:00
3. Set end time: 07:00
4. Save

**Expected Request:**

```json
{
  "quietHours": {
    "enabled": true,
    "start": "22:00",
    "end": "07:00"
  }
}
```

**Check:**

- [ ] Settings saved
- [ ] Time pickers show correct values after refresh

---

## Test 10: Error Handling

### Test 10.1: Backend down

**Steps:**

1. Stop backend server
2. Navigate to settings page

**Expected:**

- [ ] Shows error alert
- [ ] Error message displayed
- [ ] No crash

### Test 10.2: Invalid data

**Steps:**

1. Manually send invalid PUT request via DevTools Console:

```javascript
fetch("/api/notifications/settings", {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ typePreferences: "invalid" }),
});
```

**Expected:**

- [ ] Backend returns error
- [ ] Frontend shows toast error
- [ ] Settings not corrupted

---

## 🎯 Summary Checklist

- [ ] API returns actual NotificationTypes (not templates)
- [ ] Each type has `templateCount` field
- [ ] Frontend displays types grouped by Nhom
- [ ] Template count badge shows correctly
- [ ] Toggle switches work for In-app and Push
- [ ] Settings saved as `typePreferences` with type codes
- [ ] Master toggles work correctly
- [ ] Quiet hours configuration works
- [ ] No errors in console
- [ ] No TypeScript errors
- [ ] Redux state structure correct
- [ ] End-to-end notification flow works
- [ ] Both templates of same type respect user settings

---

## ✅ Sign-off

**Tested by:** ******\_\_\_******  
**Date:** ******\_\_\_******  
**Environment:** Dev / Staging / Production  
**Status:** ⬜ Pass / ⬜ Fail

**Notes:**

---

---

---
