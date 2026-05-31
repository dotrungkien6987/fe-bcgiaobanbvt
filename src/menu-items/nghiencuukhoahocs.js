// third-party

// assets
import {
  Setting2,
  Book1,
  I24Support,
  ReceiptSearch,
  Bank,
  MessageProgramming,
  MenuBoard,
  Airplane,
} from "iconsax-react";
// lodash set was unused; menu should be plain data (no JSX fragments)

// icons
const icons = {
  page: Book1,
  baocao: ReceiptSearch,
  maintenance: MessageProgramming,
  menuboard: MenuBoard,
  contactus: I24Support,
  landing: Airplane,
  bank: Bank,
  setting: Setting2,
};

const NGHIEN_CUU_COMMON_ROLES = [
  "admin",
  "daotao",
  "nomal",
  "manager",
  "noibo",
];
const HOP_TAC_QUOC_TE_ROLES = ["admin", "daotao", "cntt"];

// ==============================|| MENU ITEMS - PAGES ||============================== //

const nghiencuukhoahocs = {
  id: "group-pages",
  title: "Quản lý nghiên cứu khoa học",
  type: "group",
  icon: icons.page,
  children: [
    {
      id: "baocao",
      title: "Báo cáo",
      type: "collapse",
      icon: icons.bank,
      roles: NGHIEN_CUU_COMMON_ROLES,
      children: [
        {
          id: "thongketheonam",
          title: "Thống kê theo năm",
          type: "item",
          url: "/dashboard/lopdaotao-by-year",
        },
      ],
    },

    {
      id: "nghiencuukhoahoc",
      title: "Nghiên cứu khoa học",
      type: "collapse",
      icon: icons.menuboard,
      roles: NGHIEN_CUU_COMMON_ROLES,
      children: [
        {
          id: "sinhhoatkhoahoc",
          title: "Sinh hoạt khoa học",
          type: "item",
          url: "/lopdaotaos/NCKH06",
        },

        {
          id: "detai",
          title: "Đề tài khoa học",
          type: "collapse",
          children: [
            {
              id: "detaicoso",
              title: "Cấp cơ sở",
              type: "item",
              url: "/lopdaotaos/NCKH011",
            },
            {
              id: "detaicaptinh",
              title: "Cấp tỉnh",
              type: "item",
              url: "/lopdaotaos/NCKH012",
            },

            {
              id: "detaicapbo",
              title: "Cấp bộ",
              type: "item",
              url: "/lopdaotaos/NCKH013",
            },
            {
              id: "detaicapquocgia",
              title: "Cấp quốc gia",
              type: "item",
              url: "/lopdaotaos/NCKH014",
            },
          ],
        },

        {
          id: "sangkien",
          title: "Sáng kiến khoa học",
          type: "collapse",
          children: [
            {
              id: "sangkiencoso",
              title: "Cấp cơ sở",
              type: "item",
              url: "/lopdaotaos/NCKH015",
            },
            {
              id: "sangkiencaptinh",
              title: "Cấp tỉnh",
              type: "item",
              url: "/lopdaotaos/NCKH016",
            },

            {
              id: "sangkiencapbo",
              title: "Cấp bộ",
              type: "item",
              url: "/lopdaotaos/NCKH017",
            },
            {
              id: "sangkiencapquocgia",
              title: "Cấp quốc gia",
              type: "item",
              url: "/lopdaotaos/NCKH018",
            },
          ],
        },

        {
          id: "baoquocte",
          title: "Báo quốc tế",
          type: "item",
          url: "/lopdaotaos/NCKH02",
        },
        {
          id: "baotrongnuoc",
          title: "Báo trong nước",
          type: "item",
          url: "/lopdaotaos/NCKH03",
        },
        {
          id: "taphuan",
          title: "Tập huấn/hội nghị/ hội thảo",
          type: "item",
          url: "/lopdaotaos/NCKH07",
        },
        {
          id: "tapsan",
          title: "Tập san TTT/YHTH",
          type: "item",
          roles: NGHIEN_CUU_COMMON_ROLES,
          url: "/tapsan",
        },
      ],
    },

    {
      id: "hoptacquocte",
      title: "Hợp tác quốc tế",
      type: "collapse",
      icon: icons.bank,
      roles: HOP_TAC_QUOC_TE_ROLES,
      children: [
        {
          id: "doanvao",
          title: "Đoàn vào",
          type: "item",
          url: "/doanvao",
        },
        {
          id: "doanvaomember",
          title: "Danh sách thành viên đoàn vào",
          type: "item",
          url: "/doanvao/members",
        },
        {
          id: "doanra",
          title: "Đoàn ra",
          type: "item",
          url: "/doanra",
        },
        {
          id: "doanramember",
          title: "Danh sách thành viên đoàn ra",
          type: "item",
          url: "/doanra/members",
        },
      ],
    },

    {
      id: "danhmucnckh",
      title: "Danh mục",
      type: "collapse",
      icon: icons.setting,
      roles: NGHIEN_CUU_COMMON_ROLES,
      children: [
        {
          id: "LoaiHinhYHTH",
          title: "Loại hình y học thực hành",
          type: "item",
          url: "/datafix/LoaiHinhYHTH",
          roles: ["admin", "superadmin"],
        },
        {
          id: "ChuyenDeTTT",
          title: "Chuyên đề thông tin thuốc",
          type: "item",
          url: "/datafix/ChuyenDeTTT",
          roles: ["admin", "superadmin"],
        },
        {
          id: "MucDichXuatCanh",
          title: "Mục đích xuất cảnh",
          type: "item",
          url: "/datafix/MucDichXuatCanh",
          roles: ["admin", "superadmin"],
        },
        {
          id: "DonViGioiThieu",
          title: "Đơn vị giới thiệu",
          type: "item",
          url: "/datafix/DonViGioiThieu",
          roles: ["admin", "superadmin"],
        },
      ],
    },
  ],
};

export default nghiencuukhoahocs;
