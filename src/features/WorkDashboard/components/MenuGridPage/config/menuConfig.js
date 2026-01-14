import {
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  Send as SendIcon,
  Assessment as AssessmentIcon,
  EmojiEvents as EmojiEventsIcon,
  Timeline as TimelineIcon,
  List as ListIcon,
  Description as DescriptionIcon,
  Settings as SettingsIcon,
  School as SchoolIcon,
  Science as ScienceIcon,
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  Category as CategoryIcon,
  Work as WorkIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Notifications as NotificationsIcon,
  BusinessCenter as BusinessCenterIcon,
  LocalHospital as LocalHospitalIcon,
  BarChart as BarChartIcon,
  TrendingUp as TrendingUpIcon,
  FolderOpen as FolderOpenIcon,
  CloudUpload as CloudUploadIcon,
} from "@mui/icons-material";

/**
 * Menu sections configuration
 * Defines all menu items, their properties, and access control
 */
export const MENU_SECTIONS = [
  {
    id: "quick-access",
    title: "Truy Cập Nhanh",
    icon: DashboardIcon,
    color: "#1976d2",
    defaultExpanded: true,
    items: [
      {
        id: "home",
        label: "Trang Chủ",
        description: "Tổng quan hệ thống",
        icon: DashboardIcon,
        path: "/",
        roles: ["user", "manager", "admin", "superadmin"],
      },
      {
        id: "unified-dashboard",
        label: "Dashboard Tổng Hợp",
        description: "Công việc, yêu cầu, KPI",
        icon: TimelineIcon,
        path: "/quanlycongviec",
        roles: ["user", "manager", "admin", "superadmin"],
      },
      {
        id: "my-tasks",
        label: "Công Việc Của Tôi",
        description: "Công việc được giao",
        icon: AssignmentIcon,
        path: "/quanlycongviec/cong-viec-cua-toi",
        roles: ["user", "manager", "admin", "superadmin"],
      },
      {
        id: "assigned-tasks",
        label: "Việc Tôi Giao",
        description: "Công việc tôi giao cho người khác",
        icon: SendIcon,
        path: "/quanlycongviec/viec-toi-giao",
        roles: ["manager", "admin", "superadmin"],
      },
    ],
  },
  {
    id: "work-management",
    title: "Quản Lý Công Việc",
    icon: WorkIcon,
    color: "#2e7d32",
    defaultExpanded: true,
    items: [
      {
        id: "work-dashboard",
        label: "Dashboard Công Việc",
        description: "Tổng quan công việc",
        icon: DashboardIcon,
        path: "/quanlycongviec/cong-viec-dashboard",
        roles: ["user", "manager", "admin", "superadmin"],
      },
      {
        id: "routine-duties",
        label: "Nhiệm Vụ Thường Quy",
        description: "Quản lý nhiệm vụ định kỳ",
        icon: ScheduleIcon,
        path: "/quanlycongviec/nhiem-vu-thuong-quy",
        roles: ["manager", "admin", "superadmin"],
      },
      {
        id: "assign-routine",
        label: "Giao Nhiệm Vụ",
        description: "Giao nhiệm vụ cho nhân viên",
        icon: PersonAddIcon,
        path: "/quanlycongviec/giao-nhiem-vu",
        roles: ["manager", "admin", "superadmin"],
      },
      {
        id: "employee-duties",
        label: "Nhiệm Vụ Của Tôi",
        description: "Nhiệm vụ thường quy được giao",
        icon: CheckCircleIcon,
        path: "/quanlycongviec/nhiem-vu-cua-toi",
        roles: ["user", "manager", "admin", "superadmin"],
      },
      {
        id: "cycle-management",
        label: "Quản Lý Chu Kỳ",
        description: "Thiết lập chu kỳ đánh giá",
        icon: TimelineIcon,
        path: "/quanlycongviec/chu-ky",
        roles: ["admin", "superadmin"],
      },
      {
        id: "criteria-management",
        label: "Quản Lý Tiêu Chí",
        description: "Thiết lập tiêu chí đánh giá",
        icon: CategoryIcon,
        path: "/quanlycongviec/tieu-chi",
        roles: ["admin", "superadmin"],
      },
      {
        id: "criteria-cycle-config",
        label: "Cấu Hình Tiêu Chí Theo Chu Kỳ",
        description: "Liên kết tiêu chí với chu kỳ",
        icon: SettingsIcon,
        path: "/quanlycongviec/tieu-chi-chu-ky",
        roles: ["admin", "superadmin"],
      },
      {
        id: "employee-management",
        label: "Quản Lý Nhân Viên",
        description: "Thông tin và vai trò nhân viên",
        icon: PeopleIcon,
        path: "/quanlycongviec/quan-ly-nhan-vien",
        roles: ["admin", "superadmin"],
      },
      {
        id: "notifications",
        label: "Thông Báo",
        description: "Quản lý thông báo hệ thống",
        icon: NotificationsIcon,
        path: "/quanlycongviec/thong-bao",
        roles: ["user", "manager", "admin", "superadmin"],
      },
      {
        id: "notification-settings",
        label: "Cài Đặt Thông Báo",
        description: "Cấu hình nhận thông báo",
        icon: SettingsIcon,
        path: "/quanlycongviec/cai-dat-thong-bao",
        roles: ["user", "manager", "admin", "superadmin"],
      },
    ],
  },
  {
    id: "kpi",
    title: "Đánh Giá KPI",
    icon: EmojiEventsIcon,
    color: "#ed6c02",
    defaultExpanded: false,
    items: [
      {
        id: "kpi-dashboard",
        label: "Dashboard KPI",
        description: "Tổng quan đánh giá KPI",
        icon: DashboardIcon,
        path: "/kpi-dashboard",
        roles: ["user", "manager", "admin", "superadmin"],
      },
      {
        id: "kpi-evaluation",
        label: "Đánh Giá KPI",
        description: "Thực hiện đánh giá KPI",
        icon: AssessmentIcon,
        path: "/quanlycongviec/kpi",
        roles: ["user", "manager", "admin", "superadmin"],
      },
      {
        id: "kpi-approve",
        label: "Duyệt Đánh Giá",
        description: "Phê duyệt kết quả KPI",
        icon: CheckCircleIcon,
        path: "/quanlycongviec/kpi/duyet-danh-gia",
        roles: ["manager", "admin", "superadmin"],
      },
      {
        id: "kpi-reports",
        label: "Báo Cáo KPI",
        description: "Thống kê và báo cáo KPI",
        icon: BarChartIcon,
        path: "/quanlycongviec/kpi/bao-cao",
        roles: ["manager", "admin", "superadmin"],
      },
      {
        id: "kpi-history",
        label: "Lịch Sử Đánh Giá",
        description: "Xem lại các đánh giá trước",
        icon: FolderOpenIcon,
        path: "/quanlycongviec/kpi/lich-su",
        roles: ["user", "manager", "admin", "superadmin"],
      },
    ],
  },
  {
    id: "requests",
    title: "Quản Lý Yêu Cầu",
    icon: SendIcon,
    color: "#9c27b0",
    defaultExpanded: false,
    items: [
      {
        id: "request-dashboard",
        label: "Dashboard Yêu Cầu",
        description: "Tổng quan yêu cầu công việc",
        icon: DashboardIcon,
        path: "/yeu-cau-dashboard",
        roles: ["user", "manager", "admin", "superadmin"],
      },
      {
        id: "my-requests-sent",
        label: "Yêu Cầu Tôi Gửi",
        description: "Yêu cầu tôi đã tạo",
        icon: SendIcon,
        path: "/quanlycongviec/yeucau/toi-gui",
        roles: ["user", "manager", "admin", "superadmin"],
      },
      {
        id: "my-requests-received",
        label: "Yêu Cầu Tôi Nhận",
        description: "Yêu cầu cần xử lý",
        icon: AssignmentIcon,
        path: "/quanlycongviec/yeucau/toi-nhan",
        roles: ["user", "manager", "admin", "superadmin"],
      },
      {
        id: "all-requests",
        label: "Tất Cả Yêu Cầu",
        description: "Quản lý toàn bộ yêu cầu",
        icon: ListIcon,
        path: "/quanlycongviec/yeucau",
        roles: ["manager", "admin", "superadmin"],
      },
      {
        id: "request-stats",
        label: "Thống Kê Yêu Cầu",
        description: "Báo cáo và phân tích",
        icon: BarChartIcon,
        path: "/quanlycongviec/yeucau/thong-ke",
        roles: ["manager", "admin", "superadmin"],
      },
    ],
  },
  {
    id: "medical-reports",
    title: "Báo Cáo Y Khoa",
    icon: LocalHospitalIcon,
    color: "#d32f2f",
    defaultExpanded: false,
    items: [
      {
        id: "daily-report",
        label: "Báo Cáo Ngày",
        description: "Báo cáo bệnh nhân hàng ngày",
        icon: DescriptionIcon,
        path: "/baocaongay",
        roles: ["user", "manager", "admin", "superadmin"],
      },
      {
        id: "patient-tracking",
        label: "Theo Dõi Bệnh Nhân",
        description: "Quản lý thông tin bệnh nhân",
        icon: LocalHospitalIcon,
        path: "/theodoi",
        roles: ["user", "manager", "admin", "superadmin"],
      },
      {
        id: "incident-report",
        label: "Báo Cáo Sự Cố",
        description: "Ghi nhận sự cố y khoa",
        icon: NotificationsIcon,
        path: "/baocaosuco",
        roles: ["user", "manager", "admin", "superadmin"],
      },
      {
        id: "medical-stats",
        label: "Thống Kê Y Khoa",
        description: "Phân tích số liệu y khoa",
        icon: TrendingUpIcon,
        path: "/thongke",
        roles: ["manager", "admin", "superadmin"],
      },
      {
        id: "department-avg",
        label: "Bình Quân Khoa",
        description: "Bình quân bệnh án theo khoa",
        icon: BarChartIcon,
        path: "/khoa-binh-quan-benh-an",
        roles: ["manager", "admin", "superadmin"],
      },
      {
        id: "export-reports",
        label: "Xuất Báo Cáo",
        description: "Export PowerPoint, Word",
        icon: CloudUploadIcon,
        path: "/export",
        roles: ["user", "manager", "admin", "superadmin"],
      },
    ],
  },
  {
    id: "training",
    title: "Đào Tạo",
    icon: SchoolIcon,
    color: "#0288d1",
    defaultExpanded: false,
    items: [
      {
        id: "training-management",
        label: "Quản Lý Đào Tạo",
        description: "Kế hoạch và chương trình đào tạo",
        icon: SchoolIcon,
        path: "/daotao",
        roles: ["manager", "admin", "superadmin"],
      },
      {
        id: "training-records",
        label: "Hồ Sơ Đào Tạo",
        description: "Lịch sử đào tạo nhân viên",
        icon: FolderOpenIcon,
        path: "/daotao/ho-so",
        roles: ["user", "manager", "admin", "superadmin"],
      },
    ],
  },
  {
    id: "research",
    title: "Nghiên Cứu Khoa Học",
    icon: ScienceIcon,
    color: "#7b1fa2",
    defaultExpanded: false,
    items: [
      {
        id: "research-management",
        label: "Quản Lý Nghiên Cứu",
        description: "Đề tài và công trình nghiên cứu",
        icon: ScienceIcon,
        path: "/nghiencuukhoahoc",
        roles: ["manager", "admin", "superadmin"],
      },
    ],
  },
  {
    id: "admin",
    title: "Quản Trị Hệ Thống",
    icon: SettingsIcon,
    color: "#616161",
    defaultExpanded: false,
    items: [
      {
        id: "user-management",
        label: "Quản Lý Người Dùng",
        description: "Tài khoản và phân quyền",
        icon: PeopleIcon,
        path: "/admin/nguoidung",
        roles: ["admin", "superadmin"],
      },
      {
        id: "department-management",
        label: "Quản Lý Khoa/Phòng",
        description: "Cấu trúc tổ chức",
        icon: BusinessCenterIcon,
        path: "/admin/khoa",
        roles: ["admin", "superadmin"],
      },
      {
        id: "master-data",
        label: "Dữ Liệu Cơ Bản",
        description: "DataFix và danh mục hệ thống",
        icon: CategoryIcon,
        path: "/admin/datafix",
        roles: ["admin", "superadmin"],
      },
      {
        id: "system-settings",
        label: "Cài Đặt Hệ Thống",
        description: "Cấu hình chung",
        icon: SettingsIcon,
        path: "/admin/settings",
        roles: ["superadmin"],
      },
      {
        id: "audit-logs",
        label: "Nhật Ký Hệ Thống",
        description: "Lịch sử thao tác",
        icon: FolderOpenIcon,
        path: "/admin/logs",
        roles: ["superadmin"],
      },
    ],
  },
];

