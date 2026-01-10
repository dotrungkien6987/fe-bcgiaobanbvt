import { useEffect } from "react";
import { Outlet } from "react-router-dom";

// material-ui
import { useTheme } from "@mui/material/styles";
import { useMediaQuery, Box, Container, Toolbar } from "@mui/material";

// project-imports
import Drawer from "./Drawer";
import Header from "./Header";
import Footer from "./Footer";
import HorizontalBar from "./Drawer/HorizontalBar";
import MobileBottomNav from "components/MobileBottomNav";
import useMobileLayout from "hooks/useMobileLayout";
// import Breadcrumbs from 'components/@extended/Breadcrumbs';

import { DRAWER_WIDTH } from "configAble";
// import navigation from 'menu-items';
import useConfig from "hooks/useConfig";
import { MenuOrientation } from "configAble";
import { useDispatch } from "react-redux";
import { openDrawer } from "features/Menu/menuSlice";
import AlertMsg from "components/AlertMsg";
// import Breadcrumbs from 'components/@extended/Breadcrumbs';
// import { dispatch } from 'store';
// import { openDrawer } from 'store/reducers/menu';
// import { MenuOrientation } from 'config';

// ==============================|| MAIN LAYOUT ||============================== //

const MainLayoutAble = () => {
  const theme = useTheme();
  const downXL = useMediaQuery(theme.breakpoints.down("xl"));
  const downLG = useMediaQuery(theme.breakpoints.down("lg"));

  const { container, miniDrawer, menuOrientation } = useConfig();
  const { showBottomNav, showDrawer } = useMobileLayout();

  const isHorizontal =
    menuOrientation === MenuOrientation.HORIZONTAL && !downLG;

  // set media wise responsive drawer
  const dispatch = useDispatch();
  useEffect(() => {
    if (!miniDrawer) {
      dispatch(openDrawer(!downXL));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [downXL]);

  return (
    <Box sx={{ display: "flex", width: "100%" }}>
      <Header />
      {showDrawer && (!isHorizontal ? <Drawer /> : <HorizontalBar />)}

      <Box
        component="main"
        sx={{
          width: showDrawer ? `calc(100% - ${DRAWER_WIDTH}px)` : "100%",
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          // Add bottom padding when mobile bottom nav is shown
          pb: showBottomNav ? "80px" : { xs: 2, md: 3 },
        }}
      >
        <Toolbar
          sx={{
            mt: isHorizontal ? 8 : "inherit",
            mb: isHorizontal ? 2 : "inherit",
          }}
        />
        <Container
          maxWidth={container ? "xl" : false}
          sx={{
            xs: 0,
            ...(container && { px: { xs: 0, md: 2 } }),
            position: "relative",
            minHeight: "calc(100vh - 110px)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* <Breadcrumbs navigation={navigation} title titleBottom card={false} divider={false} /> */}
          <AlertMsg />
          <Outlet />
          <Footer />
        </Container>
      </Box>

      {/* Mobile Bottom Navigation */}
      {showBottomNav && <MobileBottomNav />}
    </Box>
  );
};

export default MainLayoutAble;
