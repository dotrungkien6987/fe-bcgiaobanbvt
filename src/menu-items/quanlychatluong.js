// third-party

// assets
import {
  DocumentText1,
  ClipboardText,
  Chart21,
  Book1,
  Send2,
  ReceiveSquare2,
  Building,
} from "iconsax-react";

// icons
const icons = {
  document: DocumentText1,
  clipboard: ClipboardText,
  chart: Chart21,
  book: Book1,
  send: Send2,
  receive: ReceiveSquare2,
  building: Building,
};

// ==============================|| MENU ITEMS - QUẢN LÝ CHẤT LƯỢNG ||============================== //

// Group 1: Dành cho phòng Quản lý chất lượng (QLCL)
const quanlychatluongAdmin = {
  id: "group-quanlychatluong-admin",
  title: "Quản lý chất lượng",
  type: "group",
  icon: icons.clipboard,
  children: [
    {
      id: "quytrinh-iso-admin",
      title: "Quy trình ISO - Quản lý",
      type: "collapse",
      icon: icons.document,
      children: [
        {
          id: "quytrinh-dashboard",
          title: "📊 Tổng quan",
          type: "item",
          url: "/quytrinh-iso/dashboard",
        },
        {
          id: "quytrinh-list",
          title: "📄 Danh sách quy trình",
          type: "item",
          url: "/quytrinh-iso",
        },
        {
          id: "quytrinh-create",
          title: "➕ Thêm quy trình mới",
          type: "item",
          url: "/quytrinh-iso/create",
        },
        {
          id: "quytrinh-phanphoi",
          title: "🎯 Quản lý phân phối",
          type: "item",
          url: "/quytrinh-iso/phan-phoi",
        },
        {
          id: "quytrinh-khoa-iso",
          title: "⚙️ Quản lý khoa ISO",
          type: "item",
          url: "/quytrinh-iso/quan-ly-khoa-iso",
        },
      ],
    },
  ],
};

// Roles: Chỉ admin và qlcl
quanlychatluongAdmin.roles = ["admin", "qlcl"];

// Group 2: Dành cho tất cả users
const quanlychatluongUser = {
  id: "group-quanlychatluong-user",
  title: "Quy trình ISO",
  type: "group",
  icon: icons.document,
  children: [
    {
      id: "quytrinh-iso-user",
      title: "Quy trình ISO",
      type: "collapse",
      icon: icons.document,
      children: [
        {
          id: "quytrinh-duocphanphoi",
          title: "📥 QT được phân phối",
          type: "item",
          url: "/quytrinh-iso/duoc-phan-phoi",
        },
        {
          id: "quytrinh-khoaxaydung",
          title: "🏗️ QT khoa xây dựng",
          type: "item",
          url: "/quytrinh-iso/khoa-xay-dung",
        },
      ],
    },
  ],
};

// Roles: Tất cả users
quanlychatluongUser.roles = [
  "admin",
  "qlcl",
  "nomal",
  "manager",
  "noibo",
  "daotao",
];

export { quanlychatluongAdmin, quanlychatluongUser };
export default quanlychatluongAdmin; // Backward compatibility
