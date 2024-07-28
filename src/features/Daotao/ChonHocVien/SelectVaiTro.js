import React, { useEffect } from 'react';
import { Select, MenuItem } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { setVaiTroCurrent } from '../daotaoSlice';
import { getAllHinhThucCapNhat } from 'features/NhanVien/hinhthuccapnhatSlice';

const SelectVaiTro = () => {
const dispatch = useDispatch();
  const {vaitroCurrent,vaitroquydoiCurents} = useSelector((state) => state.daotao);
  const {HinhThucCapNhat} = useSelector((state) => state.hinhthuccapnhat);
  useEffect(() => {
if (HinhThucCapNhat.length > 0) return;
dispatch(getAllHinhThucCapNhat)
  },[dispatch, HinhThucCapNhat])


  const handleSelectChange = (event) => {
    console.log(event.target.value);
    dispatch(setVaiTroCurrent(event.target.value));
  }
  return (
    <Select
      value={vaitroCurrent || ''}
      onChange={handleSelectChange}
      fullWidth
    >
      {vaitroquydoiCurents && vaitroquydoiCurents.length > 0 && vaitroquydoiCurents.map((item,index) => (
        <MenuItem key={index} value={item.VaiTro}>
          {item.VaiTro}
        </MenuItem>
      ))}
    </Select>
  );
};

export default SelectVaiTro;