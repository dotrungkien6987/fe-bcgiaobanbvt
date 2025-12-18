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
  FormControlLabel,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Send as SendIcon,
  Visibility as PreviewIcon,
} from "@mui/icons-material";
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
  const [dryRun, setDryRun] = useState(true);
  const [recipientId, setRecipientId] = useState("self");

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
      await dispatch(
        testTemplate({
          id: template._id,
          data: testData,
          dryRun,
          recipientId: recipientId === "self" ? null : recipientId,
        })
      );
      if (!dryRun) {
        onClose();
      }
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
          <Alert severity={dryRun ? "info" : "warning"}>
            {dryRun
              ? "🔍 Dry Run mode: Chỉ xem preview, không gửi thật"
              : "⚠️ Live mode: Sẽ gửi notification thật vào hệ thống"}
          </Alert>

          {/* Test Mode Controls */}
          <Stack spacing={1.5}>
            <FormControlLabel
              control={
                <Switch
                  checked={dryRun}
                  onChange={(e) => setDryRun(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2">
                  Dry Run (chỉ xem preview, không lưu DB)
                </Typography>
              }
            />

            {!dryRun && (
              <FormControl size="small" fullWidth>
                <InputLabel>Gửi đến</InputLabel>
                <Select
                  value={recipientId}
                  onChange={(e) => setRecipientId(e.target.value)}
                  label="Gửi đến"
                >
                  <MenuItem value="self">👤 Chính tôi</MenuItem>
                  {/* TODO: Load users from API if needed */}
                </Select>
              </FormControl>
            )}
          </Stack>

          <Divider />

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
        <Button onClick={onClose}>Đóng</Button>
        <Button
          variant="contained"
          color={dryRun ? "info" : "primary"}
          startIcon={dryRun ? <PreviewIcon /> : <SendIcon />}
          onClick={handleSendTest}
          disabled={sending}
        >
          {sending ? "Đang xử lý..." : dryRun ? "Preview" : "Gửi Test"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default NotificationTemplateTest;
