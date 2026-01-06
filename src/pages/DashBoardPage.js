import React, { useEffect, useMemo, useState, useCallback } from "react";
import useAuth from "../hooks/useAuth";

import MenuIcon from "@mui/icons-material/Menu"; // Thêm icon Menu
import {
  Box,
  Card,
  Stack,
  Tab,
  Tabs,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  AppBar,
  Toolbar,
  Badge,
} from "@mui/material";

import styled from "@emotion/styled";
import ChiSoChatLuong from "../features/DashBoard/ChiSoChatLuong";
import DieuHanh from "../features/DashBoard/DieuHanh";
import TaiChinh from "../features/DashBoard/TaiChinh";

import DashBoardKhoa from "../features/DashBoard/DashBoardKhoa/DashBoardKhoa";
import DashBoardDaotao from "features/Daotao/BaoCaoTongHopDaoTao/DashBoardDaotao/DashBoardDaotao";
import DashBoardDaotaoKhoa from "features/Daotao/BaoCaoTongHopDaoTao/DashBoardDaoTaoKhoa/DashBoardDaotaoKhoa";
import DuocVatTu from "features/DashBoard/DuocVatTu/DuocVatTu";
import BenhNhanNgoaiTinh from "features/His/BenhNhanNgoaiTinh/BenhNhanNgoaiTinh";
import SoThuTuDashboard from "features/SoThuTuPhongKham/SoThuTuDashboard";
import BinhQuanBenhAn from "../features/DashBoard/BinhQuanBenhAn";
import DichVuTrungDashboard from "../features/DashBoard/DichVuTrung/DichVuTrungDashboard";

const TabsWrapperStyled = styled("div")(({ theme }) => ({
  zIndex: 9,
  bottom: 0,
  width: "100%",
  display: "flex",
  position: "absolute",
  //   backgroundColor: "#fff",

  [theme.breakpoints.up("sm")]: {
    justifyContent: "center",
  },
  [theme.breakpoints.up("md")]: {
    justifyContent: "flex-end",
    paddingRight: theme.spacing(3),
  },
}));

// Mapping giữa các mã quyền dashboard và tên tab
const DASHBOARD_PERMISSION_MAP = {
  BNNT: "BỆNH NHÂN NGOẠI TỈNH",
  CSCL: "CHỈ SỐ CHẤT LƯỢNG",
  ĐH: "ĐIỀU HÀNH",
  TC: "TÀI CHÍNH",
  BQBA: "Bình quân bệnh án",
  DICHVUTRUNG: "DỊCH VỤ TRÙNG",
  TCKHOA: "THEO DÕI THEO KHOA",
  DVT: "DƯỢC VẬT TƯ",
  ĐT: "ĐÀO TẠO TOÀN VIỆN",
  ĐTKHOA: "ĐÀO TẠO THEO KHOA",
  SOTHUTU: "SỐ THỨ TỰ BỆNH NHÂN",
};

