import { Box, Stack } from "@mui/material";
import React from "react";
import MainHeader from "./MainHeader";
import MainFooter from "./MainFooter";
import { Outlet } from "react-router-dom";
import AlertMsg from "../components/AlertMsg";
// import CustomAppBar from "layout/MainLayout/Drawer/HorizontalBar";


function NavLayOut() {
  return (
    <Stack sx={{ minHeight: "100vh", position: "relative" }}>
      <MainHeader/>
      <AlertMsg/>
      {/* <CustomAppBar/> */}
      <Outlet />

      <Box sx={{ flexGrow: 1 }} />
      Đỗ Trung Kiên
      <MainFooter />
    </Stack>
  );
}

export default NavLayOut;
