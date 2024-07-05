// third-party


// assets
import { KyberNetwork, Messages2, Calendar1, Kanban, Profile2User, Bill, UserSquare, ShoppingBag } from 'iconsax-react';

// icons
const icons = {
  applications: KyberNetwork,
  chat: Messages2,
  calendar: Calendar1,
  kanban: Kanban,
  customer: Profile2User,
  invoice: Bill,
  profile: UserSquare,
  ecommerce: ShoppingBag
};

// ==============================|| MENU ITEMS - APPLICATIONS ||============================== //

const applications = {
  id: 'group-applications',
  title: "format mesage",
  icon: icons.applications,
  type: 'group',
  children: [
    {
      id: 'chat',
      title: "Do trung kien",
      type: 'item',
      url: '/apps/chat',
      icon: icons.chat,
      breadcrumbs: false
    },
    {
      id: 'calendar',
      title: "format mesage",
      type: 'item',
      url: '/apps/calendar',
      icon: icons.calendar
    },
    {
      id: 'kanban',
      title: "format mesage",
      type: 'item',
      icon: icons.kanban,
      url: '/apps/kanban/board'
    },
    {
      id: 'customer',
      title: "format mesage",
      type: 'collapse',
      icon: icons.customer,
      children: [
        {
          id: 'customer-list',
          title: "format mesage",
          type: 'item',
          url: '/apps/customer/customer-list'
        },
        {
          id: 'customer-card',
          title: "format mesage",
          type: 'item',
          url: '/apps/customer/customer-card'
        }
      ]
    },
    {
      id: 'invoice',
      title: "format mesage",
      url: '/apps/invoice/dashboard',
      type: 'collapse',
      icon: icons.invoice,
      breadcrumbs: true,
      children: [
        {
          id: 'create',
          title: "format mesage",
          type: 'item',
          url: '/apps/invoice/create'
        },
        {
          id: 'details',
          title: "format mesage",
          type: 'item',
          url: '/apps/invoice/details/1'
        },
        {
          id: 'list',
          title: "format mesage",
          type: 'item',
          url: '/apps/invoice/list'
        },
        {
          id: 'edit',
          title: "format mesage",
          type: 'item',
          url: '/apps/invoice/edit/1'
        }
      ]
    },
    {
      id: 'profile',
      title: "format mesage",
      type: 'collapse',
      icon: icons.profile,
      children: [
        {
          id: 'user-profile',
          title: "format mesage",
          type: 'item',
          url: '/apps/profiles/user/personal',
          breadcrumbs: false
        },
        {
          id: 'account-profile',
          title: "format mesage",
          type: 'item',
          url: '/apps/profiles/account/basic'
        }
      ]
    },

    {
      id: 'e-commerce',
      title: "format mesage",
      type: 'collapse',
      icon: icons.ecommerce,
      children: [
        {
          id: 'products',
          title: "format mesage",
          type: 'item',
          url: '/apps/e-commerce/products'
        },
        {
          id: 'product-details',
          title: "format mesage",
          type: 'item',
          url: '/apps/e-commerce/product-details/1',
          breadcrumbs: false
        },
        {
          id: 'product-list',
          title: "format mesage",
          type: 'item',
          url: '/apps/e-commerce/product-list',
          breadcrumbs: false
        },
        {
          id: 'add-new-product',
          title: "format mesage",
          type: 'item',
          url: '/apps/e-commerce/add-new-product'
        },
        {
          id: 'checkout',
          title: "format mesage",
          type: 'item',
          url: '/apps/e-commerce/checkout'
        }
      ]
    }
  ]
};

export default applications;
