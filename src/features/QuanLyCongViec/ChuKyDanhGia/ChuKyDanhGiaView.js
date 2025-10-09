import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  Stack,
  Typography,
  Grid,
  Chip,
  Button,
  Divider,
  Box,
} from "@mui/material";
import {
  ArrowLeft,
  Calendar,
  CloseCircle,
  TickCircle,
  Edit,
} from "iconsax-react";
import dayjs from "dayjs";

import { getChuKyDanhGiaById, dongChuKy, moChuKy } from "../KPI/kpiSlice";
import LoadingScreen from "../../../components/LoadingScreen";
import UpdateChuKyDanhGiaButton from "./UpdateChuKyDanhGiaButton";
import DeleteChuKyDanhGiaButton from "./DeleteChuKyDanhGiaButton";

function ChuKyDanhGiaView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { selectedChuKyDanhGia, isLoading } = useSelector((state) => state.kpi);

  useEffect(() => {
    if (id) {
      dispatch(getChuKyDanhGiaById(id));
    }
  }, [dispatch, id]);

  const handleToggleStatus = async () => {
    if (selectedChuKyDanhGia?.isDong) {
      await dispatch(moChuKy(id));
    } else {
      await dispatch(dongChuKy(id));
    }
    dispatch(getChuKyDanhGiaById(id));
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!selectedChuKyDanhGia) {
    return (
      <Card sx={{ p: 3 }}>
        <Typography>Không tìm thấy chu kỳ đánh giá</Typography>
      </Card>
    );
  }

  const InfoRow = ({ label, value }) => (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          {label}
        </Typography>
      </Grid>
      <Grid item xs={12} md={8}>
        <Typography variant="body2">{value || "-"}</Typography>
      </Grid>
    </Grid>
  );

  return (
    <Card sx={{ p: 3 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Button
              variant="outlined"
              startIcon={<ArrowLeft size={18} />}
              onClick={() => navigate("/quanlycongviec/kpi/chu-ky")}
            >
              Quay lại
            </Button>
            <Calendar size={32} variant="Bulk" />
            <Stack>
              <Typography variant="h5">
                {selectedChuKyDanhGia.TenChuKy}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Tháng {selectedChuKyDanhGia.Thang}/{selectedChuKyDanhGia.Nam}
              </Typography>
            </Stack>
          </Stack>

          <Stack direction="row" spacing={1}>
            {selectedChuKyDanhGia.isDong ? (
              <Chip
                label="Đã đóng"
                color="default"
                icon={<CloseCircle size={16} />}
              />
            ) : (
              <Chip
                label="Đang mở"
                color="success"
                icon={<TickCircle size={16} />}
              />
            )}
          </Stack>
        </Stack>

        <Divider />

        {/* Actions */}
        <Stack direction="row" spacing={2}>
          <Button
            variant={selectedChuKyDanhGia.isDong ? "contained" : "outlined"}
            color={selectedChuKyDanhGia.isDong ? "success" : "warning"}
            startIcon={
              selectedChuKyDanhGia.isDong ? (
                <TickCircle size={18} />
              ) : (
                <CloseCircle size={18} />
              )
            }
            onClick={handleToggleStatus}
          >
            {selectedChuKyDanhGia.isDong ? "Mở lại chu kỳ" : "Đóng chu kỳ"}
          </Button>

          <UpdateChuKyDanhGiaButton
            item={selectedChuKyDanhGia}
            variant="outlined"
            startIcon={<Edit size={18} />}
          >
            Chỉnh sửa
          </UpdateChuKyDanhGiaButton>

          <DeleteChuKyDanhGiaButton
            itemId={selectedChuKyDanhGia._id}
            variant="outlined"
            color="error"
          />
        </Stack>

        <Divider />

        {/* Details */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Thông tin chi tiết
          </Typography>
          <Stack spacing={2} mt={2}>
            <InfoRow label="Tên chu kỳ" value={selectedChuKyDanhGia.TenChuKy} />
            <InfoRow
              label="Tháng/Năm"
              value={`Tháng ${selectedChuKyDanhGia.Thang}/${selectedChuKyDanhGia.Nam}`}
            />
            <InfoRow
              label="Ngày bắt đầu"
              value={dayjs(selectedChuKyDanhGia.NgayBatDau).format(
                "DD/MM/YYYY"
              )}
            />
            <InfoRow
              label="Ngày kết thúc"
              value={dayjs(selectedChuKyDanhGia.NgayKetThuc).format(
                "DD/MM/YYYY"
              )}
            />
            <InfoRow
              label="Trạng thái"
              value={
                <Chip
                  label={selectedChuKyDanhGia.isDong ? "Đã đóng" : "Đang mở"}
                  size="small"
                  color={selectedChuKyDanhGia.isDong ? "default" : "success"}
                  icon={
                    selectedChuKyDanhGia.isDong ? (
                      <CloseCircle size={14} />
                    ) : (
                      <TickCircle size={14} />
                    )
                  }
                />
              }
            />
            <InfoRow label="Mô tả" value={selectedChuKyDanhGia.MoTa} />
            <InfoRow
              label="Người tạo"
              value={selectedChuKyDanhGia.NguoiTaoID?.HoTen || "-"}
            />
            <InfoRow
              label="Ngày tạo"
              value={dayjs(selectedChuKyDanhGia.createdAt).format(
                "DD/MM/YYYY HH:mm"
              )}
            />
            <InfoRow
              label="Cập nhật lần cuối"
              value={dayjs(selectedChuKyDanhGia.updatedAt).format(
                "DD/MM/YYYY HH:mm"
              )}
            />
          </Stack>
        </Box>
      </Stack>
    </Card>
  );
}

export default ChuKyDanhGiaView;
