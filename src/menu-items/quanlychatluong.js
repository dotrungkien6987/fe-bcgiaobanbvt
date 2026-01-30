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

const quanlychatluong = {
  id: "group-quanlychatluong",
  title: "Quản lý chất lượng",
  type: "group",
  icon: icons.clipboard,
  children: [
    {
      id: "quytrinh-iso",
      title: "Quy trình ISO",
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
          roles: ["qlcl", "admin", "superadmin"],
        },
        {
          id: "quytrinh-phanphoi",
          title: "🎯 Quản lý phân phối",
          type: "item",
          url: "/quytrinh-iso/phan-phoi",
          roles: ["qlcl", "admin", "superadmin"],
        },
        {
          id: "quytrinh-khoa-iso",
          title: "⚙️ Quản lý khoa ISO",
          type: "item",
          url: "/quytrinh-iso/quan-ly-khoa-iso",
          roles: ["qlcl", "admin", "superadmin"],
        },
        {
          id: "quytrinh-duocphanphoi",
          title: "📥 QT được phân phối",
          type: "item",
          url: "/quytrinh-iso/duoc-phan-phoi",
          roles: ["default"],
        },
        {
          id: "quytrinh-khoaxaydung",
          title: "🏗️ QT khoa xây dựng",
          type: "item",
          url: "/quytrinh-iso/khoa-xay-dung",
          roles: ["default"],
        },
      ],
    },
  ],
};

// Roles: qlcl, admin, superadmin - hoặc default nếu muốn cho tất cả xem
quanlychatluong.roles = ["admin", "qlcl", "default"];

export default quanlychatluong;
