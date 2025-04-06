import React, { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import PersonAddRoundedIcon from "@mui/icons-material/PersonAddRounded";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import MenuIcon from "@mui/icons-material/Menu"; // Thêm icon Menu
import { 
  Box, 
  Card, 
  Container, 
  Stack, 
  Tab, 
  Tabs, 
  IconButton, 
  Menu, 
  MenuItem, 
  Typography,
  AppBar,
  Toolbar
} from "@mui/material";
import SendTimeExtensionIcon from "@mui/icons-material/SendTimeExtension";

import styled from "@emotion/styled";
import ChiSoChatLuong from "../features/DashBoard/ChiSoChatLuong";
import DieuHanh from "../features/DashBoard/DieuHanh";
import TaiChinh from "../features/DashBoard/TaiChinh";
import HaiLongNguoiBenh from "../features/DashBoard/HaiLongNguoiBenh";
import DashBoardKhoa from "../features/DashBoard/DashBoardKhoa/DashBoardKhoa";
import DashBoardDaotao from "features/Daotao/BaoCaoTongHopDaoTao/DashBoardDaotao/DashBoardDaotao";
import DashBoardDaotaoKhoa from "features/Daotao/BaoCaoTongHopDaoTao/DashBoardDaoTaoKhoa/DashBoardDaotaoKhoa";
import DuocVatTu from "features/DashBoard/DuocVatTu/DuocVatTu";
import BenhNhanNgoaiTinh from "features/His/BenhNhanNgoaiTinh/BenhNhanNgoaiTinh";

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

function DashBoardPage() {
  const { user } = useAuth();

  // Thiết lập tab mặc định dựa trên quyền người dùng
  const defaultTab = user.PhanQuyen === 'admin' ? "TÀI CHÍNH" : "THEO DÕI THEO KHOA";
  const [currentTab, setCurrentTab] = useState(defaultTab);
  
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

  const allTabs  = [
    
    {
      value: "BỆNH NHÂN NGOẠI TỈNH",
      component: <BenhNhanNgoaiTinh />,
    },
    {
      value: "CHỈ SỐ CHẤT LƯỢNG",
      component: <ChiSoChatLuong />,
    },
    {
      value: "ĐIỀU HÀNH",
      component: <DieuHanh />,
    },
    {
      value: "TÀI CHÍNH",
      component: <TaiChinh />,
    },
    {
      value: "THEO DÕI THEO KHOA",
      component: <DashBoardKhoa />,
    },
    {
      value: "DƯỢC VẬT TƯ",
      component: <DuocVatTu />,
    },
    {
      value: "HÀI LÒNG NGƯỜI BỆNH",
      component: <HaiLongNguoiBenh />,
    },
    {
      value: "Đào tạo toàn viện",
      component: <DashBoardDaotao />,
    },
    {
      value: "Đào tạo theo khoa",
      component: <DashBoardDaotaoKhoa />,
    },
  ];
  
  // Lọc các tab dựa trên quyền của người dùng
  const PROFILE_TABS = user.PhanQuyen === 'admin' ? allTabs : allTabs.filter(tab => tab.value === "THEO DÕI THEO KHOA");

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
            <MenuIcon />
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
          'aria-labelledby': 'menu-button',
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
    </Stack>
  );
}

export default DashBoardPage;
