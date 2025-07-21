import React from "react";
import { Button } from "@mui/material";
import { useDispatch } from "react-redux";
import { deleteDoanRa, getDoanRas } from "./doanraSlice";
import DeleteIcon from "@mui/icons-material/Delete";

function DeleteDoanRaButton({ doanRaID }) {
  const dispatch = useDispatch();
  const handleDelete = async () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa đoàn ra này?")) {
      await dispatch(deleteDoanRa(doanRaID));
      // Refresh danh sách sau khi xóa thành công
      dispatch(getDoanRas());
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
