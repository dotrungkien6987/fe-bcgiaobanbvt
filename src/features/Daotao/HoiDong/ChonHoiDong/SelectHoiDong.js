import React, { useEffect, useState } from "react";
import { Select, MenuItem } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";

import { getAllHoiDong } from "features/NhanVien/hinhthuccapnhatSlice";
import { setHoiDongCurrent, updateHocVienCurrentsWhenHoiDongChanged } from "features/Daotao/daotaoSlice";

const SelectHoiDong = () => {
  const dispatch = useDispatch();

  const { hoidongCurrent } = useSelector((state) => state.daotao);
  const [previousValue, setPreviousValue] = useState(hoidongCurrent); // Biến trạng thái để lưu trữ giá trị cũ
  const [hoidongs, setHoidongs] = useState([]);
  const { HoiDong } = useSelector((state) => state.hinhthuccapnhat);
  const { lopdaotaoCurrent } = useSelector((state) => state.daotao);
  const khonghoidong = { _id: "0", Ten: "Không có hội đồng" };

  useEffect(() => {
    if (HoiDong.length > 0) {
      setHoidongs([khonghoidong, ...HoiDong]);
      return;
    }
    dispatch(getAllHoiDong());
  }, [HoiDong, dispatch]);

  useEffect(() => {
    setHoidongs([khonghoidong, ...HoiDong]);
  }, [HoiDong]);

  useEffect(() => {
    if (
      lopdaotaoCurrent &&
      lopdaotaoCurrent._id &&
      lopdaotaoCurrent.HoiDongID
    ) {
      dispatch(setHoiDongCurrent(lopdaotaoCurrent.HoiDongID));
      return;
    }
    dispatch(setHoiDongCurrent("0"));
  }, []);

  const handleSelectChange = (event) => {
    const newValue = event.target.value;
    const oldValue = hoidongCurrent; // Lưu trữ giá trị cũ vào biến tạm thời
    const thanhvienOld =
      hoidongs?.find((item) => item._id === oldValue)
        ?.ThanhVien?.map((thanhvien) => ({
          ...thanhvien,
          ...thanhvien.NhanVienID,
          TenKhoa: thanhvien.NhanVienID.KhoaID.TenKhoa,
          Sex: thanhvien.NhanVienID.GioiTinh === 0 ? "Nam" : "Nữ",
          NhanVienID: thanhvien.NhanVienID._id,
        })) || [];
    const thanhvienNew =
      hoidongs?.find((item) => item._id === newValue)
        ?.ThanhVien?.map((thanhvien) => ({
          ...thanhvien,
          ...thanhvien.NhanVienID,
          TenKhoa: thanhvien.NhanVienID.KhoaID.TenKhoa,
          Sex: thanhvien.NhanVienID.GioiTinh === 0 ? "Nam" : "Nữ",
          NhanVienID: thanhvien.NhanVienID._id,
        })) || [];

    setPreviousValue(oldValue); // Cập nhật giá trị cũ vào trạng thái
   dispatch(setHoiDongCurrent(newValue));
    dispatch(updateHocVienCurrentsWhenHoiDongChanged({  thanhvienNew, thanhvienOld }));
  };
  return (
    <Select value={hoidongCurrent || "0"} onChange={handleSelectChange}>
      {hoidongs &&
        hoidongs.length > 0 &&
        hoidongs.map((item, index) => (
          <MenuItem key={index} value={item._id}>
            {item.Ten}
          </MenuItem>
        ))}
    </Select>
  );
};

export default SelectHoiDong;
