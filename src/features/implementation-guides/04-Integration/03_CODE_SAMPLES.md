# 💻 Code Samples - Notification Trigger Service

> Copy-paste ready code cho từng file cần tạo/sửa

---

## 📁 FILE 1: `helpers/notificationHelper.js` (MỚI)

```javascript
/**
 * Notification Helper Functions
 *
 * Cung cấp helper để convert NhanVienID → User._id
 * và các utility functions khác cho notification system
 */

const User = require("../models/User");
const NhanVien = require("../models/NhanVien");

const notificationHelper = {};

/**
 * Convert NhanVienID → User._id
 * @param {string|ObjectId} nhanVienId - NhanVien._id
 * @returns {Promise<ObjectId|null>} User._id hoặc null nếu không tìm thấy
 */
notificationHelper.resolveNhanVienToUserId = async (nhanVienId) => {
  if (!nhanVienId) return null;

  try {
    const user = await User.findOne({
      NhanVienID: nhanVienId,
      isDeleted: { $ne: true },
    })
      .select("_id")
      .lean();

    return user?._id || null;
  } catch (error) {
    console.error(
      "[notificationHelper] Error resolving NhanVienID:",
      error.message
    );
    return null;
  }
};

/**
 * Batch convert nhiều NhanVienIDs → User._ids
 * @param {Array<string|ObjectId>} nhanVienIds - Array of NhanVien._id
 * @returns {Promise<Array<ObjectId>>} Array of User._id (filtered nulls)
 */
notificationHelper.resolveNhanVienListToUserIds = async (nhanVienIds) => {
  if (!Array.isArray(nhanVienIds) || nhanVienIds.length === 0) {
    return [];
  }

  // Filter out null/undefined
  const validIds = nhanVienIds.filter((id) => id != null);
  if (validIds.length === 0) return [];

  try {
    const users = await User.find({
      NhanVienID: { $in: validIds },
      isDeleted: { $ne: true },
    })
      .select("_id NhanVienID")
      .lean();

    return users.map((u) => u._id);
  } catch (error) {
    console.error(
      "[notificationHelper] Error batch resolving NhanVienIDs:",
      error.message
    );
    return [];
  }
};

/**
 * Get display name của nhân viên
 * @param {string|ObjectId} nhanVienId - NhanVien._id
 * @returns {Promise<string>} Tên nhân viên hoặc "Người dùng"
 */
notificationHelper.getDisplayName = async (nhanVienId) => {
  if (!nhanVienId) return "Người dùng";

  try {
    const nhanVien = await NhanVien.findById(nhanVienId)
      .select("Ten HoTen")
      .lean();

    return nhanVien?.Ten || nhanVien?.HoTen || "Người dùng";
  } catch (error) {
    console.error(
      "[notificationHelper] Error getting display name:",
      error.message
    );
    return "Người dùng";
  }
};

/**
 * Get display names for multiple NhanVienIds (batch)
 * @param {Array<string|ObjectId>} nhanVienIds
 * @returns {Promise<Map<string, string>>} Map của nhanVienId → displayName
 */
notificationHelper.getDisplayNames = async (nhanVienIds) => {
  const result = new Map();
  if (!Array.isArray(nhanVienIds) || nhanVienIds.length === 0) {
    return result;
  }

  try {
    const nhanViens = await NhanVien.find({
      _id: { $in: nhanVienIds },
    })
      .select("_id Ten HoTen")
      .lean();

    nhanViens.forEach((nv) => {
      result.set(String(nv._id), nv.Ten || nv.HoTen || "Người dùng");
    });

    return result;
  } catch (error) {
    console.error(
      "[notificationHelper] Error batch getting display names:",
      error.message
    );
    return result;
  }
};

module.exports = notificationHelper;
```

---

## 📁 FILE 2: `config/notificationTriggers.js` (MỚI)

