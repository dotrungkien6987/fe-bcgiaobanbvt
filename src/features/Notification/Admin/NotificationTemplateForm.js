/**
 * NotificationTemplateForm Component (Admin)
 * Create/Edit notification template dialog
 *
 * Features:
 * - Form validation with Yup
 * - Variable detection from templates
 * - typeCode selection + recipientConfig.variables
 */

import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
  InputAdornment,
  Checkbox,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
  IconButton,
} from "@mui/material";
import {
  NotificationsOutlined as NotificationIcon,
  CheckCircleOutlined as CheckIcon,
  WarningAmberOutlined as WarningIcon,
  InfoOutlined as InfoIcon,
  ErrorOutlineOutlined as ErrorIcon,
  AssignmentOutlined as TaskIcon,
  AssessmentOutlined as KPIIcon,
  DescriptionOutlined as TicketIcon,
  SystemUpdateAltOutlined as SystemIcon,
  ExpandMore as ExpandMoreIcon,
  ContentCopy as CopyIcon,
  LockOutlined as LockIcon,
} from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { FormProvider, FTextField } from "../../../components/form";
import { createTemplate, updateTemplate } from "./notificationTemplateSlice";
import { getTypes } from "./notificationTypeSlice";

// Validation schema
const schema = Yup.object().shape({
  name: Yup.string().required("Tên là bắt buộc"),
  typeCode: Yup.string()
    .required("Type là bắt buộc")
    .matches(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "TypeCode nên dạng kebab-case, vd: yeucau-tao-moi"
    ),
  titleTemplate: Yup.string().required("Title template là bắt buộc"),
  bodyTemplate: Yup.string().required("Body template là bắt buộc"),
  priority: Yup.string().oneOf(["normal", "urgent"]),
  isEnabled: Yup.boolean(),
  recipientConfig: Yup.object().shape({
    variables: Yup.array().of(Yup.string()),
  }),
});

