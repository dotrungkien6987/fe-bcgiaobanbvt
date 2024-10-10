// project-imports
import applications from './applications';
import widget from './widget';
import formsTables from './forms-tables';

import support from './support';
import pages from './pages';
import hethong from './hethong';
import baocao from './baocao';
import daotaos from './daotaos';
import admin from './admin';

// ==============================|| MENU ITEMS ||============================== //

const menuItems = {
  // items: [ ]
  items: [ daotaos, pages,baocao,hethong,admin]
  // items: [widget, applications, formsTables, chartsMap, pages, support]
};

export default menuItems;
