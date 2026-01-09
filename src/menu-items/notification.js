// third-party

// assets
import { Notification, Setting3 } from "iconsax-react";

// icons
const icons = {
  notification: Notification,
  settings: Setting3,
};

// ==============================|| MENU ITEMS - NOTIFICATION ||============================== //

const notification = {
  id: "group-notification",
  title: "Thông báo",
  type: "group",
  icon: icons.notification,
  children: [
    {
      id: "thongbao",
      title: "Danh sách thông báo",
      type: "item",
      url: "/quanlycongviec/thong-bao",
      icon: icons.notification,
    },
    {
      id: "caidatthongbao",
      title: "Cài đặt thông báo",
      type: "item",
      url: "/quanlycongviec/cai-dat/thong-bao",
      icon: icons.settings,
    },
  ],
};

export default notification;