const defaultValues = {
  name: "",
  typeCode: "",
  titleTemplate: "",
  bodyTemplate: "",
  icon: "notification",
  priority: "normal",
  actionUrl: "",
  isEnabled: true,
  recipientConfig: { variables: [] },
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
  const { types } = useSelector((state) => state.notificationType);
  const [expandedVariables, setExpandedVariables] = useState(false);

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues,
  });

  const { handleSubmit, reset, watch, control } = methods;
  const bodyTemplate = watch("bodyTemplate");
  const titleTemplate = watch("titleTemplate");
  const actionUrl = watch("actionUrl");
  const typeCode = watch("typeCode");

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
      ...extractVariables(actionUrl),
    ];
    return [...new Set(allVars)];
  }, [titleTemplate, bodyTemplate, actionUrl]);

  const selectedType = useMemo(() => {
    return types.find((t) => t.code === typeCode) || null;
  }, [types, typeCode]);

  const recipientCandidates = useMemo(() => {
    const vars = selectedType?.variables || [];
    return vars.filter((v) => v.isRecipientCandidate).map((v) => v.name);
  }, [selectedType]);

  // Helper: Copy variable syntax to clipboard
  const handleCopyVariable = (varName) => {
    const syntax = `{{${varName}}}`;
    navigator.clipboard.writeText(syntax).then(() => {
      toast.success(`Đã copy: ${syntax}`);
    });
  };

  // Split variables into recipient and display groups
  const variableGroups = useMemo(() => {
    if (!selectedType?.variables) return { recipient: [], display: [] };
    return {
      recipient: selectedType.variables.filter((v) => v.isRecipientCandidate),
      display: selectedType.variables.filter((v) => !v.isRecipientCandidate),
    };
  }, [selectedType]);

  // Reset form when template changes
  useEffect(() => {
    dispatch(getTypes({ isActive: true }));
    if (template) {
      reset({
        ...defaultValues,
        ...template,
        recipientConfig: template.recipientConfig || { variables: [] },
      });
    } else {
      reset(defaultValues);
    }
  }, [dispatch, template, reset]);

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        const payload = {
          name: data.name,
          recipientConfig: data.recipientConfig || { variables: [] },
          titleTemplate: data.titleTemplate,
          bodyTemplate: data.bodyTemplate,
          actionUrl: data.actionUrl || "",
          icon: data.icon || "notification",
          priority: data.priority || "normal",
          isEnabled: data.isEnabled !== undefined ? data.isEnabled : true,
        };
        await dispatch(updateTemplate(template._id, payload));
      } else {
        const payload = {
          name: data.name,
          typeCode: data.typeCode,
          recipientConfig: data.recipientConfig || { variables: [] },
          titleTemplate: data.titleTemplate,
          bodyTemplate: data.bodyTemplate,
          actionUrl: data.actionUrl || "",
          icon: data.icon || "notification",
          priority: data.priority || "normal",
          isEnabled: data.isEnabled !== undefined ? data.isEnabled : true,
        };
        await dispatch(createTemplate(payload));
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
      </DialogTitle>

      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            {/* Basic Info */}
            <Grid item xs={12} md={6}>
              <FTextField name="name" label="Tên hiển thị *" />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="typeCode"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FTextField
                    {...field}
                    select
                    label="Type *"
                    disabled={isEdit}
                    error={!!error}
                    helperText={
                      error?.message ||
                      (isEdit
                        ? "⚠️ Không thể đổi Type sau khi tạo (đã có recipient config và variable references)"
                        : "Chọn type đã khai báo trong Notification Types")
                    }
                    InputProps={{
                      endAdornment: isEdit && (
                        <InputAdornment position="end">
                          <Tooltip title="Type đã khóa để bảo toàn tính toàn vẹn dữ liệu">
                            <LockIcon fontSize="small" color="action" />
                          </Tooltip>
                        </InputAdornment>
                      ),
                    }}
                    SelectProps={{
                      renderValue: (selected) => {
                        const type = types.find((t) => t.code === selected);
                        return type ? `${type.code} - ${type.name}` : selected;
                      },
                    }}
                  >
                    <MenuItem value="">
                      <em>Chọn type</em>
                    </MenuItem>
                    {/* Group by Nhom */}
                    {["Công việc", "Yêu cầu", "KPI", "Hệ thống"].map((nhom) => {
                      const nhomTypes = types.filter(
                        (t) => t.isActive && t.Nhom === nhom
                      );
                      if (nhomTypes.length === 0) return null;
                      return [
                        <MenuItem
                          key={`header-${nhom}`}
                          disabled
                          sx={{
                            fontWeight: "bold",
                            fontSize: "0.875rem",
                            color: "primary.main",
                            pointerEvents: "none",
                          }}
                        >
                          {nhom}
                        </MenuItem>,
                        ...nhomTypes.map((t) => (
                          <MenuItem key={t._id} value={t.code} sx={{ pl: 4 }}>
                            {t.code} - {t.name}
                          </MenuItem>
                        )),
                      ];
                    })}
                  </FTextField>
                )}
              />
            </Grid>

            {/* Available Variables Section */}
            {selectedType && (
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Accordion
                  expanded={expandedVariables}
                  onChange={() => setExpandedVariables(!expandedVariables)}
                  sx={{
                    bgcolor: "primary.50",
                    "&:before": { display: "none" },
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <InfoIcon color="primary" fontSize="small" />
                      <Typography variant="body2" fontWeight="medium">
                        📚 Danh sách biến có thể sử dụng cho type:{" "}
                        <Box component="span" color="primary.main">
                          {selectedType.code}
                        </Box>
                      </Typography>
                      <Chip
                        label={`${selectedType.variables?.length || 0} biến`}
                        size="small"
                        color="primary"
                      />
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        mb={1}
                      >
                        💡 Sử dụng cú pháp <code>{"{{variableName}}"}</code>{" "}
                        trong Title/Body/ActionUrl template. Click vào biến để
                        copy.
                      </Typography>
                    </Box>

                    {/* Recipient Variables */}
                    {variableGroups.recipient.length > 0 && (
                      <Box sx={{ mb: 3 }}>
                        <Typography
                          variant="subtitle2"
                          color="primary.main"
                          gutterBottom
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          👥 Biến recipient ({variableGroups.recipient.length})
                          <Typography variant="caption" color="text.secondary">
                            - Dùng để chọn người nhận thông báo
                          </Typography>
                        </Typography>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap">
                          {variableGroups.recipient.map((v) => (
                            <Tooltip
                              key={v.name}
                              title={
                                <Box>
                                  <Typography variant="caption" display="block">
                                    <strong>Mô tả:</strong> {v.description}
                                  </Typography>
                                  <Typography variant="caption" display="block">
                                    <strong>Kiểu:</strong> {v.type}
                                    {v.itemType && ` (Array<${v.itemType}>)`}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    display="block"
                                    sx={{ mt: 0.5, color: "success.light" }}
                                  >
                                    Click để copy
                                  </Typography>
                                </Box>
                              }
                            >
                              <Chip
                                label={v.name}
                                size="small"
                                color="primary"
                                variant="outlined"
                                onClick={() => handleCopyVariable(v.name)}
                                onDelete={() => handleCopyVariable(v.name)}
                                deleteIcon={<CopyIcon />}
                                sx={{ mb: 0.5, cursor: "pointer" }}
                              />
                            </Tooltip>
                          ))}
                        </Stack>
                      </Box>
                    )}

                    {/* Display Variables */}
                    {variableGroups.display.length > 0 && (
                      <Box>
                        <Typography
                          variant="subtitle2"
                          color="success.main"
                          gutterBottom
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          📝 Biến hiển thị ({variableGroups.display.length})
                          <Typography variant="caption" color="text.secondary">
                            - Dùng trong template để hiển thị thông tin
                          </Typography>
                        </Typography>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap">
                          {variableGroups.display.map((v) => (
                            <Tooltip
                              key={v.name}
                              title={
                                <Box>
                                  <Typography variant="caption" display="block">
                                    <strong>Mô tả:</strong>{" "}
                                    {v.description || v.name}
                                  </Typography>
                                  <Typography variant="caption" display="block">
                                    <strong>Kiểu:</strong> {v.type}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    display="block"
                                    sx={{ mt: 0.5, color: "success.light" }}
                                  >
                                    Click để copy
                                  </Typography>
                                </Box>
                              }
                            >
                              <Chip
                                label={v.name}
                                size="small"
                                color="success"
                                variant="outlined"
                                onClick={() => handleCopyVariable(v.name)}
                                onDelete={() => handleCopyVariable(v.name)}
                                deleteIcon={<CopyIcon />}
                                sx={{ mb: 0.5, cursor: "pointer" }}
                              />
                            </Tooltip>
                          ))}
                        </Stack>
                      </Box>
                    )}

                    {/* Detailed Table View */}
                    <Divider sx={{ my: 2 }} />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      gutterBottom
                    >
                      Chi tiết đầy đủ:
                    </Typography>
                    <Box sx={{ maxHeight: 300, overflow: "auto", mt: 1 }}>
                      <Table size="small" sx={{ minWidth: 600 }}>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: "bold" }}>
                              Tên biến
                            </TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>
                              Kiểu
                            </TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>
                              Mô tả
                            </TableCell>
                            <TableCell sx={{ fontWeight: "bold", width: 100 }}>
                              Recipient?
                            </TableCell>
                            <TableCell sx={{ fontWeight: "bold", width: 60 }}>
                              Copy
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedType.variables.map((v) => (
                            <TableRow
                              key={v.name}
                              hover
                              sx={{
                                bgcolor: v.isRecipientCandidate
                                  ? "primary.50"
                                  : "inherit",
                              }}
                            >
                              <TableCell>
                                <code>{v.name}</code>
                              </TableCell>
                              <TableCell>
                                <Typography variant="caption">
                                  {v.type}
                                  {v.itemType && (
                                    <Box
                                      component="span"
                                      color="text.secondary"
                                    >
                                      {" "}
                                      &lt;{v.itemType}&gt;
                                    </Box>
                                  )}
                                  {v.ref && (
                                    <Box component="span" color="primary.main">
                                      {" "}
                                      → {v.ref}
                                    </Box>
                                  )}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="caption">
                                  {v.description || "-"}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                {v.isRecipientCandidate && (
                                  <Chip
                                    label="Yes"
                                    size="small"
                                    color="primary"
                                    sx={{ height: 20 }}
                                  />
                                )}
                              </TableCell>
                              <TableCell align="center">
                                <IconButton
                                  size="small"
                                  onClick={() => handleCopyVariable(v.name)}
                                  title="Copy cú pháp"
                                >
                                  <CopyIcon fontSize="small" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Box>
                  </AccordionDetails>
                </Accordion>
                <Divider sx={{ my: 2 }} />
              </Grid>
            )}

            <Grid item xs={12} md={4}>
              <Controller
                name="icon"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FTextField
                    {...field}
                    select
                    label="Icon"
                    error={!!error}
                    helperText={error?.message}
                    InputProps={{
                      startAdornment: field.value && (
                        <InputAdornment position="start">
                          {getIconComponent(field.value)}
                        </InputAdornment>
                      ),
                    }}
                  >
                    <MenuItem value="notification">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <NotificationIcon fontSize="small" />
                        <Typography>Notification</Typography>
                      </Stack>
                    </MenuItem>
                    <MenuItem value="check">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <CheckIcon fontSize="small" />
                        <Typography>Check</Typography>
                      </Stack>
                    </MenuItem>
                    <MenuItem value="warning">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <WarningIcon fontSize="small" />
                        <Typography>Warning</Typography>
                      </Stack>
                    </MenuItem>
                    <MenuItem value="info">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <InfoIcon fontSize="small" />
                        <Typography>Info</Typography>
                      </Stack>
                    </MenuItem>
                    <MenuItem value="error">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <ErrorIcon fontSize="small" />
                        <Typography>Error</Typography>
                      </Stack>
                    </MenuItem>
                    <MenuItem value="task">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <TaskIcon fontSize="small" />
                        <Typography>Task</Typography>
                      </Stack>
                    </MenuItem>
                    <MenuItem value="kpi">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <KPIIcon fontSize="small" />
                        <Typography>KPI</Typography>
                      </Stack>
                    </MenuItem>
                    <MenuItem value="ticket">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <TicketIcon fontSize="small" />
                        <Typography>Ticket</Typography>
                      </Stack>
                    </MenuItem>
                    <MenuItem value="system">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <SystemIcon fontSize="small" />
                        <Typography>System</Typography>
                      </Stack>
                    </MenuItem>
                  </FTextField>
                )}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Controller
                name="priority"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FTextField
                    {...field}
                    select
                    label="Priority mặc định"
                    error={!!error}
                    helperText={error?.message}
                  >
                    <MenuItem value="normal">🟢 Normal</MenuItem>
                    <MenuItem value="urgent">🔴 Urgent</MenuItem>
                  </FTextField>
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Controller
                name="isEnabled"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox checked={!!field.value} {...field} />}
                    label="Enabled"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="recipientConfig.variables"
                control={control}
                render={({ field }) => (
                  <FTextField
                    {...field}
                    select
                    SelectProps={{
                      multiple: true,
                      renderValue: (selected) =>
                        (selected || []).length
                          ? (selected || []).join(", ")
                          : "(Mặc định)",
                    }}
                    label="Recipients (variables)"
                    helperText={
                      recipientCandidates.length
                        ? "Chọn các biến recipient candidate"
                        : "Type này chưa có recipient candidate"
                    }
                  >
                    {recipientCandidates.map((v) => (
                      <MenuItem key={v} value={v}>
                        <Checkbox checked={(field.value || []).includes(v)} />
                        <Typography variant="body2">{v}</Typography>
                      </MenuItem>
                    ))}
                  </FTextField>
                )}
              />
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
                name="actionUrl"
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

// Helper function to get icon component by name
function getIconComponent(iconName) {
  const iconMap = {
    notification: <NotificationIcon fontSize="small" />,
    check: <CheckIcon fontSize="small" />,
    warning: <WarningIcon fontSize="small" />,
    info: <InfoIcon fontSize="small" />,
    error: <ErrorIcon fontSize="small" />,
    task: <TaskIcon fontSize="small" />,
    kpi: <KPIIcon fontSize="small" />,
    ticket: <TicketIcon fontSize="small" />,
    system: <SystemIcon fontSize="small" />,
  };
  return iconMap[iconName] || <NotificationIcon fontSize="small" />;
}

export default NotificationTemplateForm;
