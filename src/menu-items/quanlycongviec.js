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
          id: "nhomviecuser",
          title: "Nhóm việc theo dõi",
          type: "item",
          url: "/quanlycongviec/nhomviec-user",
        },
        // Node động: Công việc của tôi (thay :NhanVienID bằng user.NhanVienID khi render Navigation)
        {
          id: "congvieccuatoi",
          title: "Công việc của tôi",
          type: "item",
          // Giữ placeholder, sẽ được thay trong Navigation
          url: "/quan-ly-cong-viec/nhan-vien/:NhanVienID",
        },
        {
          id: "congviecmindmap",
          title: "Sơ đồ Cây Công việc",
          type: "item",
          url: "/cong-viec-mind-map",
        },
        {
          id: "congviecmindmap1",
          title: "Sơ đồ Cây Công việc enhance",
          type: "item",
          url: "/cong-viec-hierarchical",
        },
        {
          id: "canbotoiquanly",
          title: "Cán bộ tôi quản lý",
          type: "item",
          // Placeholder; nếu chưa có user.NhanVienID sẽ bị loại bỏ ở Navigation
          url: "/workmanagement/nhanvien/:NhanVienID/quanly",
        },

        {
          id: "giaonhiemvu-theo-chuky",
          title: "📅 Phân công theo chu kỳ",
          type: "item",
          // ✅ FIX: Point to LIST view (no :NhanVienID param needed)
          url: "/quanlycongviec/giao-nhiem-vu-chu-ky",
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
