// third-party


// assets
import { Building3, Hospital,Element,MedalStar } from 'iconsax-react';

// icons
const icons = {
  charts: Building3,
  chart: Hospital,
  chart1: Element,
  saudaihoc:MedalStar,
};

// ==============================|| MENU ITEMS - CHARTS & MAPS ||============================== //

const chartsMap = {
  id: 'group-charts-map',
  title: 'Quản lý đào tạo',
  icon: icons.charts,
  type: 'group',
  children: [
    {
      id: 'quanlycanbo',
      title: 'Thông tin cán bộ',
      type: 'collapse',
      icon: icons.chart1,
      children: [
        {
          id: 'danhsachnoivien',
          title: 'Danh sách cán bộ',
          type: 'item',
          url: '/nhanvien'
        },
       
      ]
    },
    {
      id: 'daotaonoivien',
      title: 'Đào tạo nội viện',
      type: 'collapse',
      icon: icons.chart,
      children: [
       
        {
          id: 'Tatcahinhthuc',
          title: 'Toàn bộ hình thức cập nhật',
          type: 'item',
          url: '/lopdaotaos'
        },
        
        {
          id: 'boiduongnganhan',
          title: 'Khóa đào tạo ngắn hạn',
          type: 'item',
          url:  '/lopdaotaos/ĐT01'
        },
        {
          id: 'hoinghihoithao',
          title: 'Hội nghị, hội thảo tại viện',
          type: 'item',
          url:  '/lopdaotaos/ĐT02'
        },
        {
          id: 'hoinghihoithaotuyentren',
          title: 'Hội thảo ngoại viện (tuyến trên)',
          type: 'item',
          url:  '/lopdaotaos/ĐT08'
        },
        {
          id: 'soanthaoquytrinh',
          title: 'Soạn thảo quy trình chuyên môn',
          type: 'item',
          url:  '/lopdaotaos/ĐT03'
        },
        {
          id: 'soanthaoquyphamphapluat',
          title: 'Soạn thảo quy phạm pháp luật',
          type: 'item',
          url:  '/lopdaotaos/ĐT04'
        },
        {
          id: 'giangdayykhoa',
          title: 'Giảng dạy y khoa',
          type: 'item',
          url:  '/lopdaotaos/ĐT05'
        },
        {
          id: 'daotaotuyentren',
          title: 'Đào tạo cấp CC tuyến trên',
          type: 'item',
          url:  '/lopdaotaos/ĐT07'
        },
        {
          id: 'hoichancabenh',
          title: 'Hội chẩn ca bệnh',
          type: 'item',
          url:  '/lopdaotaos/ĐT09'
        },
      ]
    },
    {
      id: 'daotaosaudaihoc',
      title: 'Đào tạo sau đại học',
      type: 'collapse',
      icon: icons.saudaihoc,
      children: [
       
        {
          id: 'thacsi',
          title: 'Thạc sĩ',
          type: 'item',
          url: '/lopdaotaos/ĐT061'
        },
        {
          id: 'tiensi',
          title: 'Tiến sĩ',
          type: 'item',
          url: '/lopdaotaos/ĐT062'
        },
        {
          id: 'bacsick1',
          title: 'Bác sĩ chuyên khoa I',
          type: 'item',
          url: '/lopdaotaos/ĐT063'
        },
        {
          id: 'bacsick2',
          title: 'Bác sĩ chuyên khoa II',
          type: 'item',
          url: '/lopdaotaos/ĐT064'
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
          id: 'hocvienngoaivien1',
          title: 'Danh sách học viên',
          type: 'item',
          url:'/nhanvien1',
        },
        {
          id: '123',
          title: 'Danh sách khóa',
          type: 'item',
          url: '/lopdaotaos/ĐT20',
        },
       
      ]
    },
   
  ]
};

export default chartsMap;
