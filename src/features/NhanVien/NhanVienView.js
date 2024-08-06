import PropTypes from 'prop-types';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
  useMediaQuery,
  Grid,
  Chip,
  Divider,
  
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  Stack,
  TableCell,
  TableRow,
  Typography
} from '@mui/material';


// project-imports
import MainCard from 'components/MainCard';
import Avatar from 'components/@extended/Avatar';
import Transitions from 'components/@extended/Transitions';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PhoneIcon from '@mui/icons-material/Phone';
// assets
import { Sms } from 'iconsax-react';
import { formatDate_getDate } from 'utils/formatTime';

const avatarImage = require.context('assets/images/users', true);

// ==============================|| CUSTOMER - VIEW ||============================== //

const NhanVienView = ({ data }) => {
  const theme = useTheme();
  const matchDownMD = useMediaQuery(theme.breakpoints.down('md'));
console.log("datanhanvien",data);
  return (
    <TableRow sx={{ '&:hover': { bgcolor: `transparent !important` }, overflow: 'hidden' }}>
      <TableCell colSpan={8} sx={{ p: 2.5, overflow: 'hidden' }}>
        <Transitions type="slide" direction="down" in={true}>
          <Grid container spacing={2.5} sx={{ pl: { xs: 0, sm: 5, md: 6, lg: 10, xl: 12 } }}>
            <Grid item xs={12} sm={5} >
            <Grid container spacing={2.5}  sx={{ pl: { xs: 0, sm: 5, md: 6, lg: 10, xl: 12 } }}>
              <Grid item xs={12} >
              <MainCard>
                <Chip
                  label={data.ChucDanh||''}
                  size="small"
                  color="primary"
                  sx={{
                    position: 'absolute',
                    right: 10,
                    top: 10,
                    fontSize: '0.675rem',
                    
                  }}
                />
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Stack spacing={2.5} alignItems="center">
                      <Avatar alt="Avatar 1" size="xl" src={avatarImage(data.GioiTinh===0?`./avatar-1.png`: `./avatar-9.png`)} />
                      
                      <Stack spacing={0.5} alignItems="center">
                        <Typography variant="h5">{data.Ten}</Typography>
                        <Typography color="secondary">{data.ChucVu}</Typography>
                        <Typography color="secondary">{data.KhoaID.TenKhoa}</Typography>
                      </Stack>
                    </Stack>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider />
                  </Grid>
                
                  <Grid item xs={12}>
                    <List aria-label="main mailbox folders" sx={{ py: 0, '& .MuiListItemIcon-root': { minWidth: 32 } }}>
                     
                      <ListItem>
                        <ListItemIcon>
                          <PhoneIcon size={18} />
                        </ListItemIcon>
                        <ListItemSecondaryAction>
                          
                          <Typography align="right">{data.SoDienThoai}</Typography>
                        
                        </ListItemSecondaryAction>
                      </ListItem>

                      <ListItem>
                        <ListItemIcon>
                          <CreditCardIcon size={18} />
                        </ListItemIcon>
                        <ListItemSecondaryAction>
                          <Typography align="right">
                          <Typography align="right">{data.CMND}</Typography>
                          </Typography>
                        </ListItemSecondaryAction>
                      </ListItem>

                      <ListItem>
                        <ListItemIcon>
                          <Sms size={18} />
                        </ListItemIcon>
                        <ListItemSecondaryAction>
                          <Typography align="right">{data.Email}</Typography>
                        </ListItemSecondaryAction>
                      </ListItem>

                      {/* <ListItem>
                        <ListItemIcon>
                          <Location size={18} />
                        </ListItemIcon>
                        <ListItemSecondaryAction>
                          <Typography align="right">{data.country}</Typography>
                        </ListItemSecondaryAction>
                      </ListItem> */}
                      
                    </List>
                  </Grid>
                </Grid>
              </MainCard>
              </Grid>
             
            </Grid>
              
            
            </Grid>
            <Grid item xs={12} sm={7} >
              <Stack spacing={2}>
                <MainCard >
                  <List sx={{ py: 0 }}>
                    <ListItem divider={!matchDownMD}>
                      <Grid container spacing={1}>
                        <Grid item xs={12} md={6}>
                          <Stack spacing={0.5}>
                            <Typography color="secondary">Họ tên</Typography>
                            <Typography>{data.Ten}</Typography>
                          </Stack>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Stack spacing={0.5}>
                          <Typography color="secondary">Ngày sinh</Typography>
                          <Typography>{formatDate_getDate(data.NgaySinh)}</Typography>
                          </Stack>
                        </Grid>
                      </Grid>
                    </ListItem>

                    <ListItem divider={!matchDownMD}>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Stack spacing={0.5}>
                            <Typography color="secondary">Dân tộc</Typography>
                            <Typography>{data.DanToc}</Typography>
                          </Stack>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Stack spacing={0.5}>
                            <Typography color="secondary">Giới tính</Typography>
                            <Typography>
                              {data.GioiTinh === 0 ? 'Nam' : 'Nữ'}
                            </Typography>
                          </Stack>
                        </Grid>
                      </Grid>
                    </ListItem>
                    
                    <ListItem divider={!matchDownMD}>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Stack spacing={0.5}>
                            <Typography color="secondary">Trình độ chuyên môn</Typography>
                            <Typography>{data.TrinhDoChuyenMon}</Typography>
                          </Stack>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Stack spacing={0.5}>
                            <Typography color="secondary">Chức danh</Typography>
                            <Typography>
                              {data.ChucDanh}
                            </Typography>
                          </Stack>
                        </Grid>
                      </Grid>
                    </ListItem>
                    
                    <ListItem divider={!matchDownMD}>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Stack spacing={0.5}>
                            <Typography color="secondary">Số chứng chỉ hành nghề</Typography>
                            <Typography>{data.SoCCHN}</Typography>
                          </Stack>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Stack spacing={0.5}>
                            <Typography color="secondary">Ngày cấp CCHN</Typography>
                            <Typography>
                              {formatDate_getDate(data.NgayCapCCHN)}
                            </Typography>
                          </Stack>
                        </Grid>
                      </Grid>
                    </ListItem>
                    
                    <ListItem divider={!matchDownMD}>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Stack spacing={0.5}>
                            <Typography color="secondary">Phạm vi hành nghể</Typography>
                            <Typography>{data.PhamViHanhNghe}</Typography>
                          </Stack>
                        </Grid>
                        
                      </Grid>
                    </ListItem>
                    
                   
                    {/* <ListItem>
                      <Stack spacing={0.5}>
                        <Typography color="secondary">Address</Typography>
                        <Typography>{data.address}</Typography>
                      </Stack>
                    </ListItem> */}
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

NhanVienView.propTypes = {
  data: PropTypes.object
};

export default NhanVienView;
