
import { Box,  Grid, Stack } from "@mui/material";

import React, { useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";


import MainCard from "components/MainCard";
import {
  getOneLopDaoTaoByID,
  
  resetLopDaoTaoCurrent,
  
} from "./daotaoSlice";

import { getAllHinhThucCapNhat } from "features/NhanVien/hinhthuccapnhatSlice";
import { getDataFix } from "features/NhanVien/nhanvienSlice";
import { useParams } from "react-router-dom";
import HocVienLopTable from "./ChonHocVien/HocVienLopTable";
import DiemDanhLopDaoTaoButton from "./DiemDanhLopDaoTaoButton";
import LopDaoTaoView1 from "features/NhanVien/LopDaoTaoView1";
import useAuth from "hooks/useAuth";
import HocVienLopTableTam from "./ChonHocVien/HocVienLopTableTam";

function LopDaoTaoFormTam() {
  const params = useParams();
  const lopdaotaoID = params.lopdaotaoID;
  const {user} = useAuth()
  const { lopdaotaoCurrent } = useSelector((state) => state.daotao);
  const { HinhThucCapNhat } = useSelector((state) => state.hinhthuccapnhat);
  const { NoiDaoTao } = useSelector(
    (state) => state.nhanvien
  );

  const dispatch = useDispatch();
  useEffect(() => {
    if (lopdaotaoID) dispatch(getOneLopDaoTaoByID({lopdaotaoID,tam:true,userID:user._id}));
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
            tam={true}
          />
        </Grid>

        <Grid item xs={12} md={12}>
          <HocVienLopTableTam />
        </Grid>
      </Grid>
    
    </MainCard>
  );
}

export default LopDaoTaoFormTam;
