// material-ui
import { styled } from "@mui/material/styles";
import Drawer from "@mui/material/Drawer";

// project-imports
import { DRAWER_WIDTH, MINI_DRAWER_WIDTH } from "configAble";

const openedMixin = (theme) => ({
  width: DRAWER_WIDTH,
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.easeInOut, // Smooth transition
    duration: 300, // Consistent 300ms
  }),
  overflowX: "hidden",
  overflowY: "auto",
  borderRight: `1px solid ${theme.palette.divider}`,
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.easeInOut, // Smooth transition
    duration: 300, // Consistent 300ms
  }),
  overflowX: "hidden",
  width: MINI_DRAWER_WIDTH,
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  borderRight: `1px solid ${theme.palette.divider}`,
  "& .MuiListItemIcon-root": {
    minWidth: 0,
    marginRight: 0,
    justifyContent: "center",
  },
  // Hide text smoothly
  "& .MuiListItemText-root": {
    opacity: 0,
    transition: "opacity 200ms",
  },
});

// ==============================|| DRAWER - MINI STYLED ||============================== //

const MiniDrawerStyled = styled(Drawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: DRAWER_WIDTH,
  flexShrink: 0,
  whiteSpace: "nowrap",

  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

export default MiniDrawerStyled;
