import { Stack } from '@mui/material';
import MyReactTable from 'components/MyAble-Component/MyReactTable';
import DeleteNhanVienButton from 'features/Daotao/DeleteNhanVienButton';
import UpdateNhanVienButton from 'features/Daotao/UpdateNhanVienButton';
import { getAllNhanVien } from 'features/NhanVien/nhanvienSlice';
import React, { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux';

function QuanLyHocVienPage() {
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
    <div>
      <MyReactTable title="MyReactTable Table" data={data} columns={columns}/>
    </div>
  )
}

export default QuanLyHocVienPage
