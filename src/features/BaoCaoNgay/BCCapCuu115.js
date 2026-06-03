import {
  Box,
  Button,
  Card,
  Container,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { LoadingButton } from "@mui/lab";

import { FTextField, FormProvider } from "../../components/form";
import useAuth from "../../hooks/useAuth";
import BenhNhanInsertForm from "../BenhNhan/BenhNhanInsertForm";
import ListBenhNhanCard from "../BenhNhan/ListBenhNhanCard";
import { getDataBCGiaoBanCurent } from "../BCGiaoBan/bcgiaobanSlice";
import { CheckDisplayKhoa } from "../../utils/heplFuntion";
import { insertOrUpdateBaoCaoNgay } from "./baocaongaySlice";
import {
  cc115ChiSoFields as chiSoFields,
  cc115ChiSoGroups as chiSoGroups,
  cc115PatientTypes,
} from "./cc115Config";

const schemaShape = {
  BSTruc: Yup.string(),
  DDTruc: Yup.string(),
};

chiSoFields.forEach((field) => {
  schemaShape[field.qtyName] =
    Yup.number().typeError("Bạn phải nhập 1 số");
  schemaShape[field.noteName] =
    Yup.string().nullable();
});

const RegisterSchema = Yup.object().shape(schemaShape);

const defaultValues = chiSoFields.reduce(
  (values, field) => ({
    ...values,
    [field.qtyName]: 0,
    [field.noteName]: "",
  }),
  {
    BSTruc: "",
    DDTruc: "",
  },
);

function BCCapCuu115() {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const [coQuyen, setCoQuyen] = useState(false);
  const [tenLoaiBN, setTenLoaiBN] = useState("");
  const [loaiBN, setLoaiBN] = useState(0);
  const [openEdit, setOpenEdit] = useState(false);

  const { bcGiaoBanTheoNgay, khoas, ctChiSos, bnTuVong115s, bnCapCuu115s } =
    useSelector((state) => state.baocaongay);
  const { bcGiaoBanCurent } = useSelector((state) => state.bcgiaoban);

  const methods = useForm({
    resolver: yupResolver(RegisterSchema),
    defaultValues,
  });
  const {
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = methods;

  // Lắng nghe sự thay đổi của các chỉ số con để tự động tính tổng
  const valChuyenVeBV = watch("ChuyenVeBVDieuTri_SoLuong");
  const valTuVong = watch("TuVong_SoLuong");
  const valChuyenVien = watch("ChuyenVien_SoLuong");
  const valVeGiaDinh = watch("VeGiaDinh_SoLuong");

  useEffect(() => {
    const totalCapCuu = Number(valChuyenVeBV || 0) + Number(valTuVong || 0);
    setValue("TongSoCaCapCuu_SoLuong", totalCapCuu);
  }, [valChuyenVeBV, valTuVong, setValue]);

  useEffect(() => {
    const totalVanChuyen = Number(valChuyenVien || 0) + Number(valVeGiaDinh || 0);
    setValue("TongSoCaVanChuyen_SoLuong", totalVanChuyen);
  }, [valChuyenVien, valVeGiaDinh, setValue]);

  useEffect(() => {
    if (bcGiaoBanTheoNgay.Ngay) {
      dispatch(getDataBCGiaoBanCurent(bcGiaoBanTheoNgay.Ngay));
    }
  }, [bcGiaoBanTheoNgay.Ngay, dispatch]);

  useEffect(() => {
    if (bcGiaoBanCurent && user && user.KhoaID && bcGiaoBanTheoNgay && khoas) {
      const trangthai = bcGiaoBanCurent.TrangThai;
      const phanquyen = user.PhanQuyen;
      const makhoaUser = user.KhoaID.MaKhoa;
      const foundKhoa = khoas.find(
        (khoa) => khoa._id === bcGiaoBanTheoNgay.KhoaID,
      );
      const makhoaCurent = foundKhoa ? foundKhoa.MaKhoa : null;
      setCoQuyen(
        CheckDisplayKhoa(phanquyen, trangthai, makhoaUser, makhoaCurent),
      );
    }
  }, [bcGiaoBanCurent, user, bcGiaoBanTheoNgay, khoas]);

  useEffect(() => {
    setValue("BSTruc", bcGiaoBanTheoNgay.BSTruc || "");
    setValue("DDTruc", bcGiaoBanTheoNgay.DDTruc || "");

    chiSoFields.forEach((field) => {
      const found = ctChiSos.find((obj) => obj.ChiSoCode === field.code);
      setValue(field.qtyName, found?.SoLuong || 0);
      setValue(field.noteName, found?.GhiChu || "");
    });
  }, [bcGiaoBanTheoNgay, ctChiSos, setValue]);

  const handleCapNhatDuLieu = (data) => {
    const ctChiSo = chiSoFields.map((field) => ({
      ChiSoCode: field.code,
      SoLuong: Number(data[field.qtyName] || 0),
      GhiChu: data[field.noteName] || "",
    }));

    const bcNgayKhoa = {
      ...bcGiaoBanTheoNgay,
      UserID: user._id,
      BSTruc: data.BSTruc,
      DDTruc: data.DDTruc,
      ChiTietBenhNhan: [...bnTuVong115s, ...bnCapCuu115s],
      ChiTietChiSo: ctChiSo,
    };

    dispatch(insertOrUpdateBaoCaoNgay(bcNgayKhoa));
  };

  const handleEdit = (tenLoai, nextLoaiBN) => {
    setTenLoaiBN(tenLoai);
    setLoaiBN(nextLoaiBN);
    setOpenEdit(true);
  };

  return (
    <Container>
      <Stack>
        <FormProvider
          methods={methods}
          onSubmit={handleSubmit(handleCapNhatDuLieu)}
        >
          <Stack direction="row" spacing={2} mt={3}>
            <Box sx={{ flexGrow: 1 }} />
            {coQuyen && (
              <LoadingButton
                type="submit"
                variant="contained"
                size="small"
                loading={isSubmitting}
              >
                Lưu
              </LoadingButton>
            )}
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={3} my={3}>
            <FTextField name="BSTruc" label="Bác sĩ trực" />
            <FTextField name="DDTruc" label="Điều dưỡng trực" />
          </Stack>

          {chiSoGroups.map((group) => (
            <Card key={group.title} variant="outlined" sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" mb={2}>
                {group.title}
              </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={3}>
                  <Typography fontWeight="bold">Chỉ số</Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography fontWeight="bold">Số lượng</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography fontWeight="bold">Ghi chú</Typography>
                </Grid>

                {group.fields.map((field) => {
                  const isTotalField =
                    field.code === "cc115-TongSoCaCapCuu" ||
                    field.code === "cc115-TongSoCaVanChuyen";

                  return (
                    <React.Fragment key={field.label}>
                      <Grid item xs={12} md={3}>
                        <Typography sx={{ fontWeight: isTotalField ? "bold" : "normal" }}>
                          {field.label}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <FTextField
                          name={field.qtyName}
                          label="Số lượng"
                          InputProps={
                            isTotalField
                              ? {
                                  readOnly: true,
                                  style: { fontWeight: "bold", backgroundColor: "#f1f5f9" },
                                }
                              : undefined
                          }
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FTextField name={field.noteName} label="Ghi chú" />
                      </Grid>
                    </React.Fragment>
                  );
                })}
              </Grid>
            </Card>
          ))}
        </FormProvider>

        <Stack>
          <Card
            sx={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              p: 2,
              justifyContent: "space-around",
            }}
          >
            <Card
              variant="outlined"
              sx={{
                p: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Typography variant="h6" m={1}>
                Bệnh nhân tử vong: {bnTuVong115s.length}
              </Typography>
              {coQuyen && (
                <Button
                  onClick={() =>
                    handleEdit("tử vong CC115", cc115PatientTypes.tuVong)
                  }
                  variant="contained"
                >
                  Thêm
                </Button>
              )}
            </Card>

            <Card
              variant="outlined"
              sx={{
                p: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Typography variant="h6" m={1}>
                Bệnh nhân cấp cứu: {bnCapCuu115s.length}
              </Typography>
              {coQuyen && (
                <Button
                  onClick={() =>
                    handleEdit("cấp cứu CC115", cc115PatientTypes.capCuu)
                  }
                  variant="contained"
                >
                  Thêm
                </Button>
              )}
            </Card>
          </Card>

          <BenhNhanInsertForm
            open={openEdit}
            handleClose={() => setOpenEdit(false)}
            handleSave={() => setOpenEdit(false)}
            tenLoaiBN={tenLoaiBN}
            loaiBN={loaiBN}
            benhnhan={{}}
            isCC115={true}
          />
        </Stack>

        {bnTuVong115s.length > 0 && (
          <ListBenhNhanCard
            benhnhans={bnTuVong115s}
            title="Người bệnh tử vong CC115"
          />
        )}
        {bnCapCuu115s.length > 0 && (
          <ListBenhNhanCard
            benhnhans={bnCapCuu115s}
            title="Người bệnh cấp cứu CC115"
          />
        )}
      </Stack>
    </Container>
  );
}

export default BCCapCuu115;
