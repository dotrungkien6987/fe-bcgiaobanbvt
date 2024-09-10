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

const baocao = {
  id: 'group-baocao',
  title: "Báo cáo",
  type: 'group',
  icon: icons.page,
  children: [
   
    {
      id: 'danhmucdaotao',
      title: 'DashBoard',
      type: 'collapse',
      icon: icons.chart1,
      children: [
        {
          id: 'tonghopdaotao',
          title: 'Tổng hợp tín chỉ tích lũy',
          type: 'item',
          url: '/tonghopdaotao'
        },
        {
          id: 'canhbao',
          title: 'Cảnh báo',
          type: 'item',
          url: '/canhbao'
        },
        
      ]
    }
  ]
};

export default baocao;
