import { useEffect, useMemo } from "react";

// material-ui
import { alpha, useTheme } from "@mui/material/styles";
import { AppBar, Toolbar, useMediaQuery } from "@mui/material";

// project-imports
import AppBarStyled from "./AppBarStyled";
import HeaderContent from "./HeaderContent";
import IconButton from "components/@extended/IconButton";

import { DRAWER_WIDTH, MINI_DRAWER_WIDTH } from "configAble";
import useConfig from "hooks/useConfig";

import { MenuOrientation, ThemeMode } from "configAble";

// assets
import { HambergerMenu } from "iconsax-react";
import { useDispatch, useSelector } from "react-redux";
import { openDrawer } from "features/Menu/menuSlice";
import useAuth from "hooks/useAuth";

// ==============================|| MAIN LAYOUT - HEADER ||============================== //

const Header = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const downLG = useMediaQuery(theme.breakpoints.down("lg"));

  const { menuOrientation } = useConfig();
  const { drawerOpen } = useSelector((state) => state.menu);

  const isHorizontal =
    menuOrientation === MenuOrientation.HORIZONTAL && !downLG;

  // header content
  const headerContent = useMemo(() => <HeaderContent />, []);

  const iconBackColorOpen =
    theme.palette.mode === ThemeMode.DARK ? "secondary.200" : "secondary.200";
  const iconBackColor =
    theme.palette.mode === ThemeMode.DARK
      ? "background.default"
      : "secondary.100";

  useEffect(() => {
    if (user.PhanQuyen === "admin" || user.PhanQuyen === "daotao" || user.PhanQuyen === "noibo") {
      console.log("user", user);
      return;
    }
    console.log("user", user);
    if (drawerOpen) {
      dispatch(openDrawer(false));
    }
  }, [drawerOpen]);
  // common header
  const dispatch = useDispatch();
  const mainHeader = (
    <Toolbar sx={{ px: { xs: 2, sm: 4.5, lg: 8 } }}>
      {!isHorizontal ? (
        <IconButton
          aria-label="open drawer"
          onClick={() => dispatch(openDrawer(!drawerOpen))}
          edge="start"
          color="secondary"
          variant="light"
          size="large"
          sx={{
            color: "secondary.main",
            bgcolor: drawerOpen ? iconBackColorOpen : iconBackColor,
            ml: { xs: 0, lg: -2 },
            p: 1,
          }}
        >
          <HambergerMenu />
        </IconButton>
      ) : null}
      {headerContent}
    </Toolbar>
  );

  // app-bar params
  const appBar = {
    position: "fixed",
    elevation: 0,
    sx: {
      bgcolor: alpha(theme.palette.background.default, 0.8),
      backdropFilter: "blur(8px)",
      zIndex: 1200,
      width: isHorizontal
        ? "100%"
        : {
            xs: "100%",
            lg: drawerOpen
              ? `calc(100% - ${DRAWER_WIDTH}px)`
              : `calc(100% - ${MINI_DRAWER_WIDTH}px)`,
          },
    },
  };

  return (
    <>
      {!downLG ? (
        <AppBarStyled open={drawerOpen} {...appBar}>
          {mainHeader}
        </AppBarStyled>
      ) : (
        <AppBar {...appBar}>{mainHeader}</AppBar>
      )}
    </>
  );
};

export default Header;
