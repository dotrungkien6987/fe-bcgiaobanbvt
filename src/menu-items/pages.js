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

const pages = {
  id: 'group-pages',
  title: "Quản lý nghiên cứu khoa học",
  type: 'group',
  icon: icons.page,
  children: [
    {
      id: 'nghiencuukhoahoc',
      title: "Nghiên cứu khoa học",
      type: 'collapse',
      icon: icons.menuboard,
      children: [
        {
          id: 'sinhhoatkhoahoc',
          title: 'Sinh hoạt khoa học',
          type: 'item',
          url: '/lopdaotaos/NCKH06'
        },
       
        {
          id: "detai",
          title: <>Đề tài khoa học</>,
          type: "collapse",
          children: [
            {
              id: "detaicoso",
              title: <>Cấp cơ sở</>,
              type: "item",
              url: '/lopdaotaos/NCKH011',
            },
            {
              id: "detaicaptinh",
              title: <>Cấp tỉnh</>,
              type: "item",
              url: '/lopdaotaos/NCKH012',
            },
          
            {
              id: "detaicapbo",
              title: <>Cấp bộ</>,
              type: "item",
              url: '/lopdaotaos/NCKH013',
            },
            {
              id: "detaicapquocgia",
              title: <>Cấp quốc gia</>,
              type: "item",
              url: '/lopdaotaos/NCKH014',
            },
          ],
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
          id: 'baoquocte',
          title: 'Báo quốc tế',
          type: 'item',
          url: '/lopdaotaos/NCKH02'
        },
        {
          id: 'baotrongnuoc',
          title: 'Báo trong nước',
          type: 'item',
          url: '/lopdaotaos/NCKH03'
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

export default pages;
