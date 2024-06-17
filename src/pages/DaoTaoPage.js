import React, { useEffect, useMemo } from "react";
import {
  Stack,
  Typography,
  Card,
  Box,
  TablePagination,
  Container,
  Button,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import DaoTao_ThongTinCanBo from "../features/Daotao/DaoTao_ThongTinCanBo";
import { useDispatch, useSelector } from "react-redux";

import NhanVienTable from "./tables/react-table/NhanVienTable";
import { getAllNhanVien, setIsOpenUpdateNhanVien } from "features/NhanVien/nhanvienSlice";
import { IndeterminateCheckbox } from "components/third-party/ReactTable";
import UpdateNhanVienButton from "features/Daotao/UpdateNhanVienButton";
import DeleteNhanVienButton from "features/Daotao/DeleteNhanVienButton";
import ThongTinNhanVien from "features/Daotao/ThongTinNhanVien";
function DaoTaoPage() {
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
        Header: 'Mã NV',
        Footer: 'Mã NV',
        accessor: 'MaNhanVien',
        className: 'cell-center',
        sticky:'left',
        width: 50,
        disableSortBy: false,
        disableFilters: false,
        disableGroupBy: true,
        // Cell: ({ value }) => <Avatar alt="Avatar 1" size="sm" src={avatarIma(`./avatar-${!value ? 1 : value}.png`)} />
      },
      {
        Header: 'Họ Tên',
        Footer: 'Họ Tên',
        accessor: 'Ten',
        dataType: 'text',
        // disableGroupBy: true,
        aggregate: 'count',
        Aggregated: ({ value }) => `${value} nhân viên`
      },
      {
        Header: 'Giới tính',
        Footer: 'Giới tính',
        accessor: 'GioiTinh',
        dataType: 'text',
        filter: 'fuzzyText',
        disableGroupBy: true,
        // Cell:({value})=> new Date(value).toDateString()
      },
      {
        Header: 'Ngày sinh',
        Footer: 'Ngày sinh',
        accessor: 'NgaySinh',
        dataType: 'text',
        filter: 'fuzzyText',
        disableGroupBy: true,
        Cell:({value})=> new Date(value).toDateString()
      },
      {
        Header: 'Phân loại',
        Footer: 'Phân loại',
        accessor: 'Loai',
        dataType: 'text',
        filter: 'fuzzyText',
        disableGroupBy: true
      },
      {
        Header: 'Khoa',
        Footer: 'Khoa',
        accessor: 'KhoaID',
        dataType: 'TenKhoa',
        filter: 'fuzzyText',
        disableGroupBy: true
      },
      {
        Header: 'Trình độ chuyên môn',
        Footer: 'Trình độ chuyên môn',
        accessor: 'TrinhDoChuyenMon',
        dataType: 'text',
        filter: 'fuzzyText',
        disableGroupBy: true
      },
      {
        Header: 'Điện thoại',
        Footer: 'Điện thoại',
        accessor: 'SoDienThoai',
        dataType: 'text',
        filter: 'fuzzyText',
        disableGroupBy: true
      },
      {
        Header: 'Email',
        Footer: 'Email',
        accessor: 'Email',
        dataType: 'text',
        filter: 'fuzzyText',
        disableGroupBy: true
      },
    
     
    ],
    []
  );
 
  const dispatch = useDispatch();
 
  useEffect(() => {
    // Gọi hàm để lấy danh sách cán bộ khi component được tạo
    dispatch(getAllNhanVien());
    
  }, [dispatch]);
  const { nhanvienCurent,isOpenDeleteNhanVien,isOpenUpdateNhanVien } = useSelector((state) => state.nhanvien);
  const {nhanviens} = useSelector((state)=>state.nhanvien)
  const data = useMemo(() => nhanviens, [nhanviens]);
  return (
    <Stack direction="column" justifyContent="center">
      <Stack textAlign="center">
        <Typography variant="h4" sx={{ mb: 3 }}>
          Đào tạo
        </Typography>
      </Stack>

      <Accordion defaultExpanded>
        <AccordionSummary
          expandIcon={<ArrowDownwardIcon />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          <Container>
            <Grid
              container
              direction="row"
              justifyContent="left"
              alignItems="center"
              spacing={1}
            >
              <Grid item xs={1}>
                <Box>
                  <ManageAccountsIcon sx={{ width: 45, height: 45 }} />
                </Box>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="h6">Quản lý cán bộ</Typography>
              </Grid>
            </Grid>
          </Container>
        </AccordionSummary>
        <AccordionDetails>
          {/* <DaoTao_ThongTinCanBo /> */}
          <NhanVienTable data ={data} columns={columns}/>
        </AccordionDetails>
      </Accordion>
      
    </Stack>
  );
}

export default DaoTaoPage;
