import React from "react";
import { Button } from "@mui/material";
import { useDispatch } from "react-redux";
import DeleteIcon from "@mui/icons-material/Delete";
import { deleteDoanVao } from "../doanvaoSlice";
import ConfirmDialog from "components/ConfirmDialog";

function DeleteDoanVaoButton({ doanVaoID }) {
  const dispatch = useDispatch();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleClick = (e) => {
    e?.stopPropagation?.();
    setOpen(true);
  };

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await dispatch(deleteDoanVao(doanVaoID));
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        color="error"
        size="small"
        onClick={handleClick}
        startIcon={<DeleteIcon fontSize="small" />}
      >
        Xóa
      </Button>
      <ConfirmDialog
        open={open}
        onClose={() => (!loading ? setOpen(false) : null)}
        onConfirm={handleConfirm}
        loading={loading}
        title="Xác nhận xóa Đoàn Vào"
        message="Bạn có chắc chắn muốn xóa bản ghi Đoàn Vào này? Thao tác không thể hoàn tác."
        confirmText="Xóa"
        confirmColor="error"
        severity="warning"
      />
    </>
  );
}

export default DeleteDoanVaoButton;
