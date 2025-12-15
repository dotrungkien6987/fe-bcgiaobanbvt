/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *                      YEU CAU TAB CONFIGURATION
 *                    Single Source of Truth for All Tabs
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * File này chứa toàn bộ cấu hình cho các tabs trong hệ thống Yêu Cầu.
 * Mọi thay đổi về logic filter, labels, icons đều được quản lý tại đây.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 *                           DATA MODEL REFERENCE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * YeuCau Document:
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ NGƯỜI GỬI                                                                   │
 * │   - NguoiYeuCauID: ObjectId (NhanVien) ← Người tạo yêu cầu                 │
 * │   - KhoaNguonID: ObjectId (Khoa) ← Khoa của người gửi                      │
 * ├─────────────────────────────────────────────────────────────────────────────┤
 * │ NGƯỜI NHẬN                                                                  │
 * │   - KhoaDichID: ObjectId (Khoa) ← Khoa nhận yêu cầu                        │
 * │   - LoaiNguoiNhan: "KHOA" | "CA_NHAN"                                       │
 * │   - NguoiNhanID: ObjectId (NhanVien) | null ← Nếu gửi trực tiếp cá nhân   │
 * ├─────────────────────────────────────────────────────────────────────────────┤
 * │ ĐIỀU PHỐI                                                                   │
 * │   - NguoiDieuPhoiID: ObjectId (NhanVien) ← Người điều phối (giao việc)     │
 * │   - NguoiDuocDieuPhoiID: ObjectId (NhanVien) ← Người được giao việc        │
 * │   - NgayDieuPhoi: Date                                                      │
 * ├─────────────────────────────────────────────────────────────────────────────┤
 * │ XỬ LÝ                                                                       │
 * │   - NguoiXuLyID: ObjectId (NhanVien) ← Người đã tiếp nhận và xử lý         │
 * │   - NgayTiepNhan: Date                                                      │
 * │   - NgayHoanThanh: Date                                                     │
 * ├─────────────────────────────────────────────────────────────────────────────┤
 * │ TRẠNG THÁI (5 States)                                                       │
 * │   - MOI: Vừa tạo, chờ tiếp nhận                                            │
 * │   - DANG_XU_LY: Đã tiếp nhận và đang xử lý                                 │
 * │   - DA_HOAN_THANH: Đã hoàn thành, chờ đánh giá/đóng                        │
 * │   - DA_DONG: Đã đóng (hoàn tất flow)                                       │
 * │   - TU_CHOI: Bị từ chối                                                    │
 * └─────────────────────────────────────────────────────────────────────────────┘
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 *                           BACKEND TAB FILTER LOGIC
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Backend Service (yeuCau.service.js - layDanhSach) hỗ trợ các tabs sau:
 *
 * ┌──────────────┬───────────────────────────────────────────────────────────────┐
 * │ tab param    │ MongoDB Filter                                                │
 * ├──────────────┼───────────────────────────────────────────────────────────────┤
 * │ "toi-gui"    │ { NguoiYeuCauID: nguoiXemId }                                 │
 * │              │ → Yêu cầu TÔI tạo                                             │
 * ├──────────────┼───────────────────────────────────────────────────────────────┤
 * │ "toi-xu-ly"  │ { $or: [                                                      │
 * │              │     { NguoiDuocDieuPhoiID: nguoiXemId },                       │
 * │              │     { NguoiNhanID: nguoiXemId },                               │
 * │              │     { NguoiXuLyID: nguoiXemId }                                │
 * │              │   ]                                                           │
 * │              │ }                                                              │
 * │              │ → Yêu cầu TÔI xử lý (được giao/gửi trực tiếp/đang xử lý)      │
 * ├──────────────┼───────────────────────────────────────────────────────────────┤
 * │ "can-xu-ly"  │ { KhoaDichID: nguoiXem.KhoaID }                               │
 * │              │ → Yêu cầu gửi đến KHOA tôi (tất cả NV trong khoa đều thấy)   │
 * ├──────────────┼───────────────────────────────────────────────────────────────┤
 * │ "da-xu-ly"   │ { NguoiXuLyID: nguoiXemId,                                    │
 * │              │   TrangThai: { $in: [DA_HOAN_THANH, DA_DONG] } }              │
 * │              │ → Yêu cầu tôi ĐÃ xử lý xong                                   │
 * ├──────────────┼───────────────────────────────────────────────────────────────┤
 * │ (default)    │ { $or: [                                                      │
 * │              │     { NguoiYeuCauID: nguoiXemId },                             │
 * │              │     { KhoaDichID: nguoiXem.KhoaID },                           │
 * │              │     { KhoaNguonID: nguoiXem.KhoaID }                           │
 * │              │   ]                                                           │
 * │              │ }                                                              │
 * │              │ → Tất cả yêu cầu liên quan                                    │
 * └──────────────┴───────────────────────────────────────────────────────────────┘
 *
 * Kết hợp với trangThai param để filter thêm theo trạng thái.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ============================================================================
