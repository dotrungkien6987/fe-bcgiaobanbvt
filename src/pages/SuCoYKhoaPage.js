import React, { useState, useEffect } from "react";
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Link,
  Card,
  Container,
  Grid,
  TextField,
  FormHelperText,
  CardHeader,
  Typography,
} from "@mui/material";

import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Link as RouterLink } from "react-router-dom";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";

import {
  getDataBCNgay,
  getKhoas,
} from "../features/BaoCaoNgay/baocaongaySlice";
import useAuth from "../hooks/useAuth";
import { FRadioGroup, FTextField, FormProvider } from "../components/form";
import { useForm } from "react-hook-form";

function SuCoYKhoaPage() {
  const { user } = useAuth();
  const { khoas } = useSelector((state) => state.baocaongay);
  const { watch, control } = useForm();
  const selectedValue = watch("NguoiBaoCao");
  const styleCardHeader = {
    ".MuiCardHeader-title": {
      fontSize: "20px", // Bạn có thể thay đổi giá trị này để điều chỉnh cỡ chữ mong muốn
    },
  };
  // Lấy thời gian hiện tại theo múi giờ của Việt Nam
  const now = dayjs().tz("Asia/Ho_Chi_Minh");

  // Kiểm tra xem giờ hiện tại có >= 18 hay không
  const isAfter18 = now.hour() >= 18;

  // Thiết lập giá trị mặc định cho date dựa trên giờ hiện tại

  const [date, setDate] = useState(now);

  const [selectedDepartment, setSelectedDepartment] = useState(user.KhoaID._id);
  const [loaikhoa, setLoaikhoa] = useState("noi");
  const [makhoa, setMakhoa] = useState("");

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getKhoas());
  }, [dispatch]);

  useEffect(() => {
    //SetBaoCaoNgayInStore
    const dateISO = date.toISOString();
    if (selectedDepartment !== "")
      dispatch(getDataBCNgay(dateISO, selectedDepartment));
  }, [date, selectedDepartment, dispatch]);

  useEffect(() => {
    // Update selectedDepartment when khoas changes
    if (khoas && khoas.length > 0) {
      // setSelectedDepartment(khoas[0]._id);
      setSelectedDepartment(user.KhoaID._id);
      const loai_khoa = khoas.find(
        (khoa) => khoa._id === selectedDepartment
      )?.LoaiKhoa;
      const ma_khoa = khoas.find(
        (khoa) => khoa._id === selectedDepartment
      )?.MaKhoa;

      console.log("loaikhoa", loai_khoa);
      setLoaikhoa(loai_khoa);
      setMakhoa(ma_khoa);
    }
  }, [khoas, user.KhoaID._id]);

  const handleDateChange = (newDate) => {
    // Chuyển đổi về múi giờ VN, kiểm tra đầu vào
    console.log("Chay day khong");
    if (newDate instanceof Date) {
      //   newDate.setHours(7, 0, 0, 0);
      setDate(new Date(newDate));
    } else if (dayjs.isDayjs(newDate)) {
      console.log("newdate", newDate);
      //   const updatedDate = newDate.hour(7).minute(0).second(0).millisecond(0);
      //   console.log("updateDate", updatedDate);
      setDate(newDate);
    }
  };

  const handleSelectChange = (e) => {
    setSelectedDepartment(e.target.value);
    //setLoaikhoa de hien thi giao dien tuong ung
    const loai_khoa = khoas.find(
      (khoa) => khoa._id === e.target.value
    )?.LoaiKhoa;
    const ma_khoa = khoas.find((khoa) => khoa._id === e.target.value)?.MaKhoa;

    console.log("loaikhoa", loai_khoa);
    setLoaikhoa(loai_khoa);
    setMakhoa(ma_khoa);
  };
  const defaultValues = {
    BsTruc: "",
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

  return (
    <Container>
         <Typography
          variant="h4"
          sx={{ my: 1, fontSize:  "2rem" }}
          textAlign="center"
        >
          BÁO CÁO SỰ CỐ Y KHOA BỆNH VIỆN ĐA KHOA TỈNH PHÚ THỌ
        </Typography>
      <Stack>
        <FormProvider methods={methods} onSubmit={handleSubmit}>
          <Grid container spacing={3} my={1}>
            <Grid item xs={12} md={5}>
              <Card sx={{ p: 2 }}>
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
                  }}
                />
              </Card>
            </Grid>
            <Grid item xs={12} md={7}>
              <Card sx={{ p: 2 }}>
                <Stack mb={3}>Số báo cáo/Mã số sự cố:</Stack>
                <Stack direction={'row'} spacing={2}>

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Ngày báo cáo:"
                    value={date}
                    onChange={handleDateChange}
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
            <Grid item xs={12} md={8} spacing={1}>
              <Card sx={{ p: 2 }}>
                <CardHeader
                  sx={styleCardHeader}
                  title={"Thông tin người bệnh"}
                />
                <Stack direction="row" spacing={1} mb={3}>
                  <FTextField name="HoTen" label="Họ và tên:" />
                  <FTextField name="HoTen" label="Số bệnh án:" />
                </Stack>
                <Stack direction={"row"} spacing={1}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Ngày sinh"
                      value={date}
                      onChange={handleDateChange}
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
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 2 }}>
                <CardHeader
                  sx={styleCardHeader}
                  title={"Đối tượng xảy ra sự cố"}
                />

                <FRadioGroup
                  row={false}
                  name="HinhThuc"
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
                        value={date}
                        onChange={handleDateChange}
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
                        value={selectedDepartment}
                        onChange={handleSelectChange}
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
                    <FTextField multiline name="HoTen" label="Vị trí cụ thể:" />
                  </Grid>
                </Grid>
                <Stack spacing={1}>

                <FTextField
                  multiline
                  name="HoTen"
                  label="Mô tả ngắn gọn về sự cố:"
                />
                <FTextField
                  multiline
                  name="HoTen"
                  label="Đề xuất giải pháp ban đầu:"
                />
                <FTextField
                  multiline
                  name="HoTen"
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
                  name="HinhThuc"
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
                  name="HinhThuc"
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
                  name="HinhThuc"
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
                  name="HinhThuc"
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
                  name="HinhThuc"
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
                  name="HinhThuc"
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
                    <FTextField name="HoTen" label="Họ tên:" />
                    <FTextField name="HoTen" label="Số điện thoại:" />
                    <FTextField name="HoTen" label="Email:" />
                  </Stack>

                  <FRadioGroup
                    name="NguoiBaoCao"
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
                  {selectedValue === "Điều dưỡng" && (
                    <FTextField name="ChucDanh" label="Chức danh" />
                  )}
                </Stack>
              </Card>
            </Grid>
            <Grid item xs={12} md={12}>
              <CardHeader sx={styleCardHeader} title={"Người chứng kiến"} />
              <Card sx={{ p: 2 }}>
                <FTextField name="ChucDanh" label="Người chứng kiến" />
              </Card>
            </Grid>
          </Grid>
        </FormProvider>
      </Stack>
    </Container>
  );
}

export default SuCoYKhoaPage;
