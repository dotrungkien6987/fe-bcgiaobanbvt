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
  ExpandMore as ExpandMoreIcon,
  HelpOutline as HelpIcon,
} from "@mui/icons-material";
import Collapse from "@mui/material/Collapse";
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

// ─── Quick Guide Panel ───────────────────────────────────────

function QuickGuidePanel() {
  const [expanded, setExpanded] = useState(false);
  return (
    <Paper variant="outlined" sx={{ overflow: "hidden" }}>
      <Box
        onClick={() => setExpanded((prev) => !prev)}
        sx={{
          px: 1.5,
          py: 1,
          display: "flex",
          alignItems: "center",
          gap: 1,
          cursor: "pointer",
          bgcolor: "grey.100",
          "&:hover": { bgcolor: "grey.200" },
        }}
      >
        <HelpIcon fontSize="small" color="info" />
        <Typography variant="subtitle2" sx={{ flex: 1 }}>
          Hướng dẫn: Cách xây dựng công thức lọc
        </Typography>
        <ExpandMoreIcon
          sx={{
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}
        />
      </Box>
      <Collapse in={expanded}>
        <Box sx={{ px: 2, py: 2 }}>

          {/* ── Sơ đồ luồng Pipeline ── */}
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700, color: "text.primary" }}>
            1. Công thức hoạt động như dây chuyền lọc từng bước
          </Typography>

          {/* Flow diagram */}
          <Paper variant="outlined" sx={{ p: 1.5, mb: 2, bgcolor: "grey.50", overflow: "hidden" }}>
            <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center" flexWrap="wrap" useFlexGap>
              {[
                { label: "BN đặt lịch", bg: "grey.100", color: "default" },
                { label: "Bước 1", bg: "primary.100", color: "primary" },
                { label: "Bước 2", bg: "primary.100", color: "primary" },
                { label: "Bước 3", bg: "error.50", color: "error" },
                { label: "Kết quả", bg: "success.50", color: "success" },
              ].map((item, idx, arr) => (
                <React.Fragment key={idx}>
                  <Chip
                    label={item.label}
                    size="small"
                    color={item.color}
                    sx={{ bgcolor: item.bg, fontWeight: idx === 0 || idx === arr.length - 1 ? 700 : 400 }}
                  />
                  {idx < arr.length - 1 && (
                    <ArrowIcon fontSize="small" sx={{ color: "text.disabled" }} />
                  )}
                </React.Fragment>
              ))}
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center", mt: 0.5 }}>
              BN đi qua từng bước theo thứ tự. Bị loại ở bước nào → <b>dừng ngay</b>, không xét tiếp.
            </Typography>
          </Paper>

          {/* ── 2 loại bước ── */}
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
            2. Hai loại bước trong công thức
          </Typography>

          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Paper
              variant="outlined"
              sx={{ flex: 1, p: 1.5, borderColor: "primary.main", borderWidth: 2 }}
            >
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
                <Chip label="Bước Lọc" size="small" color="primary" sx={{ fontWeight: 700 }} />
                <Typography variant="caption" color="primary.main">✓ GIỮ LẠI</Typography>
              </Stack>
              <Typography variant="caption" component="div" sx={{ lineHeight: 1.7, color: "text.secondary" }}>
                Bệnh nhân phải <b>thỏa mãn</b> điều kiện bên trong mới được qua bước tiếp theo.
              </Typography>
              <Box sx={{ mt: 1, p: 1, bgcolor: "primary.50", borderRadius: 1, border: "1px dashed", borderColor: "primary.light" }}>
                <Typography variant="caption" sx={{ fontFamily: "monospace", fontSize: "0.75rem" }}>
                  <b>Ví dụ:</b> soLanKham ≥ 2
                  <br />→ Giữ lại BN khám từ 2 lần trở lên
                  <br />→ Loại BN khám 1 lần
                </Typography>
              </Box>
            </Paper>

            <Paper
              variant="outlined"
              sx={{ flex: 1, p: 1.5, borderColor: "error.main", borderWidth: 2 }}
            >
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
                <Chip label="Bước Loại trừ" size="small" color="error" sx={{ fontWeight: 700 }} />
                <Typography variant="caption" color="error.main">✗ LOẠI BỎ</Typography>
              </Stack>
              <Typography variant="caption" component="div" sx={{ lineHeight: 1.7, color: "text.secondary" }}>
                Bệnh nhân nào <b>khớp</b> điều kiện bên trong sẽ bị <b>loại bỏ</b> khỏi danh sách.
              </Typography>
              <Box sx={{ mt: 1, p: 1, bgcolor: "error.50", borderRadius: 1, border: "1px dashed", borderColor: "error.light" }}>
                <Typography variant="caption" sx={{ fontFamily: "monospace", fontSize: "0.75rem" }}>
                  <b>Ví dụ:</b> maBenhChinhMoi == true
                  <br />→ Loại BN có mã bệnh hoàn toàn mới
                  <br />→ Giữ BN có mã đã từng gặp
                </Typography>
              </Box>
            </Paper>
          </Stack>

          {/* ── VÀ / HOẶC ── */}
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
            3. Kết hợp nhiều điều kiện với VÀ / HOẶC
          </Typography>

          <Paper variant="outlined" sx={{ p: 1.5, mb: 2, bgcolor: "grey.50" }}>
            <Stack direction="row" spacing={3}>
              <Box>
                <Chip label="VÀ" size="small" color="primary" sx={{ fontWeight: 700, mb: 0.5 }} />
                <Typography variant="caption" component="div" sx={{ lineHeight: 1.7 }}>
                  <b>Tất cả</b> điều kiện phải đúng
                  <br />→ Giống "đủ cả" (AND)
                  <br />
                  <br /><b>Ví dụ:</b> soLanKham ≥ 2 <b style={{color:"#1976d2"}}>VÀ</b> tiLeMaBenhManTinh ≥ 50
                  <br />→ BN phải thỏa <b>cả 2</b> mới qua
                </Typography>
              </Box>
              <Divider orientation="vertical" flexItem />
              <Box>
                <Chip label="HOẶC" size="small" color="warning" sx={{ fontWeight: 700, mb: 0.5 }} />
                <Typography variant="caption" component="div" sx={{ lineHeight: 1.7 }}>
                  Chỉ cần <b>1</b> điều kiện đúng là đủ
                  <br />→ Giống "ít nhất 1 trong số" (OR)
                  <br />
                  <br /><b>Ví dụ:</b> soLanKham ≥ 2 <b style={{color:"#ed6c02"}}>HOẶC</b> tiLeMaBenhManTinh ≥ 50
                  <br />→ BN khám ≥2 lần <b>HOẶC</b> ≥50% có mã MT → qua
                </Typography>
              </Box>
            </Stack>
          </Paper>

          {/* ── Ví dụ thực tế ── */}
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
            4. Ví dụ thực tế: Công thức phát hiện BN mãn tính
          </Typography>

          <Paper variant="outlined" sx={{ p: 1.5, bgcolor: "grey.50" }}>
            <Stack spacing={1}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip label="Bước 1" size="small" color="primary" />
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  Lọc — Tần suất tối thiểu
                </Typography>
              </Stack>
              <Typography variant="caption" sx={{ pl: 4.5, fontFamily: "monospace", fontSize: "0.75rem", color: "text.secondary" }}>
                soLanKham ≥ 2
              </Typography>
              <Typography variant="caption" sx={{ pl: 4.5, fontSize: "0.72rem", color: "text.disabled" }}>
                → Loại BN chỉ khám 1 lần (chưa đủ tần suất)
              </Typography>

              <Stack direction="row" spacing={1} alignItems="center">
                <Chip label="Bước 2" size="small" color="primary" />
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  Lọc — Dấu hiệu mãn tính
                </Typography>
              </Stack>
              <Typography variant="caption" sx={{ pl: 4.5, fontFamily: "monospace", fontSize: "0.75rem", color: "text.secondary" }}>
                soLanMaBenhManTinh ≥ 1 <span style={{color:"#ed6c02"}}>HOẶC</span> tiLeMaBenhManTinh ≥ 50 <span style={{color:"#ed6c02"}}>HOẶC</span> soLanLienTucMaBenhManTinh ≥ 2
              </Typography>
              <Typography variant="caption" sx={{ pl: 4.5, fontSize: "0.72rem", color: "text.disabled" }}>
                → Giữ lại BN có ít nhất 1 dấu hiệu mãn tính
              </Typography>

              <Stack direction="row" spacing={1} alignItems="center">
                <Chip label="Bước 3" size="small" color="error" />
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  Loại trừ — Tín hiệu yếu
                </Typography>
              </Stack>
              <Typography variant="caption" sx={{ pl: 4.5, fontFamily: "monospace", fontSize: "0.75rem", color: "text.secondary" }}>
                maBenhChinhMoi == true <span style={{color:"#1976d2"}}>VÀ</span> soLanMaBenhManTinh_BatKy ≤ 1
              </Typography>
              <Typography variant="caption" sx={{ pl: 4.5, fontSize: "0.72rem", color: "text.disabled" }}>
                → Loại BN mã bệnh hoàn toàn mới + chưa từng có mã MT → có thể là bệnh mới, chưa chắc mãn tính
              </Typography>
            </Stack>
          </Paper>

        </Box>
      </Collapse>
    </Paper>
  );
}

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

