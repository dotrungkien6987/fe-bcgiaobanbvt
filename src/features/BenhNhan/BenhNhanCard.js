import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { removeBenhNhanInList } from "../BaoCaoNgay/baocaongaySlice";
import BenhNhanEditForm from "./BenhNhanEditForm";

// import useAuth from "../../hooks/useAuth";
// import ActionButton from "./ActionButton";

function BenhNhanCard({ benhnhan }) {
  const {
    TenBenhNhan,
    Tuoi,
    DiaChi,
    LoaiBN,
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
  const {darkMode} = useSelector((state)=>state.mytheme)
  
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

  const handleClickOpenEditForm = () => {
    setOpenEdit(true);
  };

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
    <Card
      sx={{
        alignItems: "center",
        p: 3,
        boxShadow: cardHover ? 5 : 3, // Update boxShadow based on hover state
        // backgroundColor: cardHover ? "#EFEFEF" : "#F9FAFB",
      }}
      onMouseEnter={handleMouseEnter} // Handle mouse enter
      onMouseLeave={handleMouseLeave} // Handle mouse leave
      onDoubleClick={handleEdit} // Handle double click
    >
      <Stack direction="row">
        <Typography
          variant="body2"
          sx={{ fontWeight: "bold", color: "primary.main" }}
        >
          {Stt}. {TenBenhNhan} - {GioiTinh}- {Tuoi} tuổi - {DiaChi}
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <IconButton onClick={handleClick}>
          <MoreVertIcon sx={{ fontSize: 20 }} />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem onClick={handleEdit} sx={{ fontSize: 12 }}>
            Sửa
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleClickOpen} sx={{ fontSize: 12 }}>
            {" "}
            Xóa
          </MenuItem>
        </Menu>
        <Dialog
          open={open}
          onClose={handleCloseDialog}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{"Cảnh báo!"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Bạn có chắc muốn xóa bệnh nhân này?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              onClick={handleCloseDialog}
              color="primary"
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              onClick={handleRemove}
              color="error"
              autoFocus
            >
              Xóa
            </Button>
          </DialogActions>
        </Dialog>
        <BenhNhanEditForm
          open={openEdit}
          handleClose={handleCloseEditForm}
          // handleSave={handleSaveEditPostForm}
          // tenLoaiBN={tenLoaiBN}
          // loaiBN = {loaiBN}
          benhnhan={benhnhan}
        />
      </Stack>

      <Divider />
      <Typography
        variant="body2"
        sx={{ color: "text.secondary", fontStyle: "italic" }}
      >
       - Vào viện: {VaoVien}
      </Typography>

      <Typography
        variant="body2"
        sx={{ color: "text.secondary", fontStyle: "italic" }}
      >
        - Lý do vào viện: {LyDoVV}
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: "text.secondary", fontStyle: "italic" }}
      >
        - Diễn biến: {DienBien}
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: "text.secondary", fontStyle: "italic" }}
      >
        - Chẩn đoán: {ChanDoan}
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: "text.secondary", fontStyle: "italic" }}
      >
        - Xử trí: {XuTri}
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: "text.secondary", fontStyle: "italic" }}
      >
       - Hiện tại: {HienTai}
      </Typography>

      <Typography
        variant="body2"
        sx={{ color: "text.secondary", fontStyle: "italic" }}
      >
        {GhiChu}
      </Typography>

      {Images.length > 0 && (
        <Chip
          label={`Có ${Images.length} ảnh đính kèm`}
          variant="outlined"
          sx={{
            mt: 2,
            cursor: "pointer",
            backgroundColor: chipHover ? "primary.main" : "primary.light",
            color: chipHover ? "#fff" : "#000",
            borderColor: chipHover ? "primary.dark" : "primary.main",
          }}
          onMouseEnter={handleChipMouseEnter}
          onMouseLeave={handleChipMouseLeave}
          onClick={handleShowImages}
        />
      )}

      <Dialog open={showImages} onClose={handleCloseImages}>
        <DialogTitle>Danh sách ảnh</DialogTitle>
        <DialogContent>
          <ImageList variant="masonry" cols={3} gap={8}>
            {Images.map((img, index) => (
              <ImageListItem key={index}>
                <img src={img} alt={`Ảnh ${index + 1}`} />
              </ImageListItem>
            ))}
          </ImageList>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseImages} color="primary">
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}

export default BenhNhanCard;
