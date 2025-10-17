import React, { useState } from "react";
import { Button, Badge } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import { useSelector } from "react-redux";
import SelectNhanVienDialog from "./SelectNhanVienDialog";

/**
 * SelectNhanVienButton - Nút chọn nhân viên để lọc đánh giá KPI
 *
 * Features:
 * - Hiển thị tên nhân viên đã chọn hoặc "Chọn nhân viên"
 * - Badge indicator khi đã chọn nhân viên
 * - Mở dialog chọn nhân viên khi click
 */
function SelectNhanVienButton() {
  const [open, setOpen] = useState(false);
  const { filterNhanVienID, nhanVienDuocQuanLy = [] } = useSelector(
    (state) => state.kpi
  );

  // Tìm nhân viên đang được chọn từ danh sách nhân viên được quản lý
  const selectedNhanVien = nhanVienDuocQuanLy.find(
    (nv) => nv._id === filterNhanVienID
  );

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Badge
        color="primary"
        variant="dot"
        invisible={!filterNhanVienID}
        sx={{
          "& .MuiBadge-badge": {
            right: 8,
            top: 8,
          },
        }}
      >
        <Button
          variant="outlined"
          startIcon={<PersonIcon />}
          onClick={handleOpen}
          sx={{
            minWidth: 200,
            justifyContent: "flex-start",
          }}
        >
          {selectedNhanVien ? selectedNhanVien.Ten : "Chọn nhân viên"}
        </Button>
      </Badge>

      <SelectNhanVienDialog open={open} onClose={handleClose} />
    </>
  );
}

export default SelectNhanVienButton;
