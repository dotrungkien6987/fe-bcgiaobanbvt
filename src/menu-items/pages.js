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
          id: 'detaicapcoso',
          title: 'Đề tài cấp cơ sở',
          type: 'item',
          url: '/lopdaotaos/NCKH01'
        },
        {
          id: 'detaicaptinh',
          title: 'Đề tài cấp tỉnh/bộ/quốc gia',
          type: 'item',
          url: '/lopdaotaos/NCKH04'
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
