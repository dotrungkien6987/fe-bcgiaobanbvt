import PropTypes from "prop-types";

// material-ui
import { useTheme } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";

// project-imports
import DrawerHeaderStyled from "./DrawerHeaderStyled";
import { MenuOrientation } from "configAble";

// import Logo from "components/logo";
import { DRAWER_WIDTH, HEADER_HEIGHT } from "configAble";
import useConfig from "hooks/useConfig";
import Logo from "components/form/Logo";

// ==============================|| DRAWER HEADER ||============================== //

const DrawerHeader = ({ open }) => {
  const theme = useTheme();
  const downLG = useMediaQuery(theme.breakpoints.down("lg"));

  const { menuOrientation } = useConfig();
  const isHorizontal =
    menuOrientation === MenuOrientation.HORIZONTAL && !downLG;

  return (
    <DrawerHeaderStyled
      theme={theme}
      open={open}
      sx={{
        minHeight: isHorizontal ? "unset" : HEADER_HEIGHT,
        width: isHorizontal ? { xs: "50%", lg: DRAWER_WIDTH + 50 } : "inherit",
        paddingTop: isHorizontal ? { xs: "10px", lg: "0" } : "8px",
        paddingBottom: isHorizontal ? { xs: "18px", lg: "0" } : "8px",
        paddingLeft: isHorizontal ? { xs: "24px", lg: "0" } : open ? "24px" : 0,
      }}
    >
      <Logo isIcon={!open} sx={{ width: open ? "auto" : 50, height: "auto" }} />
    </DrawerHeaderStyled>
  );
};

DrawerHeader.propTypes = {
  open: PropTypes.bool,
};

export default DrawerHeader;
