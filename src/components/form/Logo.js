import { Link as RouterLink } from "react-router-dom";
import { Box } from "@mui/material";
import logoImg from "../logoBVTPT.png";

function Logo({ disabledLink = false, sx,isIcon=true }) {
  const logo =!isIcon? (
    <Box sx={{ width: 20, height: 20, ...sx }}>
      <img src={logoImg} alt="logo" width="30%" />
    </Box>
  ):(<Box sx={{ width: 40, height: 40, ...sx }}>
    <img src={logoImg} alt="logo" width="100%" />
  </Box>);

  if (disabledLink) {
    return <>{logo}</>;
  }

  return <RouterLink to="/">{logo}</RouterLink>;
}

export default Logo;
