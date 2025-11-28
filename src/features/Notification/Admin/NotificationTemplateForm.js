/**
 * NotificationTemplateForm Component (Admin)
 * Create/Edit notification template dialog
 *
 * Features:
 * - Form validation with Yup
 * - Variable detection from templates
 * - Category and priority selection
 * - Preview of detected variables
 */

import React, { useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  MenuItem,
  Chip,
  Stack,
  Typography,
  Box,
  Divider,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { FormProvider, FTextField, FSelect } from "../../../components/form";
import { createTemplate, updateTemplate } from "./notificationTemplateSlice";

// Validation schema
const schema = Yup.object().shape({
  type: Yup.string()
    .required("Type là bắt buộc")
    .matches(/^[A-Z_]+$/, "Type phải viết hoa và dùng _ thay khoảng trắng"),
  name: Yup.string().required("Tên là bắt buộc"),
  titleTemplate: Yup.string().required("Title template là bắt buộc"),
  bodyTemplate: Yup.string().required("Body template là bắt buộc"),
  category: Yup.string().oneOf(["task", "kpi", "ticket", "system", "other"]),
  defaultPriority: Yup.string().oneOf(["normal", "urgent"]),
});

const defaultValues = {
  type: "",
  name: "",
  description: "",
  category: "other",
  titleTemplate: "",
  bodyTemplate: "",
  icon: "notification",
  defaultPriority: "normal",
  actionUrlTemplate: "",
  requiredVariables: [],
};

/**
 * NotificationTemplateForm - Create/Edit dialog
 * @param {boolean} open - Dialog open state
 * @param {Function} onClose - Close callback
 * @param {Object} template - Template to edit (null for create)
 */
function NotificationTemplateForm({ open, onClose, template = null }) {
  const dispatch = useDispatch();
  const isEdit = Boolean(template?._id);

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues,
  });

  const { handleSubmit, reset, watch, setValue } = methods;
  const bodyTemplate = watch("bodyTemplate");
  const titleTemplate = watch("titleTemplate");
  const actionUrlTemplate = watch("actionUrlTemplate");

  // Extract variables from template strings
  const extractVariables = (text) => {
    const matches = text?.match(/\{\{(\w+)\}\}/g) || [];
    return [...new Set(matches.map((m) => m.replace(/[{}]/g, "")))];
  };

  // Combine variables from all templates
  const detectedVariables = useMemo(() => {
    const allVars = [
      ...extractVariables(titleTemplate),
      ...extractVariables(bodyTemplate),
      ...extractVariables(actionUrlTemplate),
    ];
    return [...new Set(allVars)];
  }, [titleTemplate, bodyTemplate, actionUrlTemplate]);

  // Reset form when template changes
  useEffect(() => {
    if (template) {
      reset({
        ...defaultValues,
        ...template,
        requiredVariables: template.requiredVariables || [],
      });
    } else {
      reset(defaultValues);
    }
  }, [template, reset]);

  // Auto-update requiredVariables when templates change
  useEffect(() => {
    if (detectedVariables.length > 0) {
      setValue("requiredVariables", detectedVariables);
    }
  }, [detectedVariables, setValue]);

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        // When editing auto-created template, mark as configured
        if (template?.isAutoCreated) {
          data.isAutoCreated = false;
        }
        await dispatch(updateTemplate(template._id, data));
      } else {
        await dispatch(createTemplate(data));
      }
      onClose();
    } catch (error) {
      // Error handled in slice
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEdit ? "Chỉnh sửa Template" : "Tạo Template mới"}
        {template?.isAutoCreated && (
          <Chip
            label="⚠️ Auto-created"
            color="warning"
            size="small"
            sx={{ ml: 2 }}
          />
        )}
      </DialogTitle>

      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            {/* Basic Info */}
            <Grid item xs={12} md={6}>
              <FTextField
                name="type"
                label="Type *"
                placeholder="VD: TASK_ASSIGNED"
                disabled={isEdit}
                helperText="Viết hoa, dùng _ thay khoảng trắng"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FTextField name="name" label="Tên hiển thị *" />
            </Grid>

            <Grid item xs={12}>
              <FTextField name="description" label="Mô tả" multiline rows={2} />
            </Grid>

            <Grid item xs={12} md={4}>
              <FSelect name="category" label="Category">
                <MenuItem value="task">Công việc (task)</MenuItem>
                <MenuItem value="kpi">KPI</MenuItem>
                <MenuItem value="ticket">Yêu cầu (ticket)</MenuItem>
                <MenuItem value="system">Hệ thống</MenuItem>
                <MenuItem value="other">Khác</MenuItem>
              </FSelect>
            </Grid>
            <Grid item xs={12} md={4}>
              <FTextField name="icon" label="Icon" placeholder="notification" />
            </Grid>
            <Grid item xs={12} md={4}>
              <FSelect name="defaultPriority" label="Priority mặc định">
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
              </FSelect>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" gutterBottom>
                Templates (Sử dụng {"{{variableName}}"} cho placeholders)
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <FTextField
                name="titleTemplate"
                label="Title Template *"
                placeholder="VD: Công việc mới"
              />
            </Grid>
            <Grid item xs={12}>
              <FTextField
                name="bodyTemplate"
                label="Body Template *"
                multiline
                rows={3}
                placeholder="VD: {{assignerName}} đã giao cho bạn: {{taskName}}"
              />
            </Grid>
            <Grid item xs={12}>
              <FTextField
                name="actionUrlTemplate"
                label="Action URL Template"
                placeholder="VD: /congviec/{{taskId}}"
              />
            </Grid>

            {/* Detected Variables */}
            {detectedVariables.length > 0 && (
              <Grid item xs={12}>
                <Box sx={{ p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
                  <Typography variant="caption" color="textSecondary">
                    📋 Biến được phát hiện:
                  </Typography>
                  <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
                    {detectedVariables.map((v) => (
                      <Chip key={v} label={v} size="small" sx={{ mb: 1 }} />
                    ))}
                  </Stack>
                </Box>
              </Grid>
            )}
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Hủy</Button>
          <Button type="submit" variant="contained">
            {isEdit ? "Cập nhật" : "Tạo"}
          </Button>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

export default NotificationTemplateForm;
