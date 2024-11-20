import React, { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import PersonAddRoundedIcon from "@mui/icons-material/PersonAddRounded";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import { Box, Card, Container, Stack, Tab, Tabs } from "@mui/material";
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

  const handleChangeTab = (newValue) => {
    setCurrentTab(newValue);
  };

  const allTabs  = [
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
