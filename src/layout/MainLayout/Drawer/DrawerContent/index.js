// material-ui
import { useMediaQuery, useTheme, Box } from "@mui/material";

// project-imports
import Navigation from "./Navigation";
import SimpleBar from "components/third-party/SimpleBar";

// ==============================|| DRAWER CONTENT ||============================== //

const DrawerContent = () => {
  const theme = useTheme();
  const matchDownMD = useMediaQuery(theme.breakpoints.down("lg"));

  // For permanent drawer (desktop), don't use SimpleBar to avoid scroll conflicts
  if (!matchDownMD) {
    return (
      <Box
        sx={{
          height: "100%",
          transition: "all 0.3s ease-in-out",
        }}
      >
        <Navigation />
        {/* {drawerOpen && !matchDownMD && <NavCard />} */}
      </Box>
    );
  }

  // For temporary drawer (mobile), use SimpleBar
  return (
    <SimpleBar
      sx={{
        height: "100%",
        minHeight: 0,
        maxHeight: "100%",
        overflowY: "auto", // Fallback if SimpleBar fails
        "& .simplebar-content": {
          display: "flex",
          flexDirection: "column",
          minHeight: "100%",
          paddingRight: "4px",
          paddingLeft: "8px",
          paddingBottom: "16px",
          paddingTop: "8px",
        },
        "& .simplebar-content-wrapper": {
          height: "100%",
          maxHeight: "100%",
          overflowY: "auto",
        },
        "& .simplebar-wrapper": {
          height: "100%",
          maxHeight: "100%",
        },
        "& .simplebar-scrollbar": {
          "&:before": {
            backgroundColor: "rgba(0, 0, 0, 0.3)",
          },
        },
      }}
    >
      <Navigation />
      {/* {drawerOpen && !matchDownMD && <NavCard />} */}
    </SimpleBar>
  );
};

export default DrawerContent;
