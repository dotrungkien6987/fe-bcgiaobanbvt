/**
 * NotificationTemplateTest Component (Admin)
 * Test dialog for sending test notifications
 *
 * Features:
 * - Input test values for variables
 * - Preview rendered notification via backend
 * - Test-send notification via backend (real send)
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
import {
  Send as SendIcon,
  Visibility as PreviewIcon,
} from "@mui/icons-material";
import {
  previewTemplate,
  testSendNotification,
} from "./notificationTemplateSlice";

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
  const [loading, setLoading] = useState(false);
  const [extractedVars, setExtractedVars] = useState([]);

  // Initialize test data from extracted variables (best-effort)
  useEffect(() => {
    if (!template) return;
    const matches =
      `${template.titleTemplate || ""} ${template.bodyTemplate || ""} ${
        template.actionUrl || ""
      }`.match(/\{\{(\w+)\}\}/g) || [];
    const vars = [...new Set(matches.map((m) => m.replace(/[{}]/g, "")))];
    const initial = {};
    vars.forEach((varName) => {
      initial[varName] = `[Test ${varName}]`;
    });
    setExtractedVars(vars);
    setTestData(initial);
  }, [template]);

  const handlePreview = async () => {
    setLoading(true);
    try {
      const result = await dispatch(previewTemplate(template._id, testData));
      const apiPreview = result?.preview || result?.data?.preview;
      const apiExtracted = result?.extractedVars || result?.data?.extractedVars;
      if (apiPreview) {
        setPreview({
          title: apiPreview.title || "",
          body: apiPreview.body || "",
          actionUrl: apiPreview.actionUrl || "",
        });
      }
      if (Array.isArray(apiExtracted)) setExtractedVars(apiExtracted);
    } finally {
      setLoading(false);
    }
  };

  const handleSendTest = async () => {
    setLoading(true);
    try {
      await dispatch(testSendNotification(template.typeCode, testData));
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!template) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>🧪 Test: {template.name}</DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          <Alert severity="info">
            Preview dùng API preview theo template hiện tại. “Gửi test” sẽ gửi
            thật theo recipient config của template.
          </Alert>

          <Divider />

          {/* Test Variables */}
          {extractedVars.length > 0 && (
            <>
              <Typography variant="subtitle2">Nhập giá trị test:</Typography>
              {extractedVars.map((varName) => (
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
            {preview.actionUrl && (
              <Typography variant="caption" color="text.secondary">
                URL: {preview.actionUrl}
              </Typography>
            )}
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
        <Button
          variant="outlined"
          startIcon={<PreviewIcon />}
          onClick={handlePreview}
          disabled={loading}
        >
          {loading ? "Đang xử lý..." : "Preview"}
        </Button>
        <Button
          variant="contained"
          startIcon={<SendIcon />}
          onClick={handleSendTest}
          disabled={loading}
        >
          {loading ? "Đang xử lý..." : "Gửi Test"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default NotificationTemplateTest;
