import React from "react";
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
import { useDispatch, useSelector } from "react-redux";
import MainCard from "components/MainCard";
import CommonTable from "pages/tables/MyTable/CommonTable";
import {
  getDoanVaos,
  fetchDoanVaoAttachmentsCount,
  refreshDoanVaoAttachmentCountOne,
} from "./doanvaoSlice";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";
import apiService from "app/apiService";
import ScrollX from "components/ScrollX";
import { Add, Eye } from "iconsax-react";
import DoanVaoForm from "./DoanVaoForm";
import DoanVaoView from "./DoanVaoView";
import AddDoanVao from "./components/AddDoanVao";
import DeleteDoanVaoButton from "./components/DeleteDoanVaoButton";
import UpdateDoanVaoButton from "./components/UpdateDoanVaoButton";

function DoanVaoTable() {
  const { doanVaos, attachmentsCount } = useSelector((s) => s.doanvao);
  const dispatch = useDispatch();

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [activeId, setActiveId] = React.useState(null);
  const [fileLoading, setFileLoading] = React.useState(false);
  const [files, setFiles] = React.useState([]);
  const fileCacheRef = React.useRef(new Map());
  const openPopover = Boolean(anchorEl);

  const [openForm, setOpenForm] = React.useState(false);
  const [editingId, setEditingId] = React.useState(null);
  const handleOpenForm = React.useCallback((id) => {
    setEditingId(id);
    setOpenForm(true);
  }, []);
  const handleCloseForm = React.useCallback(() => {
    setOpenForm(false);
    if (editingId) {
      dispatch(refreshDoanVaoAttachmentCountOne(editingId));
      try {
        fileCacheRef.current.delete(editingId);
      } catch {}
    }
  }, [dispatch, editingId]);

  const handleOpenFiles = async (e, id) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
    setActiveId(id);
    const cache = fileCacheRef.current.get(id);
    if (cache) {
      setFiles(cache);
    } else {
      setFiles([]);
      setFileLoading(true);
      try {
        const res = await apiService.get(
          `/attachments/DoanVao/${id}/file/files`,
          { params: { size: 20 } }
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
    } catch {}
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
    } catch {}
  };

  const columns = React.useMemo(
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
              <DeleteDoanVaoButton doanVaoID={row.original._id} />
              <UpdateDoanVaoButton
                doanVaoID={row.original._id}
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
        accessor: (r) => r.NgayKyVanBanFormatted || r.NgayKyVanBan,
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
        Header: "Thời gian vào làm việc",
        accessor: (r) => r.ThoiGianVaoLamViecFormatted || r.ThoiGianVaoLamViec,
        id: "ThoiGianVaoLamViec",
        disableGroupBy: true,
      },
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
              label={c === undefined ? "Đang…" : c === 0 ? "0 tệp" : `${c} tệp`}
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
      { Header: "_id", accessor: "_id", disableGroupBy: true },
    ],
    [attachmentsCount, handleOpenForm]
  );

  React.useEffect(() => {
    dispatch(getDoanVaos());
  }, [dispatch]);

  const data = React.useMemo(() => doanVaos, [doanVaos]);

  React.useEffect(() => {
    if (doanVaos && doanVaos.length) {
      const ids = doanVaos.map((d) => d._id).filter(Boolean);
      if (ids.length) dispatch(fetchDoanVaoAttachmentsCount(ids));
    }
  }, [doanVaos, dispatch]);

  const renderRowSubComponent = React.useCallback(
    ({ row, visibleColumns }) => (
      <TableRow>
        <TableCell colSpan={visibleColumns?.length || 1} sx={{ p: 1.5 }}>
          <DoanVaoView data={data[Number(row.id)]} />
        </TableCell>
      </TableRow>
    ),
    [data]
  );

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} lg={12}>
        <MainCard title="Quản lý Đoàn Vào">
          <ScrollX sx={{ height: 700 }}>
            <CommonTable
              data={data}
              columns={columns}
              renderRowSubComponent={renderRowSubComponent}
              additionalComponent={
                <div style={{ display: "flex", alignItems: "flex-end" }}>
                  <AddDoanVao />
                </div>
              }
            />
          </ScrollX>
        </MainCard>
      </Grid>

      <DoanVaoForm
        open={openForm}
        onClose={handleCloseForm}
        doanVaoId={editingId}
        onSuccess={(evt) => {
          if (evt && evt.type === "attachmentsChanged" && evt.id) {
            dispatch(refreshDoanVaoAttachmentCountOne(evt.id));
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
                      `/attachments/DoanVao/${activeId}/file/files`,
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
                    dispatch(refreshDoanVaoAttachmentCountOne(activeId));
                  } catch (e) {
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

export default DoanVaoTable;
