import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  Paper,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Card,
  CardContent,
  CardHeader,
  AppBar,
  Toolbar,
  Grid,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  PlayArrow as RunIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  ArrowDownward as ArrowDownIcon,
  ArrowUpward as ArrowUpIcon,
  KeyboardArrowDown as ArrowIcon,
  Close as CloseIcon,
  InfoOutlined as InfoIcon,
  AccountTree as TreeIcon,
} from "@mui/icons-material";
import { VARIABLE_DEFINITIONS } from "../utils/formulaVariables";
import {
  OPERATOR_DEFINITIONS,
  createDefaultCondition,
  createDefaultGroup,
  createDefaultStep,
  createDefaultPipeline,
  ensurePipeline,
  pipelineToText,
  STEP_TYPE_LABELS,
} from "../utils/formulaEvaluator";
import {
  fetchCongThucManTinh,
  createCongThucManTinh,
  updateCongThucManTinh,
  deleteCongThucManTinh,
  selectCongThucManTinh,
  selectLoadingCongThuc,
} from "../datLichKhamSlice";

// ─── Variable grouped options for Select ─────────────────────

const VARIABLE_GROUPS = [
  { key: "chung", label: "Thống kê chung" },
  { key: "hienTai", label: "Lần khám hiện tại" },
  { key: "dsMT_chinh", label: "DS mãn tính — CĐ chính" },
  { key: "dsMT_kemTheo", label: "DS mãn tính — CĐ kèm theo" },
  { key: "dsMT_ketHop", label: "DS mãn tính — Kết hợp" },
];

// ─── Condition editor (leaf node) ────────────────────────────

