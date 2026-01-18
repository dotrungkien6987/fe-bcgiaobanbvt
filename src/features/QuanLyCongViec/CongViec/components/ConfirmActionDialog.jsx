import React from "react";
import { Button } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import BottomSheetDialog from "components/BottomSheetDialog";

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
    <BottomSheetDialog
      open={open}
      onClose={onClose}
      title={title}
      maxWidth="xs"
      actions={
        <>
          <Button onClick={onClose}>Hủy</Button>
          <LoadingButton
            loading={actionLoading === action}
            variant="contained"
            onClick={() => executeAction(action)}
          >
            Xác nhận
          </LoadingButton>
        </>
      }
    >
      {desc}
    </BottomSheetDialog>
  );
};

export default ConfirmActionDialog;
