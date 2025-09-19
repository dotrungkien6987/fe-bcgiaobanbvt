import React from "react";
import { Button } from "@mui/material";
import { useDispatch } from "react-redux";
import DeleteIcon from "@mui/icons-material/Delete";
import { deleteDoanVao } from "../doanvaoSlice";

function DeleteDoanVaoButton({ doanVaoID }) {
  const dispatch = useDispatch();
  const handleDelete = async (e) => {
    e?.stopPropagation?.();
    if (window.confirm("Bạn có chắc chắn muốn xóa đoàn vào này?")) {
      await dispatch(deleteDoanVao(doanVaoID));
    }
  };
  return (
    <Button
      color="error"
      size="small"
      onClick={handleDelete}
      startIcon={<DeleteIcon fontSize="small" />}
    >
      Xóa
    </Button>
  );
}

export default DeleteDoanVaoButton;
