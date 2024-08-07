import { yupResolver } from "@hookform/resolvers/yup";

import { LoadingButton } from "@mui/lab";
import { Box, Card, Grid, Stack, Typography } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import { FTextField, FormProvider } from "components/form";
import FAutocomplete from "components/form/FAutocomplete";
import FDatePicker from "components/form/FDatePicker";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import dayjs from "dayjs";
import MainCard from "components/MainCard";
import {
  getOneLopDaoTaoByID,
  insertOneLopDaoTao,
  resetLopDaoTaoCurrent,
  updateOneLopDaoTao,
} from "./daotaoSlice";

import { getAllHinhThucCapNhat } from "features/NhanVien/hinhthuccapnhatSlice";
import { getDataFix } from "features/NhanVien/nhanvienSlice";
import { useParams } from "react-router-dom";
import HocVienLopTable from "./ChonHocVien/HocVienLopTable";
import DiemDanhLopDaoTaoButton from "./DiemDanhLopDaoTaoButton";
import LopDaoTaoView1 from "features/NhanVien/LopDaoTaoView1";
import useAuth from "hooks/useAuth";

function LopDaoTaoFormTam() {
  const params = useParams();
  const lopdaotaoID = params.lopdaotaoID;
  const {user} = useAuth()
  const { lopdaotaoCurrent } = useSelector((state) => state.daotao);
  const { HinhThucCapNhat } = useSelector((state) => state.hinhthuccapnhat);
  const { NoiDaoTao, NguonKinhPhi, HinhThucDaoTao } = useSelector(
    (state) => state.nhanvien
  );

  const dispatch = useDispatch();
  useEffect(() => {
    if (lopdaotaoID) dispatch(getOneLopDaoTaoByID(lopdaotaoID));
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
    <MainCard title={`Tạo thành viên tạm cho lớp đào tạo "${lopdaotaoCurrent.Ten}" - ${user.UserName}`}>
      <Grid container spacing={2}>
       
      <Grid item xs={12} md={12}>
          <LopDaoTaoView1
            data={lopdaotaoCurrent}
            
          />
        </Grid>

        <Grid item xs={12} md={12}>
          <HocVienLopTable />
        </Grid>
      </Grid>
      <Stack direction="row" mb={2} mt={1}>
        <Box sx={{ flexGrow: 1 }}></Box>
        {lopdaotaoCurrent._id && (
          <DiemDanhLopDaoTaoButton lopdaotaoID={lopdaotaoCurrent._id} isButton={true} />
        )}
      </Stack>
      
    </MainCard>
  );
}

export default LopDaoTaoFormTam;
