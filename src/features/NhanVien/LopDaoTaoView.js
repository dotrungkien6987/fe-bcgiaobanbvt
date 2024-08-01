import PropTypes from 'prop-types';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
  useMediaQuery,
  Grid,
  Chip,
  Divider,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  Stack,
  TableCell,
  TableRow,
  Typography
} from '@mui/material';

// third-party
import { PatternFormat } from 'react-number-format';

// project-imports
import MainCard from 'components/MainCard';
import Avatar from 'components/@extended/Avatar';
import Transitions from 'components/@extended/Transitions';

// assets
import { Link2, Location, Mobile, Sms } from 'iconsax-react';
import { formatDate_getDate } from 'utils/formatTime';

const avatarImage = require.context('assets/images/users', true);

// ==============================|| CUSTOMER - VIEW ||============================== //

const LopDaoTaoView = ({ data }) => {
  const theme = useTheme();
  const matchDownMD = useMediaQuery(theme.breakpoints.down('md'));
console.log("datanhanvien",data);
  return (
    <TableRow sx={{ '&:hover': { bgcolor: `transparent !important` }, overflow: 'hidden' }}>
      <TableCell colSpan={8} sx={{ p: 2.5, overflow: 'hidden' }}>
        <Transitions type="slide" direction="down" in={true}>
          <Grid container spacing={2.5} sx={{ pl: { xs: 0, sm: 5, md: 6, lg: 10, xl: 12 } }}>
            <Grid item xs={12} sm={5} >
              <MainCard>
                <Chip
                  label={"Đã hoàn thành"}
                  size="small"
                  color="primary"
                  sx={{
                    position: 'absolute',
                    right: 10,
                    top: 10,
                    fontSize: '0.8rem',
                    
                  }}
                />
                
                <Grid container spacing={4.5} mt={2}>
                  <Grid item xs={12}>
                    <Stack spacing={2.5} alignItems="center">
                      
                      <Stack spacing={0.5} alignItems="center">
                        <Typography variant="h4">{data.Ten}</Typography>
                        <Typography color="secondary">{"Đào tạo"}</Typography>
                      </Stack>
                    </Stack>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider />
                  </Grid>
                  <Grid item xs={12}>
                    <Stack direction="row" justifyContent="space-around" alignItems="center">
                      <Stack spacing={0.5} alignItems="center">
                        <Typography variant="h5">{data.SoLuong}</Typography>
                        <Typography color="secondary">Số section</Typography>
                      </Stack>
                      <Divider orientation="vertical" flexItem />
                      <Stack spacing={0.5} alignItems="center">
                        <Typography variant="h5">{"15"}</Typography>
                        <Typography color="secondary">Thành viên</Typography>
                      </Stack>
                      
                    </Stack>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider />
                  </Grid>
                  <Grid item xs={12}>
                    <Stack direction="row" justifyContent="space-around" alignItems="center">
                      <Stack spacing={0.5} alignItems="center">
                        <Typography variant="h5">{formatDate_getDate(data.NgayBatDau)}</Typography>
                        <Typography color="secondary">Thời gian bắt đầu</Typography>
                      </Stack>
                      <Divider orientation="vertical" flexItem />
                      <Stack spacing={0.5} alignItems="center">
                        <Typography variant="h5">{formatDate_getDate(data.NgayKetThuc)}</Typography>
                        <Typography color="secondary">Thời gian kết thúc</Typography>
                      </Stack>
                      
                    </Stack>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider />
                  </Grid>
                 
                </Grid>
              </MainCard>
            </Grid>
            <Grid item xs={12} sm={7} >
              <Stack spacing={2.5}>
                <MainCard >
                  <List sx={{ py: 0 }}>
                    <ListItem divider={!matchDownMD}>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={9}>
                          <Stack spacing={0.5}>
                            <Typography color="secondary">Nhóm hình thức cập nhật</Typography>
                            <Typography>Tham gia các khóa đào tạo, bồi dưỡng ngắn hạn, hội nghị, hội thảo về y khoa phù hợp với phạm vi hành nghề</Typography>
                          </Stack>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <Stack spacing={0.5}>
                            <Typography color="secondary">Mã</Typography>
                            <Typography>
                              G1
                            </Typography>
                          </Stack>
                        </Grid>
                      </Grid>
                    </ListItem>
                    <ListItem divider={!matchDownMD}>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={9}>
                          <Stack spacing={0.5}>
                            <Typography color="secondary">Hình thức cập nhật</Typography>
                            <Typography>Hội nghị, hội thảo chuyên môn</Typography>
                          </Stack>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <Stack spacing={0.5}>
                            <Typography color="secondary">Mã</Typography>
                            <Typography>
                              ĐT02
                            </Typography>
                          </Stack>
                        </Grid>
                      </Grid>
                    </ListItem>
                  
                  </List>
                </MainCard>

                <MainCard >
                  <List sx={{ py: 0 }}>
                    <ListItem divider={!matchDownMD}>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Stack spacing={0.5}>
                            <Typography color="secondary">Nguồn kinh phí</Typography>
                            <Typography>{data.NguonKinhPhi}</Typography>
                          </Stack>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Stack spacing={0.5}>
                            <Typography color="secondary">Hình thức đào tạo</Typography>
                            <Typography>
                              {data.HinhThucDaoTao}
                            </Typography>
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
                            <Typography>
                              {data.NoiDaoTao}
                            </Typography>
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
        </Transitions>
      </TableCell>
    </TableRow>
  );
};

LopDaoTaoView.propTypes = {
  data: PropTypes.object
};

export default LopDaoTaoView;
