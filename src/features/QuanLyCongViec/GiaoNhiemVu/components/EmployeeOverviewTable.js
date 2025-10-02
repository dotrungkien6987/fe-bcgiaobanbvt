import React, { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import {
  Box,
  Chip,
  IconButton,
  Tooltip,
  Typography,
  TextField,
  InputAdornment,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import {
  Visibility,
  Edit,
  DeleteSweep,
  Search,
  Warning,
  ContentCopy,
} from "@mui/icons-material";
import CommonTable from "pages/tables/MyTable/CommonTable";
import AssignDutiesDialog from "./AssignDutiesDialog";
import ViewAssignmentsDialog from "./ViewAssignmentsDialog";
import CopyAssignmentsDialog from "./CopyAssignmentsDialog";
import { removeAllAssignments } from "../giaoNhiemVuSlice";

const EmployeeOverviewTable = ({
  employees = [],
  totalsByEmployeeId = {},
  onRefresh,
}) => {
  const dispatch = useDispatch();
  const [search, setSearch] = useState("");
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmData, setConfirmData] = useState({
    title: "",
    description: "",
    onConfirm: null,
  });

  const processedData = useMemo(() => {
    return employees.map((e) => {
      const raw = e.ThongTinNhanVienDuocQuanLy;
      const nv = Array.isArray(raw) ? raw[0] : raw;
      const id = nv?._id || e.NhanVienDuocQuanLy;
      const totals = totalsByEmployeeId[id] || {};

      return {
        _id: id,
        Ten: nv?.Ten || "N/A",
        MaNhanVien: nv?.MaNhanVien || "",
        KhoaID: nv?.KhoaID,
        TenKhoa: nv?.KhoaID?.TenKhoa || "",
        assignments: totals.assignments || 0,
        totalMucDoKho: totals.totalMucDoKho || 0,
        originalEmployee: nv,
      };
    });
  }, [employees, totalsByEmployeeId]);

  const filteredData = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return processedData;
    return processedData.filter(
      (row) =>
        row.Ten.toLowerCase().includes(q) ||
        row.MaNhanVien.toLowerCase().includes(q) ||
        row.TenKhoa.toLowerCase().includes(q)
    );
  }, [processedData, search]);

  const handleOpenAssignDialog = (row) => {
    setSelectedEmployee(row);
    setAssignDialogOpen(true);
  };

  const handleOpenViewDialog = (row) => {
    setSelectedEmployee(row);
    setViewDialogOpen(true);
  };

  const handleOpenCopyDialog = (row) => {
    setSelectedEmployee(row);
    setCopyDialogOpen(true);
  };

  const handleCopyConfirm = (sourceEmployee) => {
    setCopyDialogOpen(false);
    if (onRefresh && typeof onRefresh === "function") {
      onRefresh(sourceEmployee._id, selectedEmployee._id);
    }
  };

  const handleDeleteAll = async (row) => {
    setConfirmData({
      title: "⚠️ Xác nhận gỡ tất cả nhiệm vụ",
      description: (
        <Box>
          <Typography variant="body1" gutterBottom>
            Bạn có chắc muốn gỡ tất cả <strong>{row.assignments} nhiệm vụ</strong> của nhân viên <strong>"{row.Ten}"</strong>?
          </Typography>
          <Typography variant="body2" color="error.main" sx={{ mt: 1 }}>
            ⚠️ Hành động này sẽ xóa tất cả nhiệm vụ đã gán. Dữ liệu có thể được khôi phục sau nếu gán lại.
          </Typography>
        </Box>
      ),
      onConfirm: async () => {
        try {
          await dispatch(removeAllAssignments(row._id));
          setConfirmOpen(false);
          // Callback to parent to refresh if needed
          if (onRefresh && typeof onRefresh === "function") {
            onRefresh();
          }
        } catch (error) {
          // Error already handled in thunk with toast
          setConfirmOpen(false);
        }
      },
    });
    setConfirmOpen(true);
  };

  const columns = useMemo(
    () => [
      {
        Header: "STT",
        accessor: (_row, i) => i + 1,
        width: 60,
        disableSortBy: true,
      },
      {
        Header: "Mã NV",
        accessor: "MaNhanVien",
        width: 100,
      },
      {
        Header: "Tên nhân viên",
        accessor: "Ten",
        width: 200,
        Cell: ({ value, row }) => (
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" fontWeight={500}>
              {value}
            </Typography>
            {row.original.assignments === 0 && (
              <Tooltip title="Chưa có nhiệm vụ nào">
                <Warning color="warning" fontSize="small" />
              </Tooltip>
            )}
          </Stack>
        ),
      },
      {
        Header: "Khoa",
        accessor: "TenKhoa",
        width: 150,
        Cell: ({ value }) => (
          <Chip
            label={value || "N/A"}
            size="small"
            color="primary"
            variant="outlined"
          />
        ),
      },
      {
        Header: "Số nhiệm vụ",
        accessor: "assignments",
        width: 120,
        Cell: ({ value }) => (
          <Chip
            label={value}
            size="small"
            color={value === 0 ? "default" : "success"}
            variant={value === 0 ? "outlined" : "filled"}
          />
        ),
      },
      {
        Header: "Tổng điểm",
        accessor: "totalMucDoKho",
        width: 120,
        Cell: ({ value }) => (
          <Typography variant="body2" fontWeight={600} color="primary.main">
            {Number(value || 0).toFixed(1)}
          </Typography>
        ),
      },
      {
        Header: "Thao tác",
        accessor: "actions",
        disableSortBy: true,
        width: 200,
        Cell: ({ row }) => (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Xem chi tiết">
              <IconButton
                size="small"
                color="info"
                onClick={() => handleOpenViewDialog(row.original)}
              >
                <Visibility fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Gán nhiệm vụ">
              <IconButton
                size="small"
                color="primary"
                onClick={() => handleOpenAssignDialog(row.original)}
              >
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Sao chép từ nhân viên khác">
              <IconButton
                size="small"
                color="secondary"
                onClick={() => handleOpenCopyDialog(row.original)}
              >
                <ContentCopy fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Gỡ tất cả">
              <IconButton
                size="small"
                color="error"
                onClick={() => handleDeleteAll(row.original)}
                disabled={row.original.assignments === 0}
              >
                <DeleteSweep fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <Box>
      <Box mb={2}>
        <TextField
          fullWidth
          size="small"
          placeholder="Tìm theo tên, mã NV, khoa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <CommonTable
        columns={columns}
        data={filteredData}
        pageSize={20}
        showPagination={filteredData.length > 20}
      />

      {assignDialogOpen && selectedEmployee && (
        <AssignDutiesDialog
          open={assignDialogOpen}
          employee={selectedEmployee}
          onClose={() => {
            setAssignDialogOpen(false);
            setSelectedEmployee(null);
            onRefresh?.();
          }}
        />
      )}

      {viewDialogOpen && selectedEmployee && (
        <ViewAssignmentsDialog
          open={viewDialogOpen}
          employee={selectedEmployee}
          onClose={() => {
            setViewDialogOpen(false);
            setSelectedEmployee(null);
          }}
        />
      )}

      {/* Copy Assignments Dialog */}
      {copyDialogOpen && selectedEmployee && (
        <CopyAssignmentsDialog
          open={copyDialogOpen}
          targetEmployee={selectedEmployee}
          allEmployees={employees}
          totalsByEmployeeId={totalsByEmployeeId}
          onClose={() => {
            setCopyDialogOpen(false);
            setSelectedEmployee(null);
          }}
          onConfirm={handleCopyConfirm}
        />
      )}

      {/* Confirm Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>{confirmData.title}</DialogTitle>
        <DialogContent>
          <Typography>{confirmData.description}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Hủy</Button>
          <Button
            onClick={confirmData.onConfirm}
            variant="contained"
            color="primary"
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeOverviewTable;
