import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Tooltip, useTheme } from "@mui/material";
import { Refresh } from "iconsax-react";
import IconButton from "components/@extended/IconButton";
import ConfirmDialog from "components/ConfirmDialog";
import { restoreNhanVien } from "features/NhanVien/nhanvienSlice";
import { ThemeMode } from "configAble";

function RestoreNhanVienButton({ nhanvienID }) {
  const theme = useTheme();
  const mode = theme.palette.mode;
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);

  const handleRestore = () => {
    dispatch(restoreNhanVien(nhanvienID));
    setOpen(false);
  };

  return (
    <>
      <Tooltip
        componentsProps={{
          tooltip: {
            sx: {
              backgroundColor:
                mode === ThemeMode.DARK
                  ? theme.palette.grey[50]
                  : theme.palette.grey[700],
              opacity: 0.9,
            },
          },
        }}
        title="Phục hồi nhân viên"
      >
        <IconButton
          color="success"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(true);
          }}
        >
          <Refresh />
        </IconButton>
      </Tooltip>

      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Xác nhận phục hồi"
        content="Bạn có chắc chắn muốn phục hồi nhân viên này không? Nhân viên sẽ được khôi phục vào danh sách hoạt động."
        onConfirm={handleRestore}
        confirmText="Phục hồi"
        cancelText="Hủy"
      />
    </>
  );
}

export default RestoreNhanVienButton;