//                              CONSTANTS
// ============================================================================

export const TRANG_THAI = {
  MOI: "MOI",
  DANG_XU_LY: "DANG_XU_LY",
  DA_HOAN_THANH: "DA_HOAN_THANH",
  DA_DONG: "DA_DONG",
  TU_CHOI: "TU_CHOI",
};

export const TRANG_THAI_LABELS = {
  MOI: "Mới",
  DANG_XU_LY: "Đang xử lý",
  DA_HOAN_THANH: "Đã hoàn thành",
  DA_DONG: "Đã đóng",
  TU_CHOI: "Từ chối",
};

export const TRANG_THAI_COLORS = {
  MOI: "info",
  DANG_XU_LY: "warning",
  DA_HOAN_THANH: "success",
  DA_DONG: "default",
  TU_CHOI: "error",
};

// ============================================================================
//                         PAGE CONFIGURATIONS
// ============================================================================

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *                          PAGE 1: YÊU CẦU TÔI GỬI
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Mục đích: Hiển thị tất cả yêu cầu do TÔI tạo
 * Backend filter: tab="toi-gui" → NguoiYeuCauID = myNhanVienId
 *
 * ┌─────────────┬────────────────┬─────────────────────────────────────────────┐
 * │ Tab         │ TrangThai      │ Ý nghĩa                                     │
 * ├─────────────┼────────────────┼─────────────────────────────────────────────┤
 * │ cho-phan-hoi│ MOI            │ Đã gửi, chưa ai tiếp nhận                   │
 * │ dang-xu-ly  │ DANG_XU_LY     │ Có người đang xử lý                         │
 * │ cho-danh-gia│ DA_HOAN_THANH  │ Đã xử lý xong, chờ tôi đánh giá/đóng       │
 * │ da-dong     │ DA_DONG        │ Đã đóng (lịch sử)                           │
 * │ tu-choi     │ TU_CHOI        │ Bị từ chối (có thể gửi lại/khiếu nại)      │
 * └─────────────┴────────────────┴─────────────────────────────────────────────┘
 */
