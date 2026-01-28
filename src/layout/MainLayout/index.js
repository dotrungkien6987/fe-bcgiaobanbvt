import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

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

// Routes that should render full-screen on mobile (no Header/Footer/BottomNav)
const FULLSCREEN_MOBILE_ROUTES = [
  "/congviec/responsive/",
  "/congviec/mobile/",
  "/quanlycongviec/kpi/cham-diem/", // KPI scoring page - fullScreen on mobile
];

// Routes that should render edge-to-edge on mobile (keep Header/BottomNav, remove padding)
const EDGE_TO_EDGE_ROUTES = [
  "/quanlycongviec/dashboard",
  "/quanlycongviec/yeu-cau-dashboard",
  "/quanlycongviec/yeucau/toi-gui",
  "/quanlycongviec/yeucau/xu-ly",
  "/quanlycongviec/yeucau/dieu-phoi",
  "/quanlycongviec/yeucau/quan-ly-khoa",
  "/quanlycongviec/cong-viec-dashboard",
  "/quanlycongviec/cong-viec-cua-toi",
  "/quanlycongviec/viec-toi-giao",
  "/quanlycongviec/lich-su-hoan-thanh",
  "/quanlycongviec/thong-bao",
  "/quanlycongviec/kpi/hub",
  "/quanlycongviec/kpi/danh-gia-nhan-vien",
  "/quanlycongviec/kpi/xem",
  "/quanlycongviec/kpi/tu-danh-gia",
];

const MainLayoutAble = () => {
  const theme = useTheme();
  const location = useLocation();
  const downXL = useMediaQuery(theme.breakpoints.down("xl"));
  const downLG = useMediaQuery(theme.breakpoints.down("lg"));
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const { container, miniDrawer, menuOrientation } = useConfig();
  const { showBottomNav, showDrawer } = useMobileLayout();

  // Check if current route should be full-screen on mobile
  // Special handling for YeuCau detail: /yeucau/:id (MongoDB ObjectId pattern)
  const isYeuCauDetail = /^\/quanlycongviec\/yeucau\/[a-f0-9]{24}$/i.test(
    location.pathname,
  );
  const isMobileDetailView =
    isMobile &&
    (isYeuCauDetail ||
      FULLSCREEN_MOBILE_ROUTES.some((route) =>
        location.pathname.includes(route),
      ));

  // Check if current route should be edge-to-edge on mobile (keep Header/BottomNav)
  // Exclude YeuCau detail page from edge-to-edge (it's full-screen)
  const isEdgeToEdgeView =
    isMobile &&
    !isYeuCauDetail &&
    EDGE_TO_EDGE_ROUTES.some((route) => location.pathname.includes(route));

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

  // Mobile detail view: render full-screen without Header/Footer/BottomNav
  if (isMobileDetailView) {
    return (
      <Box sx={{ width: "100%", minHeight: "100vh" }}>
        <AlertMsg />
        <Outlet />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", width: "100%" }}>
      <Header />
      {showDrawer && (!isHorizontal ? <Drawer /> : <HorizontalBar />)}

      <Box
        component="main"
        sx={{
          width: showDrawer ? `calc(100% - ${DRAWER_WIDTH}px)` : "100%",
          flexGrow: 1,
          p: isEdgeToEdgeView ? 0 : { xs: 2, md: 3 },
          // Add bottom padding when mobile bottom nav is shown
          pb: showBottomNav
            ? isEdgeToEdgeView
              ? "56px"
              : "80px"
            : isEdgeToEdgeView
              ? 0
              : { xs: 2, md: 3 },
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
            ...(container && { px: isEdgeToEdgeView ? 0 : { xs: 0, md: 2 } }),
            py: isEdgeToEdgeView ? 0 : undefined,
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
