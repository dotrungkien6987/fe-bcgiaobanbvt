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
          id: "giaonhiemvu",
          title: "Phân công cho nhân viên của tôi",
          type: "item",
          // Placeholder; nếu chưa có user.NhanVienID sẽ bị loại bỏ ở Navigation
          url: "/quanlycongviec/giao-nhiem-vu/:NhanVienID",
        },

      
        {
          id: "nhiemvuthuongquy",
          title: "Nhiệm vụ thường quy",
          type: "item",
          url: "/quanlycongviec/nhiemvu-thuongquy",
        },
       
      ],
    },

  ],
};

export default quanlycongviec;