```javascript
/**
 * Centralized Notification Triggers Configuration
 *
 * Mỗi trigger có cấu trúc:
 * - enabled: boolean - Bật/tắt trigger (cần restart server)
 * - template: string - Template type (phải match với NotificationTemplate.type)
 * - description: string - Mô tả trigger (Vietnamese)
 * - handler: string - Handler type để xử lý logic recipients
 * - recipients: string - Loại người nhận
 * - excludePerformer: boolean - Có loại trừ người thực hiện không
 *
 * Recipients Types:
 * - "assignee": NguoiChinhID (người được giao việc)
 * - "assigner": NguoiGiaoViecID (người giao việc)
 * - "participants": NguoiThamGia[] (người tham gia)
 * - "all": assignee + assigner + participants
 * - "employee": NhanVienID trong DanhGiaKPI
 * - "manager": NguoiDanhGiaID trong DanhGiaKPI
 */

module.exports = {
  // ═══════════════════════════════════════════════════════════════════════════
  // CÔNG VIỆC (CongViec) - 11 triggers (10 enabled, 1 disabled)
  // ═══════════════════════════════════════════════════════════════════════════

  // Legacy function giaoViec() dùng key này
  "CongViec.giaoViec": {
    enabled: true,
    template: "TASK_ASSIGNED",
    description: "Thông báo khi được giao việc mới (legacy)",
    handler: "congViec",
    recipients: "assignee",
    excludePerformer: true,
  },

  // Transition action GIAO_VIEC dùng key này
  "CongViec.GIAO_VIEC": {
    enabled: true,
    template: "TASK_ASSIGNED",
    description: "Thông báo khi được giao việc mới (transition)",
    handler: "congViec",
    recipients: "assignee",
    excludePerformer: true,
  },

  // Hủy giao việc - thông báo cho người được giao
  "CongViec.HUY_GIAO": {
    enabled: true,
    template: "TASK_CANCELLED",
    description: "Thông báo khi hủy giao việc",
    handler: "congViec",
    recipients: "assignee",
    excludePerformer: true,
  },

  // Hủy hoàn thành tạm - thông báo cho người được giao
  "CongViec.HUY_HOAN_THANH_TAM": {
    enabled: true,
    template: "TASK_REVISION_REQUESTED",
    description: "Thông báo khi hủy hoàn thành tạm (yêu cầu làm lại)",
    handler: "congViec",
    recipients: "assignee",
    excludePerformer: true,
  },

  "CongViec.TIEP_NHAN": {
    enabled: true,
    template: "TASK_ACCEPTED",
    description: "Thông báo khi nhân viên tiếp nhận công việc",
    handler: "congViec",
    recipients: "assigner",
    excludePerformer: true,
  },

  "CongViec.HOAN_THANH": {
    enabled: true,
    template: "TASK_COMPLETED",
    description: "Thông báo khi nhân viên báo hoàn thành",
    handler: "congViec",
    recipients: "assigner",
    excludePerformer: true,
  },

  "CongViec.HOAN_THANH_TAM": {
    enabled: true,
    template: "TASK_PENDING_APPROVAL",
    description: "Thông báo khi nhân viên báo hoàn thành (chờ duyệt)",
    handler: "congViec",
    recipients: "assigner",
    excludePerformer: true,
  },

  "CongViec.DUYET_HOAN_THANH": {
    enabled: true,
    template: "TASK_APPROVED",
    description: "Thông báo khi công việc được duyệt hoàn thành",
    handler: "congViec",
    recipients: "assignee",
    excludePerformer: true,
  },

  // NOTE: TU_CHOI action chưa được implement trong workflow hiện tại
  "CongViec.TU_CHOI": {
    enabled: false, // Disabled vì action chưa tồn tại
    template: "TASK_REJECTED",
    description: "Thông báo khi công việc bị từ chối (chưa implement)",
    handler: "congViec",
    recipients: "assignee",
    excludePerformer: true,
  },

  "CongViec.MO_LAI_HOAN_THANH": {
    enabled: true,
    template: "TASK_REOPENED",
    description: "Thông báo khi mở lại công việc đã hoàn thành",
    handler: "congViec",
    recipients: "assignee",
    excludePerformer: true,
  },

  "CongViec.comment": {
    enabled: true,
    template: "COMMENT_ADDED",
    description: "Thông báo khi có bình luận mới",
    handler: "comment",
    recipients: "all", // Gửi cho tất cả người liên quan
    excludePerformer: true,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DEADLINE (Auto-scheduled by Agenda.js) - 2 triggers
  // ═══════════════════════════════════════════════════════════════════════════

  "CongViec.DEADLINE_APPROACHING": {
    enabled: true,
    template: "DEADLINE_APPROACHING",
    description: "Thông báo khi công việc sắp đến hạn (auto by Agenda.js)",
    handler: "deadline",
    recipients: "all",
    excludePerformer: false,
  },

  "CongViec.DEADLINE_OVERDUE": {
    enabled: true,
    template: "DEADLINE_OVERDUE",
    description: "Thông báo khi công việc quá hạn (auto by Agenda.js)",
    handler: "deadline",
    recipients: "all",
    excludePerformer: false,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // KPI - 4 triggers
  // ═══════════════════════════════════════════════════════════════════════════

  "KPI.taoDanhGia": {
    enabled: true,
    template: "KPI_CYCLE_STARTED",
    description: "Thông báo khi tạo đánh giá KPI mới",
    handler: "kpi",
    recipients: "employee",
    excludePerformer: true,
  },

  "KPI.duyetDanhGia": {
    enabled: true,
    template: "KPI_EVALUATED",
    description: "Thông báo khi KPI được duyệt",
    handler: "kpi",
    recipients: "employee",
    excludePerformer: true,
  },

  "KPI.duyetTieuChi": {
    enabled: true,
    template: "KPI_EVALUATED",
    description: "Thông báo khi KPI được duyệt (theo tiêu chí)",
    handler: "kpi",
    recipients: "employee",
    excludePerformer: true,
  },

  "KPI.huyDuyet": {
    enabled: true,
    template: "KPI_APPROVAL_REVOKED",
    description: "Thông báo khi KPI bị hủy duyệt",
    handler: "kpi",
    recipients: "employee",
    excludePerformer: true,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FUTURE: Thêm triggers cho các module khác
  // ═══════════════════════════════════════════════════════════════════════════

  // "BaoCaoSuCo.taoMoi": {
  //   enabled: false,
  //   template: "INCIDENT_CREATED",
  //   description: "Thông báo khi có báo cáo sự cố mới",
  //   handler: "baoCaoSuCo",
  //   recipients: "qualityManager",
  //   excludePerformer: true,
  // },
};
```

