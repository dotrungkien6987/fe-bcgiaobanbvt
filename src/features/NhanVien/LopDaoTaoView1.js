import PropTypes from "prop-types";

// material-ui
import { useTheme } from "@mui/material/styles";
import {
  useMediaQuery,
  Grid,
  
  Divider,
  
  List,
  ListItem,
  
  Stack,
  
  Typography,
  Button,
} from "@mui/material";


// project-imports
import MainCard from "components/MainCard";

// assets
import SaveIcon from "@mui/icons-material/Save";
import { formatDate_getDate } from "utils/formatTime";
import TrangThaiLopDaoTao from "features/Daotao/TrangThaiLopDaoTao";
import { useDispatch, useSelector } from "react-redux";
import { updateTrangThaiLopDaoTao } from "features/Daotao/daotaoSlice";



// ==============================|| CUSTOMER - VIEW ||============================== //

const LopDaoTaoView1 = ({ data,tam=false }) => {
  const theme = useTheme();
  const {HinhThucCapNhat} = useSelector((state) => state.hinhthuccapnhat); 
  const loaihinhthuc = HinhThucCapNhat?.find((item) => item.Ma === data.MaHinhThucCapNhat)?.Loai || "";
  const matchDownMD = useMediaQuery(theme.breakpoints.down("md"));
  console.log("datanhanvien", data);
  const dispatch = useDispatch();
  const handleClickDuyet = () => {
    const trangthai_old = data.TrangThai ||false;
    dispatch(updateTrangThaiLopDaoTao({TrangThai: !trangthai_old, lopdaotaoID: data._id}));
  };
  return (
    <MainCard>
      <Grid container spacing={1}>
        <Grid item xs={12} sm={5}>
          <MainCard>
            {(data.TrangThai && data.TrangThai === true) ? (
             <TrangThaiLopDaoTao trangthai={data.TrangThai} title={'Đã hoàn thành'} />
            ) : (
              <TrangThaiLopDaoTao trangthai={data.TrangThai} title={'Chưa hoàn thành'}/>
            )}

            <Grid container spacing={2.9} mt={2}>
              <Grid item xs={12}>
                <Stack spacing={2} alignItems="center">
                  <Stack spacing={0.5} alignItems="center">
                    <Typography variant="h4">
                     {data.Ten || ""}
                    </Typography>
                    <Typography color="secondary">{loaihinhthuc}</Typography>
                  </Stack>
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <Divider />
              </Grid>
              <Grid item xs={12}>
                <Stack
                  direction="row"
                  justifyContent="space-around"
                  alignItems="center"
                >
                  <Stack spacing={0.5} alignItems="center">
                    <Typography variant="h5">{data.SoLuong}</Typography>
                    <Typography color="secondary">Số section</Typography>
                  </Stack>
                  <Divider orientation="vertical" flexItem />
                  <Stack spacing={0.5} alignItems="center">
                    <Typography variant="h5">{data.SoThanhVien}</Typography>
                    <Typography color="secondary">Thành viên</Typography>
                  </Stack>
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <Divider />
              </Grid>
              <Grid item xs={12}>
                <Stack
                  direction="row"
                  justifyContent="space-around"
                  alignItems="center"
                >
                  <Stack spacing={0.5} alignItems="center">
                    <Typography variant="h5">
                      {formatDate_getDate(data.NgayBatDau)}
                    </Typography>
                    <Typography color="secondary">Thời gian bắt đầu</Typography>
                  </Stack>
                  <Divider orientation="vertical" flexItem />
                  <Stack spacing={0.5} alignItems="center">
                    <Typography variant="h5">
                      {formatDate_getDate(data.NgayKetThuc)}
                    </Typography>
                    <Typography color="secondary">
                      Thời gian kết thúc
                    </Typography>
                  </Stack>
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <Divider />
              </Grid>
              <Grid item xs={12}>
                {!tam && (
                  <Button
                  fullWidth
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleClickDuyet}
                >
                 {data.TrangThai ? 'Gỡ duyệt hoàn thành' : 'Duyệt hoàn thành'}
                </Button>
                )}
                
              </Grid>
            </Grid>
          </MainCard>
        </Grid>
        <Grid item xs={12} sm={7}>
          <Stack spacing={2.5}>
            <MainCard>
              <List sx={{ py: 0 }}>
                <ListItem divider={!matchDownMD}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={9}>
                      <Stack spacing={0.5}>
                        <Typography color="secondary">
                          Nhóm hình thức cập nhật
                        </Typography>
                        <Typography>
                          Tham gia các khóa đào tạo, bồi dưỡng ngắn hạn, hội
                          nghị, hội thảo về y khoa phù hợp với phạm vi hành nghề
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Stack spacing={0.5}>
                        <Typography color="secondary">Mã</Typography>
                        <Typography>G1</Typography>
                      </Stack>
                    </Grid>
                  </Grid>
                </ListItem>
                <ListItem divider={!matchDownMD}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={9}>
                      <Stack spacing={0.5}>
                        <Typography color="secondary">
                          Hình thức cập nhật
                        </Typography>
                        <Typography>Hội nghị, hội thảo chuyên môn</Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Stack spacing={0.5}>
                        <Typography color="secondary">Mã</Typography>
                        <Typography>ĐT02</Typography>
                      </Stack>
                    </Grid>
                  </Grid>
                </ListItem>
              </List>
            </MainCard>

            <MainCard>
              <List sx={{ py: 0 }}>
                <ListItem divider={!matchDownMD}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Stack spacing={0.5}>
                        <Typography color="secondary">
                          Nguồn kinh phí
                        </Typography>
                        <Typography>{data.NguonKinhPhi}</Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Stack spacing={0.5}>
                        <Typography color="secondary">
                          Hình thức đào tạo
                        </Typography>
                        <Typography>{data.HinhThucDaoTao}</Typography>
                      </Stack>
                    </Grid>
                  </Grid>
                </ListItem>
                <ListItem divider={!matchDownMD}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Stack spacing={0.5}>
                        <Typography color="secondary">Số quyết định</Typography>
                        <Typography>{data.QuyetDinh}</Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Stack spacing={0.5}>
                        <Typography color="secondary">Nơi đào tạo</Typography>
                        <Typography>{data.NoiDaoTao}</Typography>
                      </Stack>
                    </Grid>
                  </Grid>
                </ListItem>
                <ListItem>
                  <Stack spacing={0.5}>
                    <Typography color="secondary">Ghi chú</Typography>
                    <Typography>{data.address}</Typography>
                  </Stack>
                </ListItem>
              </List>
            </MainCard>
          </Stack>
        </Grid>
      </Grid>
    </MainCard>
  );
};

LopDaoTaoView1.propTypes = {
  data: PropTypes.object,
};

export default LopDaoTaoView1;