export const YEU_CAU_TOI_GUI_CONFIG = {
  pageKey: "YEU_CAU_TOI_GUI",
  title: "Yêu cầu tôi gửi đi",
  icon: "📤",
  description: "Các yêu cầu do tôi tạo và gửi đi",
  route: "/yeu-cau-toi-gui",

  // Backend base params - Áp dụng cho TẤT CẢ tabs trong page này
  baseParams: {
    tab: "toi-gui", // Backend filter: NguoiYeuCauID = myNhanVienId
  },

  // Pagination defaults
  pagination: {
    limit: 20,
  },

  // Tab definitions
  tabs: [
    {
      key: "cho-phan-hoi",
      label: "Chờ tiếp nhận",
      icon: "HourglassEmpty",
      color: "info",
      params: { trangThai: TRANG_THAI.MOI },
      description: "Yêu cầu đã gửi, chưa ai tiếp nhận",
      emptyMessage: "Không có yêu cầu nào đang chờ phản hồi",
    },
    {
      key: "dang-xu-ly",
      label: "Đang xử lý",
      icon: "Build",
      color: "warning",
      params: { trangThai: TRANG_THAI.DANG_XU_LY },
      description: "Có người đang xử lý yêu cầu của bạn",
      emptyMessage: "Không có yêu cầu nào đang được xử lý",
    },
    {
      key: "cho-danh-gia",
      label: "Chờ đánh giá",
      icon: "RateReview",
      color: "success",
      params: { trangThai: TRANG_THAI.DA_HOAN_THANH },
      description: "Đã hoàn thành, chờ bạn đánh giá và đóng",
      emptyMessage: "Không có yêu cầu nào chờ đánh giá",
    },
    {
      key: "da-dong",
      label: "Đã đóng",
      icon: "CheckCircle",
      color: "default",
      params: { trangThai: TRANG_THAI.DA_DONG },
      description: "Yêu cầu đã hoàn tất",
      emptyMessage: "Chưa có yêu cầu nào đã đóng",
    },
    {
      key: "tu-choi",
      label: "Bị từ chối",
      icon: "Cancel",
      color: "error",
      params: { trangThai: TRANG_THAI.TU_CHOI },
      description: "Yêu cầu bị từ chối, có thể gửi lại hoặc khiếu nại",
      emptyMessage: "Không có yêu cầu nào bị từ chối",
    },
  ],

  // Actions available
  actions: {
    canCreate: true, // Có thể tạo yêu cầu mới
    canEdit: (yeuCau) => yeuCau.TrangThai === TRANG_THAI.MOI, // Chỉ sửa khi MOI
    canDelete: (yeuCau) => yeuCau.TrangThai === TRANG_THAI.MOI, // Chỉ xóa khi MOI
    canRate: (yeuCau) => yeuCau.TrangThai === TRANG_THAI.DA_HOAN_THANH, // Đánh giá khi hoàn thành
    canClose: (yeuCau) => yeuCau.TrangThai === TRANG_THAI.DA_HOAN_THANH, // Đóng khi hoàn thành
  },
};

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *                          PAGE 2: YÊU CẦU TÔI XỬ LÝ
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Mục đích: Hiển thị tất cả yêu cầu mà TÔI phải xử lý
 * Backend filter: tab="toi-xu-ly" → $or: [
 *   { NguoiDuocDieuPhoiID: myNhanVienId },  // Được điều phối giao
 *   { NguoiNhanID: myNhanVienId },          // Được gửi trực tiếp
 *   { NguoiXuLyID: myNhanVienId }           // Đang/đã xử lý
 * ]
 *
 * ┌──────────────┬────────────────┬─────────────────────────────────────────────┐
 * │ Tab          │ TrangThai      │ Ý nghĩa                                     │
 * ├──────────────┼────────────────┼─────────────────────────────────────────────┤
 * │ cho-tiep-nhan│ MOI            │ Được giao/gửi trực tiếp, chưa tiếp nhận    │
 * │ dang-xu-ly   │ DANG_XU_LY     │ Tôi đang xử lý                              │
 * │ cho-xac-nhan │ DA_HOAN_THANH  │ Tôi đã hoàn thành, chờ người gửi đóng      │
 * │ da-hoan-thanh│ DA_DONG        │ Đã hoàn tất (lịch sử)                       │
 * └──────────────┴────────────────┴─────────────────────────────────────────────┘
 *
 * Lưu ý: Tab "Bị từ chối" không có ở đây vì người xử lý là người từ chối,
 *        sau khi từ chối YC không còn thuộc về họ nữa.
 */
