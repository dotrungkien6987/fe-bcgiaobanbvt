import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useDispatch } from "react-redux";
import { bulkCreateKhuyenCao } from "./khuyenCaoKhoaBQBASlice";

function BulkCopyButton({ currentYear }) {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [namGoc, setNamGoc] = useState(currentYear - 1);
  const [namMoi, setNamMoi] = useState(currentYear);

  const handleOpen = () => {
    setNamGoc(currentYear - 1);
    setNamMoi(currentYear);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleCopy = async () => {
    try {
      await dispatch(bulkCreateKhuyenCao(namGoc, namMoi));
      handleClose();
    } catch (error) {
      // Error already handled by redux action
    }
  };

  // Generate years for selection
  const years = [];
  const current = new Date().getFullYear();
  for (let i = current - 5; i <= current + 2; i++) {
    years.push(i);
  }

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<ContentCopyIcon />}
        onClick={handleOpen}
        size="small"
      >
        Copy từ năm trước
      </Button>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Copy khuyến cáo từ năm trước</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            margin="normal"
            label="Năm gốc (copy từ)"
            value={namGoc}
            onChange={(e) => setNamGoc(parseInt(e.target.value))}
          >
            {years.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            fullWidth
            margin="normal"
            label="Năm mới (copy tới)"
            value={namMoi}
            onChange={(e) => setNamMoi(parseInt(e.target.value))}
          >
            {years.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Hủy</Button>
          <Button
            onClick={handleCopy}
            variant="contained"
            disabled={namGoc === namMoi}
          >
            Copy
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default BulkCopyButton;
