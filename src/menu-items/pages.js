// third-party


// assets
import { Book1, I24Support, Security, MessageProgramming, DollarSquare, Airplane } from 'iconsax-react';

// icons
const icons = {
  page: Book1,
  authentication: Security,
  maintenance: MessageProgramming,
  pricing: DollarSquare,
  contactus: I24Support,
  landing: Airplane
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
      icon: icons.nghiencuukhoahoc,
      children: [
        {
          id: 'sinhhoatkhoahoc',
          title: 'Sinh hoạt khoa học',
          type: 'item',
          url: '/sinhhoatkhoahoc'
        },
        {
          id: 'detaicapcoso',
          title: 'Đề tài cấp cơ sở',
          type: 'item',
          url: '/detaicapcoso'
        },
        {
          id: 'detaicaptinh',
          title: 'Đề tài cấp tỉnh/bộ/quốc gia',
          type: 'item',
          url: '/detaicaptinh'
        },
        {
          id: 'baoquocte',
          title: 'Báo quốc tế',
          type: 'item',
          url: '/baoquocte'
        },
        {
          id: 'baotrongnuoc',
          title: 'Báo trong nước',
          type: 'item',
          url: '/baotrongnuoc'
        },
        {
          id: 'taphuan',
          title: 'Tập huấn/hội nghị/ hội thảo',
          type: 'item',
          url: '/taphuan'
        },
        {
          id: 'tapsan',
          title: 'Tập san TTT/YHTH',
          type: 'item',
          url: '/taphuan'
        },
      ]
    },
    
    {
      id: 'hoptacquocte',
      title: "Hợp tác quốc tế",
      type: 'collapse',
      icon: icons.nghiencuukhoahoc,
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