---

## 📁 FILE 3: `services/triggerService.js` (MỚI)

```javascript
/**
 * TriggerService - Core service để fire notification triggers
 *
 * Usage:
 *   const triggerService = require("../../../services/triggerService");
 *   await triggerService.fire("CongViec.giaoViec", { congViec, performerId });
 */

const triggers = require("../config/notificationTriggers");
const notificationHelper = require("../helpers/notificationHelper");
const notificationService = require("../modules/workmanagement/services/notificationService");

class TriggerService {
  constructor() {
    this.triggers = triggers;
    this._logSummary();
  }

  /**
   * Log summary khi service khởi tạo
   */
  _logSummary() {
    const total = Object.keys(this.triggers).length;
    const enabled = Object.values(this.triggers).filter(
      (t) => t.enabled
    ).length;
    const disabled = total - enabled;

    console.log(
      `[TriggerService] ✅ Loaded ${total} triggers (${enabled} enabled, ${disabled} disabled)`
    );

    if (disabled > 0) {
      const disabledKeys = Object.entries(this.triggers)
        .filter(([_, config]) => !config.enabled)
        .map(([key]) => key);
      console.log(`[TriggerService] ⚠️  Disabled: ${disabledKeys.join(", ")}`);
    }
  }

  /**
   * Fire a trigger
   * @param {string} triggerKey - Key của trigger (e.g., "CongViec.giaoViec")
   * @param {Object} context - Context data
   * @param {Object} context.congViec - CongViec document (for CongViec triggers)
   * @param {Object} context.danhGiaKPI - DanhGiaKPI document (for KPI triggers)
   * @param {Object} context.comment - BinhLuan document (for comment trigger)
   * @param {string} context.performerId - NhanVienID của người thực hiện
   * @param {string} context.ghiChu - Ghi chú/lý do (optional)
   * @param {string} context.lyDo - Lý do (for reject/revoke)
   */
  async fire(triggerKey, context) {
    try {
      const config = this.triggers[triggerKey];

      // Step 1: Check if trigger exists and is enabled
      if (!config) {
        console.warn(`[TriggerService] ⚠️ Unknown trigger: ${triggerKey}`);
        return;
      }

      if (!config.enabled) {
        console.log(`[TriggerService] ⏭️ Skipped (disabled): ${triggerKey}`);
        return;
      }

      // Step 2: Get handler and process
      const handlerResult = await this._processHandler(
        config.handler,
        context,
        config
      );

      if (!handlerResult) {
        console.warn(
          `[TriggerService] ⚠️ Handler returned null for: ${triggerKey}`
        );
        return;
      }

      const { recipientNhanVienIds, data } = handlerResult;

      // Step 3: Convert NhanVienIDs → UserIds
      let userIds = await notificationHelper.resolveNhanVienListToUserIds(
        recipientNhanVienIds
      );

      if (userIds.length === 0) {
        console.log(
          `[TriggerService] ⚠️ No valid recipients for: ${triggerKey}`
        );
        return;
      }

      // Step 4: Exclude performer if configured
      if (config.excludePerformer && context.performerId) {
        const performerUserId =
          await notificationHelper.resolveNhanVienToUserId(context.performerId);
        if (performerUserId) {
          const originalCount = userIds.length;
          userIds = userIds.filter(
            (id) => String(id) !== String(performerUserId)
          );
          if (userIds.length < originalCount) {
            console.log(
              `[TriggerService] 👤 Excluded performer from recipients`
            );
          }
        }
      }

      if (userIds.length === 0) {
        console.log(
          `[TriggerService] ⚠️ No recipients after exclusion for: ${triggerKey}`
        );
        return;
      }

      // Step 5: Send notifications
      console.log(
        `[TriggerService] 🔔 Firing ${triggerKey} → ${userIds.length} recipients`
      );

      await notificationService.sendToMany({
        type: config.template,
        recipientIds: userIds,
        data: data,
      });

      console.log(`[TriggerService] ✅ ${triggerKey} sent successfully`);
    } catch (error) {
      // Log error but don't throw - notification failure shouldn't break business logic
      console.error(
        `[TriggerService] ❌ Error firing ${triggerKey}:`,
        error.message
      );
    }
  }

  /**
   * Process handler based on type
   * @private
   */
  async _processHandler(handlerType, context, config) {
    switch (handlerType) {
      case "congViec":
        return this._handleCongViec(context, config);
      case "kpi":
        return this._handleKPI(context, config);
      case "comment":
        return this._handleComment(context, config);
      default:
        console.warn(`[TriggerService] Unknown handler type: ${handlerType}`);
        return null;
    }
  }

  /**
   * Handler for CongViec triggers
   * @private
   */
  async _handleCongViec(context, config) {
    const { congViec, ghiChu, lyDo } = context;
    if (!congViec) return null;

    // Determine recipients based on config
    let recipientNhanVienIds = [];

    switch (config.recipients) {
      case "assignee":
        if (congViec.NguoiChinhID) {
          recipientNhanVienIds.push(congViec.NguoiChinhID);
        }
        break;

      case "assigner":
        if (congViec.NguoiGiaoViecID) {
          recipientNhanVienIds.push(congViec.NguoiGiaoViecID);
        }
        break;

      case "participants":
        if (Array.isArray(congViec.NguoiThamGia)) {
          congViec.NguoiThamGia.forEach((p) => {
            if (p.NhanVienID) recipientNhanVienIds.push(p.NhanVienID);
          });
        }
        break;

      case "all":
        if (congViec.NguoiChinhID)
          recipientNhanVienIds.push(congViec.NguoiChinhID);
        if (congViec.NguoiGiaoViecID)
          recipientNhanVienIds.push(congViec.NguoiGiaoViecID);
        if (Array.isArray(congViec.NguoiThamGia)) {
          congViec.NguoiThamGia.forEach((p) => {
            if (p.NhanVienID) recipientNhanVienIds.push(p.NhanVienID);
          });
        }
        break;
    }

    // Build template data
    const assignerName = await notificationHelper.getDisplayName(
      congViec.NguoiGiaoViecID
    );
    const assigneeName = await notificationHelper.getDisplayName(
      congViec.NguoiChinhID
    );

    const data = {
      taskId: String(congViec._id),
      taskName: congViec.TenCongViec || "Công việc",
      assignerName: assignerName,
      assigneeName: assigneeName,
      newStatus: this._mapStatus(congViec.TrangThai),
      reason: lyDo || ghiChu || "",
      // For approved/rejected templates
      approverName: assignerName,
      rejecterName: assignerName,
    };

    return { recipientNhanVienIds, data };
  }

  /**
   * Handler for KPI triggers
   * @private
   */
  async _handleKPI(context, config) {
    const { danhGiaKPI, chuKy, lyDo } = context;
    if (!danhGiaKPI) return null;

    // Recipients: employee being evaluated
    let recipientNhanVienIds = [];

    switch (config.recipients) {
      case "employee":
        const employeeId = danhGiaKPI.NhanVienID?._id || danhGiaKPI.NhanVienID;
        if (employeeId) recipientNhanVienIds.push(employeeId);
        break;

      case "manager":
        const managerId =
          danhGiaKPI.NguoiDanhGiaID?._id || danhGiaKPI.NguoiDanhGiaID;
        if (managerId) recipientNhanVienIds.push(managerId);
        break;
    }

    // Build template data
    const managerName = await notificationHelper.getDisplayName(
      danhGiaKPI.NguoiDanhGiaID?._id || danhGiaKPI.NguoiDanhGiaID
    );

    const cycleName =
      chuKy?.TenChuKy ||
      danhGiaKPI.ChuKyDanhGiaID?.TenChuKy ||
      "Chu kỳ đánh giá";

    const data = {
      evaluationId: String(danhGiaKPI._id),
      cycleName: cycleName,
      managerName: managerName,
      rating: this._getRating(danhGiaKPI.TongDiemKPI),
      reason: lyDo || "",
      deadline: chuKy?.NgayKetThuc
        ? new Date(chuKy.NgayKetThuc).toLocaleDateString("vi-VN")
        : "",
    };

    return { recipientNhanVienIds, data };
  }

  /**
   * Handler for Comment trigger
   * @private
   */
  async _handleComment(context, config) {
    const { congViec, comment } = context;
    if (!congViec || !comment) return null;

    // Recipients: all people related to the task
    let recipientNhanVienIds = [];

    if (congViec.NguoiChinhID) recipientNhanVienIds.push(congViec.NguoiChinhID);
    if (congViec.NguoiGiaoViecID)
      recipientNhanVienIds.push(congViec.NguoiGiaoViecID);
    if (Array.isArray(congViec.NguoiThamGia)) {
      congViec.NguoiThamGia.forEach((p) => {
        if (p.NhanVienID) recipientNhanVienIds.push(p.NhanVienID);
      });
    }

    // Build template data
    const commenterName = await notificationHelper.getDisplayName(
      comment.NguoiBinhLuanID
    );

    const data = {
      taskId: String(congViec._id),
      taskName: congViec.TenCongViec || "Công việc",
      commenterName: commenterName,
      commentPreview: comment.NoiDung?.substring(0, 100) || "",
    };

    return { recipientNhanVienIds, data };
  }

  /**
   * Map TrangThai to Vietnamese display
   * @private
   */
  _mapStatus(status) {
    const statusMap = {
      NHAP: "Nháp",
      DA_GIAO: "Đã giao",
      DANG_THUC_HIEN: "Đang thực hiện",
      HOAN_THANH_TAM: "Chờ duyệt",
      HOAN_THANH: "Hoàn thành",
    };
    return statusMap[status] || status;
  }

  /**
   * Get rating text from score
   * @private
   */
  _getRating(score) {
    if (score == null) return "Chưa có";
    if (score >= 90) return "Xuất sắc";
    if (score >= 80) return "Tốt";
    if (score >= 70) return "Khá";
    if (score >= 50) return "Trung bình";
    return "Cần cải thiện";
  }

  /**
   * Get summary of all triggers (for debug endpoint)
   */
  getSummary() {
    const triggerList = Object.entries(this.triggers).map(([key, config]) => ({
      key,
      enabled: config.enabled,
      template: config.template,
      description: config.description,
      handler: config.handler,
      recipients: config.recipients,
    }));

    return {
      total: triggerList.length,
      enabled: triggerList.filter((t) => t.enabled).length,
      disabled: triggerList.filter((t) => !t.enabled).length,
      triggers: triggerList,
    };
  }
}

module.exports = new TriggerService();
```

