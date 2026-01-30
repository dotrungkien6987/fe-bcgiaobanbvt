/**
 * AlertBanner - Banner cảnh báo hiển thị khi có công việc/yêu cầu quá hạn hoặc gấp
 *
 * @param {Object} alert - { hasUrgent, message, type }
 * @param {Function} onViewClick - Callback khi click "Xem ngay"
 */

import React from "react";
import { Alert, Button, Collapse } from "@mui/material";
import { Warning2, Danger } from "iconsax-react";

function AlertBanner({ alert, onViewClick }) {
  // Don't render if no alert
  if (!alert?.hasUrgent) {
    return null;
  }

  const severity = alert.type === "error" ? "error" : "warning";
  const Icon = alert.type === "error" ? Danger : Warning2;

  return (
    <Collapse in={!!alert?.hasUrgent}>
      <Alert
        severity={severity}
        icon={<Icon size={20} variant="Bold" />}
        action={
          <Button
            color="inherit"
            size="small"
            onClick={onViewClick}
            sx={{ fontWeight: 600 }}
          >
            Xem ngay
          </Button>
        }
        sx={{
          mb: 2,
          borderRadius: 2,
          "& .MuiAlert-message": {
            fontWeight: 500,
          },
        }}
      >
        {alert.message}
      </Alert>
    </Collapse>
  );
}

export default AlertBanner;
