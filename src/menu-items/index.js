// project-imports
import applications from './applications';
import widget from './widget';
import formsTables from './forms-tables';

import support from './support';
import nghiencuukhoahocs from './nghiencuukhoahocs';
import hethong from './hethong';
import baocao from './baocao';
import daotaos from './daotaos';
import admin from './admin';
import lichtruc from './lichtruc';
import quanlycongviec from './quanlycongviec';


import newfeature from './NoiBo/newfeature';
// Thêm thuộc tính roles cho từng menu item
nghiencuukhoahocs.roles = ['admin', 'daotao', 'default']; // Tất cả đều thấy
daotaos.roles = ['admin', 'daotao'];
baocao.roles = ['admin', 'daotao', 'manager'];
hethong.roles = ['admin','daotao'];
newfeature.roles = ['admin','noibo'];
quanlycongviec.roles = ['admin', 'default']; // Tất cả đều thấy
admin.roles = ['admin']; // Chỉ admin mới thấy
lichtruc.roles = ['admin', 'default']; // Tất cả đều thấy menu lịch trực

// ==============================|| MENU ITEMS ||============================== //

const menuItems = {
  items: [ daotaos, nghiencuukhoahocs, baocao, lichtruc, quanlycongviec,hethong, admin]
};

export default menuItems;
