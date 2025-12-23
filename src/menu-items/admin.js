// third-party

// assets
import {
  Setting2,
  I24Support,
  Security,
  MessageProgramming,
  DollarSquare,
  Airplane,
} from "iconsax-react";

// icons
const icons = {
  page: Setting2,
  authentication: Security,
  maintenance: MessageProgramming,
  pricing: DollarSquare,
  contactus: I24Support,
  landing: Airplane,
};

// ==============================|| MENU ITEMS - PAGES ||============================== //

const admin = {
  id: "group-admin",
  title: "Admin",
  type: "group",
  icon: icons.page,
  children: [
    {
      id: "danhmucdaotao",
      title: "Quản lý người dùng",
      type: "collapse",
      icon: icons.page,
      children: [
        {
          id: "usersable",
          title: "Users",
          type: "item",
          url: "/usersable",
        },
        {
          id: "teptin",
          title: "Quản lý file",
          type: "item",
          url: "/admin/teptin",
        },
      ],
    },
    {
      id: "notification-types",
      title: "Quản lý loại thông báo",
      type: "item",
      icon: icons.maintenance,
      url: "/admin/notification-types",
    },
    {
      id: "notification-templates",
      title: "Quản lý mẫu thông báo",
      type: "item",
      icon: icons.maintenance,
      url: "/admin/notification-templates",
    },
  ],
};

export default admin;
