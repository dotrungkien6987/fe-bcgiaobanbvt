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
  Stack,
  Container,
} from "@mui/material";

import { useDispatch, useSelector } from "react-redux";
import { fDate } from "../../utils/formatTime";
import { useNavigate } from "react-router-dom";
import { UpdateTrangThaiSuCo, deleteOneSuCo } from "./baocaosucoSlice";
import MyReactTable from "../../components/MyAble-Component/MyReactTable";
import Basic from "pages/tables/react-table/basic";
import UmbrellaTable from "pages/tables/react-table/umbrella";

// import ColumnHiding from "../../pages/tables/react-table/column-hiding";

function DSSuCoTable() {
  const { khoas } = useSelector((state) => state.baocaongay);
  const { baocaosucos } = useSelector((state) => state.baocaosuco);
  const [selectedSuCoId, setSelectedSuCoId] = useState("");
  const [userEdit, setUserEdit] = useState({ _id: 0 });
  const handleEditUser = (userId) => {
    setOpenEdit(true);
  };

  const handleDeleteSuCo = (sucoId) => {
    setSelectedSuCoId(sucoId);
    setOpenDelete(true);
  };
  const handleCloseDeleteForm = () => {
    setOpenDelete(false);
  };
  const dispatch = useDispatch();
  const handleDeleteSuCoOnDB = () => {
    dispatch(deleteOneSuCo(selectedSuCoId));
    setOpenDelete(false);
  };

  const handleResetPass = (userId) => {
    // const bn= users.find(user=>user._id === userId)
    // console.log("user suwar",userEdit)
    // setUserEdit(bn)
    setOpenResetPass(true);
  };

  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openResetPass, setOpenResetPass] = useState(false);

  const handleCloseEditForm = () => {
    setOpenEdit(false);
  };
  const handleSaveEditForm = () => {
    console.log("handleSaveEdit form");
  };

  const handleChangeTrangThai = (bcsuco) => {
    const sucoId = bcsuco._id;
    const trangthai = !(bcsuco.TrangThai||false)
    dispatch(UpdateTrangThaiSuCo(sucoId,trangthai))
  };
  const handleSaveResetPassForm = () => {
    console.log("handle reset pass form");
  };
  const handleTiepNhanSuCo=()=>{
    
  } 
  const navigate = useNavigate();
  return (
    <Stack sx={{ overflowX: "auto" }}>

      {/* <MyReactTable/> */}
{/* <Basic/> */}
<UmbrellaTable />
      {/* <ColumnHiding/> */}
      
      <TableContainer>
        {/* <TableContainer sx={{ minWidth: 800 }}> */}
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: { xs: "8%", sm: "8%" } }}>
                Mã sự cố
              </TableCell>
              <TableCell
                sx={{ display: { xs: "none", sm: "table-cell" }, width: "10%" }}
              >
                Ngày sự cố
              </TableCell>

              <TableCell
                sx={{ display: { xs: "none", md: "table-cell" }, width: "15%" }}
              >
                Khoa
              </TableCell>
              <TableCell
                sx={{ display: { xs: "none", md: "table-cell" }, width: "45%" }}
              >
                Mô tả sự cố
              </TableCell>

              <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {baocaosucos.map((bcsuco) => {
              //   const { status, action } = getActionsAndStatus(bcsuco);

              return (
                <TableRow key={bcsuco._id} hover>
                  <TableCell
                    align="left"
                    // sx={{ display: { xs: "none", md: "table-cell" } }}
                    // sx={{ display: { xs: "none", md: "table-cell" } }}
                  >
                    {bcsuco.MaBC}
                  </TableCell>
                  <TableCell
                    align="left"
                    sx={{ display: { xs: "none", md: "table-cell" } }}
                  >
                    {fDate(bcsuco.NgaySuCo)}
                  </TableCell>
                  <TableCell
                    align="left"
                    sx={{ display: { xs: "none", sm: "table-cell" } }}
                  >
                    {bcsuco.KhoaSuCo.TenKhoa}
                  </TableCell>
                  <TableCell
                    align="left"
                    sx={{ display: { xs: "none", sm: "table-cell" } }}
                  >
                    {bcsuco.MoTa}
                  </TableCell>
                  <TableCell
                    align="left"
                    // sx={{ display: { xs: "none", sm: "table-cell" } }}
                  >
                    <Stack direction={"row"} spacing={0.1} mb={0.5}>
                      <Button
                        sx={{ fontSize: "0.6rem" }}
                        size="small"
                        variant="contained"
                        onClick={() => navigate(`../suco/${bcsuco._id}`)}
                      >
                        Sửa
                      </Button>
                      <Button
                        sx={{ fontSize: "0.6rem" }}
                        size="small"
                        variant="contained"
                        color="error"
                        onClick={() => handleDeleteSuCo(bcsuco._id)}
                      >
                        Xóa
                      </Button>



                      <Button
                        sx={{ fontSize: "0.6rem" }}
                        size="small"
                        variant="contained"
                        //   color="error"
                        onClick={() => handleChangeTrangThai(bcsuco)}
                      >
                        {bcsuco.TrangThai===true?"Hủy tiếp nhận":"Tiếp nhận"}
                      </Button>

                    </Stack>
                    <Stack>
                      <Button
                        sx={{ fontSize: "0.6rem" }}
                        size="small"
                        variant="contained"
                        //   color="error"
                        onClick={() => navigate(`../phantich/${bcsuco._id}`)}
                      >
                        Tiếp nhận & Phân tích
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={openDelete}
        onClose={handleCloseDeleteForm}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Cảnh báo!"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Bạn có chắc muốn xóa sự cố này?
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
            onClick={handleDeleteSuCoOnDB}
            color="error"
            autoFocus
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

    </Stack>
  );
}

export default DSSuCoTable;
