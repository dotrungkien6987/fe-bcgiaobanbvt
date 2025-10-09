import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Stack, Typography, Chip, IconButton, Tooltip } from "@mui/material";
import { Eye, Calendar, CloseCircle, TickCircle } from "iconsax-react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

import CommonTable from "../../../pages/tables/MyTable/CommonTable";
import AddChuKyDanhGiaButton from "./AddChuKyDanhGiaButton";
import UpdateChuKyDanhGiaButton from "./UpdateChuKyDanhGiaButton";
import DeleteChuKyDanhGiaButton from "./DeleteChuKyDanhGiaButton";
import { getChuKyDanhGias, dongChuKy, moChuKy } from "../KPI/kpiSlice";
import MainCard from "components/MainCard";
import ScrollX from "components/ScrollX";

function ChuKyDanhGiaList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { chuKyDanhGias, isLoading } = useSelector((state) => state.kpi);

  const [filterStatus, setFilterStatus] = useState("all"); // all, open, closed

  useEffect(() => {
    dispatch(getChuKyDanhGias());
  }, [dispatch]);

  const handleToggleStatus = useCallback(
    async (chuKy) => {
      if (chuKy.isDong) {
        // Mở lại chu kỳ
        await dispatch(moChuKy(chuKy._id));
      } else {
        // Đóng chu kỳ
        await dispatch(dongChuKy(chuKy._id));
      }
      dispatch(getChuKyDanhGias());
    },
    [dispatch]
  );

  const filteredData = chuKyDanhGias
    ?.filter((item) => !item.isDeleted)
    ?.filter((item) => {
      if (filterStatus === "open") return !item.isDong;
      if (filterStatus === "closed") return item.isDong;
      return true;
    });

  const columns = useMemo(
    () => [
      {
        Header: "STT",
        Footer: "STT",
        accessor: "index",
        disableGroupBy: true,
        sticky: "left",
        Cell: ({ row }) => row.index + 1,
      },
      {
        Header: "Tên chu kỳ",
        Footer: "Tên chu kỳ",
        accessor: "TenChuKy",
        disableGroupBy: true,
        Cell: ({ row }) => (
          <Stack>
            <Typography variant="body2" fontWeight={500}>
              {row.original.TenChuKy}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Tháng {row.original.Thang}/{row.original.Nam}
            </Typography>
          </Stack>
        ),
      },
      {
        Header: "Ngày bắt đầu",
        Footer: "Ngày bắt đầu",
        accessor: "NgayBatDau",
        disableGroupBy: true,
        Cell: ({ row }) => dayjs(row.original.NgayBatDau).format("DD/MM/YYYY"),
      },
      {
        Header: "Ngày kết thúc",
        Footer: "Ngày kết thúc",
        accessor: "NgayKetThuc",
        disableGroupBy: true,
        Cell: ({ row }) => dayjs(row.original.NgayKetThuc).format("DD/MM/YYYY"),
      },
      {
        Header: "Trạng thái",
        Footer: "Trạng thái",
        accessor: "isDong",
        disableGroupBy: true,
        Cell: ({ row }) =>
          row.original.isDong ? (
            <Chip
              label="Đã đóng"
              size="small"
              color="default"
              icon={<CloseCircle size={16} />}
            />
          ) : (
            <Chip
              label="Đang mở"
              size="small"
              color="success"
              icon={<TickCircle size={16} />}
            />
          ),
      },
      {
        Header: "Mô tả",
        Footer: "Mô tả",
        accessor: "MoTa",
        disableGroupBy: true,
        Cell: ({ row }) => (
          <Typography
            variant="caption"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {row.original.MoTa || "-"}
          </Typography>
        ),
      },
      {
        Header: "Thao tác",
        Footer: "Thao tác",
        accessor: "actions",
        disableGroupBy: true,
        sticky: "right",
        Cell: ({ row }) => (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Xem chi tiết">
              <IconButton
                size="small"
                onClick={() =>
                  navigate(`/quanlycongviec/kpi/chu-ky/${row.original._id}`)
                }
              >
                <Eye size={18} />
              </IconButton>
            </Tooltip>

            <Tooltip
              title={row.original.isDong ? "Mở lại chu kỳ" : "Đóng chu kỳ"}
            >
              <IconButton
                size="small"
                color={row.original.isDong ? "success" : "warning"}
                onClick={() => handleToggleStatus(row.original)}
              >
                {row.original.isDong ? (
                  <TickCircle size={18} />
                ) : (
                  <CloseCircle size={18} />
                )}
              </IconButton>
            </Tooltip>

            <UpdateChuKyDanhGiaButton item={row.original} />
            <DeleteChuKyDanhGiaButton itemId={row.original._id} />
          </Stack>
        ),
      },
    ],
    [navigate, handleToggleStatus]
  );

  return (
    <MainCard content={false}>
      <ScrollX>
        <Stack spacing={3} sx={{ p: 3 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Calendar size={32} variant="Bulk" />
              <Typography variant="h5">Quản lý chu kỳ đánh giá</Typography>
            </Stack>
            <AddChuKyDanhGiaButton />
          </Stack>

          <Stack direction="row" spacing={2}>
            <Chip
              label="Tất cả"
              color={filterStatus === "all" ? "primary" : "default"}
              onClick={() => setFilterStatus("all")}
              sx={{ cursor: "pointer" }}
            />
            <Chip
              label="Đang mở"
              color={filterStatus === "open" ? "success" : "default"}
              onClick={() => setFilterStatus("open")}
              icon={<TickCircle size={16} />}
              sx={{ cursor: "pointer" }}
            />
            <Chip
              label="Đã đóng"
              color={filterStatus === "closed" ? "default" : "default"}
              onClick={() => setFilterStatus("closed")}
              icon={<CloseCircle size={16} />}
              sx={{ cursor: "pointer" }}
            />
          </Stack>

          <CommonTable
            columns={columns}
            data={filteredData || []}
            isLoading={isLoading}
          />
        </Stack>
      </ScrollX>
    </MainCard>
  );
}

export default ChuKyDanhGiaList;
