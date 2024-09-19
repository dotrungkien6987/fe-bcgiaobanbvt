// third-party


// assets
import { ReceiptSearch, I24Support, Security, Setting2, DollarSquare, Airplane } from 'iconsax-react';

// icons
const icons = {
  page: ReceiptSearch,
  authentication: Security,
  maintenance: Setting2,
  pricing: DollarSquare,
  contactus: I24Support,
  landing: Airplane
};

// ==============================|| MENU ITEMS - PAGES ||============================== //

const baocao = {
  id: 'group-baocao',
  title: "Báo cáo",
  type: 'group',
  icon: icons.page,
  children: [
   
    {
      id: 'BaoCao',
      title: 'Báo cáo',
      type: 'collapse',
      icon: icons.page,
      children: [
        {
          id: 'dashboard',
          title: 'DashBoard',
          type: 'item',
          url: '/dashboarddaotao'
        },
        {
          id: 'tonghopdaotao',
          title: 'Tổng hợp tín chỉ tích lũy',
          type: 'item',
          url: '/tonghopdaotao'
        },
        {
          id: 'tonghopsoluong',
          title: 'Báo cáo số lượng',
          type: 'item',
          url: '/tonghopsoluong'
        },
        {
          id: 'soluongtheokhoa',
          title: 'Cảnh báo theo khoa',
          type: 'item',
          url: '/soluongtheokhoa'
        },
        
      ]
    }
  ]
};

export default baocao;