export const YEU_CAU_TOI_XU_LY_CONFIG = {
  pageKey: "YEU_CAU_TOI_XU_LY",
  title: "Yêu cầu tôi xử lý",
  icon: "🔧",
  description: "Các yêu cầu được giao cho tôi hoặc gửi trực tiếp đến tôi",
  route: "/yeu-cau-xu-ly",

  // Backend base params
  baseParams: {
    tab: "toi-xu-ly", // Backend filter: NguoiDuocDieuPhoiID | NguoiNhanID | NguoiXuLyID = myNhanVienId
  },

  pagination: {
    limit: 20,
  },

  tabs: [
    {
      key: "cho-tiep-nhan",
      label: "Chờ tiếp nhận",
      icon: "Inbox",
      color: "info",
      params: { trangThai: TRANG_THAI.MOI },
      description: "Yêu cầu được giao cho bạn, chờ bạn tiếp nhận",
      emptyMessage: "Không có yêu cầu nào chờ bạn tiếp nhận",
      // Badge logic: Số lượng YC cần tiếp nhận (urgent)
      badgeType: "urgent",
    },
    {
      key: "dang-xu-ly",
      label: "Đang xử lý",
      icon: "Build",
      color: "warning",
      params: { trangThai: TRANG_THAI.DANG_XU_LY },
      description: "Yêu cầu bạn đang xử lý",
      emptyMessage: "Bạn không có yêu cầu nào đang xử lý",
    },
    {
      key: "cho-xac-nhan",
      label: "Đã hoàn thành - chờ xác nhận",
      icon: "HourglassTop",
      color: "success",
      params: { trangThai: TRANG_THAI.DA_HOAN_THANH },
      description: "Bạn đã hoàn thành, chờ người gửi xác nhận đóng",
      emptyMessage: "Không có yêu cầu nào chờ xác nhận",
    },
    {
      key: "da-hoan-thanh",
      label: "Đã đóng",
      icon: "CheckCircle",
      color: "default",
      params: { trangThai: TRANG_THAI.DA_DONG },
      description: "Yêu cầu đã xử lý xong và đóng",
      emptyMessage: "Chưa có yêu cầu nào đã đóng",
    },
  ],

  // KPI Metrics cho người xử lý
  showKPIMetrics: true,
  kpiMetrics: [
    { key: "tongXuLy", label: "Tổng đã xử lý", icon: "Assignment" },
    { key: "trungBinhSao", label: "Điểm đánh giá TB", icon: "Star" },
    { key: "tyLeDungHan", label: "Tỷ lệ đúng hạn", icon: "Timer" },
  ],

  actions: {
    canAccept: (yeuCau, myNhanVienId) =>
      yeuCau.TrangThai === TRANG_THAI.MOI &&
      (yeuCau.NguoiDuocDieuPhoiID === myNhanVienId ||
        yeuCau.NguoiNhanID === myNhanVienId),
    canReject: (yeuCau, myNhanVienId) =>
      yeuCau.TrangThai === TRANG_THAI.MOI &&
      (yeuCau.NguoiDuocDieuPhoiID === myNhanVienId ||
        yeuCau.NguoiNhanID === myNhanVienId),
    canComplete: (yeuCau, myNhanVienId) =>
      yeuCau.TrangThai === TRANG_THAI.DANG_XU_LY &&
      yeuCau.NguoiXuLyID === myNhanVienId,
  },
};

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *                          PAGE 3: ĐIỀU PHỐI YÊU CẦU
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Mục đích: Điều phối viên quản lý yêu cầu gửi đến khoa
 * Điều kiện truy cập: isNguoiDieuPhoi = true (từ CauHinhThongBaoKhoa)
 * Backend filter: khoaDichId=myKhoaID (lọc theo khoa đích)
 *
 * ┌──────────────┬────────────────┬─────────────────────────────────────────────┐
 * │ Tab          │ Filter Logic   │ Ý nghĩa                                     │
 * ├──────────────┼────────────────┼─────────────────────────────────────────────┤
 * │ moi-den      │ MOI +          │ YC mới đến khoa, chưa ai điều phối          │
 * │              │ NguoiDuocDieu  │ (NguoiDuocDieuPhoiID = null)                │
 * │              │ PhoiID = null  │                                             │
 * ├──────────────┼────────────────┼─────────────────────────────────────────────┤
 * │ da-dieu-phoi │ MOI +          │ Đã điều phối, chờ người được giao tiếp nhận │
 * │              │ NguoiDuocDieu  │ (NguoiDuocDieuPhoiID != null)               │
 * │              │ PhoiID != null │                                             │
 * ├──────────────┼────────────────┼─────────────────────────────────────────────┤
 * │ dang-xu-ly   │ DANG_XU_LY     │ Đã có người tiếp nhận và đang xử lý         │
 * ├──────────────┼────────────────┼─────────────────────────────────────────────┤
 * │ hoan-thanh   │ DA_HOAN_THANH  │ Đã hoàn thành, chờ đóng                     │
 * │              │ | DA_DONG      │                                             │
 * ├──────────────┼────────────────┼─────────────────────────────────────────────┤
 * │ tu-choi      │ TU_CHOI        │ YC bị từ chối (cần xem xét lại)             │
 * └──────────────┴────────────────┴─────────────────────────────────────────────┘
 */
