// third-party


// assets
import { Graph, Chart21 } from 'iconsax-react';

// icons
const icons = {
  charts: Chart21,
  chart: Graph
};

// ==============================|| MENU ITEMS - CHARTS & MAPS ||============================== //

const chartsMap = {
  id: 'group-charts-map',
  title: 'FormattedMessage',
  icon: icons.charts,
  type: 'group',
  children: [
    {
      id: 'react-chart',
      title: 'FormattedMessage',
      type: 'collapse',
      icon: icons.chart,
      children: [
        {
          id: 'apexchart',
          title: 'FormattedMessage',
          type: 'item',
          url: '/charts/apexchart'
        },
        {
          id: 'org-chart',
          title: 'FormattedMessage',
          type: 'item',
          url: '/charts/org-chart'
        }
      ]
    }
  ]
};

export default chartsMap;
