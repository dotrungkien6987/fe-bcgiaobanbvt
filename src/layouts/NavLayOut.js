import { Box, Stack } from "@mui/material";
import React from "react";
import MainHeader from "./MainHeader";
import MainFooter from "./MainFooter";
import { Outlet } from "react-router-dom";
import AlertMsg from "../components/AlertMsg";
import TreeNav from "./TreeNav";
// import CustomAppBar from "layout/MainLayout/Drawer/HorizontalBar";


function NavLayOut() {
  return (
    <Stack sx={{ minHeight: '100vh', position: 'relative', display: 'flex' }}>
          <MainHeader />
            <Stack direction="row" sx={{ flex: 1 }}>
                <TreeNav />
                <Box sx={{ flexGrow: 1, paddingLeft: 2, paddingRight: 2 }}>
                    <Outlet />
                </Box>
            </Stack>
            <MainFooter />
    </Stack>
);
}

export default NavLayOut;
