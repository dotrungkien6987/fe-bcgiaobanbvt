import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
} from "@mui/material";
import { GridMoreVertIcon } from "@mui/x-data-grid";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { UpdateTrangThaiSuCo, deleteOneSuCo } from "./baocaosucoSlice";

function ActionSucoForReactTable(params) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const trangthai = params.params.TrangThai;
  const dispatch = useDispatch();
  const handleDeleteSuCo = (sucoId) => {
    setOpenDelete(true);
  };

  const handleCloseDeleteForm = () => {
    setOpenDelete(false);
  };
  const handleDeleteSuCoOnDB = () => {
    dispatch(deleteOneSuCo(params.params._id));
    setOpenDelete(false);
  };
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    console.log("param", params.params);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const navigate = useNavigate();
  const handleChangeTrangThai = () => {
    const sucoId = params.params._id;
    const trangthai = !(params.params.TrangThai || false);
    dispatch(UpdateTrangThaiSuCo(sucoId, trangthai));
  };
  return (
    <Stack direction={"row"} p={2}>
      {/* {params.value.getFullYear()} */}
      <IconButton onClick={handleClick} sx={{bgcolor:trangthai?'#84A9FF':'#CB6B6B',  '&:hover': {
      bgcolor:trangthai?'#4069C7':'#CD3F3F', // Màu nền khi hover
    },}} >
        <GridMoreVertIcon sx={{ fontSize: 15 }} />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem sx={{ fontSize: 12 }}>
          <Button
            sx={{ fontSize: "0.6rem", minWidth: "auto", flex: 1 }}
            variant="contained"
            size="small"
            // style={{ marginLeft: 16 }}
            // tabIndex={params.hasFocus ? 0 : -1}


            onClick={() => {
              console.log("paramid", params);
              navigate(`../suco/${params.params._id}`);
            }}
          >
            Sửa
          </Button>
        </MenuItem>
        <Divider />
        <MenuItem>
          <Button
            sx={{ fontSize: "0.6rem", minWidth: "auto", flex: 1 }}
            size="small"
            variant="contained"
            color={params.TrangThai === true ? "error" : "primary"}
            onClick={() => handleChangeTrangThai()}
          >
            {params.params.TrangThai === true
              ? "Hủy tiếp nhận"
              : "Tiếp nhận"}
          </Button>
        </MenuItem>
        <Divider />
        {(params.params.TrangThai === true) &&(
 <MenuItem>
 <Button
   sx={{ fontSize: "0.6rem", minWidth: "auto", flex: 1 }}
   size="small"
   variant="contained"
   //   color="error"
   onClick={() => navigate(`../phantich/${params.params._id}`)}
 >
   Phân tích
 </Button>
</MenuItem>
        )}
       
        <Divider />
        <MenuItem sx={{ fontSize: 12 }}>
          <Button
            sx={{ fontSize: "0.6rem", minWidth: "auto", flex: 1 }}
            size="small"
            variant="contained"
            color="error"
            onClick={() => handleDeleteSuCo(params.params._id)}
          >
            Xóa
          </Button>
        </MenuItem>
      </Menu>

      <Dialog
        open={openDelete}
        onClose={handleCloseDeleteForm}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Cảnh báo!"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Bạn có chắc muốn xóa sự cố này?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={handleCloseDeleteForm}
            color="primary"
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleDeleteSuCoOnDB}
            color="error"
            autoFocus
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

export default ActionSucoForReactTable;
