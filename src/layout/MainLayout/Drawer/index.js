import PropTypes from "prop-types";
import { useMemo } from "react";

// material-ui
import { useTheme } from "@mui/material/styles";
import { Box, Drawer, useMediaQuery } from "@mui/material";

// project-imports
import DrawerHeader from "./DrawerHeader";
import DrawerContent from "./DrawerContent";
import MiniDrawerStyled from "./MiniDrawerStyled";

import { DRAWER_WIDTH } from "configAble";

import { useDispatch, useSelector } from "react-redux";
import { openDrawer } from "features/Menu/menuSlice";

// ==============================|| MAIN LAYOUT - DRAWER ||============================== //

const MainDrawer = ({ window }) => {
  const theme = useTheme();
  const downLG = useMediaQuery(theme.breakpoints.down("lg"));

  const { drawerOpen } = useSelector((state) => state.menu);

  // responsive drawer container
  const container =
    window !== undefined ? () => window().document.body : undefined;

  // header content
  const drawerContent = useMemo(() => <DrawerContent />, []);
  const drawerHeader = useMemo(
    () => <DrawerHeader open={drawerOpen} />,
    [drawerOpen]
  );

  const dispatch = useDispatch();
  return (
    <Box
      component="nav"
      sx={{ flexShrink: { md: 0 }, zIndex: 1200 }}
      aria-label="mailbox folders"
    >
      {!downLG ? (
        <MiniDrawerStyled variant="permanent" open={drawerOpen}>
          {drawerHeader}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              overflowX: "hidden",
              paddingRight: "4px",
              paddingLeft: "8px",
              paddingBottom: "16px",
              paddingTop: "8px",
              position: "relative",
            }}
          >
            {drawerContent}
          </Box>
        </MiniDrawerStyled>
      ) : (
        <Drawer
          container={container}
          variant="temporary"
          open={drawerOpen}
          onClose={() => dispatch(openDrawer(!drawerOpen))}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", lg: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: DRAWER_WIDTH,
              display: "flex",
              flexDirection: "column",
            },
          }}
        >
          {drawerHeader}
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
            }}
          >
            {drawerContent}
          </Box>
        </Drawer>
      )}
    </Box>
  );
};

MainDrawer.propTypes = {
  open: PropTypes.bool,
  window: PropTypes.object,
  handleDrawerToggle: PropTypes.func,
};

export default MainDrawer;
