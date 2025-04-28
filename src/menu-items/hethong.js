// third-party


// assets
import { Setting2, I24Support, Security, MessageProgramming, DollarSquare, Airplane } from 'iconsax-react';

// icons
const icons = {
  page: Setting2,
  authentication: Security,
  maintenance: MessageProgramming,
  pricing: DollarSquare,
  contactus: I24Support,
  landing: Airplane
};

// ==============================|| MENU ITEMS - PAGES ||============================== //

const hethong = {
  id: 'group-hethong',
  title: "Hệ thống",
  type: 'group',
  icon: icons.page,
  children: [
   
    {
      id: 'danhmucdaotao',
      title: 'Cấu hình danh mục',
      type: 'collapse',
      icon: icons.page,
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
          id: 'TrinhDoChuyenMonQuyDoi',
          title: 'Trình độ chuyên môn.',
          type: 'item',
          url: '/trinhdochuyenmon'
        },
        {
          id: 'HoiDong',
          title: 'Hội đồng',
          type: 'item',
          url: '/hoidong'
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
        {
          id: 'Tinh',
          title: 'Tỉnh',
          type: 'item',
          url: '/tinh'
        },
        {
          id: 'Huyen',
          title: 'Huyện',
          type: 'item',
          url: '/huyen'
        },
        {
          id: 'Xa',
          title: 'Xã',
          type: 'item',
          url: '/xa'
        },
        {
          id: 'Khoa',
          title: 'Danh mục khoa',
          type: 'item',
          url: '/khoas'
        },
        {
          id: 'NhomKhoa',
          title: 'Nhóm các khoa',
          type: 'item',
          url: '/nhomkhoas'
        },
      ]
    }
  ]
};

export default hethong;
