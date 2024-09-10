// third-party


// assets
import { Building3, Hospital,Element } from 'iconsax-react';

// icons
const icons = {
  charts: Building3,
  chart: Hospital,
  chart1: Element,
};

// ==============================|| MENU ITEMS - CHARTS & MAPS ||============================== //

const chartsMap = {
  id: 'group-charts-map',
  title: 'Quản lý đào tạo',
  icon: icons.charts,
  type: 'group',
  children: [
    {
      id: 'daotaonoivien',
      title: 'Đào tạo nội viện',
      type: 'collapse',
      icon: icons.chart,
      children: [
        {
          id: 'danhsachnoivien',
          title: 'Danh sách cán bộ',
          type: 'item',
          url: '/nhanvien'
        },
        {
          id: 'khoadaotaonoivien',
          title: 'Khóa đào tạo',
          type: 'item',
          url: '/lopdaotaos'
        },
        // {
        //   id: 'taomoilopdaotaonoivien',
        //   title: 'Tạo mới lớp đào tạo',
        //   type: 'item',
        //   url: '/lopdaotao',
        // },
        {
          id: 'tonghopdaotaonoivien',
          title: 'Tổng hợp tín chỉ tích lũy',
          type: 'item',
          url: '/tonghopdaotao',
        }
      ]
    },
    {
      id: 'daotaosaudaihoc',
      title: 'Đào tạo sau đại học',
      type: 'collapse',
      icon: icons.chart,
      children: [
        {
          id: 'danhsachnoivien',
          title: 'Danh sách cán bộ',
          type: 'item',
          url: '/nhanvien'
        },
        {
          id: 'khoadaotaonoivien',
          title: 'Khóa đào tạo',
          type: 'item',
          url: '/lopdaotaos'
        },
       
      ]
    },
    {
      id: 'daotaongoaivien',
      title: 'Đào tạo & Chỉ đạo tuyến',
      type: 'collapse',
      icon: icons.charts,
      children: [
        {
          id: 'hocvienngoaivien',
          title: 'Danh sách học viên',
          type: 'item',
          url:'/nhanvien',
        },
        {
          id: '123',
          title: 'Khóa đào tạo',
          type: 'item',
          url: '/lopdaotaos',
        },
        // {
        //   id: 'taomoilopdaotao',
        //   title: 'Tạo mới lớp đào tạo',
        //   type: 'item',
        //   url: '/lopdaotao',
        // }
      ]
    },
   
  ]
};

export default chartsMap;