export const YEU_CAU_DIEU_PHOI_CONFIG = {
  pageKey: "YEU_CAU_DIEU_PHOI",
  title: "Điều phối yêu cầu",
  icon: "🎯",
  description: "Quản lý và phân công yêu cầu gửi đến khoa",
  route: "/yeu-cau-dieu-phoi",
  requireRole: "isNguoiDieuPhoi", // Yêu cầu quyền điều phối

  // Backend base params - Dùng khoaDichId thay vì tab
  // vì cần filter chi tiết hơn (NguoiDuocDieuPhoiID null/not null)
  // ⚠️ CRITICAL: Must use NhanVien.KhoaID (from nhanVienInfo), NOT User.KhoaID
  getBaseParams: (user) => ({
    khoaDichId: user?.nhanVienInfo?.khoaId,
  }),

  pagination: {
    limit: 20,
  },

  tabs: [
    {
      key: "moi-den",
      label: "Mới đến",
      icon: "NotificationsActive",
      color: "error",
      params: { trangThai: TRANG_THAI.MOI, chuaDieuPhoi: true },
      description: "Yêu cầu mới gửi đến khoa, chưa điều phối",
      emptyMessage: "Không có yêu cầu mới nào chờ điều phối",
      badgeType: "urgent",
      // Backend cần thêm logic: filter NguoiDuocDieuPhoiID = null
    },
    {
      key: "da-dieu-phoi",
      label: "Đã điều phối",
      icon: "AssignmentInd",
      color: "info",
      params: { trangThai: TRANG_THAI.MOI, daDieuPhoi: true },
      description: "Đã giao việc, chờ người xử lý tiếp nhận",
      emptyMessage: "Không có yêu cầu nào đang chờ tiếp nhận",
      // Backend cần thêm logic: filter NguoiDuocDieuPhoiID != null
    },
    {
      key: "dang-xu-ly",
      label: "Đang xử lý",
      icon: "Engineering",
      color: "warning",
      params: { trangThai: TRANG_THAI.DANG_XU_LY },
      description: "Yêu cầu đang được xử lý",
      emptyMessage: "Không có yêu cầu nào đang xử lý",
    },
    {
      key: "hoan-thanh",
      label: "Hoàn thành",
      icon: "CheckCircle",
      color: "success",
      // Backend chưa support multiple trangThai, tạm dùng DA_DONG
      params: { trangThai: TRANG_THAI.DA_DONG },
      description: "Yêu cầu đã hoàn tất",
      emptyMessage: "Chưa có yêu cầu nào hoàn thành",
    },
    {
      key: "tu-choi",
      label: "Từ chối",
      icon: "Block",
      color: "error",
      params: { trangThai: TRANG_THAI.TU_CHOI },
      description: "Yêu cầu bị từ chối, cần xem xét",
      emptyMessage: "Không có yêu cầu nào bị từ chối",
    },
  ],

  // Dashboard metrics cho điều phối
  showDashboard: true,
  dashboardMetrics: [
    { key: "moiHomNay", label: "Mới hôm nay", icon: "Today", color: "info" },
    { key: "quaHan", label: "Quá hạn", icon: "Warning", color: "error" },
    {
      key: "choDieuPhoi",
      label: "Chờ điều phối",
      icon: "Pending",
      color: "warning",
    },
    { key: "dangXuLy", label: "Đang xử lý", icon: "Build", color: "primary" },
  ],

  actions: {
    canDispatch: (yeuCau) =>
      yeuCau.TrangThai === TRANG_THAI.MOI && !yeuCau.NguoiDuocDieuPhoiID,
    canReDispatch: (yeuCau) =>
      yeuCau.TrangThai === TRANG_THAI.MOI && yeuCau.NguoiDuocDieuPhoiID,
    canEscalate: (yeuCau) =>
      [TRANG_THAI.MOI, TRANG_THAI.DANG_XU_LY].includes(yeuCau.TrangThai),
  },
};

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *                          PAGE 4: QUẢN LÝ YÊU CẦU KHOA
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Mục đích: Quản lý khoa xem tổng quan yêu cầu của khoa
 * Điều kiện truy cập: isQuanLyKhoa = true (từ CauHinhThongBaoKhoa)
 *
 * ┌──────────────┬────────────────┬─────────────────────────────────────────────┐
 * │ Tab          │ Filter Logic   │ Ý nghĩa                                     │
 * ├──────────────┼────────────────┼─────────────────────────────────────────────┤
 * │ gui-den-khoa │ KhoaDichID     │ Tất cả YC gửi đến khoa                      │
 * ├──────────────┼────────────────┼─────────────────────────────────────────────┤
 * │ khoa-gui-di  │ KhoaNguonID    │ Tất cả YC từ nhân viên khoa gửi đi          │
 * ├──────────────┼────────────────┼─────────────────────────────────────────────┤
 * │ qua-han      │ HanXuLy < now  │ YC quá hạn xử lý                            │
 * │              │ & TrangThai    │                                             │
 * │              │ != DA_DONG     │                                             │
 * ├──────────────┼────────────────┼─────────────────────────────────────────────┤
 * │ bao-cao      │ -              │ Tab báo cáo thống kê (không load list)      │
 * └──────────────┴────────────────┴─────────────────────────────────────────────┘
 */