function ConditionEditor({ node, onChange, onDelete }) {
  const varDef = VARIABLE_DEFINITIONS.find((v) => v.id === node.bienSo);
  const varType = varDef?.type || "number";

  const applicableOps = OPERATOR_DEFINITIONS.filter(
    (op) => !op.types || op.types.includes(varType),
  );

  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      sx={{
        py: 0.75,
        px: 1,
        borderRadius: 1,
        "&:hover": { bgcolor: "action.hover" },
      }}
    >
      <Box
        sx={{
          width: 4,
          height: 32,
          borderRadius: 1,
          bgcolor: "primary.light",
          flexShrink: 0,
        }}
      />
      <FormControl size="small" sx={{ minWidth: 240 }}>
        <InputLabel>Biến số</InputLabel>
        <Select
          value={node.bienSo}
          label="Biến số"
          onChange={(e) => {
            const newVar = VARIABLE_DEFINITIONS.find(
              (v) => v.id === e.target.value,
            );
            const newNode = { ...node, bienSo: e.target.value };
            if (newVar?.type === "boolean") {
              newNode.giaTri = true;
              newNode.toanTu = "==";
            } else if (typeof node.giaTri === "boolean") {
              newNode.giaTri = 3;
              newNode.toanTu = ">=";
            }
            onChange(newNode);
          }}
        >
          {VARIABLE_GROUPS.map((group) => {
            const vars = VARIABLE_DEFINITIONS.filter(
              (v) => v.nhom === group.key,
            );
            if (vars.length === 0) return null;
            return [
              <ListItem
                key={`header-${group.key}`}
                sx={{
                  py: 0.25,
                  px: 2,
                  bgcolor: "grey.100",
                  pointerEvents: "none",
                }}
              >
                <Typography
                  variant="caption"
                  fontWeight="bold"
                  color="text.secondary"
                >
                  {group.label}
                </Typography>
              </ListItem>,
              ...vars.map((v) => (
                <MenuItem key={v.id} value={v.id} sx={{ pl: 3 }}>
                  <Tooltip title={v.moTa} placement="right">
                    <Box sx={{ width: "100%" }}>
                      <Typography variant="body2">{v.label}</Typography>
                    </Box>
                  </Tooltip>
                </MenuItem>
              )),
            ];
          })}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 100 }}>
        <InputLabel>Toán tử</InputLabel>
        <Select
          value={node.toanTu}
          label="Toán tử"
          onChange={(e) => onChange({ ...node, toanTu: e.target.value })}
        >
          {applicableOps.map((op) => (
            <MenuItem key={op.id} value={op.id}>
              {op.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {varType === "boolean" ? (
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel>Giá trị</InputLabel>
          <Select
            value={node.giaTri === true ? "true" : "false"}
            label="Giá trị"
            onChange={(e) =>
              onChange({ ...node, giaTri: e.target.value === "true" })
            }
          >
            <MenuItem value="true">Có</MenuItem>
            <MenuItem value="false">Không</MenuItem>
          </Select>
        </FormControl>
      ) : (
        <TextField
          size="small"
          label="Giá trị"
          type="number"
          value={node.giaTri}
          onChange={(e) =>
            onChange({ ...node, giaTri: Number(e.target.value) })
          }
          sx={{ width: 100 }}
        />
      )}

      <IconButton size="small" color="error" onClick={onDelete}>
        <DeleteIcon fontSize="small" />
      </IconButton>
    </Stack>
  );
}

// ─── Group editor (AND/OR node) — recursive ─────────────────

function GroupEditor({ node, onChange, onDelete, depth = 0 }) {
  const handleToggleLogic = () => {
    onChange({ ...node, loai: node.loai === "AND" ? "OR" : "AND" });
  };

  const handleChildChange = (index, newChild) => {
    const newChildren = [...node.children];
    newChildren[index] = newChild;
    onChange({ ...node, children: newChildren });
  };

  const handleChildDelete = (index) => {
    const newChildren = node.children.filter((_, i) => i !== index);
    if (newChildren.length === 0 && onDelete) {
      onDelete();
    } else {
      onChange({ ...node, children: newChildren });
    }
  };

  const handleAddCondition = () => {
    onChange({
      ...node,
      children: [...node.children, createDefaultCondition()],
    });
  };

  const handleAddGroup = () => {
    onChange({
      ...node,
      children: [
        ...node.children,
        createDefaultGroup(node.loai === "AND" ? "OR" : "AND"),
      ],
    });
  };

  const isAnd = node.loai === "AND";

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        ml: depth > 0 ? 2 : 0,
        borderLeft: "3px solid",
        borderLeftColor: isAnd ? "primary.main" : "warning.main",
        bgcolor: depth % 2 === 0 ? "grey.50" : "white",
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <Chip
          label={isAnd ? "VÀ (AND)" : "HOẶC (OR)"}
          color={isAnd ? "primary" : "warning"}
          size="small"
          onClick={handleToggleLogic}
          sx={{ cursor: "pointer", fontWeight: "bold" }}
        />
        <Typography variant="caption" color="text.secondary">
          Click để đổi
        </Typography>
        {onDelete && (
          <IconButton size="small" color="error" onClick={onDelete}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}
      </Stack>

      {node.children.map((child, idx) => (
        <Box key={idx}>
          {idx > 0 && (
            <Divider sx={{ my: 0.5 }}>
              <Chip
                label={isAnd ? "VÀ" : "HOẶC"}
                size="small"
                variant="outlined"
                color={isAnd ? "primary" : "warning"}
                sx={{ fontSize: "0.7rem" }}
              />
            </Divider>
          )}
          {child.loai === "dieu_kien" ? (
            <ConditionEditor
              node={child}
              onChange={(n) => handleChildChange(idx, n)}
              onDelete={() => handleChildDelete(idx)}
            />
          ) : (
            <GroupEditor
              node={child}
              onChange={(n) => handleChildChange(idx, n)}
              onDelete={() => handleChildDelete(idx)}
              depth={depth + 1}
            />
          )}
        </Box>
      ))}

      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={handleAddCondition}
        >
          Thêm điều kiện
        </Button>
        <Button
          size="small"
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAddGroup}
        >
          Thêm nhóm
        </Button>
      </Stack>
    </Paper>
  );
}

// ─── Condition tree visualizer (read-only) ──────────────────

const OPERATOR_SYMBOL = {
  "==": "=",
  "!=": "≠",
  ">": ">",
  ">=": "≥",
  "<": "<",
  "<=": "≤",
};

function getVarShortLabel(bienSo) {
  const def = VARIABLE_DEFINITIONS.find((v) => v.id === bienSo);
  return def ? def.label : bienSo;
}

function TreeLeaf({ node }) {
  const val =
    typeof node.giaTri === "boolean"
      ? node.giaTri
        ? "Có"
        : "Không"
      : node.giaTri;
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        px: 1,
        py: 0.25,
        borderRadius: 1,
        bgcolor: "grey.100",
        border: "1px solid",
        borderColor: "grey.300",
        fontSize: "0.75rem",
        whiteSpace: "nowrap",
      }}
    >
      <Typography
        variant="caption"
        fontWeight={600}
        color="text.primary"
        sx={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}
      >
        {getVarShortLabel(node.bienSo)}
      </Typography>
      <Typography variant="caption" color="secondary.main" fontWeight="bold">
        {OPERATOR_SYMBOL[node.toanTu] || node.toanTu}
      </Typography>
      <Typography variant="caption" color="primary.main" fontWeight="bold">
        {val}
      </Typography>
    </Box>
  );
}

