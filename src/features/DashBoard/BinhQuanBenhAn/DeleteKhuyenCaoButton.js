import React from "react";
import { IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useDispatch } from "react-redux";
import { deleteKhuyenCao } from "./khuyenCaoKhoaBQBASlice";

function DeleteKhuyenCaoButton({ item }) {
  const dispatch = useDispatch();

  const handleDelete = () => {
    if (
      window.confirm(
        `Bạn có chắc chắn muốn xóa khuyến cáo cho khoa "${item.TenKhoa}" (${item.LoaiKhoa}) năm ${item.Nam}?`
      )
    ) {
      dispatch(deleteKhuyenCao(item._id));
    }
  };

  return (
    <IconButton color="error" onClick={handleDelete}>
      <DeleteIcon />
    </IconButton>
  );
}

export default DeleteKhuyenCaoButton;
