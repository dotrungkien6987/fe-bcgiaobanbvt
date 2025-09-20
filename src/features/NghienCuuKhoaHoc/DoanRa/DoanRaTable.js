import {
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Chip,
  Popover,
  CircularProgress,
  Box,
  TableRow,
  TableCell,
} from "@mui/material";
import React, { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import MainCard from "components/MainCard";
import CommonTable from "pages/tables/MyTable/CommonTable";
import {
  getDoanRas,
  fetchDoanRaAttachmentsCount,
  refreshDoanRaAttachmentCountOne,
} from "./doanraSlice";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";
import apiService from "app/apiService";
import AddDoanRa from "./AddDoanRa";
import DeleteDoanRaButton from "./DeleteDoanRaButton";
import UpdateDoanRaButton from "./UpdateDoanRaButton";
import DoanRaView from "./DoanRaView";
import { Add, Eye } from "iconsax-react";
import ScrollX from "components/ScrollX";
import DoanRaForm from "./DoanRaForm";

function DoanRaTable() {
  const { doanRas, attachmentsCount } = useSelector((state) => state.doanra);
  const dispatch = useDispatch();

  // Local state for lazy popover file list
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [activeId, setActiveId] = React.useState(null);
  const [fileLoading, setFileLoading] = React.useState(false);
  const [files, setFiles] = React.useState([]);

  // Simple in-memory cache (session scope)
  const fileCacheRef = React.useRef(new Map()); // id -> file[]

  const openPopover = Boolean(anchorEl);

  // Hoist form state to table level to avoid row remount side-effects
  const [openForm, setOpenForm] = React.useState(false);
  const [editingId, setEditingId] = React.useState(null);
  const handleOpenForm = React.useCallback((id) => {
    setEditingId(id);
    setOpenForm(true);
  }, []);
  const handleCloseForm = React.useCallback(() => {
    setOpenForm(false);
    if (editingId) {
      // Làm mới lại đếm tệp cho bản ghi vừa sửa
      dispatch(refreshDoanRaAttachmentCountOne(editingId));
      // Xoá cache danh sách file để popover hiển thị dữ liệu mới ở lần tới
      try {
        fileCacheRef.current.delete(editingId);
      } catch {}
    }
  }, [dispatch, editingId]);

  const handleOpenFiles = async (e, id) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
    setActiveId(id);
    // Use cache first
    const cache = fileCacheRef.current.get(id);
    if (cache) {
      setFiles(cache);
    } else {
      setFiles([]);
      setFileLoading(true);
      try {
        const res = await apiService.get(
          `/attachments/DoanRa/${id}/file/files`,
          {
            params: { size: 20 },
          }
        );
        const list =
          res?.data?.data?.items ||
          res?.data?.data ||
          res?.data?.items ||
          res?.data ||
          [];
        fileCacheRef.current.set(id, list);
        setFiles(list);
      } catch (err) {
        console.warn("Load file list error", err);
        setFiles([]);
      } finally {
        setFileLoading(false);
      }
    }
  };

  const handleCloseFiles = () => {
    setAnchorEl(null);
    setActiveId(null);
    setFiles([]);
  };

  const previewFile = async (fileId) => {
    try {
      const res = await apiService.get(`/attachments/files/${fileId}/inline`, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(res.data);
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (e) {
      console.warn("Preview error", e);
    }
  };

  const downloadFile = async (fileId, filename = "download") => {
    try {
      const res = await apiService.get(
        `/attachments/files/${fileId}/download`,
        { responseType: "blob" }
      );
      const blobUrl = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
    } catch (e) {
      console.warn("Download error", e);
    }
  };

  const columns = useMemo(
    () => [
      {
        Header: "Actions",
        Footer: "Actions",
        accessor: "Actions",
        disableGroupBy: true,
        sticky: "left",
        Cell: ({ row }) => {
          const collapseIcon = row.isExpanded ? (
            <Add style={{ transform: "rotate(45deg)" }} />
          ) : (
            <Eye />
          );
          return (
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="center"
              spacing={0}
            >
              <DeleteDoanRaButton doanRaID={row.original._id} />
              <UpdateDoanRaButton
                doanRaID={row.original._id}
                onOpen={handleOpenForm}
              />
              <Tooltip title="Xem chi tiết">
                <IconButton
                  color="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    row.toggleRowExpanded();
                  }}
                >
                  {collapseIcon}
                </IconButton>
              </Tooltip>
            </Stack>
          );
        },
      },
      {
        Header: "Ngày ký",
        accessor: (row) => row.NgayKyVanBanFormatted || row.NgayKyVanBan,
        id: "NgayKyVanBan",
        disableGroupBy: true,
      },
      {
        Header: "Số văn bản",
        accessor: "SoVanBanChoPhep",
        disableGroupBy: true,
      },
      { Header: "Mục đích", accessor: "MucDichXuatCanh", disableGroupBy: true },
      {
        Header: "Thành viên",
        id: "ThanhVienCount",
        accessor: (row) =>
          Array.isArray(row.ThanhVien) ? row.ThanhVien.length : 0,
        width: 110,
        disableGroupBy: true,
      },
      {
        Header: "Thời gian xuất cảnh",
        accessor: (row) =>
          row.ThoiGianXuatCanhFormatted || row.ThoiGianXuatCanh,
        id: "ThoiGianXuatCanh",
        disableGroupBy: true,
      },
      { Header: "Quốc gia đến", accessor: "QuocGiaDen", disableGroupBy: true },
      { Header: "Ghi chú", accessor: "GhiChu", disableGroupBy: true },
      {
        Header: "# Tệp",
        id: "AttachmentsCount",
        accessor: (row) => row._id,
        width: 80,
        Cell: ({ value }) => {
          const c = attachmentsCount[value];
          return (
            <Chip
              size="small"
              variant="outlined"
              color={c > 0 ? "primary" : "default"}
              label={
                c === undefined ? "Chưa có" : c === 0 ? "0 tệp" : `${c} tệp`
              }
              onClick={(e) => {
                e.stopPropagation();
                handleOpenFiles(e, value);
              }}
              sx={{ cursor: "pointer" }}
            />
          );
        },
        disableGroupBy: true,
      },
      // (Đã bỏ cột preview tệp để đơn giản hoá - dùng chip count + popover lazy nếu cần sau)
      { Header: "_id", accessor: "_id", disableGroupBy: true },
    ],
    [attachmentsCount, handleOpenForm]
  );

  // dispatch đã khai báo phía trên
  useEffect(() => {
    dispatch(getDoanRas());
  }, [dispatch]);

  const data = useMemo(() => doanRas, [doanRas]);

  // Batch load attachments meta when list changes
  useEffect(() => {
    if (doanRas && doanRas.length) {
      const ids = doanRas.map((d) => d._id).filter(Boolean);
      if (ids.length) {
        dispatch(fetchDoanRaAttachmentsCount(ids));
      }
    }
  }, [doanRas, dispatch]);
  const renderRowSubComponent = useCallback(
    ({ row, visibleColumns }) => (
      <TableRow>
        <TableCell colSpan={visibleColumns?.length || 1} sx={{ p: 1.5 }}>
          <DoanRaView data={data[Number(row.id)]} />
        </TableCell>
      </TableRow>
    ),
    [data]
  );

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} lg={12}>
        <MainCard title="Quản lý Đoàn Ra">
          <ScrollX sx={{ height: 700 }}>
            <CommonTable
              data={data}
              columns={columns}
              renderRowSubComponent={renderRowSubComponent}
              additionalComponent={
                <div style={{ display: "flex", alignItems: "flex-end" }}>
                  <AddDoanRa />
                </div>
              }
            />
          </ScrollX>
        </MainCard>
      </Grid>
      {/* Edit form mounted once at page level to prevent row unmount closing it */}
      <DoanRaForm
        open={openForm}
        onClose={handleCloseForm}
        doanRaId={editingId}
        onSuccess={(evt) => {
          if (evt && evt.type === "attachmentsChanged" && evt.id) {
            dispatch(refreshDoanRaAttachmentCountOne(evt.id));
            try {
              fileCacheRef.current.delete(evt.id);
            } catch {}
          }
        }}
      />
      <Popover
        open={openPopover}
        anchorEl={anchorEl}
        onClose={handleCloseFiles}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{ sx: { p: 1.5, maxWidth: 400 } }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 1 }}
        >
          <Box sx={{ fontSize: 14, fontWeight: 600 }}>Tệp đính kèm</Box>
          {activeId && (
            <Tooltip title="Làm mới">
              <IconButton
                size="small"
                onClick={async () => {
                  if (!activeId) return;
                  fileCacheRef.current.delete(activeId);
                  setFileLoading(true);
                  try {
                    const res = await apiService.get(
                      `/attachments/DoanRa/${activeId}/file/files`,
                      { params: { size: 20 } }
                    );
                    const list =
                      res?.data?.data?.items ||
                      res?.data?.data ||
                      res?.data?.items ||
                      res?.data ||
                      [];
                    fileCacheRef.current.set(activeId, list);
                    setFiles(list);
                    // đồng bộ lại count (phòng trường hợp thay đổi ngoài form)
                    dispatch(refreshDoanRaAttachmentCountOne(activeId));
                  } catch (e) {
                    console.warn(e);
                  } finally {
                    setFileLoading(false);
                  }
                }}
              >
                <RefreshIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
        {fileLoading && (
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <CircularProgress size={18} />
            <span style={{ fontSize: 12 }}>Đang tải...</span>
          </Stack>
        )}
        {!fileLoading && files.length === 0 && (
          <Box sx={{ fontSize: 12, opacity: 0.7 }}>Không có tệp</Box>
        )}
        <Stack
          direction="column"
          spacing={0.75}
          sx={{ maxHeight: 320, overflowY: "auto" }}
        >
          {files.map((f) => {
            const name =
              f.TenGoc || f.TenFile || f.fileName || f.originalName || "Tệp";
            const short =
              name.length > 48
                ? name.slice(0, 38) + "…" + name.slice(-6)
                : name;
            return (
              <Stack
                key={f._id}
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{
                  border: "1px solid #e0e0e0",
                  borderRadius: 1,
                  px: 1,
                  py: 0.5,
                }}
              >
                <Tooltip title={name}>
                  <Chip
                    size="small"
                    label={short}
                    onClick={() => previewFile(f._id)}
                    sx={{ cursor: "pointer", maxWidth: 250 }}
                  />
                </Tooltip>
                <Tooltip title="Xem">
                  <IconButton size="small" onClick={() => previewFile(f._id)}>
                    <VisibilityIcon fontSize="inherit" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Tải xuống">
                  <IconButton
                    size="small"
                    onClick={() => downloadFile(f._id, name)}
                  >
                    <DownloadIcon fontSize="inherit" />
                  </IconButton>
                </Tooltip>
              </Stack>
            );
          })}
        </Stack>
      </Popover>
    </Grid>
  );
}

export default DoanRaTable;
