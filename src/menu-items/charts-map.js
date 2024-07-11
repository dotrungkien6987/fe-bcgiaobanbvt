// third-party


// assets
import { Graph, Chart21 } from 'iconsax-react';

// icons
const icons = {
  charts: Chart21,
  chart: Graph
};

// ==============================|| MENU ITEMS - CHARTS & MAPS ||============================== //

const chartsMap = {
  id: 'group-charts-map',
  title: 'Quản lý đào tạo',
  icon: icons.charts,
  type: 'group',
  children: [
    {
      id: 'react-chart',
      title: 'Đào tạo nội viện',
      type: 'collapse',
      icon: icons.chart,
      children: [
        {
          id: 'apexchart',
          title: 'Danh sách cán bộ',
          type: 'item',
          url: '/nhanvien'
        },
        {
          id: 'org-chart',
          title: 'Khóa đào tạo',
          type: 'item',
          url: '/test'
        }
      ]
    },
    {
      id: 'react-chart',
      title: 'Đào tạo ngoại viện',
      type: 'collapse',
      icon: icons.chart,
      children: [
        {
          id: 'apexchart',
          title: 'Danh sách học viên',
          type: 'item',
          url: '/charts/apexchart'
        },
        {
          id: 'org-chart',
          title: 'FormattedMessage',
          type: 'item',
          url: '/charts/org-chart'
        }
      ]
    },
    {
      id: 'react-chart',
      title: 'Cấu hình danh mục đào tạo',
      type: 'collapse',
      icon: icons.chart,
      children: [
        {
          id: 'apexchart',
          title: 'Đơn vị quy đổi',
          type: 'item',
          url: '/charts/apexchart'
        },
        {
          id: 'org-chart',
          title: 'Vai trò',
          type: 'item',
          url: '/charts/org-chart'
        },
        {
          id: 'org-chart',
          title: 'Nhóm hình thức cập nhật',
          type: 'item',
          url: '/charts/org-chart'
        },
      ]
    }
  ]
};

export default chartsMap;
