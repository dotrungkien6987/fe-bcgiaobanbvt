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
        {
          id: 'taomoilopdaotaonoivien',
          title: 'Tạo mới lớp đào tạo',
          type: 'item',
          url: '/lopdaotao',
        }
      ]
    },
    {
      id: 'daotaongoaivien',
      title: 'Đào tạo ngoại viện',
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
        {
          id: 'taomoilopdaotao',
          title: 'Tạo mới lớp đào tạo',
          type: 'item',
          url: '/lopdaotao',
        }
      ]
    },
    {
      id: 'danhmucdaotao',
      title: 'Cấu hình danh mục đào tạo',
      type: 'collapse',
      icon: icons.chart1,
      children: [
        {
          id: 'NhomHinhThuc',
          title: 'Nhóm hình thức cập nhật',
          type: 'item',
          url: '/nhomhinhthuc'
        },
        {
          id: 'HinhThucCapNhat',
          title: 'Hình thức cập nhật',
          type: 'item',
          url: '/hinhthuc'
        },
        {
          id: 'DonVi',
          title: 'Đơn vị quy đổi',
          type: 'item',
          url: '/datafix/DonVi'
        },
        {
          id: 'VaiTro',
          title: 'Vai trò',
          type: 'item',
          url: '/datafix/VaiTro'
        },
        {
          id: 'ChucDanh',
          title: 'Chức danh',
          type: 'item',
          url: '/datafix/ChucDanh'
        },
        {
          id: 'ChucVu',
          title: 'Chức vụ',
          type: 'item',
          url: '/datafix/ChucVu'
        },
        {
          id: 'TrinhDoChuyenMon',
          title: 'Trình độ chuyên môn',
          type: 'item',
          url: '/datafix/TrinhDoChuyenMon'
        },
        {
          id: 'NguonKinhPhi',
          title: 'Nguồn kinh phí',
          type: 'item',
          url: '/datafix/NguonKinhPhi'
        },
        {
          id: 'NoiDaoTao',
          title: 'Nơi đào tạo',
          type: 'item',
          url: '/datafix/NoiDaoTao'
        },
        {
          id: 'HinhThucDaoTao',
          title: 'Hình thức đào tạo',
          type: 'item',
          url: '/datafix/HinhThucDaoTao'
        },
        {
          id: 'DanToc',
          title: 'Dân tộc',
          type: 'item',
          url: '/datafix/DanToc'
        },
        {
          id: 'PhamViHanhNghe',
          title: 'Phạm Vi Hành Nghề',
          type: 'item',
          url: '/datafix/PhamViHanhNghe'
        },
      ]
    }
  ]
};

export default chartsMap;