// ── Helper: ví dụ block ──────────────────────────────────────
function ViDuBlock({ viDu }) {
  return (
    <Paper
      component="pre"
      sx={{
        bgcolor: "grey.50",
        p: 0.75,
        pl: 1.5,
        borderRadius: 1,
        border: "1px solid",
        borderColor: "divider",
        fontSize: "0.72rem",
        fontFamily: "monospace",
        whiteSpace: "pre-wrap",
        mb: 0,
        overflow: "hidden",
      }}
    >
      <Typography
        component="span"
        variant="caption"
        sx={{ fontFamily: "inherit", fontSize: "inherit" }}
      >
        <Box component="span" sx={{ color: "text.disabled", fontWeight: 600 }}>
          VD:{" "}
        </Box>
        {viDu}
      </Typography>
    </Paper>
  );
}

// ── Helper: 1 card biến số ──────────────────────────────────
function VariableCard({ variable, stt, viDu }) {
  return (
    <Paper variant="outlined" sx={{ mb: 1, p: 1.5 }}>
      {/* Row 1: STT + type badge + label */}
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            fontSize: "0.7rem",
            minWidth: 24,
            height: 20,
            lineHeight: "20px",
            textAlign: "center",
            bgcolor: "grey.200",
            borderRadius: "4px",
            px: 0.5,
            flexShrink: 0,
          }}
        >
          {stt}
        </Typography>
        <Chip
          label={variable.type === "boolean" ? "Có/Không" : "Số"}
          size="small"
          color={variable.type === "boolean" ? "info" : "default"}
          sx={{ fontWeight: 600, fontSize: "0.65rem", flexShrink: 0 }}
        />
        <Typography variant="body2" fontWeight={600} sx={{ flex: 1 }}>
          {variable.label}
        </Typography>
      </Stack>
      {/* Row 2: mô tả */}
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", mb: 0.75, pl: 8.5 }}
      >
        {variable.moTa}
      </Typography>
      {/* Row 3: ví dụ */}
      {viDu ? <ViDuBlock viDu={viDu} /> : null}
    </Paper>
  );
}