function TreeGroup({ node, depth = 0 }) {
  const isAnd = node.loai === "AND";
  const color = isAnd ? "#1976d2" : "#ed6c02";
  const label = isAnd ? "VÀ" : "HOẶC";
  const children = node.children || [];

  return (
    <Box sx={{ display: "flex", flexDirection: "row", alignItems: "stretch" }}>
      {/* Logic node */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          mr: 0.5,
          position: "relative",
        }}
      >
        <Chip
          label={label}
          size="small"
          sx={{
            fontWeight: "bold",
            fontSize: "0.65rem",
            bgcolor: color,
            color: "#fff",
            height: 22,
            minWidth: 40,
            zIndex: 1,
          }}
        />
      </Box>

      {/* Connector lines + children */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          position: "relative",
          pl: 1.5,
          "&::before": {
            content: '""',
            position: "absolute",
            left: 0,
            top: children.length <= 1 ? "50%" : "14px",
            bottom: children.length <= 1 ? "50%" : "14px",
            width: "2px",
            bgcolor: color,
          },
        }}
      >
        {children.map((child, idx) => (
          <Box
            key={idx}
            sx={{
              display: "flex",
              alignItems: "center",
              py: 0.3,
              position: "relative",
              "&::before": {
                content: '""',
                position: "absolute",
                left: "-12px",
                top: "50%",
                width: 12,
                height: "2px",
                bgcolor: color,
              },
            }}
          >
            {child.loai === "dieu_kien" ? (
              <TreeLeaf node={child} />
            ) : (
              <TreeGroup node={child} depth={depth + 1} />
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function ConditionTreeView({ dieuKien }) {
  if (!dieuKien) return null;
  return (
    <Box
      sx={{
        p: 1.5,
        bgcolor: "#fafbfc",
        border: "1px dashed",
        borderColor: "grey.300",
        borderRadius: 1,
        overflowX: "auto",
      }}
    >
      {dieuKien.loai === "dieu_kien" ? (
        <TreeLeaf node={dieuKien} />
      ) : (
        <TreeGroup node={dieuKien} />
      )}
    </Box>
  );
}

// ─── Step card (1 bước trong pipeline) ───────────────────────

function StepCard({ step, index, total, onChange, onDelete, onMove }) {
  const stepTypeInfo = STEP_TYPE_LABELS[step.loaiStep] || STEP_TYPE_LABELS.loc;

  return (
    <Card
      variant="outlined"
      sx={{
        borderColor:
          step.loaiStep === "loaiTru" ? "error.main" : "primary.main",
        borderWidth: 2,
      }}
    >
      <CardHeader
        sx={{
          py: 1,
          px: 2,
          bgcolor: step.loaiStep === "loaiTru" ? "error.50" : "primary.50",
        }}
        title={
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              label={`Bước ${index + 1}`}
              size="small"
              sx={{ fontWeight: "bold", bgcolor: "grey.200" }}
            />
            <Chip
              label={stepTypeInfo.label}
              size="small"
              color={stepTypeInfo.color}
              onClick={() => {
                const newType = step.loaiStep === "loc" ? "loaiTru" : "loc";
                const newLabel = STEP_TYPE_LABELS[newType];
                onChange({
                  ...step,
                  loaiStep: newType,
                  tenStep: step.tenStep || newLabel.label,
                });
              }}
              sx={{ cursor: "pointer" }}
            />
            <TextField
              size="small"
              variant="standard"
              placeholder="Tên bước..."
              value={step.tenStep || ""}
              onChange={(e) => onChange({ ...step, tenStep: e.target.value })}
              sx={{
                flex: 1,
                "& input": { fontSize: "0.875rem", fontWeight: 500 },
              }}
            />
          </Stack>
        }
        action={
          <Stack direction="row" spacing={0}>
            <Tooltip title="Di chuyển lên">
              <span>
                <IconButton
                  size="small"
                  disabled={index === 0}
                  onClick={() => onMove(index, index - 1)}
                >
                  <ArrowUpIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Di chuyển xuống">
              <span>
                <IconButton
                  size="small"
                  disabled={index === total - 1}
                  onClick={() => onMove(index, index + 1)}
                >
                  <ArrowDownIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            {total > 1 && (
              <Tooltip title="Xóa bước">
                <IconButton size="small" color="error" onClick={onDelete}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        }
      />
      <CardContent sx={{ pt: 1, pb: "8px !important" }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mb: 0.5, display: "block" }}
        >
          {stepTypeInfo.moTa}
        </Typography>

        {/* Editable form */}
        <GroupEditor
          node={step.dieuKien}
          onChange={(newDK) => onChange({ ...step, dieuKien: newDK })}
          depth={0}
        />
      </CardContent>
    </Card>
  );
}

// ─── Arrow connector between steps ───────────────────────────

function StepArrow({ onAddStep }) {
  return (
    <Stack alignItems="center" spacing={0} sx={{ py: 0.5 }}>
      <ArrowIcon color="action" />
      <Tooltip title="Chèn bước mới tại đây">
        <IconButton
          size="small"
          sx={{
            border: "1px dashed",
            borderColor: "divider",
            width: 28,
            height: 28,
          }}
          onClick={onAddStep}
        >
          <AddIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>
      <ArrowIcon color="action" />
    </Stack>
  );
}

// ─── Variable reference dialog ──────────────────────────────

function VariableReferenceDialog({ open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h6">
            Danh sách biến số ({VARIABLE_DEFINITIONS.length} biến)
          </Typography>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        {VARIABLE_GROUPS.map((group) => {
          const vars = VARIABLE_DEFINITIONS.filter((v) => v.nhom === group.key);
          if (!vars.length) return null;
          return (
            <Box key={group.key} sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="primary" sx={{ mb: 0.5 }}>
                {group.label}
              </Typography>
              {vars.map((v) => (
                <Stack
                  key={v.id}
                  direction="row"
                  spacing={1}
                  alignItems="baseline"
                  sx={{ pl: 1, py: 0.25 }}
                >
                  <Chip
                    label={v.type === "boolean" ? "Có/Không" : "Số"}
                    size="small"
                    color={v.type === "boolean" ? "info" : "default"}
                    variant="outlined"
                    sx={{ fontSize: "0.65rem", minWidth: 70 }}
                  />
                  <Typography variant="body2" fontWeight={500}>
                    {v.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    — {v.moTa}
                  </Typography>
                </Stack>
              ))}
            </Box>
          );
        })}
      </DialogContent>
    </Dialog>
  );
}

// ─── Pipeline tree overview (right column) ──────────────────

function PipelineTreeOverview({ pipeline }) {
  if (!pipeline.length) return null;
  return (
    <Stack spacing={1.5}>
      {pipeline.map((step, idx) => {
        const info = STEP_TYPE_LABELS[step.loaiStep] || STEP_TYPE_LABELS.loc;
        return (
          <Paper key={idx} variant="outlined" sx={{ overflow: "hidden" }}>
            <Box
              sx={{
                px: 1.5,
                py: 0.75,
                bgcolor:
                  step.loaiStep === "loaiTru" ? "error.50" : "primary.50",
                borderBottom: "1px solid",
                borderColor: "divider",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Chip
                label={`B${idx + 1}`}
                size="small"
                sx={{ fontWeight: "bold", bgcolor: "grey.200", height: 22 }}
              />
              <Chip
                label={info.label}
                size="small"
                color={info.color}
                sx={{ height: 22 }}
              />
              {step.tenStep && (
                <Typography variant="caption" fontWeight={500}>
                  {step.tenStep}
                </Typography>
              )}
            </Box>
            <Box sx={{ p: 1 }}>
              <ConditionTreeView dieuKien={step.dieuKien} />
            </Box>
          </Paper>
        );
      })}
    </Stack>
  );
}

// ─── Main dialog ─────────────────────────────────────────────

function CongThucManTinhDialog({ open, onClose, onRunFormula }) {
  const dispatch = useDispatch();
  const congThucList = useSelector(selectCongThucManTinh);
  const loading = useSelector(selectLoadingCongThuc);

  const [editing, setEditing] = useState(null); // null = list view, "new" | id = editing
  const [tenCongThuc, setTenCongThuc] = useState("");
  const [moTa, setMoTa] = useState("");
  const [pipeline, setPipeline] = useState([]);
  const [varDialogOpen, setVarDialogOpen] = useState(false);

  useEffect(() => {
    if (open) {
      dispatch(fetchCongThucManTinh());
      setEditing(null);
    }
  }, [open, dispatch]);

  const handleNew = useCallback(() => {
    setEditing("new");
    setTenCongThuc("");
    setMoTa("");
    setPipeline(createDefaultPipeline());
  }, []);

  const handleEdit = useCallback((ct) => {
    setEditing(ct._id);
    setTenCongThuc(ct.tenCongThuc);
    setMoTa(ct.moTa || "");
    setPipeline(ensurePipeline(ct));
  }, []);

  const handleSave = useCallback(async () => {
    if (!tenCongThuc.trim() || !pipeline.length) return;

    // Re-index thuTu
    const indexed = pipeline.map((s, i) => ({ ...s, thuTu: i + 1 }));
    const data = { tenCongThuc, moTa, pipeline: indexed };
    let ok;
    if (editing === "new") {
      ok = await dispatch(createCongThucManTinh(data));
    } else {
      ok = await dispatch(updateCongThucManTinh(editing, data));
    }
    if (ok) setEditing(null);
  }, [editing, tenCongThuc, moTa, pipeline, dispatch]);

  const handleDelete = useCallback(
    (id) => {
      if (window.confirm("Xóa công thức này?")) {
        dispatch(deleteCongThucManTinh(id));
      }
    },
    [dispatch],
  );

  // Pipeline step handlers
  const handleStepChange = useCallback((index, newStep) => {
    setPipeline((prev) => prev.map((s, i) => (i === index ? newStep : s)));
  }, []);

  const handleStepDelete = useCallback((index) => {
    setPipeline((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleStepMove = useCallback((fromIdx, toIdx) => {
    setPipeline((prev) => {
      const arr = [...prev];
      const [item] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, item);
      return arr.map((s, i) => ({ ...s, thuTu: i + 1 }));
    });
  }, []);

  const handleAddStep = useCallback((atIndex) => {
    setPipeline((prev) => {
      const arr = [...prev];
      arr.splice(atIndex, 0, createDefaultStep("loc", ""));
      return arr.map((s, i) => ({ ...s, thuTu: i + 1 }));
    });
  }, []);

  const previewText = useMemo(() => {
    if (!pipeline.length) return "";
    return pipelineToText(pipeline);
  }, [pipeline]);

  // ─── List view ───────────────────────────────────────────
  if (editing === null) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">Quản lý công thức lọc mãn tính</Typography>
            <Button
              size="small"
              startIcon={<AddIcon />}
              variant="contained"
              onClick={handleNew}
            >
              Tạo công thức
            </Button>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          {!congThucList || congThucList.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Chưa có công thức nào. Tạo công thức để bắt đầu lọc tự động.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleNew}
              >
                Tạo công thức đầu tiên
              </Button>
            </Box>
          ) : (
            <List>
              {congThucList.map((ct) => {
                const pl = ensurePipeline(ct);
                return (
                  <ListItem
                    key={ct._id}
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                      mb: 1,
                    }}
                  >
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography fontWeight="bold">
                            {ct.tenCongThuc}
                          </Typography>
                          {ct.isActive && (
                            <Chip label="Active" size="small" color="success" />
                          )}
                          <Chip
                            label={`${pl.length} bước`}
                            size="small"
                            variant="outlined"
                          />
                        </Stack>
                      }
                      secondary={
                        <>
                          {ct.moTa && (
                            <Typography variant="body2" color="text.secondary">
                              {ct.moTa}
                            </Typography>
                          )}
                          <Stack
                            direction="row"
                            spacing={0.5}
                            sx={{ mt: 0.5, flexWrap: "wrap" }}
                            useFlexGap
                          >
                            {pl.map((step, i) => (
                              <Chip
                                key={i}
                                label={`${step.tenStep || `B${i + 1}`} (${STEP_TYPE_LABELS[step.loaiStep]?.label || step.loaiStep})`}
                                size="small"
                                variant="outlined"
                                color={
                                  STEP_TYPE_LABELS[step.loaiStep]?.color ||
                                  "default"
                                }
                              />
                            ))}
                          </Stack>
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="Chạy công thức này">
                          <IconButton
                            color="success"
                            onClick={() => {
                              onRunFormula?.(ct);
                              onClose();
                            }}
                          >
                            <RunIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Sửa">
                          <IconButton onClick={() => handleEdit(ct)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa">
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(ct._id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </ListItemSecondaryAction>
                  </ListItem>
                );
              })}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Đóng</Button>
        </DialogActions>
      </Dialog>
    );
  }

  // ─── Edit/Create view — Fullscreen Flowchart ─────────────
  return (
    <Dialog open={open} onClose={onClose} fullScreen>
      <AppBar sx={{ position: "relative" }} color="default" elevation={1}>
        <Toolbar variant="dense">
          <IconButton
            edge="start"
            onClick={() => setEditing(null)}
            sx={{ mr: 1 }}
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flex: 1 }}>
            {editing === "new" ? "Tạo công thức mới" : "Sửa công thức"}
          </Typography>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={!tenCongThuc.trim() || !pipeline.length || loading}
          >
            Lưu
          </Button>
        </Toolbar>
      </AppBar>
      <DialogContent sx={{ bgcolor: "grey.50", p: 2 }}>
        <Grid container spacing={2} sx={{ height: "100%" }}>
          {/* Left column: Pipeline editor */}
          <Grid item xs={12} md={8}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={2}>
                <TextField
                  size="small"
                  label="Tên công thức"
                  value={tenCongThuc}
                  onChange={(e) => setTenCongThuc(e.target.value)}
                  required
                  sx={{ flex: 1 }}
                />
                <TextField
                  size="small"
                  label="Mô tả (tùy chọn)"
                  value={moTa}
                  onChange={(e) => setMoTa(e.target.value)}
                  sx={{ flex: 1 }}
                />
              </Stack>

              <Divider>
                <Chip label="Pipeline" size="small" />
              </Divider>

              {/* Flowchart: Steps + Arrows */}
              <Stack alignItems="stretch" spacing={0}>
                {pipeline.map((step, idx) => (
                  <Box key={idx}>
                    {idx > 0 && (
                      <StepArrow onAddStep={() => handleAddStep(idx)} />
                    )}
                    <StepCard
                      step={step}
                      index={idx}
                      total={pipeline.length}
                      onChange={(s) => handleStepChange(idx, s)}
                      onDelete={() => handleStepDelete(idx)}
                      onMove={handleStepMove}
                    />
                  </Box>
                ))}
              </Stack>

              {/* Add step button at end */}
              <Stack alignItems="center">
                <ArrowIcon color="action" />
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => handleAddStep(pipeline.length)}
                  sx={{ mt: 0.5 }}
                >
                  Thêm bước mới
                </Button>
              </Stack>
            </Stack>
          </Grid>

          {/* Right column: Tree overview + Preview */}
          <Grid item xs={12} md={4}>
            <Stack spacing={2} sx={{ position: "sticky", top: 0 }}>
              {/* Button to open variable reference dialog */}
              <Button
                variant="outlined"
                size="small"
                startIcon={<InfoIcon />}
                onClick={() => setVarDialogOpen(true)}
                sx={{ textTransform: "none", fontWeight: 500 }}
              >
                Xem danh sách biến số ({VARIABLE_DEFINITIONS.length} biến)
              </Button>

              {/* Visual tree for all pipeline steps */}
              <Paper variant="outlined" sx={{ p: 1.5, bgcolor: "#fafbfc" }}>
                <Stack
                  direction="row"
                  spacing={0.5}
                  alignItems="center"
                  sx={{ mb: 1 }}
                >
                  <TreeIcon fontSize="small" color="primary" />
                  <Typography variant="subtitle2" color="primary">
                    Cây điều kiện trực quan
                  </Typography>
                </Stack>
                <PipelineTreeOverview pipeline={pipeline} />
              </Paper>

              {/* Preview */}
              {previewText && (
                <Alert severity="info" icon={false}>
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    Diễn giải pipeline:
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                    {previewText}
                  </Typography>
                </Alert>
              )}
            </Stack>
          </Grid>

          <VariableReferenceDialog
            open={varDialogOpen}
            onClose={() => setVarDialogOpen(false)}
          />
        </Grid>
      </DialogContent>
    </Dialog>
  );
}

export default CongThucManTinhDialog;
