import { Box, Grid, Typography } from "@mui/material";

import React, { useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";

import MainCard from "components/MainCard";
import { getOneLopDaoTaoByID, resetLopDaoTaoCurrent } from "./daotaoSlice";

import { getAllHinhThucCapNhat } from "features/NhanVien/hinhthuccapnhatSlice";
import { getDataFix } from "features/NhanVien/nhanvienSlice";
import { useParams } from "react-router-dom";
import LopDaoTaoView1 from "features/NhanVien/LopDaoTaoView1";
import useAuth from "hooks/useAuth";
import HocVienLopTableTam from "./ChonHocVien/HocVienLopTableTam";
import { canManageLopDaoTao } from "./lopDaoTaoPermissions";

function LopDaoTaoFormTam() {
  const params = useParams();
  const lopdaotaoID = params.lopdaotaoID;
  const { user } = useAuth();
  const { lopdaotaoCurrent } = useSelector((state) => state.daotao);
  const { HinhThucCapNhat } = useSelector((state) => state.hinhthuccapnhat);
  const { NoiDaoTao } = useSelector((state) => state.nhanvien);
  const canManageCurrentLopDaoTao = canManageLopDaoTao(user, lopdaotaoCurrent);
  const showPermissionWarning =
    Boolean(lopdaotaoCurrent?._id) && !canManageCurrentLopDaoTao;

  const dispatch = useDispatch();
  useEffect(() => {
    if (lopdaotaoID)
      dispatch(
        getOneLopDaoTaoByID({ lopdaotaoID, tam: true, userID: user._id }),
      );
    else dispatch(resetLopDaoTaoCurrent());
  }, []);
  useEffect(() => {
    if (HinhThucCapNhat.length === 0) {
      dispatch(getAllHinhThucCapNhat());
    }
    if (NoiDaoTao.length === 0) {
      dispatch(getDataFix());
    }
  }, []);

  return (
    <MainCard
      title={`Tạo thành viên tạm cho lớp đào tạo "${lopdaotaoCurrent.Ten}" - ${user.UserName}`}
    >
      <Grid container spacing={2}>
        <Grid item xs={12} md={12}>
          <LopDaoTaoView1 data={lopdaotaoCurrent} tam={true} />
        </Grid>

        <Grid item xs={12} md={12}>
          {showPermissionWarning ? (
            <Box
              sx={{
                p: 2,
                border: "1px solid",
                borderColor: "error.main",
                borderRadius: 1,
              }}
            >
              <Typography color="error">
                Bạn không có quyền thao tác với danh sách tạm của lớp đào tạo
                này.
              </Typography>
            </Box>
          ) : (
            <HocVienLopTableTam />
          )}
        </Grid>
      </Grid>
    </MainCard>
  );
}

export default LopDaoTaoFormTam;