function VariableReferenceDialog({ open, onClose }) {
  // Build flat list of { group, variable, stt } — no IIFE, no nested JSX
  let sttCounter = 0;
  const flatItems = [];
  VARIABLE_GROUPS.forEach((group) => {
    const vars = VARIABLE_DEFINITIONS.filter((v) => v.nhom === group.key);
    vars.forEach((variable) => {
      sttCounter++;
      flatItems.push({ group, variable, stt: sttCounter });
    });
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h6">Danh sách biến số</Typography>
            <Chip label={`${VARIABLE_DEFINITIONS.length} biến`} size="small" color="primary" />
          </Stack>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent dividers sx={{ overflow: "auto", maxHeight: "80vh" }}>
        <Stack spacing={3}>
          {VARIABLE_GROUPS.map((group) => {
            const groupItems = flatItems.filter((item) => item.group === group);
            if (groupItems.length === 0) return null;
            return (
              <Box key={group.key}>
                <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: 700 }}>
                  {group.label}
                </Typography>
                {groupItems.map((item) => (
                  <VariableCard key={item.variable.id} variable={item.variable} stt={item.stt} viDu={item.variable.viDu} />
                ))}
              </Box>
            );
          })}
        </Stack>
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
        const isLoaiTru = step.loaiStep === "loaiTru";
        return (
          <Paper key={idx} variant="outlined" sx={{ overflow: "hidden" }}>
            <Box
              sx={{
                px: 1.5,
                py: 0.75,
                bgcolor: isLoaiTru ? "error.50" : "primary.50",
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
            <Typography
              variant="caption"
              sx={{
                display: "block",
                px: 1.5,
                py: 0.5,
                bgcolor: isLoaiTru ? "#fff5f5" : "#f0f7ff",
                color: isLoaiTru ? "error.main" : "primary.main",
                fontStyle: "italic",
                borderBottom: "1px dashed",
                borderColor: "divider",
              }}
            >
              {isLoaiTru
                ? "→ Bệnh nhân sẽ bị LOẠI nếu khớp điều kiện bên dưới"
                : "→ Bệnh nhân chỉ được giữ lại nếu thỏa điều kiện bên dưới"}
            </Typography>
            <Box sx={{ p: 1 }}>
              <ConditionTreeView dieuKien={step.dieuKien} />
            </Box>
          </Paper>
        );
      })}

      {pipeline.length > 1 && (
        <Alert severity="info" variant="outlined" sx={{ py: 0.5 }}>
          <Typography variant="caption">
            Bệnh nhân đi qua từng bước theo thứ tự. Nếu bị loại ở bước nào thì
            dừng, không xét các bước sau.
          </Typography>
        </Alert>
      )}
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

              {/* Quick Guide */}
              <QuickGuidePanel />

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
