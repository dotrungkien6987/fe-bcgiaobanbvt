import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";

const ConfirmActionDialog = ({
  open,
  action,
  buildConfirmTexts,
  actionLoading,
  executeAction,
  onClose,
}) => {
  if (!open || !action) return null;
  const { title, desc } = buildConfirmTexts(action);
  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{desc}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <LoadingButton
          loading={actionLoading === action}
          variant="contained"
          onClick={() => executeAction(action)}
        >
          Xác nhận
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmActionDialog;
