import {
  Box,
  
  Card,
  CardContent,
  
  Modal,
  
  Typography,
  
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, {  useState } from "react";
import { useSelector } from "react-redux";

import {
  commonStyle,
  commonStyleLeft,
  commonStyleTitle,
} from "../../utils/heplFuntion";


import TablePhongChiDinhPhongThucHien from "./TablePhongChiDinhPhongThucHien";
function CardPhongChiDinhPhongThucHien({
  dataPhongChiDinh,
  title,
  value,
  colorCardWarning,
  titleMore,
}) {
  
  const theme = useTheme();
  const { darkMode } = useSelector((state) => state.mytheme);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  let commonStyleReponsive = isSmallScreen
    ? { ...commonStyle, fontSize: "0.8rem" }
    : { ...commonStyle };
  let commonStyleLeftReponsive = isSmallScreen
    ? { ...commonStyleLeft, fontSize: "0.8rem" }
    : { ...commonStyleLeft };
  commonStyleReponsive = darkMode
    ? { ...commonStyleReponsive, color: "#FFF" }
    : { ...commonStyleReponsive };
  commonStyleLeftReponsive = darkMode
    ? { ...commonStyleLeftReponsive, color: "#FFF" }
    : { ...commonStyleLeftReponsive };

  let commonStyleTitleReponsive = isSmallScreen
    ? { ...commonStyleTitle, fontSize: "0.8rem" }
    : { ...commonStyleTitle };
  const rowStyle = {
    height: "35px", // Adjust the height as needed
    "& td, & th": { padding: "5px" }, // Adjust the padding as needed
  };

  const VND = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  });

  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const [isHovered, setHovered] = useState(false);

  const handleMouseOver = () => {
    setHovered(true);
  };

  const handleMouseOut = () => {
    setHovered(false);
  };

  return (
    <Box>
      <Card
        sx={{
          fontWeight: "bold",
          color: "#f2f2f2",

          backgroundColor: colorCardWarning ? "#bb1515" : "#1939B7",
          boxShadow: 10,
          borderRadius: 3,
          mx: 2,
          mb: 1,
          ":hover": {
            filter: isHovered ? "brightness(1.5)" : "initial", // Tăng độ sáng lên 150%
            cursor: isHovered ? "pointer" : "initial",
          },
        }}
        onClick={handleOpen}
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
      >
        <CardContent>
          <Typography sx={{ textAlign: "center", fontSize: "0.9rem" }}>
            {title}
          </Typography>
          <Typography variant="h5" sx={{ textAlign: "center" }}>
            {value}
          </Typography>
        </CardContent>
      </Card>

      <div>
        <Modal open={open} onClose={handleClose}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "85vw",
              maxHeight: "80vh", // Giới hạn chiều cao tối đa
              overflowY: "auto", // Hiển thị thanh cuộn
              bgcolor: theme.palette.background.paper,
              boxShadow: 24,
              borderRadius: 2,
              //   p: 1,
            }}
          >
            <TablePhongChiDinhPhongThucHien
              dataPhongChiDinh={dataPhongChiDinh}
              titleTable={title}
            />
          </Box>
        </Modal>
      </div>
    </Box>
  );
}

export default CardPhongChiDinhPhongThucHien;
