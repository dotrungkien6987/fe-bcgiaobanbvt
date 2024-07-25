import React, { useState, useEffect } from "react";
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,

  Card,
  Container,
  Grid,
  
  CardHeader,
  Typography,
  Box,
  Button,
} from "@mui/material";

import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";

import {
 
  getKhoas,
} from "../features/BaoCaoNgay/baocaongaySlice";
import useAuth from "../hooks/useAuth";
import { FRadioGroup, FTextField, FormProvider } from "../components/form";
import { useForm } from "react-hook-form";
import { LoadingButton } from "@mui/lab";
import {
  InsertOne,
  UpdateOneSuCo,
  getOneById,
} from "../features/BaoCaoSuCo/baocaosucoSlice";
import ExportWord from "../features/BaoCaoSuCo/ExportWord";
import { GenerateDocument } from "../features/BaoCaoSuCo/GenerateDocument";

function SuCoYKhoaPage() {
  const params = useParams();
  const sucoId = params.sucoId;
  const { user } = useAuth();
  const { khoas } = useSelector((state) => state.baocaongay);
  const { baocaosucoCurent, isLoading } = useSelector(
    (state) => state.baocaosuco
  );
  const { watch, control } = useForm();
  const selectedValue = watch("NguoiBaoCao");
  const styleCardHeader = {
    ".MuiCardHeader-title": {
      fontSize: "20px", // Bạn có thể thay đổi giá trị này để điều chỉnh cỡ chữ mong muốn
    },
  };
  // Lấy thời gian hiện tại theo múi giờ của Việt Nam
  const now = dayjs().tz("Asia/Ho_Chi_Minh");

  // Thiết lập giá trị mặc định cho date dựa trên giờ hiện tại

  const [ngayBaoCao, setNgayBaoCao] = useState(now);
  const [ngaySinh, setNgaySinh] = useState(now);
  const [ngaySuCo, setNgaySuCo] = useState(now);

  const [selectedDepartment, setSelectedDepartment] = useState(user.KhoaID._id);
  const [selectedKhoaNguoiBenh, setSelectedKhoaNguoiBenh] = useState(
    user.KhoaID._id
  );
  const [selectedKhoaSuCo, setSelectedKhoaSuCo] = useState(user.KhoaID._id);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getKhoas());
  }, [dispatch]);

  useEffect(() => {
    console.log("chay get One by ID",sucoId)
    dispatch(getOneById(sucoId));
  }, []);
  useEffect(() => {
    // Update selectedDepartment when khoas changes
    if (khoas && khoas.length > 0) {
      // setSelectedDepartment(khoas[0]._id);
      setSelectedDepartment(user.KhoaID._id);
    }
  }, [khoas, user.KhoaID._id]);

  const handleNgayBaoCaoChange = (newDate) => {
    // Chuyển đổi về múi giờ VN, kiểm tra đầu vào
    console.log("Chay day khong");
    if (newDate instanceof Date) {
      //   newDate.setHours(7, 0, 0, 0);
      setNgayBaoCao(new Date(newDate));
    } else if (dayjs.isDayjs(newDate)) {
      console.log("newdate", newDate);
      //   const updatedDate = newDate.hour(7).minute(0).second(0).millisecond(0);
      //   console.log("updateDate", updatedDate);
      setNgayBaoCao(newDate);
    }
  };

  const handleNgaySinhChange = (newDate) => {
    // Chuyển đổi về múi giờ VN, kiểm tra đầu vào
    console.log("Chay day khong");
    if (newDate instanceof Date) {
      //   newDate.setHours(7, 0, 0, 0);
      setNgaySinh(new Date(newDate));
    } else if (dayjs.isDayjs(newDate)) {
      console.log("newdate", newDate);
      //   const updatedDate = newDate.hour(7).minute(0).second(0).millisecond(0);
      //   console.log("updateDate", updatedDate);
      setNgaySinh(newDate);
    }
  };

  const handleNgaySuCoChange = (newDate) => {
    // Chuyển đổi về múi giờ VN, kiểm tra đầu vào
    console.log("Chay day khong");
    if (newDate instanceof Date) {
      //   newDate.setHours(7, 0, 0, 0);
      setNgaySuCo(new Date(newDate));
    } else if (dayjs.isDayjs(newDate)) {
      console.log("newdate", newDate);
      //   const updatedDate = newDate.hour(7).minute(0).second(0).millisecond(0);
      //   console.log("updateDate", updatedDate);
      setNgaySuCo(newDate);
    }
  };

  const handleSelectKhoaNguoiBenhChange = (e) => {
    setSelectedKhoaNguoiBenh(e.target.value);
  };
  const handleSelectKhoaSuCoChange = (e) => {
    setSelectedKhoaSuCo(e.target.value);
  };
  const handleSelectChange = (e) => {
    setSelectedDepartment(e.target.value);
  };

  const defaultValues = {
    MaBC: baocaosucoCurent.MaBC || "",
    HinhThuc: baocaosucoCurent.HinhThuc || "",
    TenBN: baocaosucoCurent.TenBN || "",
    SoBA: baocaosucoCurent.SoBA || "",
    GioiTinh: baocaosucoCurent.GioiTinh || "",
    DoiTuongSuCo: baocaosucoCurent.DoiTuongSuCo || "",
    ViTri: baocaosucoCurent.ViTri || "",
    MoTa: baocaosucoCurent.MoTa || "",
    GiaiPhap: baocaosucoCurent.GiaiPhap || "",
    XuLyDaLam: baocaosucoCurent.XuLyDaLam || "",
    ThongBaoBacSi: baocaosucoCurent.ThongBaoBacSi || "",
    GhiNhanHoSo: baocaosucoCurent.GhiNhanHoSo || "",
    ThongBaoNguoiNha: baocaosucoCurent.ThongBaoNguoiNha || "",
    ThongBaoNguoiBenh: baocaosucoCurent.ThongBaoNguoiBenh || "",
    PhanLoaiBanDau: baocaosucoCurent.PhanLoaiBanDau || "",
    DanhGiaBanDau: baocaosucoCurent.DanhGiaBanDau || "",
    TenNguoiBC: baocaosucoCurent.TenNguoiBC || "",
    SDTNguoiBC: baocaosucoCurent.SDTNguoiBC || "",
    Email: baocaosucoCurent.Email || "",
    LoaiNguoiBC: baocaosucoCurent.LoaiNguoiBC || "",
    GhiChuNguoiBC: baocaosucoCurent.GhiChuNguoiBC || "",
    NguoiChungKien: baocaosucoCurent.NguoiChungKien || "",
    LyDoKhongTiepNhan: baocaosucoCurent.LyDoKhongTiepNhan || "",
  };
  const methods = useForm({
    defaultValues,
  });
  const {
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (baocaosucoCurent) {
      // Khi prop baocaosucoCurent thay đổi, cập nhật lại dữ liệu trong form
      setValue("MaBC", baocaosucoCurent.MaBC || "");
      setValue("HinhThuc", baocaosucoCurent.HinhThuc || "");
      setValue("TenBN", baocaosucoCurent.TenBN || "");
      setValue("SoBA", baocaosucoCurent.SoBA || "");
      setValue("GioiTinh", baocaosucoCurent.GioiTinh || "");
      setValue("DoiTuongSuCo", baocaosucoCurent.DoiTuongSuCo || "");
      setValue("ViTri", baocaosucoCurent.ViTri || "");
      setValue("MoTa", baocaosucoCurent.MoTa || "");
      setValue("GiaiPhap", baocaosucoCurent.GiaiPhap || "");
      setValue("XuLyDaLam", baocaosucoCurent.XuLyDaLam || "");
      setValue("ThongBaoBacSi", baocaosucoCurent.ThongBaoBacSi || "");
      setValue("GhiNhanHoSo", baocaosucoCurent.GhiNhanHoSo || "");
      setValue("ThongBaoNguoiNha", baocaosucoCurent.ThongBaoNguoiNha || "");
      setValue("ThongBaoNguoiBenh", baocaosucoCurent.ThongBaoNguoiBenh || "");
      setValue("PhanLoaiBanDau", baocaosucoCurent.PhanLoaiBanDau || "");
      setValue("DanhGiaBanDau", baocaosucoCurent.DanhGiaBanDau || "");
      setValue("TenNguoiBC", baocaosucoCurent.TenNguoiBC || "");
      setValue("SDTNguoiBC", baocaosucoCurent.SDTNguoiBC || "");
      setValue("Email", baocaosucoCurent.Email || "");
      setValue("LoaiNguoiBC", baocaosucoCurent.LoaiNguoiBC || "");
      setValue("GhiChuNguoiBC", baocaosucoCurent.GhiChuNguoiBC || "");
      setValue("NguoiChungKien", baocaosucoCurent.NguoiChungKien || "");
      setValue("LyDoKhongTiepNhan", baocaosucoCurent.LyDoKhongTiepNhan || "");

      setSelectedDepartment(baocaosucoCurent.KhoaBC || user.KhoaID._id);
      setSelectedKhoaNguoiBenh(baocaosucoCurent.KhoaBN || user.KhoaID._id);
      setSelectedKhoaSuCo(baocaosucoCurent.KhoaSuCo || user.KhoaID._id);
      setNgayBaoCao(new dayjs(baocaosucoCurent.NgayBC));
      setNgaySinh(new dayjs(baocaosucoCurent.NgaySinh));
      setNgaySuCo(new dayjs(baocaosucoCurent.NgaySuCo));
    }

    console.log("baocaosucoCurent in edit", baocaosucoCurent);
  }, [baocaosucoCurent, setValue]);

  const handleCapNhatDuLieu = (data) => {
    console.log("data", data);
    
    const baocaosuco = {
      ...baocaosucoCurent,
      ...data,
      NgayBC: ngayBaoCao,
      NgaySinh: ngaySinh,
      NgaySuCo: ngaySuCo,
      KhoaBC: selectedDepartment,
      KhoaBN: selectedKhoaNguoiBenh,
      KhoaSuCo: selectedKhoaSuCo,
    };
    if (baocaosuco._id) {
      console.log("update suco");
      dispatch(UpdateOneSuCo(baocaosuco));
    } else {
      console.log("insert suco");
      dispatch(InsertOne(baocaosuco));
    }
  };
  const handleExportDocument = ()=>{
    GenerateDocument({
      name: "John Doe",
     
      cb1 : "☑" ,
      cb2 :  "☐",
    })
  }
  return (
    <Container>
      <Typography
        variant="h4"
        sx={{ my: 1, fontSize: "2rem" }}
        textAlign="center"
      >
        BÁO CÁO SỰ CỐ Y KHOA BỆNH VIỆN ĐA KHOA TỈNH PHÚ THỌ
      </Typography>
      <Stack>
        <Button onClick={handleExportDocument}>export</Button>
        {/* <FTextField name="export" label="export" /> */}
        <ExportWord />
      </Stack>
      <Stack>
        <FormProvider
          methods={methods}
          onSubmit={handleSubmit(handleCapNhatDuLieu)}
        >
           
          <Grid container spacing={3} my={1}>
            <Grid item xs={12} md={5}>
              <Card sx={{ p: 2}}>
                <CardHeader
                  sx={styleCardHeader}
                  title={"HÌNH THỨC BÁO CÁO SỰ CỐ Y KHOA"}
                />

                <FRadioGroup
                  name="HinhThuc"
                  options={["Tự nguyện", "Bắt buộc"]}
                  sx={{
                    "& .MuiSvgIcon-root": {
                      fontSize: 15,
                    },
                    
                    // disabled:true
                  }}
                  disabled={true}
                />
              </Card>
            </Grid>
            <Grid item xs={12} md={7}>
              <Card sx={{ p: 2 }}>
                <Stack mb={3}>
                  {/* Số báo cáo/Mã số sự cố: */}
                  <FTextField
                    name="MaBC"
                    label="Số báo cáo/Mã số sự cố:"
                    disabled={true}
                  />
                </Stack>
                <Stack direction={"row"} spacing={2}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Ngày báo cáo:"
                      value={ngayBaoCao}
                      onChange={handleNgayBaoCaoChange}
                      //   ampm={false}
                      //   format="HH:mm:ss"
                      format="DD/MM/YYYY"
                    />
                  </LocalizationProvider>

                  <FormControl>
                    <InputLabel sx={{ my: -1 }}>Đơn vị báo cáo</InputLabel>
                    <Select
                      value={selectedDepartment}
                      onChange={handleSelectChange}
                    >
                      {khoas &&
                        khoas.length > 0 &&
                        khoas.map((department) => (
                          <MenuItem key={department._id} value={department._id}>
                            {department.TenKhoa}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Stack>
              </Card>
            </Grid>
            <Grid item xs={12} md={8}>
              <Card sx={{ p: 2}}>
                <CardHeader
                  sx={styleCardHeader}
                  title={"Thông tin người bệnh"}
                />
                <Stack direction="row" spacing={1} mb={3}>
                  <FTextField name="TenBN" label="Họ và tên:" />
                  <FTextField name="SoBA" label="Số bệnh án:" />
                </Stack>
                <Stack direction={"row"} spacing={1}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Ngày sinh"
                      value={ngaySinh}
                      onChange={handleNgaySinhChange}
                      //   ampm={false}
                      //   format="HH:mm:ss"
                      // format="DD/MM/YYYY HH:mm:ss"
                    />
                  </LocalizationProvider>

                  <FRadioGroup
                    row={false}
                    name="GioiTinh"
                    options={["Nam", "Nữ"]}
                    sx={{
                      "& .MuiSvgIcon-root": {
                        fontSize: 15,
                      },
                    }}
                  />

                  <FormControl>
                    <InputLabel sx={{ my: -1 }}>Khoa</InputLabel>
                    <Select
                      value={selectedKhoaNguoiBenh}
                      onChange={handleSelectKhoaNguoiBenhChange}
                    >
                      {khoas &&
                        khoas.length > 0 &&
                        khoas.map((department) => (
                          <MenuItem key={department._id} value={department._id}>
                            {department.TenKhoa}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Stack>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 2 }}>
                <CardHeader
                  sx={styleCardHeader}
                  title={"Đối tượng xảy ra sự cố"}
                />

                <FRadioGroup
                  row={false}
                  name="DoiTuongSuCo"
                  options={[
                    "Người bệnh",
                    "Người nhà/Khách đến thăm",
                    "Nhân viên y tế",
                    "Trang thiết bị/cơ sở hạ tầng",
                  ]}
                  sx={{
                    "& .MuiSvgIcon-root": {
                      fontSize: 15,
                    },
                  }}
                />
              </Card>
            </Grid>
            <Grid item xs={12} md={12}>
              <Card sx={{ p: 2 }}>
                <CardHeader sx={styleCardHeader} title={"Nơi xảy ra sự cố"} />

                <Grid container spacing={3} my={1}>
                  <Grid item xs={12} md={2.5}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Thời gian xảy ra sự cố"
                        value={ngaySuCo}
                        onChange={handleNgaySuCoChange}
                        //   ampm={false}
                        //   format="HH:mm:ss"
                        format="DD/MM/YYYY HH:mm:ss"
                      />
                    </LocalizationProvider>
                  </Grid>
                  <Grid item xs={12} md={3.3}>
                    <FormControl>
                      <InputLabel sx={{ my: -1 }}>Khoa</InputLabel>
                      <Select
                        value={selectedKhoaSuCo}
                        onChange={handleSelectKhoaSuCoChange}
                      >
                        {khoas &&
                          khoas.length > 0 &&
                          khoas.map((department) => (
                            <MenuItem
                              key={department._id}
                              value={department._id}
                            >
                              {department.TenKhoa}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6.2}>
                    <FTextField multiline name="ViTri" label="Vị trí cụ thể:" />
                  </Grid>
                </Grid>
                <Stack spacing={1}>
                  <FTextField
                    multiline
                    name="MoTa"
                    label="Mô tả ngắn gọn về sự cố:"
                  />
                  <FTextField
                    multiline
                    name="GiaiPhap"
                    label="Đề xuất giải pháp ban đầu:"
                  />
                  <FTextField
                    multiline
                    name="XuLyDaLam"
                    label="Điều trị/xử lý ban đầu đã thực hiện"
                  />
                </Stack>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2 }}>
                <CardHeader
                  sx={styleCardHeader}
                  title={"Thông báo cho Bác sĩ điều trị/người có trách nhiệm"}
                />

                <FRadioGroup
                  name="ThongBaoBacSi"
                  options={["Có", "Không", "Không ghi nhận"]}
                  sx={{
                    "& .MuiSvgIcon-root": {
                      fontSize: 15,
                    },
                  }}
                />
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2 }}>
                <CardHeader
                  sx={styleCardHeader}
                  title={"Ghi nhận vào hồ sơ bệnh án/giấy tờ liên quan"}
                />

                <FRadioGroup
                  name="GhiNhanHoSo"
                  options={["Có", "Không", "Không ghi nhận"]}
                  sx={{
                    "& .MuiSvgIcon-root": {
                      fontSize: 15,
                    },
                  }}
                />
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2 }}>
                <CardHeader
                  sx={styleCardHeader}
                  title={"Thông báo cho người nhà/người bảo hộ"}
                />

                <FRadioGroup
                  name="ThongBaoNguoiNha"
                  options={["Có", "Không", "Không ghi nhận"]}
                  sx={{
                    "& .MuiSvgIcon-root": {
                      fontSize: 15,
                    },
                  }}
                />
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2 }}>
                <CardHeader
                  sx={styleCardHeader}
                  title={"Thông báo cho người bệnh"}
                />

                <FRadioGroup
                  name="ThongBaoNguoiBenh"
                  options={["Có", "Không", "Không ghi nhận"]}
                  sx={{
                    "& .MuiSvgIcon-root": {
                      fontSize: 15,
                    },
                  }}
                />
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2 }}>
                <CardHeader
                  sx={styleCardHeader}
                  title={"Phân loại ban đầu về sự cố"}
                />

                <FRadioGroup
                  name="PhanLoaiBanDau"
                  options={["Chưa xảy ra", "Đã xảy ra"]}
                  sx={{
                    "& .MuiSvgIcon-root": {
                      fontSize: 15,
                    },
                  }}
                />
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2 }}>
                <CardHeader
                  sx={styleCardHeader}
                  title={"Đánh giá ban đầu về mức độ ảnh hưởng của sự cố"}
                />

                <FRadioGroup
                  name="DanhGiaBanDau"
                  options={["Nặng", "Trung bình", "Nhẹ"]}
                  sx={{
                    "& .MuiSvgIcon-root": {
                      fontSize: 15,
                    },
                  }}
                />
              </Card>
            </Grid>
            <Grid item xs={12} md={12}>
              <Card sx={{ p: 2 }}>
                <CardHeader
                  sx={styleCardHeader}
                  title={"Thông tin người báo cáo"}
                />

                <Stack>
                  <Stack direction={"row"} mb={3}>
                    <FTextField name="TenNguoiBC" label="Họ tên:" />
                    <FTextField name="SDTNguoiBC" label="Số điện thoại:" />
                    <FTextField name="Email" label="Email:" />
                  </Stack>

                  <FRadioGroup
                    name="LoaiNguoiBC"
                    options={[
                      "Điều dưỡng",
                      "Người bệnh",
                      "Người nhà/khách đến thăm",
                      "Bác sỹ",
                      "Khác",
                    ]}
                    control={control} // truyền control vào để FRadioGroup sử dụng
                    sx={{
                      "& .MuiSvgIcon-root": {
                        fontSize: 15,
                      },
                    }}
                  />
                  <FTextField name="GhiChuNguoiBC" label="Ghi chú:" />
                </Stack>
              </Card>
            </Grid>
            <Grid item xs={12} md={12}>
              <CardHeader sx={styleCardHeader} title={"Người chứng kiến"} />
              <Card sx={{ p: 2 }}>
                <FTextField name="NguoiChungKien" label="Người chứng kiến" />
              </Card>
              <Card sx={{ p: 2 }}>
                <FTextField
                  name="LyDoKhongTiepNhan"
                  label="Lý do không tiếp nhận"
                />
              </Card>
            </Grid>
          </Grid>
          <Box
            sx={{
              m: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LoadingButton
              type="submit"
              variant="contained"
              size="small"
              // loading={true}
              loading={isLoading}
              // loading={isSubmitting}
            >
              Cập nhật
            </LoadingButton>
          </Box>
        </FormProvider>
      </Stack>
      
    </Container>
  );
}

export default SuCoYKhoaPage;
