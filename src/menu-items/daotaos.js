// third-party

// assets
import { Building3, Hospital, Element, MedalStar } from "iconsax-react";

// icons
const icons = {
  charts: Building3,
  chart: Hospital,
  chart1: Element,
  saudaihoc: MedalStar,
};

// ==============================|| MENU ITEMS - CHARTS & MAPS ||============================== //

const daotaos = {
  id: "group-daotao",
  title: "Quản lý đào tạo",
  icon: icons.charts,
  type: "group",
  children: [
    {
      id: "quanlycanbo",
      title: "Thông tin cán bộ",
      type: "collapse",
      icon: icons.chart1,
      children: [
        {
          id: "danhsachnoivien",
          title: "Danh sách cán bộ",
          type: "item",
          url: "/nhanvien",
        },
        {
          id: "danhsachnoiviendeleted",
          title: "Cán bộ đã xóa",
          type: "item",
          url: "/nhanvien-deleted",
        },
      ],
    },
    {
      id: "daotaonoivien",
      title: "Đào tạo nội viện",
      type: "collapse",
      icon: icons.chart,
      children: [
        {
          id: "Tatcahinhthuc",
          title: "Toàn bộ hình thức cập nhật",
          type: "item",
          url: "/lopdaotaos",
        },

        {
          id: "boiduongnganhan",
          title: "Khóa đào tạo ngắn hạn",
          type: "item",
          url: "/lopdaotaos/DT01",
        },
        {
          id: "hoinghihoithao",
          title: "Hội nghị, hội thảo tại viện",
          type: "item",
          url: "/lopdaotaos/DT02",
        },
        {
          id: "hoinghihoithaotuyentren",
          title: "Hội thảo ngoại viện (tuyến trên)",
          type: "item",
          url: "/lopdaotaos/DT08",
        },
        {
          id: "soanthaoquytrinh",
          title: "Soạn thảo quy trình chuyên môn",
          type: "item",
          url: "/lopdaotaos/DT03",
        },
        {
          id: "soanthaoquyphamphapluat",
          title: "Soạn thảo quy phạm pháp luật",
          type: "item",
          url: "/lopdaotaos/DT04",
        },
        {
          id: "giangdayykhoa",
          title: "Giảng dạy y khoa",
          type: "item",
          url: "/lopdaotaos/DT05",
        },
        {
          id: "daotaotuyentren",
          title: "Đào tạo cấp CC tuyến trên",
          type: "item",
          url: "/lopdaotaos/DT07",
        },
        {
          id: "hoichancabenh",
          title: "Hội chẩn ca bệnh",
          type: "item",
          url: "/lopdaotaos/DT09",
        },
      ],
    },
    {
      id: "daotaosaudaihoc",
      title: "Đào tạo sau đại học",
      type: "collapse",
      icon: icons.saudaihoc,
      children: [
        {
          id: "Bacsi",
          title: <>Bác sĩ</>,
          type: "collapse",
          children: [
            {
              id: "bacsitiensi",
              title: <>Tiến sĩ</>,
              type: "item",
              url: "/lopdaotaos/DT062",
            },
            {
              id: "bacsithacsi",
              title: <>Thạc sĩ</>,
              type: "item",
              url: "/lopdaotaos/DT061",
            },
            {
              id: "bacsick1",
              title: <>Chuyên khoa I</>,
              type: "item",
              url: "/lopdaotaos/DT063",
            },
            {
              id: "bacsick2",
              title: <>Chuyên khoa II</>,
              type: "item",
              url: "/lopdaotaos/DT064",
            },
            {
              id: "bacsinoitru",
              title: <>Bác sĩ nội trú</>,
              type: "item",
              url: "/lopdaotaos/DT0611",
            },
            {
              id: "bacsinoitru",
              title: <>Bác sĩ đa khoa</>,
              type: "item",
              url: "/lopdaotaos/DT0612",
            },
          ],
        },

        {
          id: "DieuDuong",
          title: <>Điều dưỡng</>,
          type: "collapse",
          children: [
            {
              id: "dieuduongtiensi",
              title: <>Tiến sĩ</>,
              type: "item",
              url: "/lopdaotaos/DT065",
            },
            {
              id: "dieuduongthacsi",
              title: <>Thạc sĩ</>,
              type: "item",
              url: "/lopdaotaos/DT066",
            },
            {
              id: "dieuduongck1",
              title: <>Chuyên khoa I</>,
              type: "item",
              url: "/lopdaotaos/DT068",
            },
            {
              id: "dieuduongck2",
              title: <>Chuyên khoa II</>,
              type: "item",
              url: "/lopdaotaos/DT067",
            },
            {
              id: "dieuduongdaihoc",
              title: <>Đại học</>,
              type: "item",
              url: "/lopdaotaos/DT069",
            },
          ],
        },

        {
          id: "duocsi",
          title: <>Dược sĩ</>,
          type: "collapse",
          children: [
            {
              id: "duocsitiensi",
              title: <>Tiến sĩ</>,
              type: "item",
              url: "/lopdaotaos/DT0601",
            },
            {
              id: "duocsithacsi",
              title: <>Thạc sĩ</>,
              type: "item",
              url: "/lopdaotaos/DT0602",
            },
            {
              id: "duocsick1",
              title: <>Chuyên khoa I</>,
              type: "item",
              url: "/lopdaotaos/DT0604",
            },
            {
              id: "duocsick2",
              title: <>Chuyên khoa II</>,
              type: "item",
              url: "/lopdaotaos/DT0603",
            },
            {
              id: "duocsidaihoc",
              title: <>Đại học</>,
              type: "item",
              url: "/lopdaotaos/DT0605",
            },
          ],
        },

        {
          id: "chuyennganhkhac",
          title: <>Chuyên ngành khác</>,
          type: "collapse",
          children: [
            {
              id: "tiensikhac",
              title: <>Tiến sĩ</>,
              type: "item",
              url: "/lopdaotaos/DT06100",
            },
            {
              id: "thacsikhac",
              title: <>Thạc sĩ</>,
              type: "item",
              url: "/lopdaotaos/DT0609",
            },
            {
              id: "ck1khac",
              title: <>Chuyên khoa I</>,
              type: "item",
              url: "/lopdaotaos/DT0607",
            },
            {
              id: "ck2khac",
              title: <>Chuyên khoa II</>,
              type: "item",
              url: "/lopdaotaos/DT0608",
            },
            {
              id: "daihockhac",
              title: <>Đại học</>,
              type: "item",
              url: "/lopdaotaos/DT0606",
            },
          ],
        },
      ],
    },
    {
      id: "daotaongoaivien",
      title: "Đào tạo & Chỉ đạo tuyến",
      type: "collapse",
      icon: icons.charts,
      children: [
        {
          id: "hocvienngoaivien1",
          title: "Danh sách học viên",
          type: "item",
          url: "/nhanvien1",
        },
        {
          id: "123",
          title: "Danh sách khóa",
          type: "item",
          url: "/lopdaotaos/DT20",
        },
      ],
    },
  ],
};

export default daotaos;
