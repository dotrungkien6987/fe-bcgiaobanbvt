import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
  Box,
  Card,
  Typography,
  Divider,
  Stack,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Chip,
  ImageList,
  ImageListItem,
  CardContent,
  Avatar,
  Fade,
  Zoom,
  alpha,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PersonIcon from "@mui/icons-material/Person";
import EditIcon from "@mui/icons-material/Edit";
import TransferWithinAStationIcon from "@mui/icons-material/TransferWithinAStation";
import DeleteIcon from "@mui/icons-material/Delete";
import ImageIcon from "@mui/icons-material/Image";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";

import { removeBenhNhanInList } from "features/BaoCaoNgay/baocaongay_riengtheokhoaSlice";
import { transferBenhNhanFromRieng } from "features/BaoCaoNgay/baocaongaySlice";
import BenhNhanEditFormRieng from "./BenhNhanEditFormRieng";

// import useAuth from "../../hooks/useAuth";
// import ActionButton from "./ActionButton";

function BenhNhanCardRieng({ benhnhan }) {
  const {
    TenBenhNhan,
    Tuoi,
    DiaChi,
    VaoVien,
    GioiTinh,
    LyDoVV,
    DienBien,
    ChanDoan,
    XuTri,
    HienTai,
    GhiChu,
    Images,
    Stt,
  } = benhnhan;
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    setOpenEdit(true);
    console.log("benhnhan", benhnhan);
    setAnchorEl(null);
  };
  const handleRemove = () => {
    dispatch(removeBenhNhanInList(benhnhan));
    console.log("BN del", benhnhan);
    setAnchorEl(null);
    setOpen(false);
  };

  const handleTransfer = () => {
    dispatch(transferBenhNhanFromRieng(benhnhan));
    console.log("BN transfer to chung", benhnhan);
    setAnchorEl(null);
  };

  //dialogDelete
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setAnchorEl(null);
  };
  //dialog Edit Post
  const [openEdit, setOpenEdit] = useState(false);

  const handleCloseEditForm = () => {
    setOpenEdit(false);
  };
  const [cardHover, setCardHover] = useState(false); // New state to manage hover effect

  const handleMouseEnter = () => {
    setCardHover(true);
  };

  const handleMouseLeave = () => {
    setCardHover(false);
  };

  const [chipHover, setChipHover] = useState(false); // New state to manage Chip hover effect

  const handleChipMouseEnter = () => {
    setChipHover(true);
  };

  const handleChipMouseLeave = () => {
    setChipHover(false);
  };

  const [showImages, setShowImages] = useState(false); // New state to manage image dialog

  const handleShowImages = () => {
    setShowImages(true);
  };

  const handleCloseImages = () => {
    setShowImages(false);
  };
  return (
    <Fade in timeout={300}>
      <Card
        sx={{
          position: "relative",
          borderRadius: 3,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: cardHover
            ? "0 8px 25px rgba(0,0,0,0.15)"
            : "0 2px 10px rgba(0,0,0,0.08)",
          border: "1px solid",
          borderColor: cardHover ? "secondary.main" : alpha("#E0E0E0", 0.5),
          transform: cardHover ? "translateY(-4px)" : "translateY(0px)",
          cursor: "pointer",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "4px",
            height: "100%",
            background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            opacity: cardHover ? 1 : 0.7,
            transition: "opacity 0.3s ease",
          },
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onDoubleClick={handleEdit}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Header Section */}
          <Stack direction="row" alignItems="flex-start" spacing={2} mb={2}>
            <Avatar
              sx={{
                bgcolor: "secondary.main",
                width: 48,
                height: 48,
                fontSize: "1.1rem",
                fontWeight: "bold",
              }}
            >
              {Stt}
            </Avatar>

            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: "text.primary",
                  mb: 0.5,
                  fontSize: "1.1rem",
                  lineHeight: 1.3,
                }}
              >
                {TenBenhNhan}
              </Typography>{" "}
              <Stack direction="column" spacing={1.5} sx={{ width: "100%" }}>
                <Chip
                  icon={<PersonIcon />}
                  label={`${GioiTinh}, ${Tuoi} tuổi`}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderColor: "secondary.main",
                    color: "secondary.main",
                    "& .MuiChip-icon": { color: "secondary.main" },
                    width: "fit-content",
                  }}
                />

                <Box sx={{ width: "100%" }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "success.main",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      mb: 0.5,
                    }}
                  >
                    <LocationOnIcon sx={{ fontSize: 14 }} />
                    Địa chỉ:
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      backgroundColor: alpha("#4caf50", 0.1),
                      padding: "6px 12px",
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: alpha("#4caf50", 0.3),
                      fontSize: "0.875rem",
                      lineHeight: 1.4,
                      wordBreak: "break-word",
                    }}
                  >
                    {DiaChi}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <IconButton
              onClick={handleClick}
              sx={{
                transition: "all 0.2s ease",
                "&:hover": {
                  bgcolor: "action.hover",
                  transform: "scale(1.1)",
                },
              }}
            >
              <MoreVertIcon />
            </IconButton>
          </Stack>
          <Divider sx={{ my: 2, borderColor: alpha("#E0E0E0", 0.6) }} />
          {/* Information Section */}
          <Stack spacing={1.5}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CalendarTodayIcon
                sx={{ fontSize: 16, color: "text.secondary" }}
              />
              <Typography variant="body2" color="text.secondary">
                <strong>Vào viện:</strong> {VaoVien}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
              <LocalHospitalIcon
                sx={{ fontSize: 16, color: "text.secondary", mt: 0.2 }}
              />
              <Typography variant="body2" color="text.secondary">
                <strong>Lý do vào viện:</strong> {LyDoVV}
              </Typography>
            </Box>

            {DienBien && (
              <Typography variant="body2" color="text.secondary" sx={{ pl: 3 }}>
                <strong>Diễn biến:</strong> {DienBien}
              </Typography>
            )}

            {ChanDoan && (
              <Typography variant="body2" color="text.secondary" sx={{ pl: 3 }}>
                <strong>Chẩn đoán:</strong> {ChanDoan}
              </Typography>
            )}

            {XuTri && (
              <Typography variant="body2" color="text.secondary" sx={{ pl: 3 }}>
                <strong>Xử trí:</strong> {XuTri}
              </Typography>
            )}

            {HienTai && (
              <Typography variant="body2" color="text.secondary" sx={{ pl: 3 }}>
                <strong>Hiện tại:</strong> {HienTai}
              </Typography>
            )}

            {GhiChu && (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  bgcolor: alpha("#f5f5f5", 0.5),
                  borderRadius: 2,
                  borderLeft: "3px solid",
                  borderLeftColor: "info.main",
                }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontStyle="italic"
                >
                  {GhiChu}
                </Typography>
              </Box>
            )}
          </Stack>{" "}
          {/* Images Section */}
          {Images && Images.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Zoom in timeout={300}>
                <Chip
                  icon={<ImageIcon />}
                  label={`${Images.length} ảnh đính kèm`}
                  variant="filled"
                  onClick={handleShowImages}
                  sx={{
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    bgcolor: chipHover ? "secondary.main" : "secondary.light",
                    color: chipHover ? "white" : "secondary.contrastText",
                    "&:hover": {
                      transform: "scale(1.05)",
                      boxShadow: 2,
                    },
                    "& .MuiChip-icon": {
                      color: chipHover ? "white" : "secondary.main",
                    },
                  }}
                  onMouseEnter={handleChipMouseEnter}
                  onMouseLeave={handleChipMouseLeave}
                />
              </Zoom>
            </Box>
          )}
        </CardContent>

        {/* Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          PaperProps={{
            sx: {
              borderRadius: 2,
              minWidth: 180,
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              border: "1px solid rgba(0,0,0,0.05)",
            },
          }}
        >
          <MenuItem
            onClick={handleEdit}
            sx={{
              py: 1.5,
              gap: 2,
              "&:hover": { bgcolor: alpha("#1976d2", 0.1) },
            }}
          >
            <EditIcon sx={{ fontSize: 18, color: "primary.main" }} />
            <Typography variant="body2">Sửa</Typography>
          </MenuItem>

          <Divider />

          <MenuItem
            onClick={handleTransfer}
            sx={{
              py: 1.5,
              gap: 2,
              "&:hover": { bgcolor: alpha("#ed6c02", 0.1) },
            }}
          >
            <TransferWithinAStationIcon
              sx={{ fontSize: 18, color: "warning.main" }}
            />
            <Typography variant="body2">Chuyển lên toàn viện</Typography>
          </MenuItem>

          <Divider />

          <MenuItem
            onClick={handleClickOpen}
            sx={{
              py: 1.5,
              gap: 2,
              "&:hover": { bgcolor: alpha("#d32f2f", 0.1) },
            }}
          >
            <DeleteIcon sx={{ fontSize: 18, color: "error.main" }} />
            <Typography variant="body2">Xóa</Typography>
          </MenuItem>
        </Menu>

        {/* Dialogs */}
        <Dialog
          open={open}
          onClose={handleCloseDialog}
          PaperProps={{
            sx: {
              borderRadius: 3,
              minWidth: 400,
            },
          }}
        >
          <DialogTitle
            sx={{
              pb: 1,
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: "error.main",
            }}
          >
            <DeleteIcon />
            Cảnh báo!
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ fontSize: "1rem", pt: 1 }}>
              Bạn có chắc muốn xóa bệnh nhân <strong>{TenBenhNhan}</strong> này
              không?
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button
              variant="outlined"
              onClick={handleCloseDialog}
              sx={{ minWidth: 80 }}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              onClick={handleRemove}
              color="error"
              autoFocus
              sx={{ minWidth: 80 }}
            >
              Xóa
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={showImages}
          onClose={handleCloseImages}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
            },
          }}
        >
          <DialogTitle sx={{ pb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <ImageIcon color="primary" />
              Danh sách ảnh ({Images.length})
            </Box>
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <ImageList variant="masonry" cols={3} gap={12}>
              {Images.map((img, index) => (
                <ImageListItem
                  key={index}
                  sx={{
                    borderRadius: 2,
                    overflow: "hidden",
                    transition: "transform 0.2s ease",
                    "&:hover": {
                      transform: "scale(1.02)",
                    },
                  }}
                >
                  <img
                    src={img}
                    alt={`Ảnh ${index + 1}`}
                    style={{
                      borderRadius: 8,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                  />
                </ImageListItem>
              ))}
            </ImageList>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button
              onClick={handleCloseImages}
              variant="outlined"
              sx={{ minWidth: 80 }}
            >
              Đóng
            </Button>
          </DialogActions>
        </Dialog>

        <BenhNhanEditFormRieng
          open={openEdit}
          handleClose={handleCloseEditForm}
          benhnhan={benhnhan}
        />
      </Card>
    </Fade>
  );
}

export default BenhNhanCardRieng;
