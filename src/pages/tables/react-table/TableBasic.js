import { useEffect, useMemo } from 'react';

// material-ui
import { Button, Chip, Grid, Stack } from '@mui/material';

// project-imports
// import BasicTable from 'sections/tables/react-table/BasicTable';
// import FooterTable from 'sections/tables/react-table/FooterTable';
import makeData from 'data/react-table';
import BasicTable from 'sections/react-table/BasicTable';
import FooterTable from 'sections/react-table/FooterTable';
import LinearWithLabel from 'components/@extended/progress/LinearWithLabel';
import { useDispatch, useSelector } from 'react-redux';
import { getAllNhanVien } from 'features/NhanVien/nhanvienSlice';
import { Data } from 'iconsax-react';
import UpdateNhanVienButton from 'features/Daotao/UpdateNhanVienButton';
import DeleteNhanVienButton from 'features/Daotao/DeleteNhanVienButton';
import SortingTable from './SorttingTable';
import FilteringTable from './FilteringTable';
import Grouping from './grouping';
import ColumnHiding from './ColumnHiding';
import ColumnResizing from './column-resizing';
import StickyTableData from './sticky';
import Sticky from './sticky';
import StickyTable from 'sections/react-table/StickyTable';
import PaginationTable from './pagination';
import MyReactTable from 'components/MyAble-Component/MyReactTable';

// ==============================|| REACT TABLE - BASIC ||============================== //

const TableBasic = () => {

  const columns = useMemo(
    () => [
    
      {
        Header: '_id',
      
        accessor: '_id',
        disableGroupBy: true,
        sticky: 'left',
       Cell:({row})=>(
        <Stack direction="row" alignItems="center" justifyContent="center" spacing={0}>
      <UpdateNhanVienButton nhanvien={row.original}/>
      <DeleteNhanVienButton nhanvienID = {row.original._id}/>
      </Stack>
      ),
      
      },
      {
        Header: 'Mã NV',
       
        accessor: 'MaNhanVien',
        className: 'cell-center',
        disableGroupBy: true,
        sticky: 'left',
        // Cell: ({ value }) => <Avatar alt="Avatar 1" size="sm" src={avatarIma(`./avatar-${!value ? 1 : value}.png`)} />
      },
      {
        Header: 'Họ Tên',
        
        accessor: 'Ten',
        disableGroupBy: true,
      },
      {
        Header: 'Giới tính',
      
        accessor: 'GioiTinh',
        // disableGroupBy: true,
      },
      {
        Header: 'Ngày sinh',
       
        accessor: 'NgaySinh',
      
        disableGroupBy: true,
        Cell:({value})=> new Date(value).toDateString()
      },
      {
        Header: 'Phân loại',
       
        accessor: 'Loai',
        disableGroupBy: true,
      },
      // {
      //   Header: 'Khoa',
      //   Footer: 'Khoa',
      //   accessor: 'KhoaID',
      //   dataType: 'TenKhoa',
      //   filter: 'fuzzyText',
      //   disableGroupBy: true
      // },
      {
        Header: 'Trình độ chuyên môn',
        accessor: 'TrinhDoChuyenMon',
        dataType: 'text',
        filter: 'fuzzyText',
        disableGroupBy: true
      },
      {
        Header: 'Điện thoại',
        
        accessor: 'SoDienThoai',
        disableGroupBy: true,
      },
      {
        Header: 'Email',
        
        accessor: 'Email',
        disableGroupBy: true,
      },
    
     
    ],
    []
  );

  const dispatch =useDispatch()
  useEffect(() => {
    // Gọi hàm để lấy danh sách cán bộ khi component được tạo
    dispatch(getAllNhanVien());
    
  }, [dispatch]);
  
  const {nhanviens} = useSelector((state)=>state.nhanvien)
  
  const data = useMemo(() => nhanviens, [nhanviens]);
  return (
    <Grid container spacing={3}>
      {/* <Grid item xs={12} lg={12}>
        <BasicTable title="TableBasic Table" data={data} columns={columns}/>
      </Grid>
      <Grid item xs={12} lg={12}>
        <SortingTable title="SortingTable Table" data={data} columns={columns}/>
      </Grid>
       */}
      {/* <Grid item xs={12} lg={12}>
        <FilteringTable title="FilteringTable Table" data={data} columns={columns}/>
      </Grid>
       */}
      {/* <Grid item xs={12} lg={12}>
        <Grouping title="Grouping Table" data={data} columns={columns}/>
      </Grid> */}
      {/* <Grid item xs={12} lg={12}>
        <ColumnHiding title="ColumnHiding Table" data={data} columns={columns}/>
      </Grid>
      
      <Grid item xs={12} lg={12}>
        <ColumnResizing title="ColumnResizing Table" data={data} columns={columns}/>
      </Grid>
      
      <Grid item xs={12} lg={12}>
        <StickyTable title="Sticky Table" data={data} columns={columns}/>
      </Grid>
      
      <Grid item xs={12} lg={12}>
        <PaginationTable title="PaginationTable Table" data={data} columns={columns}/>
      </Grid>
       */}
      <Grid item xs={12} lg={12}>
        <MyReactTable title="MyReactTable Table" data={data} columns={columns}/>
      </Grid>
      
      
    </Grid>
  );
};

export default TableBasic;