---

## 📁 FILE 4: Thêm vào `seeds/notificationTemplates.js`

```javascript
// Thêm vào array templates[], sau KPI_EVALUATED
{
  type: "KPI_APPROVAL_REVOKED",
  name: "Hủy duyệt KPI",
  description: "Khi quản lý hủy duyệt đánh giá KPI đã duyệt trước đó",
  category: "kpi",
  titleTemplate: "⚠️ KPI bị hủy duyệt",
  bodyTemplate: "{{managerName}} đã hủy duyệt KPI chu kỳ {{cycleName}}. Lý do: {{reason}}",
  icon: "warning",
  defaultChannels: ["inapp", "push"],
  defaultPriority: "urgent",
  actionUrlTemplate: "/kpi/chi-tiet/{{evaluationId}}",
  requiredVariables: ["managerName", "cycleName", "reason", "evaluationId"],
},
```

---

## 📁 FILE 5: Thêm debug route vào `notificationRoutes.js`

```javascript
// Thêm route mới vào cuối file (trước module.exports)

/**
 * @route GET /api/workmanagement/notifications/triggers/summary
 * @desc Get summary of all notification triggers (Admin only)
 */
router.get("/triggers/summary", authMiddleware.loginRequired, (req, res) => {
  // Optional: Check admin role
  // if (req.user.PhanQuyen !== "admin") {
  //   return res.status(403).json({ success: false, message: "Forbidden" });
  // }

  const triggerService = require("../../../services/triggerService");
  const summary = triggerService.getSummary();

  return res.status(200).json({
    success: true,
    data: summary,
  });
});
```

