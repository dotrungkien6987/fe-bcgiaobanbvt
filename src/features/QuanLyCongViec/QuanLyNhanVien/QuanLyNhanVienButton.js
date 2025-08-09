import { IconButton, Tooltip } from "@mui/material";
import { ManageAccounts } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export default function QuanLyNhanVienButton({ nhanvienID }) {
  const navigate = useNavigate();

  const handleClick = () => {
    console.log("QuanLyNhanVienButton - nhanvienID:", nhanvienID);
    if (!nhanvienID) {
      console.error("nhanvienID is undefined or null");
      return;
    }
    navigate(`/workmanagement/nhanvien/${nhanvienID}/quanly`);
  };

  return (
    <Tooltip title="Quản lý nhân viên">
      <IconButton color="primary" onClick={handleClick}>
        <ManageAccounts />
      </IconButton>
    </Tooltip>
  );
}
