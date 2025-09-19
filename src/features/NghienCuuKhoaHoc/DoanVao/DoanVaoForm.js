import React from "react";
import PropTypes from "prop-types";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, useFieldArray } from "react-hook-form";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Stack,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
  createDoanVao,
  updateDoanVao,
  refreshDoanVaoAttachmentCountOne,
} from "./doanvaoSlice";
import { FormProvider, FTextField, FSelect } from "components/form";
import FDatePicker from "components/form/FDatePicker";
import AttachmentSection from "shared/components/AttachmentSection";
import { getDoanVaoById } from "./doanvaoSlice";

const schema = Yup.object().shape({
  SoVanBanChoPhep: Yup.string().required("Vui lòng nhập Số văn bản"),
  NgayKyVanBan: Yup.date().nullable().required("Vui lòng chọn Ngày ký"),
  MucDichXuatCanh: Yup.string().required("Vui lòng nhập Mục đích"),
  ThoiGianVaoLamViec: Yup.date()
    .nullable()
    .required("Vui lòng chọn Thời gian vào làm việc"),
  GhiChu: Yup.string().nullable(),
});

function DoanVaoForm({ open, onClose, doanVaoId, onSuccess }) {
  const dispatch = useDispatch();
  const { currentDoanVao } = useSelector((s) => s.doanvao || {});

  const editing = Boolean(doanVaoId);

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      SoVanBanChoPhep: "",
      NgayKyVanBan: null,
      MucDichXuatCanh: "",
      ThoiGianVaoLamViec: null,
      GhiChu: "",
      ThanhVien: [],
    },
  });
  const { handleSubmit, reset, control } = methods;
  const { fields, append, remove } = useFieldArray({
    name: "ThanhVien",
    control,
  });

  // Load chi tiết khi mở dialog ở chế độ sửa
  React.useEffect(() => {
    if (open && editing && doanVaoId) {
      dispatch(getDoanVaoById(doanVaoId));
    } else if (open && !editing) {
      reset({
        SoVanBanChoPhep: "",
        NgayKyVanBan: null,
        MucDichXuatCanh: "",
        ThoiGianVaoLamViec: null,
        GhiChu: "",
        ThanhVien: [],
      });
    }
  }, [open, editing, doanVaoId, dispatch, reset]);

  // Đổ dữ liệu vào form khi currentDoanVao có
  React.useEffect(() => {
    if (open && editing && currentDoanVao && currentDoanVao._id === doanVaoId) {
      reset({
        SoVanBanChoPhep: currentDoanVao.SoVanBanChoPhep || "",
        NgayKyVanBan: currentDoanVao.NgayKyVanBan || null,
        MucDichXuatCanh: currentDoanVao.MucDichXuatCanh || "",
        ThoiGianVaoLamViec: currentDoanVao.ThoiGianVaoLamViec || null,
        GhiChu: currentDoanVao.GhiChu || "",
        ThanhVien: Array.isArray(currentDoanVao.ThanhVien)
          ? currentDoanVao.ThanhVien
          : [],
      });
    }
  }, [open, editing, doanVaoId, currentDoanVao, reset]);

  const handleDialogClose = (event, reason) => {
    if (reason === "backdropClick" || reason === "escapeKeyDown") return; // guard
    onClose?.();
  };

  const onSubmit = async (data) => {
    let result;
    if (editing) {
      result = await dispatch(updateDoanVao(doanVaoId, data));
      onSuccess?.({ type: "saved", id: doanVaoId });
      onClose?.();
    } else {
      result = await dispatch(createDoanVao(data));
      const createdId = result?.data?._id;
      onSuccess?.({ type: "saved", id: createdId });
      onClose?.();
    }
  };

  const handleAttachmentsChange = (evt) => {
    if (evt?.type === "uploaded" && (evt.id || doanVaoId)) {
      const id = evt.id || doanVaoId;
      dispatch(refreshDoanVaoAttachmentCountOne(id));
      onSuccess?.({ type: "attachmentsChanged", id });
    }
  };

  return (
    <Dialog open={open} onClose={handleDialogClose} fullWidth maxWidth="md">
      <DialogTitle>
        {editing ? "Cập nhật Đoàn Vào" : "Thêm mới Đoàn Vào"}
      </DialogTitle>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FTextField name="SoVanBanChoPhep" label="Số văn bản cho phép" />
            </Grid>
            <Grid item xs={12} md={6}>
              <FDatePicker name="NgayKyVanBan" label="Ngày ký văn bản" />
            </Grid>
            <Grid item xs={12} md={6}>
              <FTextField name="MucDichXuatCanh" label="Mục đích" />
            </Grid>
            <Grid item xs={12} md={6}>
              <FDatePicker
                name="ThoiGianVaoLamViec"
                label="Thời gian vào làm việc"
              />
            </Grid>
            <Grid item xs={12}>
              <FTextField name="GhiChu" label="Ghi chú" multiline minRows={2} />
            </Grid>
          </Grid>

          <Grid container spacing={1.5} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <strong>Thành viên</strong>
            </Grid>
            <Grid item xs={12}>
              {fields.map((field, idx) => (
                <Grid
                  container
                  spacing={1}
                  key={field.id}
                  alignItems="center"
                  sx={{ mb: 0.5 }}
                >
                  <Grid item xs={12} md={3}>
                    <FTextField name={`ThanhVien.${idx}.Ten`} label="Họ tên" />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <FDatePicker
                      name={`ThanhVien.${idx}.NgaySinh`}
                      label="Ngày sinh"
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <FSelect
                      name={`ThanhVien.${idx}.GioiTinh`}
                      label="Giới tính"
                      options={[
                        { label: "Nam", value: "Nam" },
                        { label: "Nữ", value: "Nữ" },
                        { label: "Khác", value: "Khác" },
                      ]}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <FTextField
                      name={`ThanhVien.${idx}.ChucVu`}
                      label="Chức vụ"
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FTextField
                      name={`ThanhVien.${idx}.DonViCongTac`}
                      label="Đơn vị công tác"
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <FTextField
                      name={`ThanhVien.${idx}.QuocTich`}
                      label="Quốc tịch"
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FTextField
                      name={`ThanhVien.${idx}.DonViGioiThieu`}
                      label="Đơn vị giới thiệu"
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Button
                      color="error"
                      size="small"
                      onClick={() => remove(idx)}
                    >
                      Xóa
                    </Button>
                  </Grid>
                </Grid>
              ))}
              <Button
                size="small"
                onClick={() =>
                  append({
                    Ten: "",
                    NgaySinh: null,
                    GioiTinh: "",
                    ChucVu: "",
                    DonViCongTac: "",
                    QuocTich: "",
                    DonViGioiThieu: "",
                  })
                }
              >
                Thêm thành viên
              </Button>
            </Grid>
          </Grid>

          <Stack sx={{ mt: 2 }}>
            {editing && (
              <AttachmentSection
                ownerType="DoanVao"
                ownerId={doanVaoId}
                field="file"
                onChange={handleAttachmentsChange}
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="inherit">
            Đóng
          </Button>
          <Button type="submit" variant="contained">
            Lưu
          </Button>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

DoanVaoForm.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  doanVaoId: PropTypes.string,
  onSuccess: PropTypes.func,
};

export default DoanVaoForm;
