import React from "react";
import { Snackbar, Alert } from "@mui/material";

export default function useLocalSnackbar() {
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [severity, setSeverity] = React.useState("success");

  const show = (msg, sev = "success") => {
    setMessage(msg);
    setSeverity(sev);
    setOpen(true);
  };

  const showSuccess = (msg) => show(msg, "success");
  const showError = (msg) => show(msg, "error");
  const showInfo = (msg) => show(msg, "info");
  const showWarning = (msg) => show(msg, "warning");

  const SnackbarElement = (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={() => setOpen(false)}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    >
      <Alert
        onClose={() => setOpen(false)}
        severity={severity}
        variant="filled"
        sx={{ width: "100%" }}
      >
        {message}
      </Alert>
    </Snackbar>
  );

  return { showSuccess, showError, showInfo, showWarning, SnackbarElement };
}