export const YEU_CAU_QUAN_LY_KHOA_CONFIG = {
  pageKey: "YEU_CAU_QUAN_LY_KHOA",
  title: "Quản lý yêu cầu khoa",
  icon: "📊",
  description: "Tổng quan và báo cáo yêu cầu của khoa",
  route: "/yeu-cau-quan-ly-khoa",
  requireRole: "isQuanLyKhoa", // Yêu cầu quyền quản lý khoa

  // Backend base params
  // ⚠️ CRITICAL: Must use NhanVien.KhoaID (from nhanVienInfo), NOT User.KhoaID
  getBaseParams: (user) => ({
    khoaDichId: user?.nhanVienInfo?.khoaId,
  }),

  pagination: {
    limit: 50, // Manager xem nhiều hơn
  },

  tabs: [
    {
      key: "gui-den-khoa",
      label: "Gửi đến khoa",
      icon: "CallReceived",
      color: "primary",
      params: {}, // Chỉ dùng baseParams (khoaDichId)
      description: "Tất cả yêu cầu gửi đến khoa",
      emptyMessage: "Không có yêu cầu nào gửi đến khoa",
    },
    {
      key: "khoa-gui-di",
      label: "Khoa gửi đi",
      icon: "CallMade",
      color: "secondary",
      // Backend cần support: khoaNguonId param
      params: { filterType: "khoa-gui-di" },
      description: "Tất cả yêu cầu từ nhân viên khoa gửi đi",
      emptyMessage: "Không có yêu cầu nào từ khoa gửi đi",
    },
    {
      key: "qua-han",
      label: "Quá hạn",
      icon: "Warning",
      color: "error",
      // Backend cần support: quaHan filter
      params: { quaHan: true },
      description: "Yêu cầu quá hạn xử lý",
      emptyMessage: "Không có yêu cầu nào quá hạn",
      badgeType: "warning",
    },
    {
      key: "bao-cao",
      label: "Báo cáo",
      icon: "Assessment",
      color: "default",
      isReport: true, // Tab này không load list, hiển thị charts
      description: "Thống kê và báo cáo",
    },
  ],

  // Summary metrics cho quản lý
  showSummary: true,
  summaryMetrics: [
    { key: "tongGuiDen", label: "Tổng gửi đến", icon: "Inbox" },
    { key: "tongGuiDi", label: "Tổng gửi đi", icon: "Send" },
    { key: "quaHan", label: "Quá hạn", icon: "Warning", color: "error" },
    { key: "tyLeHoanThanh", label: "Tỷ lệ hoàn thành", icon: "PieChart" },
  ],

  actions: {
    canExport: true, // Xuất báo cáo
    canViewDetails: true,
  },
};

