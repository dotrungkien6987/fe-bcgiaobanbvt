// assets
import { Building3, Hospital, Element, MedalStar } from "iconsax-react";

// icons
const icons = {
  charts: Building3,
  chart: Hospital,
  element: Element,
  medal: MedalStar,
};

// ==============================|| MENU ITEMS - NEW FEATURE ||============================== //

const newfeature = {
  id: "group-newfeature",
  title: "Chức năng mới",
  icon: icons.charts,
  type: "group",
  children: [
    {
      id: "feature1",
      title: "Tính năng 1",
      type: "collapse",
      icon: icons.element,
      children: [
        {
          id: "function1",
          title: "Chức năng 1.1",
          type: "item",
          url: "/newfeature/function1",
        },
        {
          id: "function2",
          title: "Chức năng 1.2",
          type: "item",
          url: "/newfeature/function2",
        },
      ],
    },
    {
      id: "feature2",
      title: "Tính năng 2",
      type: "collapse",
      icon: icons.chart,
      children: [
        {
          id: "function3",
          title: "Chức năng 2.1",
          type: "item",
          url: "/newfeature/function3",
        },
        {
          id: "function4",
          title: "Chức năng 2.2",
          type: "item",
          url: "/newfeature/function4",
        },
      ],
    },
  ],
};

export default newfeature;