// project-imports

import nghiencuukhoahocs from "./nghiencuukhoahocs";
import hethong from "./hethong";
import baocao from "./baocao";
import daotaos from "./daotaos";
import admin from "./admin";
import lichtruc from "./lichtruc";
import quanlycongviec from "./quanlycongviec";
import notification from "./notification";
import { quanlychatluongAdmin, quanlychatluongUser } from "./quanlychatluong";

import newfeature from "./NoiBo/newfeature";
// Thêm thuộc tính roles cho từng menu item
// Note: User.PhanQuyen có 7 giá trị: "admin", "daotao", "nomal", "manager", "noibo", "qlcl", "cntt"
nghiencuukhoahocs.roles = ["admin", "daotao", "nomal", "manager", "noibo"]; // Không bao gồm qlcl, cntt
daotaos.roles = ["admin", "daotao"];
baocao.roles = ["admin", "daotao", "manager"];
hethong.roles = ["admin", "daotao"];
newfeature.roles = ["admin", "noibo"];
quanlycongviec.roles = [
  "admin",
  "daotao",
  "nomal",
  "manager",
  "noibo",
  "qlcl",
  "cntt",
]; // Tất cả đều thấy
admin.roles = ["admin"]; // Chỉ admin mới thấy
lichtruc.roles = ["admin", "daotao", "nomal", "manager", "noibo", "qlcl"]; // Tất cả đều thấy
notification.roles = ["admin", "daotao", "nomal", "manager", "noibo", "qlcl"]; // Tất cả đều thấy
// quanlychatluong đã có roles trong file của nó (2 groups riêng biệt)

// ==============================|| MENU ITEMS ||============================== //

const menuItems = {
  items: [
    daotaos,
    nghiencuukhoahocs,
    baocao,
    lichtruc,
    quanlycongviec,
    quanlychatluongAdmin, // Group cho phòng QLCL (5 items)
    quanlychatluongUser, // Group cho tất cả users (2 items)
    notification,
    hethong,
    admin,
  ],
};

export default menuItems;
