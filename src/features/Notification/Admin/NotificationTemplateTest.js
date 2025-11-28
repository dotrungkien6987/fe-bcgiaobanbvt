/**
 * NotificationTemplateTest Component (Admin)
 * Test dialog for sending test notifications
 *
 * Features:
 * - Input test values for variables
 * - Live preview of rendered notification
 * - Send test notification to self
 */

import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography,
  Box,
  Divider,
  Alert,
} from "@mui/material";
import { Send as SendIcon } from "@mui/icons-material";
import { testTemplate } from "./notificationTemplateSlice";

/**
 * NotificationTemplateTest - Test notification dialog
 * @param {boolean} open - Dialog open state
 * @param {Function} onClose - Close callback
 * @param {Object} template - Template to test
 */
function NotificationTemplateTest({ open, onClose, template }) {
  const dispatch = useDispatch();
  const [testData, setTestData] = useState({});
  const [preview, setPreview] = useState({ title: "", body: "" });
  const [sending, setSending] = useState(false);

  // Initialize test data from requiredVariables
  useEffect(() => {
    if (template?.requiredVariables) {
      const initial = {};
      template.requiredVariables.forEach((varName) => {
        initial[varName] = `[Test ${varName}]`;
      });
      setTestData(initial);
    }
  }, [template]);

  // Update preview when test data changes
  useEffect(() => {
    if (template) {
      let title = template.titleTemplate || "";
      let body = template.bodyTemplate || "";

      Object.entries(testData).forEach(([key, value]) => {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
        title = title.replace(regex, value);
        body = body.replace(regex, value);
      });

      setPreview({ title, body });
    }
  }, [template, testData]);

  /**
   * Handle sending test notification
   */
  const handleSendTest = async () => {
    setSending(true);
    try {
      await dispatch(testTemplate(template._id, testData));
      onClose();
    } finally {
      setSending(false);
    }
  };

  if (!template) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>🧪 Test: {template.name}</DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          <Alert severity="info">
            Notification test sẽ được gửi đến tài khoản của bạn.
          </Alert>

          {/* Test Variables */}
          {template.requiredVariables?.length > 0 && (
            <>
              <Typography variant="subtitle2">Nhập giá trị test:</Typography>
              {template.requiredVariables.map((varName) => (
                <TextField
                  key={varName}
                  label={varName}
                  size="small"
                  fullWidth
                  value={testData[varName] || ""}
                  onChange={(e) =>
                    setTestData((prev) => ({
                      ...prev,
                      [varName]: e.target.value,
                    }))
                  }
                />
              ))}
            </>
          )}

          <Divider />

          {/* Preview */}
          <Typography variant="subtitle2">Xem trước:</Typography>
          <Box sx={{ p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              {preview.title || "(Title trống)"}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {preview.body || "(Body trống)"}
            </Typography>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button
          variant="contained"
          startIcon={<SendIcon />}
          onClick={handleSendTest}
          disabled={sending}
        >
          {sending ? "Đang gửi..." : "Gửi Test"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default NotificationTemplateTest;
