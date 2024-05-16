import React, { useState } from "react";
import {
  Table,
  TableHead,
  
  TableRow,
  TableBody,
  TableCell,
  
  TableContainer,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";


import UserInsertForm from "./UserInsertForm";
import ResetPassForm from "./ResetPassForm";
import { useDispatch, useSelector } from "react-redux";
import { deleteUser, setKhoaTaiChinhCurent } from "./userSlice";
import { addTenKhoaToUsers } from "../../utils/heplFuntion";


function UserTable({ users }) {
  const {khoas} = useSelector((state)=>state.baocaongay)
  const updateUser = addTenKhoaToUsers(users,khoas)
    const [userEdit,setUserEdit] =useState({_id:0})
    const dispatch = useDispatch()
const handleEditUser =async(userId)=>{
    const bn= users.find(user=>user._id === userId)
    await dispatch(setKhoaTaiChinhCurent(bn.KhoaTaiChinh))
    console.log("user suwar",userEdit)
    setUserEdit(bn)
    setOpenEdit(true)
console.log(userId)
}

const handleClickDeleteUser =(userId)=>{
  const bn= users.find(user=>user._id === userId)
  setUserEdit(bn)
  setOpenDelete(true)
}
const handleCloseDeleteForm =()=>{
  setOpenDelete(false)
}

const handleDeleteUser =()=>{
 dispatch(deleteUser(userEdit._id))
setOpenDelete(false)
}

const handleResetPass =(userId)=>{
    const bn= users.find(user=>user._id === userId)
    console.log("user suwar",userEdit)
    setUserEdit(bn)
    setOpenResetPass(true)
console.log(userId)
}


const [openDelete, setOpenDelete] = useState(false);
const [openEdit, setOpenEdit] = useState(false);
const [openResetPass, setOpenResetPass] = useState(false);

  const handleCloseEditForm = ()=>{
    setOpenEdit(false);
  }
  const handleSaveEditForm = ()=>{
    console.log("handleSaveEdit form")
  } 

  const handleCloseResetPassForm = ()=>{
    setOpenResetPass(false);
  }
  const handleSaveResetPassForm = ()=>{
    console.log("handle reset pass form")
  } 
  return (
    <Box sx={{ overflowX: "auto" }}>
      <TableContainer >
      {/* <TableContainer sx={{ minWidth: 800 }}> */}
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: { xs: "20%", sm: "25%" } }}>
                UserName
              </TableCell>
              <TableCell
                sx={{ display: { xs: "none", sm: "table-cell" }, width: "20%" }}
              >
                Họ tên
              </TableCell>

              <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                Khoa
              </TableCell>
              <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                Phân quyền
              </TableCell>
             
              <TableCell  sx={{ display: { xs: "none", md: "table-cell" } }}>Action</TableCell>
              
            </TableRow>
          </TableHead>
          <TableBody>
            {updateUser.map((user) => {
            //   const { status, action } = getActionsAndStatus(user);
             
              return (
                <TableRow key={user._id} hover>
                
                  <TableCell
                    align="left"
                    // sx={{ display: { xs: "none", md: "table-cell" } }}
                    // sx={{ display: { xs: "none", md: "table-cell" } }}
                  >
                    {user.UserName}
                  </TableCell>
                  <TableCell
                    align="left"
                    sx={{ display: { xs: "none", md: "table-cell" } }}
                  >
                    {user.HoTen}
                  </TableCell>
                  <TableCell
                    align="left"
                    sx={{ display: { xs: "none", sm: "table-cell" } }}
                  >
                     {user.TenKhoa}
                  </TableCell>
                  <TableCell
                    align="left"
                    sx={{ display: { xs: "none", sm: "table-cell" } }}
                  >
                     {user.PhanQuyen}
                  </TableCell>
                  <TableCell
                    align="left"
                    // sx={{ display: { xs: "none", sm: "table-cell" } }}
                  >
                     <Button
      sx={{ fontSize: "0.6rem" }}
      size="small"
      variant="contained"
      onClick={()=> (handleEditUser(user._id))}
    >
      Sửa
    </Button>
    <Button
      sx={{ fontSize: "0.6rem" }}
      size="small"
      variant="contained"
      color="error"
     onClick={()=> (handleClickDeleteUser(user._id))}
    >
      Xóa
    </Button>

    <Button
      sx={{ fontSize: "0.6rem" }}
      size="small"
      variant="contained"
    //   color="error"
     onClick={()=> (handleResetPass(user._id))}
    >
      Reset Pass
    </Button>

                  </TableCell>
                  
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <UserInsertForm
            open={openEdit}
            handleClose={handleCloseEditForm}
            handleSave={handleSaveEditForm}
           user ={userEdit}
          />
      <ResetPassForm
            open={openResetPass}
            handleClose={handleCloseResetPassForm}
            handleSave={handleSaveResetPassForm}
           user ={userEdit}
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
              Bạn có chắc muốn xóa bệnh nhân này?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button variant ="contained" onClick={handleCloseDeleteForm} color="primary">
              Hủy
            </Button>
            <Button variant ="contained" onClick={handleDeleteUser} color="error" autoFocus>
              Xóa
            </Button>
          </DialogActions>
        </Dialog>
    </Box>
  );
}

export default UserTable;
