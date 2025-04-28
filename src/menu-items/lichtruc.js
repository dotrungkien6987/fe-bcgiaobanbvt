// third-party
import { Setting2, I24Support, Security, MessageProgramming, DollarSquare, Airplane } from 'iconsax-react';

// icons
const icons = {
    Security,
  MessageProgramming
};

// ==============================|| MENU ITEMS - LỊCH TRỰC ||============================== //

const lichtruc = {
  id: 'group-lichtruc',
  title: 'Lịch trực',
  type: 'group',
  children: [
    {
      id: 'lichtruc',
      title: 'Lịch trực khoa',
      type: 'item',
      url: '/lichtruc',
      icon: icons.MessageProgramming,
      breadcrumbs: false
    }
  ]
};

export default lichtruc; 