// ============================================================================
//                         EXPORT ALL CONFIGS
// ============================================================================

export const ALL_YEU_CAU_CONFIGS = {
  YEU_CAU_TOI_GUI: YEU_CAU_TOI_GUI_CONFIG,
  YEU_CAU_TOI_XU_LY: YEU_CAU_TOI_XU_LY_CONFIG,
  YEU_CAU_DIEU_PHOI: YEU_CAU_DIEU_PHOI_CONFIG,
  YEU_CAU_QUAN_LY_KHOA: YEU_CAU_QUAN_LY_KHOA_CONFIG,
};

// ============================================================================
//                         HELPER FUNCTIONS
// ============================================================================

/**
 * Lấy config cho một tab cụ thể
 * @param {string} pageKey - Key của page (YEU_CAU_TOI_GUI, ...)
 * @param {string} tabKey - Key của tab (cho-phan-hoi, ...)
 */
export function getTabConfig(pageKey, tabKey) {
  const pageConfig = ALL_YEU_CAU_CONFIGS[pageKey];
  if (!pageConfig) return null;

  const tab = pageConfig.tabs.find((t) => t.key === tabKey);
  if (!tab) return null;

  return {
    ...tab,
    pageConfig,
  };
}

/**
 * Build API params cho một tab
 * @param {string} pageKey - Key của page
 * @param {string} tabKey - Key của tab
 * @param {Object} user - User object từ useAuth()
 * @param {Object} overrides - Override params (page, limit, ...)
 */
export function buildTabParams(pageKey, tabKey, user, overrides = {}) {
  const pageConfig = ALL_YEU_CAU_CONFIGS[pageKey];
  if (!pageConfig) return null;

  const tab = pageConfig.tabs.find((t) => t.key === tabKey);
  if (!tab) return null;

  // Base params (có thể là object hoặc function)
  const baseParams =
    typeof pageConfig.getBaseParams === "function"
      ? pageConfig.getBaseParams(user)
      : pageConfig.baseParams || {};

  // Merge: baseParams + tab.params + pagination defaults + overrides
  return {
    page: 1,
    limit: pageConfig.pagination?.limit || 20,
    ...baseParams,
    ...tab.params,
    ...overrides,
  };
}

/**
 * Lấy default tab của một page
 */
export function getDefaultTab(pageKey) {
  const pageConfig = ALL_YEU_CAU_CONFIGS[pageKey];
  return pageConfig?.tabs?.[0]?.key || null;
}

/**
 * Validate tab key
 */
export function isValidTab(pageKey, tabKey) {
  const pageConfig = ALL_YEU_CAU_CONFIGS[pageKey];
  if (!pageConfig) return false;
  return pageConfig.tabs.some((t) => t.key === tabKey);
}
