// third-party

// assets

import {
  Book1,
  I24Support,
  ReceiptSearch,
  Bank,
  MessageProgramming,
  MenuBoard,
  Airplane,
  PresentionChart,
  MedalStar,
  StatusUp,
  Setting2,
  Calendar2,
  MessageQuestion,
  Category2,
  Clock,
} from "iconsax-react";

// icons
const icons = {
  page: Book1,
  baocao: ReceiptSearch,
  maintenance: MessageProgramming,
  menuboard: MenuBoard,
  contactus: I24Support,
  landing: Airplane,
  bank: Bank,
  chart: PresentionChart,
  medal: MedalStar,
  status: StatusUp,
  setting: Setting2,
  calendar: Calendar2,
  ticket: MessageQuestion,
  settings: Setting2,
  category: Category2,
  history: Clock,
};

// ==============================|| MENU ITEMS - PAGES ||============================== //

const quanlycongviec = {
  id: "group-pages",
  title: "Quản lý công việc và KPI",
  type: "group",
  icon: icons.page,
  children: [
    {
      id: "quanlycongviec",
      title: "Quản lý công việc",
      type: "collapse",
      icon: icons.menuboard,
      children: [
        {
          id: "dashboardcongviec",
          title: "📊 Dashboard Công Việc",
          type: "item",
          url: "/quanlycongviec/cong-viec-dashboard",
        },
        {
          id: "nhomviecuser",
          title: "Nhóm việc theo dõi",
          type: "item",
          url: "/quanlycongviec/nhomviec-user",
        },
        {
          id: "congvieccuatoi",
          title: "Công việc tôi nhận",
          type: "item",
          url: "/quanlycongviec/cong-viec-cua-toi",
        },
        {
          id: "viectoigiao",
          title: "Việc tôi giao",
          type: "item",
          url: "/quanlycongviec/viec-toi-giao",
        },
        {
          id: "lichsuhoanthanh",
          title: "Lịch sử hoàn thành",
          type: "item",
          url: "/quanlycongviec/lich-su-hoan-thanh",
          icon: icons.history,
        },
        {
          id: "congviecmindmap",
          title: "Sơ đồ Cây Công việc",
          type: "item",
          url: "/quanlycongviec/congviec/mind-map",
        },
        {
          id: "congviecmindmap1",
          title: "Sơ đồ Cây Công việc enhance",
          type: "item",
          url: "/quanlycongviec/congviec/hierarchical",
        },
        {
          id: "canbotoiquanly",
          title: "Cán bộ tôi quản lý",
          type: "item",
          // Placeholder; nếu chưa có user.NhanVienID sẽ bị loại bỏ ở Navigation
          url: "/quanlycongviec/quan-ly-nhan-vien/:NhanVienID",
        },

        {
          id: "giaonhiemvu-theo-chuky",
          title: "📅 Phân công theo chu kỳ",
          type: "item",
          url: "/quanlycongviec/giao-nhiemvu",
        },

        {
          id: "nhiemvuthuongquy",
          title: "Nhiệm vụ thường quy",
          type: "item",
          url: "/quanlycongviec/nhiemvu-thuongquy",
        },
      ],
    },

    // ==============================
    // Ticket/Support Request Menu
    // ==============================
    {
      id: "quanlyyeucau",
      title: "Quản lý yêu cầu",
      type: "collapse",
      icon: icons.ticket,
      children: [
        {
          id: "dashboardyeucau",
          title: "📊 Dashboard Yêu cầu",
          type: "item",
          url: "/quanlycongviec/yeu-cau-dashboard",
        },
        {
          id: "yeucau-toi-gui",
          title: "Yêu cầu tôi gửi",
          type: "item",
          url: "/quanlycongviec/yeucau/toi-gui",
          // Badge will be added dynamically via useYeuCauBadgeCounts hook
        },
        {
          id: "yeucau-xu-ly",
          title: "Yêu cầu tôi xử lý",
          type: "item",
          url: "/quanlycongviec/yeucau/xu-ly",
          // Badge will be added dynamically
        },
        {
          id: "yeucau-dieu-phoi",
          title: "Điều phối",
          type: "item",
          url: "/quanlycongviec/yeucau/dieu-phoi",
          // Badge will be added dynamically, hidden if not điều phối
        },
        {
          id: "yeucau-quan-ly-khoa",
          title: "Quản lý khoa",
          type: "item",
          url: "/quanlycongviec/yeucau/quan-ly-khoa",
          // Hidden if not quản lý khoa
        },
        {
          id: "yeucau-hotro-legacy",
          title: "Tất cả yêu cầu (Cũ)",
          type: "item",
          url: "/quanlycongviec/yeucau",
        },
        {
          id: "yeucau-admin-cauhinh",
          title: "Cấu hình Khoa",
          type: "item",
          url: "/quanlycongviec/yeucau/admin/cau-hinh-khoa",
          icon: icons.settings,
          requiredRole: ["admin", "superadmin", "QuanLyKhoa"],
        },
        {
          id: "yeucau-admin-danhmuc",
          title: "Danh mục Yêu cầu",
          type: "item",
          url: "/quanlycongviec/yeucau/admin/danh-muc",
          icon: icons.category,
          requiredRole: ["admin", "superadmin", "QuanLyKhoa"],
        },
        {
          id: "yeucau-admin-lydotuchoi",
          title: "Lý do từ chối",
          type: "item",
          url: "/quanlycongviec/yeucau/admin/ly-do-tu-choi",
          icon: icons.category,
          requiredRole: ["admin", "superadmin"],
        },
      ],
    },

    // ==============================
    // KPI Management Menu
    // ==============================
    {
      id: "kpi",
      title: "Đánh giá KPI",
      type: "collapse",
      icon: icons.medal,
      children: [
        {
          id: "kpi-xem",
          title: "KPI của tôi",
          type: "item",
          url: "/quanlycongviec/kpi/xem",
          icon: icons.status,
          breadcrumbs: true,
        },
        {
          id: "kpi-tu-danh-gia",
          title: "Tự đánh giá KPI",
          type: "item",
          url: "/quanlycongviec/kpi/tu-danh-gia",
          icon: icons.status,
          breadcrumbs: true,
          chip: {
            label: "MỚI",
            color: "primary",
            size: "small",
          },
        },
        {
          id: "kpi-danhgia-nhanvien",
          title: "Chấm điểm KPI",
          type: "item",
          url: "/quanlycongviec/kpi/danh-gia-nhan-vien",
          icon: icons.medal,
          breadcrumbs: true,
        },

        {
          id: "kpi-baocao",
          title: "Báo cáo & Thống kê",
          type: "item",
          url: "/quanlycongviec/kpi/bao-cao",
          icon: icons.chart,
          breadcrumbs: true,
          // Chỉ admin (Role >= 3) mới thấy
          roles: ["admin"],
        },
        {
          id: "kpi-chuky",
          title: "Quản lý chu kỳ",
          type: "item",
          url: "/quanlycongviec/kpi/chu-ky",
          icon: icons.calendar,
          breadcrumbs: true,
          // Chỉ admin (Role >= 3) mới thấy
          roles: ["admin"],
        },
      ],
    },
  ],
};

export default quanlycongviec;
