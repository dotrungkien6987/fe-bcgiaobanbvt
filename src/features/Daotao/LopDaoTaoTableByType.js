import { Grid, IconButton, Stack, Tooltip, useTheme } from "@mui/material";
import { Chip, Popover, CircularProgress, Box as MBox } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import RefreshIcon from "@mui/icons-material/Refresh";

import React, { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import MainCard from "components/MainCard";
import CommonTable from "pages/tables/MyTable/CommonTable";

import {
  getAllLopDaoTao,
  getLopDaoTaoByType,
  fetchLopDaoTaoAttachmentsCount,
  refreshLopDaoTaoAttachmentCountOne,
} from "./daotaoSlice";
import AddLopDaoTao from "./AddLopDaoTao";

import DeleteLopDaoTaoButton from "./DeleteLopDaoTaoButton";
import UpdateLopDaoTaoButton from "./UpdateLopDaoTaoButton";
import DiemDanhLopDaoTaoButton from "./DiemDanhLopDaoTaoButton";
import LopDaoTaoView from "features/NhanVien/LopDaoTaoView";
import { Add, Eye } from "iconsax-react";
import { ThemeMode } from "configAble";
import TrangThaiLopDaoTao from "./TrangThaiLopDaoTao";

import ScrollX from "components/ScrollX";
import ThemHocVienTamButton from "./ThemHocVienTam/ThemHocVienTamButton";
import { useParams } from "react-router-dom";
import { getAllHinhThucCapNhat } from "features/NhanVien/hinhthuccapnhatSlice";
import {
  buildLopDaoTaoColumnsByGroup,
  resolveLopDaoTaoTitleByCode,
  insertAttachmentsColumn,
} from "./lopDaoTaoTableConfig";
import apiService from "app/apiService";

function LopDaoTaoTableByType() {
  const params = useParams();
  let typeLopDaoTao = params.type;
  const { HinhThucCapNhat } = useSelector((state) => state.hinhthuccapnhat);
  const dispatch = useDispatch();
  useEffect(() => {
    if (HinhThucCapNhat.length === 0) {
      dispatch(getAllHinhThucCapNhat());
    }
  }, [HinhThucCapNhat.length, dispatch]);
  // Không mutate mã type tại FE; dữ liệu sẽ được lọc theo type ở BE

  const theme = useTheme();
  const mode = theme.palette.mode;

  // Popover + cache for attachments
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [activeId, setActiveId] = React.useState(null);
  const [fileLoading, setFileLoading] = React.useState(false);
  const [files, setFiles] = React.useState([]);
  const openPopover = Boolean(anchorEl);
  const fileCacheRef = React.useRef(new Map());
  const countCacheRef = React.useRef(new Map());

  const handleOpenFiles = async (e, id) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
    setActiveId(id);
    const cached = fileCacheRef.current.get(id);
    if (cached) {
      setFiles(cached);
      return;
    }
    setFiles([]);
    setFileLoading(true);
    try {
      const res = await apiService.get(
        `/attachments/LopDaoTao/${id}/file/files`,
        { params: { size: 20 } }
      );
      const list =
        res?.data?.data?.items ||
        res?.data?.data ||
        res?.data?.items ||
        res?.data ||
        [];
      fileCacheRef.current.set(id, list);
      countCacheRef.current.set(id, Array.isArray(list) ? list.length : 0);
      setFiles(list);
    } catch (err) {
      console.warn("Load attachments error", err);
      setFiles([]);
      countCacheRef.current.set(id, 0);
    } finally {
      setFileLoading(false);
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
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (e) {
      console.warn("Preview error", e);
    }
  };

  const downloadFile = async (fileId, filename = "download") => {
    try {
      const res = await apiService.get(
        `/attachments/files/${fileId}/download`,
        {
          responseType: "blob",
        }
      );
      const blobUrl = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch (e) {
      console.warn("Download error", e);
    }
  };

  const baseColumns = useMemo(
    () => [
      {
        Header: "Actions",
        Footer: "Actions",
        accessor: "Actions",
        disableGroupBy: true,
        sticky: "left",
        Cell: ({ row }) => {
          const collapseIcon = row.isExpanded ? (
            <Add
              style={{
                // color: theme.palette.error.main,
                transform: "rotate(45deg)",
              }}
            />
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
              <DeleteLopDaoTaoButton lopdaotaoID={row.original._id} />
              {row.original.TrangThai === false && (
                <Stack direction={"row"}>
                  <UpdateLopDaoTaoButton lopdaotaoID={row.original._id} />
                  <ThemHocVienTamButton lopdaotaoID={row.original._id} />
                </Stack>
              )}
              <DiemDanhLopDaoTaoButton lopdaotaoID={row.original._id} />
              <Tooltip
                componentsProps={{
                  tooltip: {
                    sx: {
                      backgroundColor:
                        mode === ThemeMode.DARK
                          ? theme.palette.grey[50]
                          : theme.palette.grey[700],
                      opacity: 0.9,
                    },
                  },
                }}
              >
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
        Header: "Mã hình thức",
        Footer: "Mã hình thức",
        accessor: "MaHinhThucCapNhat",
        className: "cell-center",
        disableGroupBy: true,
      },
      {
        Header: "Tên lớp đào tạo",
        Footer: "Tên lớp đào tạo",
        accessor: "Ten",
        disableGroupBy: true,
      },
      {
        Header: "Trạng thái",
        Footer: "Trạng thái",
        accessor: "TrangThai",
        disableGroupBy: true,
        Cell: ({ value }) =>
          value ? (
            <TrangThaiLopDaoTao trangthai={true} title={"Đã hoàn thành"} />
          ) : (
            <TrangThaiLopDaoTao trangthai={false} title={"Chưa hoàn thành"} />
          ),
      },
      {
        Header: "Quyết định",
        Footer: "Quyết định",
        accessor: "QuyetDinh",
        disableGroupBy: true,
      },
      {
        Header: "Cán bộ tham gia",
        Footer: "Cán bộ tham gia",
        accessor: "CanBoThamGia",
        disableGroupBy: true,
      },
      {
        Header: "Hình thức đào tạo",
        Footer: "Hình thức đào tạo",
        accessor: "HinhThucDaoTao",
        disableGroupBy: true,
      },
      {
        Header: "Số thành viên",
        Footer: "Số thành viên",
        accessor: "SoThanhVien",
        disableGroupBy: true,
      },
      {
        Header: "Ngày bắt đầu",
        Footer: "Ngày bắt đầu",
        accessor: "NgayBatDauFormat",
        disableGroupBy: true,
      },
      {
        Header: "Ngày kết thúc",
        Footer: "Ngày kết thúc",
        accessor: "NgayKetThucFormat",
        disableGroupBy: true,
      },
      {
        Header: "Số section",
        Footer: "Số section",
        accessor: "SoLuong",
        disableGroupBy: true,
      },
      {
        Header: "Người tạo",
        Footer: "Người tạo",
        accessor: "NguoiTao",
        disableGroupBy: true,
      },
      {
        Header: "_id",
        Footer: "_id",
        accessor: "_id",
        disableGroupBy: true,
      },
    ],
    [mode, theme]
  );

  const { attachmentsCountLopDaoTao, LopDaoTaos } = useSelector(
    (state) => state.daotao
  );

  const columns = useMemo(() => {
    const grouped = buildLopDaoTaoColumnsByGroup({
      baseColumns,
      code: typeLopDaoTao,
    });
    return insertAttachmentsColumn({
      columns: grouped,
      positionAfterAccessor: "SoThanhVien",
      cellRenderer: ({ value }) => {
        const c =
          (attachmentsCountLopDaoTao && attachmentsCountLopDaoTao[value]) ??
          (countCacheRef.current.has(value)
            ? countCacheRef.current.get(value)
            : undefined);
        return (
          <Chip
            size="small"
            variant="outlined"
            color={c > 0 ? "primary" : "default"}
            label={c === undefined ? "Xem tệp" : c === 0 ? "0 tệp" : `${c} tệp`}
            onClick={(e) => handleOpenFiles(e, value)}
            sx={{ cursor: "pointer" }}
          />
        );
      },
      width: 90,
    });
  }, [baseColumns, typeLopDaoTao, attachmentsCountLopDaoTao]);

  useEffect(() => {
    if (typeLopDaoTao) {
      dispatch(getLopDaoTaoByType(typeLopDaoTao));
    } else {
      dispatch(getAllLopDaoTao());
    }
  }, [dispatch, typeLopDaoTao]);

  const data = useMemo(() => LopDaoTaos, [LopDaoTaos]);
  useEffect(() => {
    if (Array.isArray(data) && data.length) {
      const ids = data.map((r) => r._id).filter(Boolean);
      if (ids.length) dispatch(fetchLopDaoTaoAttachmentsCount(ids));
    }
  }, [dispatch, data]);
  const renderRowSubComponent = useCallback(
    ({ row }) => <LopDaoTaoView data={data[Number(row.id)]} />,
    [data]
  );
  const quyDoiLoaiDaoTao = (maLoai) => {
    const hinhthuc = HinhThucCapNhat.find((item) => item.Ma === maLoai);
    if (hinhthuc?.TenBenhVien) return hinhthuc.TenBenhVien;
    else return "Lớp đào tạo";
  };

  const title = resolveLopDaoTaoTitleByCode(
    typeLopDaoTao,
    `Quản lý ${quyDoiLoaiDaoTao(typeLopDaoTao)}`
  );

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} lg={12}>
        <MainCard title={title}>
          <ScrollX sx={{ height: 700 }}>
            <CommonTable
              data={data}
              columns={columns}
              renderRowSubComponent={renderRowSubComponent}
              additionalComponent={
                <div style={{ display: "flex", alignItems: "flex-end" }}>
                  <AddLopDaoTao mahinhthuccapnhat={typeLopDaoTao} />
                </div>
              }
            />
          </ScrollX>
        </MainCard>
      </Grid>

      {/* Popover danh sách tệp (lazy + cache) */}
      <Popover
        open={openPopover}
        anchorEl={anchorEl}
        onClose={handleCloseFiles}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{ sx: { p: 1.5, maxWidth: 480 } }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 1 }}
        >
          <MBox sx={{ fontSize: 14, fontWeight: 600 }}>Tệp đính kèm</MBox>
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
                      `/attachments/LopDaoTao/${activeId}/file/files`,
                      { params: { size: 20 } }
                    );
                    const list =
                      res?.data?.data?.items ||
                      res?.data?.data ||
                      res?.data?.items ||
                      res?.data ||
                      [];
                    fileCacheRef.current.set(activeId, list);
                    countCacheRef.current.set(
                      activeId,
                      Array.isArray(list) ? list.length : 0
                    );
                    setFiles(list);
                    // sync Redux count for this row
                    dispatch(refreshLopDaoTaoAttachmentCountOne(activeId));
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
          <MBox sx={{ fontSize: 12, opacity: 0.7 }}>Không có tệp</MBox>
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
                    sx={{ cursor: "pointer", maxWidth: 280 }}
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

export default LopDaoTaoTableByType;
