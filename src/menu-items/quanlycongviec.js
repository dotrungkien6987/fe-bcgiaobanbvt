// third-party


// assets

import { Book1, I24Support, ReceiptSearch,Bank, MessageProgramming, MenuBoard, Airplane } from 'iconsax-react';

// icons
const icons = {
  page: Book1,
  baocao: ReceiptSearch,
  maintenance: MessageProgramming,
  menuboard: MenuBoard,
  contactus: I24Support,
  landing: Airplane,
  bank:Bank,
};

// ==============================|| MENU ITEMS - PAGES ||============================== //

const quanlycongviec = {
  id: 'group-pages',
  title: "Quản lý công việc và KPI",
  type: 'group',
  icon: icons.page,
  children: [
    {
      id: 'quanlycongviec',
      title: "Quản lý công việc",
      type: 'collapse',
      icon: icons.menuboard,
      children: [
        {
          id: 'nhomviecuser',
          title: 'Nhóm việc theo dõi',
          type: 'item',
          url: '/quanlycongviec/nhomviec-user',
        },
       
        {
          id: "sangkien",
          title: <>Sáng kiến khoa học</>,
          type: "collapse",
          children: [
            {
              id: "sangkiencoso",
              title: <>Cấp cơ sở</>,
              type: "item",
              url: '/lopdaotaos/NCKH015',
            },
            {
              id: "sangkiencaptinh",
              title: <>Cấp tỉnh</>,
              type: "item",
              url: '/lopdaotaos/NCKH016',
            },
          
            {
              id: "sangkiencapbo",
              title: <>Cấp bộ</>,
              type: "item",
              url: '/lopdaotaos/NCKH017',
            },
            {
              id: "sangkiencapquocgia",
              title: <>Cấp quốc gia</>,
              type: "item",
              url: '/lopdaotaos/NCKH018',
            },
          ],
        },
      
        {
          id: 'nhiemvuthuongquy',
          title: 'Nhiệm vụ thường quy',
          type: 'item',
          url: '/quanlycongviec/nhiemvu-thuongquy'
        },
        {
          id: 'phancongcongviec',
          title: 'Phân công công việc',
          type: 'item',
          url: '/quanlycongviec/phancongcongviec'
        },
        {
          id: 'taphuan',
          title: 'Tập huấn/hội nghị/ hội thảo',
          type: 'item',
          url: '/lopdaotaos/NCKH07'
        },
        {
          id: 'tapsan',
          title: 'Tập san TTT/YHTH',
          type: 'item',
          url: '/lopdaotaos/NCKH08'
        },
      ]
    },
    
    {
      id: 'hoptacquocte',
      title: "Hợp tác quốc tế",
      type: 'collapse',
      icon: icons.bank,
      children: [
       
        {
          id: 'taphuan',
          title: 'Đoàn vào',
          type: 'item',
          url: '/doanden'
        },
        {
          id: 'tapsan',
          title: 'Đoàn ra',
          type: 'item',
          url: '/doandi'
        },
      ]
    },
    
  ]
};

export default quanlycongviec;
