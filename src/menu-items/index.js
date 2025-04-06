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

import newfeature from './NoiBo/newfeature';
// Thêm thuộc tính roles cho từng menu item
nghiencuukhoahocs.roles = ['admin', 'daotao', 'default']; // Tất cả đều thấy
daotaos.roles = ['admin', 'daotao'];
baocao.roles = ['admin', 'daotao', 'manager'];
hethong.roles = ['admin'];
newfeature.roles = ['admin','noibo'];
admin.roles = ['admin']; // Chỉ admin mới thấy

// ==============================|| MENU ITEMS ||============================== //

const menuItems = {
  items: [newfeature, daotaos, nghiencuukhoahocs, baocao, hethong, admin]
};

export default menuItems;