---

## 📝 Integration Code Snippets

### congViec.service.js - giaoViec()

```javascript
// Tìm dòng: await congviec.save(); (khoảng line 1560)
// Thêm sau đó:

const triggerService = require("../../../services/triggerService");

// ... existing code ...

await congviec.save();

// 🔔 Notification trigger
await triggerService.fire("CongViec.giaoViec", {
  congViec: congviec,
  performerId: req.user?.NhanVienID,
});

const populated = await CongViec.findById(congviec._id);
// ... rest of code
```

### congViec.service.js - transition()

```javascript
// Tìm dòng: await congviec.save(); (khoảng line 1920)
// Thêm sau đó:

const triggerService = require("../../../services/triggerService");

// ... existing code ...

await congviec.save();

// 🔔 Notification trigger
await triggerService.fire(`CongViec.${action}`, {
  congViec: congviec,
  performerId: performerIdCtx,
  ghiChu: ghiChu || lyDo,
});

// Lightweight fetch for patch building
const populated = await CongViec.findById(congviec._id);
// ... rest of code
```

### congViec.service.js - addComment()

```javascript
// Tìm đoạn: congviec.BinhLuans.push(binhLuan._id); await congviec.save();
// Thêm sau đó:

const triggerService = require("../../../services/triggerService");

// ... existing code ...

congviec.BinhLuans.push(binhLuan._id);
await congviec.save();

// 🔔 Notification trigger
await triggerService.fire("CongViec.comment", {
  congViec: congviec,
  comment: binhLuan,
  performerId: currentUser.NhanVienID,
});

// Build DTO consistent with FE expectations
// ... rest of code
```

