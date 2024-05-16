import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';

import {
  Stack,
  Typography,
  Card,
  Box,
  TablePagination,
  Container,
  Button,
} from "@mui/material";
// import SearchInput from '../../components/SearchInput';
import UserTable from '../features/User/UserTable';
import SearchInput from '../components/SearchInput';
import { getUsers, setKhoaTaiChinhCurent } from '../features/User/userSlice';

import UserInsertForm from '../features/User/UserInsertForm';
// import UserTable from './UserTable';

function AdminPage() {
  const [filterName, setFilterName] = useState("");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(100);
  const {users} =useSelector((state)=>state.user)
  
  // const { currentPageUsers, usersById, totalUsers } = useSelector(
  //   (state) => state.friend
  // );
  // const users = currentPageUsers.map((userId) => usersById[userId]);
const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getUsers({ filterName, page: page + 1, limit: rowsPerPage }));
  }, [filterName, page, rowsPerPage, dispatch]);
const {totalUsers} =useSelector((state)=>state.user)
  const handleSubmit = (searchQuery) => {
    setFilterName(searchQuery);
  };
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const [openEdit, setOpenEdit] = useState(false);

  const handleOpenEditForm = async()=>{
    await dispatch(setKhoaTaiChinhCurent([]))
    setOpenEdit(true);
  }
  const handleCloseEditForm = ()=>{
    setOpenEdit(false);
  }
  const handleSaveEditForm = ()=>{
    console.log("handleSaveEdit form")
  }

  return (
    <Container>
      <Typography variant="h4" sx={{ mb: 3 }}>
       Quản lý người dùng
      </Typography>
      <Card sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Stack direction={{ xs: "column", md: "row" }} alignItems="center">
            <SearchInput handleSubmit={handleSubmit} />

            <Typography
              variant="subtitle"
              sx={{ color: "text.secondary", ml: 1 }}
            >
              {totalUsers > 1
                ? `${totalUsers} users found`
                : totalUsers === 1
                ? `${totalUsers} user found`
                : "No user found"}
            </Typography>
           
            <Box sx={{ flexGrow: 1 }} />
           
            <TablePagination
              sx={{
                "& .MuiTablePagination-selectLabel, .MuiTablePagination-select, .MuiTablePagination-selectIcon":
                  {
                    display: { xs: "none", md: "block" },
                  },
              }}
              component="div"
              count={totalUsers ? totalUsers : 0}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
             <Button variant="contained" onClick={()=>handleOpenEditForm()} >
            Thêm
          </Button>
          <UserInsertForm
            open={openEdit}
            handleClose={handleCloseEditForm}
            handleSave={handleSaveEditForm}
           user ={{_id:0,PhanQuyen:'nomal'}}
          />
          </Stack>
          <UserTable users={users} />
        </Stack>
      </Card>
    </Container>
  )
}

export default AdminPage