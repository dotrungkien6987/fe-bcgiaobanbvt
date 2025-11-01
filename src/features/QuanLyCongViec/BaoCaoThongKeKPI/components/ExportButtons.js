import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Stack, Button } from "@mui/material";
import {
  FileDownload as ExcelIcon,
  PictureAsPdf as PdfIcon,
} from "@mui/icons-material";
import { exportExcelKPI } from "../baoCaoKPISlice";
import { toast } from "react-toastify";

function ExportButtons() {
  const dispatch = useDispatch();
  const { filters, isLoading } = useSelector((state) => state.baoCaoKPI);

  const handleExportExcel = async () => {
    try {
      await dispatch(exportExcelKPI(filters)).unwrap();
    } catch (error) {
      // Error already handled in slice with toast
      console.error("Export Excel failed:", error);
    }
  };

  const handleExportPDF = () => {
    toast.info("Chức năng xuất PDF đang được phát triển");
    // TODO: Implement PDF export in future
  };

  return (
    <Stack direction="row" spacing={2}>
      <Button
        variant="contained"
        color="success"
        startIcon={<ExcelIcon />}
        onClick={handleExportExcel}
        disabled={isLoading}
      >
        Xuất Excel
      </Button>
      <Button
        variant="contained"
        color="error"
        startIcon={<PdfIcon />}
        onClick={handleExportPDF}
        disabled={isLoading}
      >
        Xuất PDF
      </Button>
    </Stack>
  );
}

export default ExportButtons;