function DashBoardPage() {
  const { user } = useAuth();

  // Danh sách tất cả các tab có sẵn (memoized)
  const allTabs = useMemo(
    () => [
      {
        value: "BỆNH NHÂN NGOẠI TỈNH",
        component: <BenhNhanNgoaiTinh />,
        permission: "BNNT",
      },
      {
        value: "CHỈ SỐ CHẤT LƯỢNG",
        component: <ChiSoChatLuong />,
        permission: "CSCL",
      },
      {
        value: "ĐIỀU HÀNH",
        component: <DieuHanh />,
        permission: "ĐH",
      },
      {
        value: "TÀI CHÍNH",
        component: <TaiChinh />,
        permission: "TC",
      },
      {
        value: "Bình quân bệnh án",
        component: <BinhQuanBenhAn />,
        permission: "BQBA",
      },
      {
        value: "DỊCH VỤ TRÙNG",
        component: <DichVuTrungDashboard />,
        permission: "DICHVUTRUNG",
      },
      {
        value: "THEO DÕI THEO KHOA",
        component: <DashBoardKhoa />,
        permission: "TCKHOA",
      },
      {
        value: "DƯỢC VẬT TƯ",
        component: <DuocVatTu />,
        permission: "DVT",
      },
      {
        value: "SỐ THỨ TỰ BỆNH NHÂN",
        component: <SoThuTuDashboard />,
        permission: "SOTHUTU",
      },
      {
        value: "ĐÀO TẠO TOÀN VIỆN",
        component: <DashBoardDaotao />,
        permission: "ĐT",
      },
      {
        value: "ĐÀO TẠO THEO KHOA",
        component: <DashBoardDaotaoKhoa />,
        permission: "ĐTKHOA",
      },
    ],
    []
  );

  // Lọc các tab dựa trên quyền của người dùng
  const getAuthorizedTabs = useCallback(() => {
    // Nếu là admin, hiển thị tất cả các tab
    if (user.PhanQuyen === "admin") {
      return allTabs;
    }

    // Lấy các quyền dashboard từ user
    const userDashboardPermissions = user.DashBoard || [];

    // Tạo mảng chứa tên các tab mà user có quyền xem
    let allowedTabs = [];

    // Nếu là manager
    if (user.PhanQuyen === "manager") {
      // Manager mặc định xem được THEO DÕI THEO KHOA và CHỈ SỐ CHẤT LƯỢNG
      allowedTabs = ["THEO DÕI THEO KHOA", "CHỈ SỐ CHẤT LƯỢNG"];

      // Thêm các quyền dashboard khác
      userDashboardPermissions.forEach((permission) => {
        const tabName = DASHBOARD_PERMISSION_MAP[permission];
        if (tabName && !allowedTabs.includes(tabName)) {
          allowedTabs.push(tabName);
        }
      });
    }
    // Các quyền khác (nomal, daotao, noibo)
    else {
      // Mặc định xem được CHỈ SỐ CHẤT LƯỢNG
      allowedTabs = ["CHỈ SỐ CHẤT LƯỢNG"];

      // Thêm các quyền dashboard khác
      userDashboardPermissions.forEach((permission) => {
        const tabName = DASHBOARD_PERMISSION_MAP[permission];
        if (tabName && !allowedTabs.includes(tabName)) {
          allowedTabs.push(tabName);
        }
      });
    }

    // Lọc lại danh sách tab theo các quyền đã xác định
    return allTabs.filter((tab) => allowedTabs.includes(tab.value));
  }, [user, allTabs]);

  // Lấy danh sách tab được phép xem (memoized)
  const PROFILE_TABS = useMemo(() => getAuthorizedTabs(), [getAuthorizedTabs]);

  // Tab mặc định (memoized)
  const defaultTab = useMemo(() => {
    if (PROFILE_TABS.length === 0) return "";

    if (user.PhanQuyen === "admin") return "TÀI CHÍNH";
    if (user.PhanQuyen === "manager") return "THEO DÕI THEO KHOA";
    return "CHỈ SỐ CHẤT LƯỢNG";
  }, [user, PROFILE_TABS]);

  const [currentTab, setCurrentTab] = useState("");

  // Cập nhật tab mặc định sau khi đã lọc danh sách tab
  useEffect(() => {
    // Kiểm tra xem tab mặc định có tồn tại trong danh sách tab được phép không
    if (defaultTab && PROFILE_TABS.some((tab) => tab.value === defaultTab)) {
      setCurrentTab(defaultTab);
    } else if (PROFILE_TABS.length > 0) {
      // Nếu không, chọn tab đầu tiên trong danh sách
      setCurrentTab(PROFILE_TABS[0].value);
    }
  }, [defaultTab, PROFILE_TABS]);

  // State cho menu
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  const handleChangeTab = (newValue) => {
    setCurrentTab(newValue);
  };

  // Xử lý mở menu
  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Xử lý đóng menu
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  // Xử lý chọn menu item
  const handleMenuItemClick = (tabValue) => {
    setCurrentTab(tabValue);
    handleCloseMenu();
  };

  return (
    <Stack>
      {/* AppBar với Menu button */}
      <AppBar position="static" color="default" elevation={1} sx={{ mb: 2 }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleOpenMenu}
            sx={{ mr: 2 }}
          >
            <Badge badgeContent={PROFILE_TABS.length} color="primary">
              <MenuIcon />
            </Badge>
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Menu cho điều hướng */}
      <Menu
        id="dashboard-menu"
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleCloseMenu}
        MenuListProps={{
          "aria-labelledby": "menu-button",
        }}
      >
        {PROFILE_TABS.map((tab) => (
          <MenuItem
            key={tab.value}
            onClick={() => handleMenuItemClick(tab.value)}
            selected={tab.value === currentTab}
          >
            {tab.value}
          </MenuItem>
        ))}
      </Menu>

      {PROFILE_TABS.length > 0 ? (
        <>
          <Card
            sx={{
              mb: 3,
              height: 50,
              position: "relative",
            }}
          >
            <TabsWrapperStyled>
              <Tabs
                value={currentTab}
                scrollButtons="auto"
                variant="scrollable"
                allowScrollButtonsMobile
                onChange={(e, value) => handleChangeTab(value)}
              >
                {PROFILE_TABS.map((tab) => (
                  <Tab
                    disableRipple
                    key={tab.value}
                    value={tab.value}
                    icon={tab.icon}
                    label={tab.value}
                  />
                ))}
              </Tabs>
            </TabsWrapperStyled>
          </Card>

          {PROFILE_TABS.map((tab) => {
            const isMatched = tab.value === currentTab;
            return isMatched && <Box key={tab.value}>{tab.component}</Box>;
          })}
        </>
      ) : (
        <Box
          sx={{
            p: 3,
            textAlign: "center",
            bgcolor: "#f5f5f5",
            borderRadius: 2,
            boxShadow: 1,
          }}
        >
          <Typography variant="h6" color="text.secondary">
            Bạn không có quyền xem Dashboard nào
          </Typography>
        </Box>
      )}
    </Stack>
  );
}

export default DashBoardPage;
