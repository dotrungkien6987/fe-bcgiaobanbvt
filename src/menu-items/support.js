// third-party


// assets
import { DocumentCode2, OceanProtocol, Level, ShieldCross, InfoCircle, I24Support, Driving } from 'iconsax-react';

// icons
const icons = {
  samplePage: DocumentCode2,
  menuLevel: OceanProtocol,
  menuLevelSubtitle: Level,
  disabledMenu: ShieldCross,
  chipMenu: InfoCircle,
  documentation: I24Support,
  roadmap: Driving
};

// ==============================|| MENU ITEMS - SUPPORT ||============================== //

const support = {
  id: 'other',
  title: "FormattedMessage",
  type: 'group',
  children: [
   
    {
      id: 'menu-level',
      title: "Sau đại học",
      type: 'collapse',
      icon: icons.menuLevel,
      children: [
        {
          id: 'menu-level-1.1',
          title: (
            <>
              "Bác sĩ",
            </>
          ),
          type: 'item',
          url: '#'
        },
        {
          id: 'menu-level-1.2',
          title: (
            <>
              "Điều dưỡng",
            </>
          ),
          type: 'collapse',
          children: [
            {
              id: 'menu-level-2.1',
              title: (
                <>
                  "Thạc sĩ",
                </>
              ),
              type: 'item',
              url: '#'
            },
            {
              id: 'menu-level-2.2',
              title: (
                <>
                  "Chuyên khoa I",
                </>
              ),
              type: 'collapse',
              children: [
                {
                  id: 'menu-level-3.1',
                  title: (
                    <>
                      "FormattedMessage",
                    </>
                  ),
                  type: 'item',
                  url: '#'
                },
                {
                  id: 'menu-level-3.2',
                  title: (
                    <>
                      "FormattedMessage",
                    </>
                  ),
                  type: 'item',
                  url: '#'
                }
              ]
            }
          ]
        }
      ]
    },
    
  ]
};

export default support;
