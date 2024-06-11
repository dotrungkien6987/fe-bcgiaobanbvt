import React, { useEffect, useMemo, useState } from "react";
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
import { UpdateTrangThaiSuCo, deleteOneSuCo, getBaoCaoSuCoForDataGrid } from "./baocaosucoSlice";
import MyReactTable from "../../components/MyAble-Component/MyReactTable";
import Basic from "pages/tables/react-table/basic";
import UmbrellaTable from "pages/tables/react-table/umbrella";
import Avatar from "components/@extended/Avatar";

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
  // const { baocaosucos } = useSelector((state) => state.baocaosuco);
  const data = useMemo(() => baocaosucos, [baocaosucos]);
  // const dispatch = useDispatch();
  useEffect(() => {
    
    dispatch(getBaoCaoSuCoForDataGrid('2023-09-30T17:00:00.000Z','2024-06-06T04:06:15.000Z','Tất cả'));
  }, [dispatch]);
  const columns = useMemo(
    () => [
      // {
      //   title: 'Row Selection',
      //   id: 'selection',
      //   Header: ({ getToggleAllPageRowsSelectedProps }) => <IndeterminateCheckbox indeterminate {...getToggleAllPageRowsSelectedProps()} />,
      //   Footer: '#',
      //   accessor: 'selection',
      //   groupByBoundary: true,
      //   Cell: ({ row }) => <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />,
      //   disableSortBy: true,
      //   disableFilters: true,
      //   disableGroupBy: true,
      //   Aggregated: () => null
      // },
      {
        Header: '_id',
        Footer: '_id',
        accessor: '_id',
        className: 'cell-center',
        sticky:'left',
        width: 50,
        disableFilters: true,
        disableGroupBy: true
      },
      {
        Header: 'Avatar',
        Footer: 'Avatar',
        accessor: 'avatar',
        className: 'cell-center',
        sticky:'left',
        width: 50,
        disableSortBy: true,
        disableFilters: true,
        disableGroupBy: true,
        // Cell: ({ value }) => <Avatar alt="Avatar 1" size="sm" src={avatarIma(`./avatar-${!value ? 1 : value}.png`)} />
      },
      {
        Header: 'Hình thức',
        Footer: 'Hình thức',
        accessor: 'HinhThuc',
        dataType: 'text',
        // disableGroupBy: true,
        aggregate: 'count',
        Aggregated: ({ value }) => `${value} Person`
      },
      {
        Header: 'Ngày sự cố',
        Footer: 'Ngày sự cố',
        accessor: 'NgaySuCo',
        dataType: 'object',
        filter: 'DateColumnFilter',
        disableGroupBy: true,
        // Cell:({value})=> new Date(value).toDateString()
      },
      {
        Header: 'Tên bệnh nhân',
        Footer: 'Tên bệnh nhân',
        accessor: 'TenBN',
        dataType: 'text',
        filter: 'fuzzyText',
        disableGroupBy: true
      },
      {
        Header: 'Tên khoa',
        Footer: 'Tên khoa',
        accessor: 'KhoaSuCo',
        dataType: 'TenKhoa',
        filter: 'fuzzyText',
        disableGroupBy: true
      },
      {
        Header: 'Mô tả sự cố',
        Footer: 'Mô tả sự cố',
        accessor: 'MoTa',
        dataType: 'text',
        filter: 'fuzzyText',
        disableGroupBy: true
      },
      {
        Header: 'Giải pháp',
        Footer: 'Giải pháp',
        accessor: 'GiaiPhap',
        dataType: 'text',
        filter: 'fuzzyText',
        disableGroupBy: true
      },
      {
        Header: 'Đánh giá nhóm sự cố',
        Footer: 'Đánh giá nhóm sự cố',
        accessor: 'ChiTietNhomSuCo',
        dataType: 'text',
        filter: 'fuzzyText',
        disableGroupBy: true
      },
      {
        Header: 'Đánh giá nguyên nhân',
        Footer: 'Đánh giá nguyên nhân',
        accessor: 'ChiTietNguyenNhan',
        dataType: 'text',
        filter: 'fuzzyText',
        disableGroupBy: true
      },
      {
        Header: 'Tổn thương NB',
        Footer: 'Tổn thương NB',
        accessor: 'TonThuongChiTiet',
        dataType: 'text',
        filter: 'fuzzyText',
        disableGroupBy: true
      },
      {
        Header: 'Hành động khắc phục',
        Footer: 'Hành động khắc phục',
        accessor: 'HanhDongKhacPhuc',
        dataType: 'text',
        filter: 'fuzzyText',
        disableGroupBy: true
      },
      // {
      //   Header: 'Father Name',
      //   Footer: 'Father Name',
      //   accessor: 'fatherName',
      //   dataType: 'text',
      //   disableGroupBy: true
      // },
      // {
      //   Header: 'Email',
      //   Footer: 'Email',
      //   accessor: 'email',
      //   dataType: 'text',
      //   disableGroupBy: true
      // },
      // {
      //   Header: 'Age',
      //   Footer: 'Age',
      //   accessor: 'age',
      //   dataType: 'text',

      //   className: 'cell-right',
      //   Filter: SliderColumnFilter,
      //   filter: 'equals',
      //   aggregate: 'average',
      //   Aggregated: ({ value }) => `${Math.round(value * 100) / 100} (avg)`
      // },
      // {
      //   Header: 'Role',
      //   Footer: 'Role',
      //   dataType: 'text',
      //   accessor: 'role',
      //   disableGroupBy: true
      // },
      // {
      //   Header: 'Contact',
      //   dataType: 'text',
      //   Footer: 'Contact',
      //   accessor: 'contact',
      //   disableGroupBy: true
      // },
      // {
      //   Header: 'Country',
      //   Footer: 'Country',
      //   accessor: 'country',
      //   dataType: 'text',
      //   disableGroupBy: true
      // },
      // {
      //   Header: 'Visits',
      //   accessor: 'visits',
      //   dataType: 'text',
      //   className: 'cell-right',
      //   Filter: NumberRangeColumnFilter,
      //   filter: 'between',
      //   disableGroupBy: true,
      //   aggregate: 'sum',
      //   Aggregated: ({ value }) => `${value} (total)`,
      //   Footer: (info) => {
      //     const { rows } = info;
      //     // only calculate total visits if rows change
      //     const total = useMemo(() => rows.reduce((sum, row) => row.values.visits + sum, 0), [rows]);

      //     return (
      //       <Typography variant="subtitle1">
      //         <NumericFormat value={total} displayType="text" thousandSeparator />
      //       </Typography>
      //     );
      //   }
      // },
      // {
      //   Header: 'Status',
      //   Footer: 'Status',
      //   accessor: 'status',
      //   dataType: 'select',
      //   Filter: SelectColumnFilter,
      //   filter: 'includes'
      // },
      // {
      //   Header: 'Profile Progress',
      //   Footer: 'Profile Progress',
      //   accessor: 'progress',
      //   Filter: SliderColumnFilter,
      //   dataType: 'progress',
      //   filter: filterGreaterThan,
      //   disableGroupBy: true,
      //   aggregate: roundedMedian,
      //   Aggregated: ({ value }) => `${value} (med)`
      // }
    ],
    []
  );

  const init = {
    filters: [{ id: 'status', value: '' }],
    hiddenColumns: ['id', 'role', 'contact', 'country', 'fatherName'],
    columnOrder: ['selection', 'avatar', 'lastName', 'firstName', 'email', 'age', 'visits', 'status', 'progress'],
    pageIndex: 0,
    pageSize: 5,
  }
  return (
    <Stack sx={{ overflowX: "auto" }}>

      {/* <MyReactTable/> */}
{/* <Basic/> */}
<UmbrellaTable data ={data} columns={columns} initialState={init}/>
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
