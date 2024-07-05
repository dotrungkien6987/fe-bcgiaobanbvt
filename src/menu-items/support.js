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
      id: 'sample-page',
      title: "FormattedMessage",
      type: 'item',
      url: '/sample-page',
      icon: icons.samplePage
    },
    {
      id: 'menu-level',
      title: "FormattedMessage",
      type: 'collapse',
      icon: icons.menuLevel,
      children: [
        {
          id: 'menu-level-1.1',
          title: (
            <>
              "FormattedMessage",
            </>
          ),
          type: 'item',
          url: '#'
        },
        {
          id: 'menu-level-1.2',
          title: (
            <>
              "FormattedMessage",
            </>
          ),
          type: 'collapse',
          children: [
            {
              id: 'menu-level-2.1',
              title: (
                <>
                  "FormattedMessage",
                </>
              ),
              type: 'item',
              url: '#'
            },
            {
              id: 'menu-level-2.2',
              title: (
                <>
                  "FormattedMessage",
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
    {
      id: 'menu-level-subtitle',
      title: "FormattedMessage",
      caption: "FormattedMessage",
      type: 'collapse',
      icon: icons.menuLevelSubtitle,
      children: [
        {
          id: 'sub-menu-level-1.1',
          title: (
            <>
              "FormattedMessage",
            </>
          ),
          caption: "FormattedMessage",
          type: 'item',
          url: '#'
        },
        {
          id: 'sub-menu-level-1.2',
          title: (
            <>
              "FormattedMessage",
            </>
          ),
          caption: "FormattedMessage",
          type: 'collapse',
          children: [
            {
              id: 'sub-menu-level-2.1',
              title: (
                <>
                  "FormattedMessage",
                </>
              ),
              caption: "FormattedMessage",
              type: 'item',
              url: '#'
            }
          ]
        }
      ]
    },
    {
      id: 'disabled-menu',
      title: "FormattedMessage",
      type: 'item',
      url: '#',
      icon: icons.disabledMenu,
      disabled: true
    },
    {
      id: 'oval-chip-menu',
      title: "FormattedMessage",
      type: 'item',
      url: '#',
      icon: icons.chipMenu,
      chip: {
        label: 'Fire',
        color: 'error',
        variant: 'outlined',
        size: 'small'
      }
    },
    {
      id: 'documentation',
      title: "FormattedMessage",
      type: 'item',
      url: 'https://phoenixcoded.gitbook.io/able-pro/v/react/',
      icon: icons.documentation,
      external: true,
      target: true,
      chip: {
        label: 'gitbook',
        color: 'info',
        size: 'small'
      }
    },
    {
      id: 'roadmap',
      title: "FormattedMessage",
      type: 'item',
      url: 'https://phoenixcoded.gitbook.io/able-pro/v/react/roadmap',
      icon: icons.roadmap,
      external: true,
      target: true
    }
  ]
};

export default support;
