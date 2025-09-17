import React from "react";
import { Button } from "@mui/material";
import { useDispatch } from "react-redux";
import { deleteDoanRa } from "./doanraSlice";
import DeleteIcon from "@mui/icons-material/Delete";

function DeleteDoanRaButton({ doanRaID }) {
  const dispatch = useDispatch();
  const handleDelete = async () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa đoàn ra này?")) {
      await dispatch(deleteDoanRa(doanRaID));
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

export default DeleteDoanRaButton;