/**
 * Section color mapping
 * Maps section IDs to their corresponding theme colors
 */
export const SECTION_COLORS = {
  "quick-access": "#1976d2",
  "work-management": "#2e7d32",
  kpi: "#ed6c02",
  requests: "#9c27b0",
  "medical-reports": "#d32f2f",
  training: "#0288d1",
  research: "#7b1fa2",
  admin: "#616161",
};

/**
 * Default expanded sections
 * Defines which sections should be expanded by default
 */
export const DEFAULT_EXPANDED_SECTIONS = ["quick-access", "work-management"];

/**
 * Get section by ID
 * @param {string} sectionId - The section ID to find
 * @returns {object|undefined} The section object or undefined if not found
 */
export const getSectionById = (sectionId) => {
  return MENU_SECTIONS.find((section) => section.id === sectionId);
};

/**
 * Get menu item by ID
 * @param {string} itemId - The item ID to find
 * @returns {object|undefined} The menu item object or undefined if not found
 */
export const getMenuItemById = (itemId) => {
  for (const section of MENU_SECTIONS) {
    const item = section.items.find((item) => item.id === itemId);
    if (item) return item;
  }
  return undefined;
};

/**
 * Filter menu sections by user role
 * @param {string} userRole - The user's role (user, manager, admin, superadmin)
 * @returns {array} Filtered menu sections
 */
export const filterMenuByRole = (userRole = "user") => {
  return MENU_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => item.roles.includes(userRole)),
  })).filter((section) => section.items.length > 0);
};

/**
 * Search menu items
 * @param {string} query - Search query
 * @param {string} userRole - The user's role
 * @returns {array} Filtered menu sections with matching items
 */
export const searchMenuItems = (query = "", userRole = "user") => {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return filterMenuByRole(userRole);

  return MENU_SECTIONS.map((section) => {
    const filteredItems = section.items.filter((item) => {
      // Role check
      if (!item.roles.includes(userRole)) return false;

      // Search check
      return (
        item.label.toLowerCase().includes(lowerQuery) ||
        item.description.toLowerCase().includes(lowerQuery) ||
        section.title.toLowerCase().includes(lowerQuery)
      );
    });

    return { ...section, items: filteredItems };
  }).filter((section) => section.items.length > 0);
};
