import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Stack,
  Tooltip,
  IconButton,
} from "@mui/material";
import MainCard from "components/MainCard";

import SimpleTable from "pages/tables/MyTable/SimpleTable";

import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Edit, Trash, Convert3DCube } from "iconsax-react";
import AddHinhThucButton from "features/Daotao/AddHinhThucButton";
import {
  deleteUser,
  getAllUsers,
  setKhoaTaiChinhCurent,
  setNhanVienUserCurrent,
  setUserCurent,
} from "../userSlice";
import UserInsertForm from "../UserInsertForm";
import ResetPassForm from "../ResetPassForm";
import AddUserButton from "./AddUserButton";

function UserThemeAbleTable() {
  const { khoas } = useSelector((state) => state.baocaongay);
  const { users, userCurrent } = useSelector((state) => state.user);
  // const updateUser = addTenKhoaToUsers(users,khoas)

  const dispatch = useDispatch();
  useEffect(() => {
    if (users.length > 0) return;
    dispatch(getAllUsers());
  }, []);

  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openResetPass, setOpenResetPass] = useState(false);

  const handleCloseResetPassForm = () => {
    setOpenResetPass(false);
  };
  const handleCloseEditForm = () => {
    setOpenEdit(false);
  };
  const handleEditUser = (user) => {
    // const bn = users.find((user) => user._id === userId);

    if (user) dispatch(setKhoaTaiChinhCurent(user.KhoaTaiChinh));
    if (user.NhanVienID) dispatch(setNhanVienUserCurrent(user.NhanVienID));
    // console.log("user suwar", userEdit);
    // setUserEdit(user);
    dispatch(setUserCurent(user));
    
    setOpenEdit(true);
  };
  const handleCloseDeleteForm = () => {
    setOpenDelete(false);
  };

  const handleClickDeleteUser = (userId) => {
    // const bn = users.find((user) => user._id === userId);
    const bn = users.find((user) => String(user._id) === String(userId));
    dispatch(setUserCurent(bn));
    setOpenDelete(true);
  };
  const handleDeleteUser = () => {
    if (userCurrent && userCurrent._id) {
      dispatch(deleteUser(userCurrent._id)); // Sử dụng _id từ userCurrent để xóa
      setOpenDelete(false);
    }
  };
  const handleResetPass = (user) => {
    dispatch(setUserCurent(user));
    setOpenResetPass(true);
  };
  const data = useMemo(() => users, [users]);

  const columns = useMemo(
    () => [
      {
        Header: "Action",
        Footer: "Action",
        accessor: "action",
        disableGroupBy: true,
        sticky: "left",
        Cell: ({ row }) => (
          <Stack
            direction="row"
            alignItems="left"
            justifyContent="left"
            spacing={0}
          >
            {/* <UpdateHinhThucButton hinhthuccapnhat={row.original} />
              <DeleteHinhThucButton hinhthuccapnhatID={row.original._id} /> */}

            <Tooltip title="Đặt lại mật khẩu">
              <IconButton
                color="primary"
                onClick={() => handleResetPass(row.original)}
              >
                <Convert3DCube />
              </IconButton>
            </Tooltip>
            <Tooltip title="Sửa">
              <IconButton
                color="primary"
                onClick={() => handleEditUser(row.original)}
              >
                <Edit />
              </IconButton>
            </Tooltip>

            <Tooltip title="Xóa">
              <IconButton
                color="error"
                onClick={() => handleClickDeleteUser(row.original._id)}
              >
                <Trash />
              </IconButton>
            </Tooltip>
          </Stack>
        ),
      },

      {
        Header: "UserName",
        Footer: "UserName",

        accessor: "UserName",
        disableGroupBy: true,
      },
      {
        Header: "Họ tên",
        Footer: "Họ tên",

        accessor: "HoTen",
        disableGroupBy: true,
      },
      {
        Header: "Khoa",
        Footer: "Khoa",

        accessor: "TenKhoa",
        disableGroupBy: true,
      },
      {
        Header: "Phân quyền",
        Footer: "Phân quyền",

        accessor: "PhanQuyen",
        disableGroupBy: true,
      },
      {
        Header: "User His",
        Footer: "User His",

        accessor: "UserHis",
        disableGroupBy: true,
      },
      // {
      //   Header: "NhanVienID",
      //   Footer: "NhanVienID",

      //   accessor: "NhanVienID",
      //   disableGroupBy: true,
      // },
      {
        Header: "_ID",
        Footer: "_ID",

        accessor: "_id",
        disableGroupBy: true,
      },
    ],
    []
  );

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} lg={12}>
        <MainCard title={`Danh sách tài khoản 
          người dùng`}>
          <SimpleTable
            data={data}
            columns={columns}
            additionalComponent={<AddUserButton />}
          />
        </MainCard>
      </Grid>
      <UserInsertForm open={openEdit} handleClose={handleCloseEditForm} />
      <ResetPassForm
        open={openResetPass}
        handleClose={handleCloseResetPassForm}
      />

      <Dialog
        open={openDelete}
        onClose={handleCloseDeleteForm}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Cảnh báo!"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Bạn có chắc muốn xóa người dùng này?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={handleCloseDeleteForm}
            color="primary"
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleDeleteUser}
            color="error"
            autoFocus
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}

export default UserThemeAbleTable;
