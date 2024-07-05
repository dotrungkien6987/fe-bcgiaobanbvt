// third-party


// assets
import { Book, PasswordCheck, Next, RowVertical, CpuCharge, TableDocument, Subtitle } from 'iconsax-react';

// icons
const icons = {
  formsTable: Book,
  validation: PasswordCheck,
  wizard: Next,
  layout: RowVertical,
  plugins: CpuCharge,
  reactTables: TableDocument,
  muiTables: Subtitle
};

// ==============================|| MENU ITEMS - FORMS & TABLES ||============================== //

const formsTables = {
  id: 'group-forms-tables',
  title: 'FormattedMessage',
  icon: icons.formsTable,
  type: 'group',
  children: [
    {
      id: 'validation',
      title: 'FormattedMessage',
      type: 'item',
      url: '/forms/validation',
      icon: icons.validation
    },
    {
      id: 'wizard',
      title: 'FormattedMessage',
      type: 'item',
      url: '/forms/wizard',
      icon: icons.wizard
    },
    {
      id: 'forms-layout',
      title: 'FormattedMessage',
      type: 'collapse',
      icon: icons.layout,
      children: [
        {
          id: 'basic',
          title: 'FormattedMessage',
          type: 'item',
          url: '/forms/layout/basic'
        },
        {
          id: 'multi-column',
          title: 'FormattedMessage',
          type: 'item',
          url: '/forms/layout/multi-column'
        },
        {
          id: 'action-bar',
          title: 'FormattedMessage',
          type: 'item',
          url: '/forms/layout/action-bar'
        },
        {
          id: 'sticky-bar',
          title: 'FormattedMessage',
          type: 'item',
          url: '/forms/layout/sticky-bar'
        }
      ]
    },
    {
      id: 'forms-plugins',
      title: 'FormattedMessage',
      type: 'collapse',
      icon: icons.plugins,
      children: [
        {
          id: 'mask',
          title: 'FormattedMessage',
          type: 'item',
          url: '/forms/plugins/mask'
        },
        {
          id: 'clipboard',
          title: 'FormattedMessage',
          type: 'item',
          url: '/forms/plugins/clipboard'
        },
        {
          id: 're-captcha',
          title: 'FormattedMessage',
          type: 'item',
          url: '/forms/plugins/re-captcha'
        },
        {
          id: 'editor',
          title: 'FormattedMessage',
          type: 'item',
          url: '/forms/plugins/editor'
        },
        {
          id: 'dropzone',
          title: 'FormattedMessage',
          type: 'item',
          url: '/forms/plugins/dropzone'
        }
      ]
    },
    {
      id: 'react-tables',
      title: 'FormattedMessage',
      type: 'collapse',
      icon: icons.reactTables,
      children: [
        {
          id: 'rt-table',
          title: 'FormattedMessage',
          type: 'item',
          url: '/tables/react-table/basic'
        },
        {
          id: 'rt-sorting',
          title: 'FormattedMessage',
          type: 'item',
          url: '/tables/react-table/sorting'
        },
        {
          id: 'rt-filtering',
          title: 'FormattedMessage',
          type: 'item',
          url: '/tables/react-table/filtering'
        },
        {
          id: 'rt-grouping',
          title: 'FormattedMessage',
          type: 'item',
          url: '/tables/react-table/grouping'
        },
        {
          id: 'rt-pagination',
          title: 'FormattedMessage',
          type: 'item',
          url: '/tables/react-table/pagination'
        },
        {
          id: 'rt-row-selection',
          title: 'FormattedMessage',
          type: 'item',
          url: '/tables/react-table/row-selection'
        },
        {
          id: 'rt-expanding',
          title: 'FormattedMessage',
          type: 'item',
          url: '/tables/react-table/expanding'
        },
        {
          id: 'rt-editable',
          title: 'FormattedMessage',
          type: 'item',
          url: '/tables/react-table/editable'
        },
        {
          id: 'rt-drag-drop',
          title: 'FormattedMessage',
          type: 'item',
          url: '/tables/react-table/drag-drop'
        },
        {
          id: 'rt-column-hiding',
          title: 'FormattedMessage',
          type: 'item',
          url: '/tables/react-table/column-hiding'
        },
        {
          id: 'rt-column-resizing',
          title: 'FormattedMessage',
          type: 'item',
          url: '/tables/react-table/column-resizing'
        },
        {
          id: 'rt-sticky-table',
          title: 'FormattedMessage',
          type: 'item',
          url: '/tables/react-table/sticky-table'
        },
        {
          id: 'rt-umbrella',
          title: 'FormattedMessage',
          type: 'item',
          url: '/tables/react-table/umbrella'
        },
        {
          id: 'rt-empty',
          title: 'FormattedMessage',
          type: 'item',
          url: '/tables/react-table/empty'
        }
      ]
    },
    {
      id: 'mui-tables',
      title: 'FormattedMessage',
      type: 'collapse',
      icon: icons.muiTables,
      children: [
        {
          id: 'mui-table',
          title: 'FormattedMessage',
          type: 'item',
          url: '/tables/mui-table/basic'
        },
        {
          id: 'mui-dense',
          title: 'FormattedMessage',
          type: 'item',
          url: '/tables/mui-table/dense'
        },
        {
          id: 'mui-enhanced',
          title: 'FormattedMessage',
          type: 'item',
          url: '/tables/mui-table/enhanced'
        },
        {
          id: 'mui-data-table',
          title: 'FormattedMessage',
          type: 'item',
          url: '/tables/mui-table/datatable'
        },
        {
          id: 'mui-custom',
          title: 'FormattedMessage',
          type: 'item',
          url: '/tables/mui-table/custom'
        },
        {
          id: 'mui-fixed-header',
          title: 'FormattedMessage',
          type: 'item',
          url: '/tables/mui-table/fixed-header'
        },
        {
          id: 'mui-collapse',
          title: 'FormattedMessage',
          type: 'item',
          url: '/tables/mui-table/collapse'
        }
      ]
    }
  ]
};

export default formsTables;