### kpi.controller.js - taoDanhGiaKPI()

```javascript
// Tìm sau: const danhGiaKPI = await DanhGiaKPI.create({...});
// Thêm:

const triggerService = require("../../../services/triggerService");

// ... existing code ...

const danhGiaKPI = await DanhGiaKPI.create({
  ChuKyDanhGiaID,
  NhanVienID,
  NguoiDanhGiaID,
  TongDiemKPI: 0,
  TrangThai: "CHUA_DUYET",
});

// 🔔 Notification trigger
await triggerService.fire("KPI.taoDanhGia", {
  danhGiaKPI: danhGiaKPI,
  chuKy: chuKy,
  performerId: NguoiDanhGiaID,
});

// 6. Tạo danh sách DanhGiaNhiemVuThuongQuy
// ... rest of code
```

### kpi.controller.js - duyetDanhGiaKPI()

```javascript
// Tìm trước: return sendResponse(res, 200, true, {...}, null, "Đã duyệt KPI thành công");
// Thêm:

const triggerService = require("../../../services/triggerService");

// ... existing code ...

// 🔔 Notification trigger
await triggerService.fire("KPI.duyetDanhGia", {
  danhGiaKPI: updatedDanhGiaKPI,
  performerId: currentNhanVienID,
});

return sendResponse(
  res,
  200,
  true,
  {
    danhGiaKPI: updatedDanhGiaKPI,
    // ... rest
  },
  null,
  `Đã duyệt KPI thành công...`
);
```

