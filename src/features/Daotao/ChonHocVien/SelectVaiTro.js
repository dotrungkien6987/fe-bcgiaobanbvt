import React, { useEffect } from "react";
import { Select, MenuItem } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { setVaiTroCurrent } from "../daotaoSlice";
import { getAllHinhThucCapNhat } from "features/NhanVien/hinhthuccapnhatSlice";
import { getDataFix } from "features/NhanVien/nhanvienSlice";

const SelectVaiTro = ({ isHoiDong = false }) => {
  const dispatch = useDispatch();
  const { vaitroCurrent, vaitroquydoiCurents } = useSelector(
    (state) => state.daotao
  );

  const {VaiTro} = useSelector((state) => state.nhanvien);

  const { HinhThucCapNhat } = useSelector((state) => state.hinhthuccapnhat);
  useEffect(() => {
    if (HinhThucCapNhat.length > 0) return;
    dispatch(getAllHinhThucCapNhat);
  }, [dispatch, HinhThucCapNhat]);


  //UseEfect get VaiTro khi isHoiDong = true
useEffect(() => {
  if (!isHoiDong) return;
  if (VaiTro.length > 0) return;
  dispatch(getDataFix());
},[]);


  const handleSelectChange = (event) => {
    console.log(event.target.value);
    dispatch(setVaiTroCurrent(event.target.value));
  };
  return (
    <div>
      {isHoiDong ? (
        <Select
        value={vaitroCurrent || ""}
        onChange={handleSelectChange}
        fullWidth
      >
        {VaiTro &&
          VaiTro.length > 0 &&
          VaiTro.map((item, index) => (
            <MenuItem key={index} value={item.VaiTro}>
              {item.VaiTro}
            </MenuItem>
          ))}
      </Select>
      ) : (
        <Select
          value={vaitroCurrent || ""}
          onChange={handleSelectChange}
          fullWidth
        >
          {vaitroquydoiCurents &&
            vaitroquydoiCurents.length > 0 &&
            vaitroquydoiCurents.map((item, index) => (
              <MenuItem key={index} value={item.VaiTro}>
                {item.VaiTro}
              </MenuItem>
            ))}
        </Select>
      )}
    </div>
  );
};

export default SelectVaiTro;
