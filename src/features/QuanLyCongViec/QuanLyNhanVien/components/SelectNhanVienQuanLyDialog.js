import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
  AlertTitle,
  Alert,
  Box,
} from "@mui/material";
import React, { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import SelectNhanVienQuanLyTable from "./SelectNhanVienQuanLyTable";
import { addNhanVienToList } from "../quanLyNhanVienSlice";

function SelectNhanVienQuanLyDialog({
  open,
  onClose,
  loaiQuanLy, // 'Giao_Viec' hoặc 'KPI'
  currentRelations = [],
}) {
  const dispatch = useDispatch();
  const { currentNhanVienQuanLy } = useSelector(
    (state) => state.quanLyNhanVien
  );

  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [error, setError] = useState("");

  // Handle selected rows change from table
  const handleSelectedRowsChange = useCallback((selectedRows) => {
    setSelectedRowIds(selectedRows);
    setError(""); // Clear error when selection changes
  }, []);

  // Handle select - add selected nhân viên to list and close dialog
  const handleSelect = () => {
    if (!currentNhanVienQuanLy) {
      setError("Không tìm thấy thông tin nhân viên quản lý");
      return;
    }

    try {
      // selectedRowIds là mảng các đối tượng nhân viên
      console.log("selectedRowIds (array of objects):", selectedRowIds);

      // Add each selected nhân viên to the appropriate list
      selectedRowIds.forEach((nhanVien) => {
        dispatch(
          addNhanVienToList({
            loaiQuanLy: loaiQuanLy,
            nhanVien: nhanVien,
          })
        );
      });

      // Close dialog
      onClose();
    } catch (error) {
      console.error("Error adding nhân viên to list:", error);
      setError(error.message || "Có lỗi xảy ra khi chọn nhân viên");
    }
  };

  const handleClose = () => {
    setSelectedRowIds([]);
    setError("");
    onClose();
  };

  const dialogTitle = `Chọn nhân viên ${
    loaiQuanLy === "Giao_Viec" ? "giao việc" : "chấm KPI"
  }`;
  const selectedCount = selectedRowIds.length;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: { height: "90vh" },
      }}
    >
      <DialogTitle>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h4">{dialogTitle}</Typography>
          <Typography variant="body2" color="text.secondary">
            Đã chọn: {selectedCount} nhân viên
          </Typography>
        </Stack>

        {currentNhanVienQuanLy && (
          <Box mt={1}>
            <Typography variant="body2" color="text.secondary">
              Nhân viên quản lý: <strong>{currentNhanVienQuanLy.Ten}</strong> (
              {currentNhanVienQuanLy.MaNhanVien})
            </Typography>
          </Box>
        )}
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <AlertTitle>Lỗi</AlertTitle>
            {error}
          </Alert>
        )}

        <SelectNhanVienQuanLyTable
          loaiQuanLy={loaiQuanLy}
          currentRelations={currentRelations}
          onSelectedRowsChange={handleSelectedRowsChange}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          Hủy
        </Button>
        <Button onClick={handleSelect} variant="contained">
          Chọn
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SelectNhanVienQuanLyDialog;