### kpi.controller.js - duyetKPITieuChi()

```javascript
// Tìm trước: return sendResponse(res, 200, true, {...});
// Trong try block, sau await danhGiaKPI.duyet(...)

const triggerService = require("../../../services/triggerService");

// ... existing code ...

await danhGiaKPI.duyet(undefined, req.user.NhanVienID || req.user._id);

// 🔔 Notification trigger
await triggerService.fire("KPI.duyetTieuChi", {
  danhGiaKPI: danhGiaKPI,
  performerId: nguoiDanhGiaID,
});

// Populate for response
await danhGiaKPI.populate("ChuKyDanhGiaID NhanVienID");
// ... rest of code
```

### kpi.controller.js - huyDuyetKPI()

```javascript
// Tìm trước: return sendResponse(res, 200, true, {...});
// Trong try block

const triggerService = require("../../../services/triggerService");

// ... existing code ...

await danhGiaKPI.huyDuyet(currentUser.NhanVienID || currentUser._id, lyDo);

// 🔔 Notification trigger
await triggerService.fire("KPI.huyDuyet", {
  danhGiaKPI: danhGiaKPIPopulated,
  lyDo: lyDo,
  performerId: currentUser.NhanVienID,
});

return sendResponse(
  res,
  200,
  true,
  { danhGiaKPI: danhGiaKPIPopulated },
  null,
  "Đã hủy duyệt KPI thành công..."
);
```

---

## ✅ Verification Commands

```bash
# 1. Seed template mới
cd giaobanbv-be
npm run seed:notifications

# 2. Start server và kiểm tra console
npm run dev
# Should see: [TriggerService] ✅ Loaded 11 triggers (11 enabled, 0 disabled)

# 3. Test API
curl http://localhost:8020/api/workmanagement/notifications/triggers/summary
```
