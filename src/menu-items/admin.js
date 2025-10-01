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

const admin = {
  id: 'group-admin',
  title: "Admin",
  type: 'group',
  icon: icons.page,
  children: [
   
    {
      id: 'danhmucdaotao',
      title: 'Quản lý người dùng',
      type: 'collapse',
      icon: icons.page,
      children: [
        {
          id: 'usersable',
          title: 'Users',
          type: 'item',
          url: '/usersable'
        },
        {
          id: 'teptin',
          title: 'Quản lý file',
          type: 'item',
          url: '/admin/teptin'
        },
       
      ]
    }
  ]
};

export default admin;
