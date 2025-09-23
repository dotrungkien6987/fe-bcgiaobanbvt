import React from "react";
import { Button } from "@mui/material";
import { useDispatch } from "react-redux";
import { deleteDoanRa } from "./doanraSlice";
import DeleteIcon from "@mui/icons-material/Delete";
import ConfirmDialog from "components/ConfirmDialog";

function DeleteDoanRaButton({ doanRaID }) {
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
      await dispatch(deleteDoanRa(doanRaID));
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
        title="Xác nhận xóa Đoàn Ra"
        message="Bạn có chắc chắn muốn xóa bản ghi Đoàn Ra này? Thao tác không thể hoàn tác."
        confirmText="Xóa"
        confirmColor="error"
        severity="warning"
      />
    </>
  );
}

export default DeleteDoanRaButton;
