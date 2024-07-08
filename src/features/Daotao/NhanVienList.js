import { Grid, Stack } from '@mui/material';
import { getAllNhanVien } from 'features/NhanVien/nhanvienSlice';
import UmbrellaTable from 'pages/tables/react-table/umbrella';
import React, { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import UpdateNhanVienButton from './UpdateNhanVienButton';
import DeleteNhanVienButton from './DeleteNhanVienButton';

function NhanVienList() {
  
  const columns = useMemo(
    () => [
    
      {
        Header: '_id',
        Footer: 'Action',
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
        Footer: 'Mã NV',
        accessor: 'MaNhanVien',
        className: 'cell-center',
        disableGroupBy: true,
        // sticky: 'left',
        // Cell: ({ value }) => <Avatar alt="Avatar 1" size="sm" src={avatarIma(`./avatar-${!value ? 1 : value}.png`)} />
      },
      {
        Header: 'Họ Tên',
        Footer: 'Họ Tên',
        
        accessor: 'Ten',
        disableGroupBy: true,
      },
      {
        Header: 'Giới tính',
        Footer: 'Giới tính',
      
        accessor: 'GioiTinh',
        aggregate: 'count',
        // disableGroupBy: true,
      },
      {
        Header: 'Ngày sinh',
        Footer: 'Ngày sinh',
       
        accessor: 'NgaySinh',
      
        disableGroupBy: true,
        Cell:({value})=> new Date(value).toDateString()
      },
      {
        Header: 'Phân loại',
        Footer: 'Phân loại',
       
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
        disableGroupBy: true,
      },
      {
        Header: 'Email',
        Footer: 'Email',
        
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
    
    <Grid item xs={12} lg={12}>
      <UmbrellaTable title="MyReactTable Table" data={data} columns={columns}/>
    </Grid>
    
    
  </Grid>
  )
}

export default NhanVienList