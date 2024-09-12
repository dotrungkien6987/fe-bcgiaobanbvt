import React, { useEffect, useState } from "react";
import { Select, MenuItem, useMediaQuery } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { setVaiTroCurrent } from "../daotaoSlice";
import { getAllHinhThucCapNhat } from "features/NhanVien/hinhthuccapnhatSlice";
import { getDataFix, setTypeTongHop } from "features/NhanVien/nhanvienSlice";
import MyFRadioGroup from "components/form/MyFRadioGroup";
import { useTheme } from "@emotion/react";
import { commonStyle } from "utils/heplFuntion";
import { FormProvider } from "components/form";
import { useForm } from "react-hook-form";

const TypeTongHopRadioGroup = ({ isHoiDong = false }) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const [selectedLoai, setSelectedLoai] = useState(0);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
   const defaultValues = {
    Loai: 0,
   
  };
  useEffect(() => {
    dispatch(setTypeTongHop(selectedLoai));
  }, [selectedLoai, dispatch]); // Chỉ thực hiện khi selectedLoai thay đổi
 const methods = useForm({
    defaultValues,
  });
  const {
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting },
  } = methods;
  return (
    <FormProvider methods={methods}>
 <MyFRadioGroup
    name="Loai"
    value={selectedLoai}
    onChange={(e) => {
      setSelectedLoai(parseInt(e.target.value, 10));
      
    }}
    options={[
      { value: 0, label: "Tất cả" },
      { value: 1, label: "Đạt" },
      { value: 2, label: "Chưa đạt" },
    
    ]}
    // options={allOptions.slice(4)}

    sx={{
      "& .MuiSvgIcon-root": {
        fontSize: { isSmallScreen } ? 12 : 20,
      },
      "& .MuiTypography-body1": {
        fontSize: isSmallScreen ? "0.7rem" : "1.1rem",
      },
    }}
  />
    </FormProvider>
   
  );
};

export default TypeTongHopRadioGroup;
