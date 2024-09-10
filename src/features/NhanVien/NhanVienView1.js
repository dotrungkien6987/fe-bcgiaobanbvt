import PropTypes from "prop-types";

// material-ui
import { useTheme } from "@mui/material/styles";
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
  
  Typography,
} from "@mui/material";

// third-party


// project-imports
import MainCard from "components/MainCard";
import Avatar from "components/@extended/Avatar";

import CreditCardIcon from "@mui/icons-material/CreditCard";
import PhoneIcon from "@mui/icons-material/Phone";
// assets
import {  CalendarTick, Sms } from "iconsax-react";
import { formatDate_getDate } from "utils/formatTime";
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { getOneNhanVienByID } from "./nhanvienSlice";
import { useDispatch, useSelector } from "react-redux";
import DaoTaoTheoNhanVienTable from "./DaoTaoTheoNhanVienTable";

const avatarImage = require.context("assets/images/users", true);

// ==============================|| CUSTOMER - VIEW ||============================== //

const NhanVienView1 = () => {
  const params = useParams();

  const dispatch = useDispatch();
  const {
    nhanvienCurrent,
    lopdaotaotheoNhanVienCurrents,
    nghiencuukhoahoctheoNhanVienCurrents,
    tinchitichluyCurrents,
  } = useSelector((state) => state.nhanvien);
  useEffect(() => {
    dispatch(getOneNhanVienByID(params.nhanvienID));
  }, []);
  const theme = useTheme();
  const matchDownMD = useMediaQuery(theme.breakpoints.down("md"));
  console.log("datanhanvien", nhanvienCurrent);
  return (
    <MainCard
      title={`Quá trình cập nhật kiến thức y khoa liên tục của ${nhanvienCurrent.ChucDanh}:- ${nhanvienCurrent.Ten}`}
    >
      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={4}>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <MainCard>
                <Chip
                  label={nhanvienCurrent?.ChucDanh || ""}
                  size="small"
                  color="primary"
                  sx={{
                    position: "absolute",
                    right: 10,
                    top: 10,
                    fontSize: "0.675rem",
                  }}
                />
                <Grid container spacing={2.2}>
                  <Grid item xs={12}>
                    <Stack spacing={2.5} alignItems="center">
                      <Avatar
                        alt="Avatar 1"
                        size="xl"
                        src={avatarImage(
                          nhanvienCurrent.GioiTinh === 0
                            ? `./avatar-1.png`
                            : `./avatar-9.png`
                        )}
                      />
                      <Stack spacing={0.5} alignItems="center">
                        <Typography variant="h5">
                          {nhanvienCurrent.Ten}
                        </Typography>

                        <Typography color="secondary">
                          {nhanvienCurrent.ChucVu}
                        </Typography>
                        <Typography color="secondary">
                          {nhanvienCurrent.KhoaID?.TenKhoa || ""}
                        </Typography>
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
                          {lopdaotaotheoNhanVienCurrents.length}
                        </Typography>
                        <Typography color="secondary">Khóa đào tạo</Typography>
                      </Stack>
                      <Divider orientation="vertical" flexItem />
                      <Stack spacing={0.5} alignItems="center">
                        <Typography variant="h5">
                          {nghiencuukhoahoctheoNhanVienCurrents.length}
                        </Typography>
                        <Typography color="secondary">
                          Nghiên cứu khoa học
                        </Typography>
                      </Stack>
                      {/* <Divider orientation="vertical" flexItem /> */}
                    </Stack>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider />
                  </Grid>
                  <Grid item xs={12}>
                    <List
                      aria-label="main mailbox folders"
                      sx={{
                        py: 0,
                        "& .MuiListItemIcon-root": { minWidth: 32 },
                      }}
                    >
                      <ListItem>
                        <ListItemIcon>
                          <PhoneIcon size={18} />
                        </ListItemIcon>
                        <ListItemSecondaryAction>
                          <Typography align="right">
                            {nhanvienCurrent.SoDienThoai}
                          </Typography>
                        </ListItemSecondaryAction>
                      </ListItem>

                      <ListItem>
                        <ListItemIcon>
                          <CreditCardIcon size={18} />
                        </ListItemIcon>
                        <ListItemSecondaryAction>
                          <Typography align="right">
                            <Typography align="right">
                              {nhanvienCurrent.CMND}
                            </Typography>
                          </Typography>
                        </ListItemSecondaryAction>
                      </ListItem>

                      <ListItem>
                        <ListItemIcon>
                          <Sms size={18} />
                        </ListItemIcon>
                        <ListItemSecondaryAction>
                          <Typography align="right">
                            {nhanvienCurrent.Email}
                          </Typography>
                        </ListItemSecondaryAction>
                      </ListItem>

                      {/* <ListItem>
                        <ListItemIcon>
                          <Location size={18} />
                        </ListItemIcon>
                        <ListItemSecondaryAction>
                          <Typography align="right">{nhanvienCurrent.country}</Typography>
                        </ListItemSecondaryAction>
                      </ListItem> */}
                    </List>
                  </Grid>
                </Grid>
              </MainCard>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Stack spacing={2.5}>
            <MainCard title="Thông tin cá nhân">
              <List sx={{ py: 0 }}>
                <ListItem divider={!matchDownMD}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Stack spacing={0.5}>
                        <Typography color="secondary">Họ tên</Typography>
                        <Typography>{nhanvienCurrent.Ten}</Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Stack spacing={0.5}>
                        <Typography color="secondary">Ngày sinh</Typography>
                        <Typography>
                          {formatDate_getDate(nhanvienCurrent.NgaySinh)}
                        </Typography>
                      </Stack>
                    </Grid>
                  </Grid>
                </ListItem>

                <ListItem divider={!matchDownMD}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Stack spacing={0.5}>
                        <Typography color="secondary">Dân tộc</Typography>
                        <Typography>{nhanvienCurrent.DanToc}</Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Stack spacing={0.5}>
                        <Typography color="secondary">Giới tính</Typography>
                        <Typography>
                          {nhanvienCurrent.GioiTinh === 0 ? "Nam" : "Nữ"}
                        </Typography>
                      </Stack>
                    </Grid>
                  </Grid>
                </ListItem>

                <ListItem divider={!matchDownMD}>
                  <Grid container spacing={2.5}>
                    <Grid item xs={12} md={6}>
                      <Stack spacing={0.5}>
                        <Typography color="secondary">
                          Trình độ chuyên môn
                        </Typography>
                        <Typography>
                          {nhanvienCurrent.TrinhDoChuyenMon}
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Stack spacing={0.5}>
                        <Typography color="secondary">Chức danh</Typography>
                        <Typography>{nhanvienCurrent.ChucDanh}</Typography>
                      </Stack>
                    </Grid>
                  </Grid>
                </ListItem>

                <ListItem divider={!matchDownMD}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Stack spacing={0.5}>
                        <Typography color="secondary">
                          Số chứng chỉ hành nghề
                        </Typography>
                        <Typography>{nhanvienCurrent.SoCCHN || ""}</Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Stack spacing={0.5}>
                        <Typography color="secondary">Ngày cấp CCHN</Typography>
                        <Typography>
                          {nhanvienCurrent.NgayCapCCHN
                            ? formatDate_getDate(nhanvienCurrent.NgayCapCCHN)
                            : ""}
                        </Typography>
                      </Stack>
                    </Grid>
                  </Grid>
                </ListItem>

                <ListItem divider={!matchDownMD}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Stack spacing={0.5}>
                        <Typography color="secondary">
                          Phạm vi hành nghề
                        </Typography>
                        <Typography>
                          {nhanvienCurrent.PhamViHanhNghe}
                        </Typography>
                      </Stack>
                    </Grid>
                  </Grid>
                </ListItem>
              </List>
            </MainCard>
          </Stack>
        </Grid>
        <Grid item xs={12} md={2}>
          <MainCard title="Tín chỉ tích lũy">
            <List
              aria-label="main mailbox folders"
              sx={{
                py: 0,
                "& .MuiListItemIcon-root": { minWidth: 32 },
              }}
            >
              {tinchitichluyCurrents.length > 0 &&
                tinchitichluyCurrents.map((item, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CalendarTick variant="Outline" size={24} />
                      <Typography align="right" variant="h4">
                        {item.Year}
                      </Typography>
                    </ListItemIcon>
                    <ListItemSecondaryAction>
                      <Typography align="right">
                        <Typography align="right" variant="h3" color={item.TongTinChi >=24 ? '#1939B7':`red`}>
                          {item.TongTinChi}
                        </Typography>
                      </Typography>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}

              <Divider />
            </List>
          </MainCard>
        </Grid>
        <Grid item xs={12}>
          <DaoTaoTheoNhanVienTable
            LopDaoTaos={lopdaotaotheoNhanVienCurrents}
            title={"Quá trình đào tạo"}
          />
        </Grid>
        <Grid item xs={12}>
          <DaoTaoTheoNhanVienTable
            LopDaoTaos={nghiencuukhoahoctheoNhanVienCurrents}
            title={"Quá trình nghiên cứu khoa học"}
          />
        </Grid>
      </Grid>
    </MainCard>
  );
};

NhanVienView1.propTypes = {
  nhanvienCurrent: PropTypes.object,
};

export default NhanVienView1;
