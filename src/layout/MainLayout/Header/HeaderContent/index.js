import React, { useMemo, useState } from 'react';

// material-ui
import { Avatar, Box, ButtonBase, Divider, IconButton, Menu, MenuItem, Typography, useMediaQuery } from '@mui/material';

// project-imports
import Search from './Search';
import Message from './Message';
import Profile from './Profile';
import Localization from './Localization';
import Notification from './Notification';
import MobileSection from './MobileSection';
import MegaMenuSection from './MegaMenuSection';
import { Link as RouterLink, useNavigate } from "react-router-dom";
import useConfig from 'hooks/useConfig';
import DrawerHeader from 'layout/MainLayout/Drawer/DrawerHeader';
import { MenuOrientation } from 'configAble';
import { useTheme } from '@emotion/react';
import useAuth from 'hooks/useAuth';
import PersonIcon from "@mui/icons-material/Person";
import { useDispatch } from 'react-redux';
import UserResetPassForm from 'features/User/UserResetPassForm';
import avatar1 from 'assets/images/users/avatar-6.png';
// ==============================|| HEADER - CONTENT ||============================== //

const HeaderContent = () => {
  const { i18n, menuOrientation } = useConfig();

  const downLG = useMediaQuery((theme) => theme.breakpoints.down('lg'));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const localization = useMemo(() => <Localization />, [i18n]);

  const megaMenu = useMemo(() => <MegaMenuSection />, []);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const { user, logout } = useAuth();
  // const { user, logout } ={};
  const [anchorEl, setAnchorEl] = React.useState(null);
  const navigate = useNavigate();
  const [openResetPass, setOpenResetPass] = useState(false);
  const handleCloseResetPassForm = () => {
    setOpenResetPass(false);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
    console.log("user", user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      handleMenuClose();
      await logout(() => {
        navigate("/login");
      });
    } catch (error) {
      console.error(error);
    }
  };
  const dispatch = useDispatch();

  const handleResetPass = (userId) => {
    setOpenResetPass(true);
    console.log(userId);
  };
  const renderMenu = (
    <Menu
      id="menu-appbar"
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
    >
      <Box sx={{ my: 1.5, px: 2.5 }}>
        <Typography variant="subtitle2" noWrap>
          {user?.UserName}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {user?.KhoaID.TenKhoa}
        </Typography>
      </Box>
      <Divider sx={{ borderStyle: "dashed" }} />

      <MenuItem
        onClick={handleMenuClose}
        to="/"
        component={RouterLink}
        sx={{ mx: 1 }}
      >
        Home
      </MenuItem>
      {(user.PhanQuyen === "admin"||user.PhanQuyen === "manager") && (
        <>
          <MenuItem
            onClick={handleMenuClose}
            to="/dashboard"
            component={RouterLink}
            sx={{ mx: 1 }}
          >
            DashBoard
          </MenuItem>

          <MenuItem
            onClick={handleMenuClose}
            to="/khuyencaokhoa"
            component={RouterLink}
            sx={{ mx: 1 }}
          >
            Khuyến cáo khoa
          </MenuItem>
        </>
      )}
      {user.PhanQuyen === "admin" && (
        <MenuItem
          onClick={handleMenuClose}
          to="/admin"
          component={RouterLink}
          sx={{ mx: 1 }}
        >
          Admin
        </MenuItem>
      )}

      <MenuItem
        onClick={handleMenuClose}
        to="/tongtruc"
        component={RouterLink}
        sx={{ mx: 1 }}
      >
        Lịch tổng trực
      </MenuItem>

      <Divider sx={{ borderStyle: "dashed" }} />
     
      {/* <MenuItem
        onClick={handleMenuClose}
        to="/danhsach"
        component={RouterLink}
        sx={{ mx: 1 }}
      >
      Danh sách sự cố y khoa
      </MenuItem> */}

      <MenuItem
        onClick={handleMenuClose}
        to="/baocaosuco"
        component={RouterLink}
        sx={{ mx: 1 }}
      >
        Tổng hợp sự cố y khoa
      </MenuItem>
      <Divider sx={{ borderStyle: "dashed" }} />
      <MenuItem
        onClick={handleMenuClose}
        to="/lopdaotaos"
        component={RouterLink}
        sx={{ mx: 1 }}
      >
        Nội bộ
      </MenuItem>
      <Divider sx={{ borderStyle: "dashed" }} />
      <MenuItem onClick={handleResetPass} component={RouterLink} sx={{ mx: 1 }}>
        Đổi mật khẩu
      </MenuItem>

      <MenuItem
        onClick={handleLogout}
        //  component={RouterLink}
        sx={{ mx: 1 }}
      >
        Logout
      </MenuItem>
    </Menu>
  );

  return (
    <>
      {menuOrientation === MenuOrientation.HORIZONTAL && !downLG && <DrawerHeader open={true} />}
      {/* {!downLG && <Search />} */}
      {/* {!downLG && megaMenu} */}
      {/* {!downLG && localization} */}
      {/* {downLG && <Box sx={{ width: '100%', ml: 1 }} />} */}

      {/* <Notification /> */}
      {/* <Message /> */}
      <Box sx={{ flexGrow: 1 }} />
     
          {renderMenu}
          <UserResetPassForm
        open={openResetPass}
        handleClose={handleCloseResetPassForm}
        user={user}
      />
       <ButtonBase
        sx={{
          p: 0.25,
          borderRadius: 1,
          '&:hover': { bgcolor:'secondary.lighter' },
          '&:focus-visible': {
            outline: `2px solid ${theme.palette.secondary.dark}`,
            outlineOffset: 2
          }
        }}
        aria-label="open profile"
        // ref={anchorRef}
        // aria-controls={open ? 'profile-grow' : undefined}
        aria-haspopup="true"
        onClick={handleProfileMenuOpen}
      >
        <Avatar alt="profile user" src={avatar1} />
      </ButtonBase>
      {/* {!downLG && <Profile />} */}
      {/* {downLG && <MobileSection />} */}
    </>
  );
};

export default HeaderContent;
