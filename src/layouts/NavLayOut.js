import { Box, Stack } from "@mui/material";
import React from "react";
import MainHeader from "./MainHeader";
import MainFooter from "./MainFooter";
import { Outlet } from "react-router-dom";
import AlertMsg from "../components/AlertMsg";
import TreeNav from "./TreeNav";
import SimpleBarScroll from "components/third-party/SimpleBar";
// import CustomAppBar from "layout/MainLayout/Drawer/HorizontalBar";


function NavLayOut() {
  return (
    <Stack sx={{ minHeight: '100vh', position: 'relative', display: 'flex' }}>
          <MainHeader />
            <Stack direction="row" sx={{ flex: 1 }}>
              <Box sx={{width:280,flexShrink:0,borderRight: '1px solid #ddd', backgroundColor: '#f5f5f5'}}>

                <TreeNav />
              </Box>
                <Box sx={{ flexGrow: 1, paddingLeft: 0, paddingRight: 2 }}>
                  <SimpleBarScroll>

                    <Outlet />
                  </SimpleBarScroll>
                </Box>
            </Stack>
            <MainFooter />
    </Stack>
);
}

export default NavLayOut;
