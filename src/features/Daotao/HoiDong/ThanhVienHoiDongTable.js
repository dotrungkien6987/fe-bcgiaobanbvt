import { Box, Button, Card, Stack, Typography } from "@mui/material";
import { getAllNhanVien } from "features/NhanVien/nhanvienSlice";

import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import StickyTable from "sections/react-table/StickyTable";




import SaveIcon from "@mui/icons-material/Save";

import { insertOrUpdateLopDaoTaoNhanVien } from "../daotaoSlice";

import { formatDate_getDate } from "utils/formatTime";

import useAuth from "hooks/useAuth";
import DongBoHocViensTamButton from "../ChonHocVien/DongBoHocViensTamButton";
import SelectHocVienForm from "../ChonHocVien/SelectHocVienForm";
import SelectVaiTro from "../ChonHocVien/SelectVaiTro";
import RemoveHocVienTrongLop from "../ChonHocVien/RemoveHocVienTrongLop";
function ThanhVienHoiDongTable({ setSelectedRows }) {
 
  const columns = useMemo(
    () => [
      {
        Header: "_id",
        Footer: "Action",
        accessor: "_id",
        disableGroupBy: true,
        sticky: "left",
        Cell: ({ row }) => (
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            spacing={0}
          >
            <RemoveHocVienTrongLop nhanvienID={row.original._id} />
          </Stack>
        ),
      },
      {
        Header: "Vai trò",
        Footer: "Vai trò",
        accessor: "VaiTro",
        className: "cell-center",
        disableGroupBy: true,
        // sticky: 'left',
        // Cell: ({ value }) => <Avatar alt="Avatar 1" size="sm" src={avatarIma(`./avatar-${!value ? 1 : value}.png`)} />
      },
      {
        Header: "Mã NV",
        Footer: "Mã NV",
        accessor: "MaNhanVien",
        className: "cell-center",
        disableGroupBy: true,
        // sticky: 'left',
        // Cell: ({ value }) => <Avatar alt="Avatar 1" size="sm" src={avatarIma(`./avatar-${!value ? 1 : value}.png`)} />
      },
      {
        Header: "Họ Tên",
        Footer: "Họ Tên",

        accessor: "Ten",
        disableGroupBy: true,
      },
      {
        Header: "Tên khoa",
        Footer: "Tên khoa",

        accessor: "TenKhoa",
        disableGroupBy: true,
      },
      {
        Header: "Giới tính",
        Footer: "Giới tính",

        accessor: "Sex",
        aggregate: "count",
        // disableGroupBy: true,
      },
      {
        Header: "Ngày sinh",
        Footer: "Ngày sinh",

        accessor: "NgaySinh",

        disableGroupBy: true,
        Cell: ({ value }) => formatDate_getDate(value),
      },
    ],
    []
  );

  const dispatch = useDispatch();
  
  const { hocvienCurrents } = useSelector(
    (state) => state.daotao
  );
  const {nhanviens  } = useSelector(
    (state) => state.nhanvien
  );
  useEffect(() => {
    // Gọi hàm để lấy danh sách cán bộ khi component được tạo
    
    if (nhanviens.length === 0) dispatch(getAllNhanVien());
  }, []);

  const data = useMemo(() => hocvienCurrents, [hocvienCurrents]);
  return (
    <Card variant="outlined" sx={{ p: 1 }}>
      <Stack direction="row" mb={2}>
        <Typography fontSize={18} fontWeight={"bold"}>
          {" "}
          Danh sách học viên trong lớp
        </Typography>
        <Box sx={{ flexGrow: 1 }}></Box>
      
      </Stack>

      

      <StickyTable
        data={data}
        columns={columns}
        setSelectedRows={setSelectedRows}
        sx={{ height: 598 }}
        additionalComponent={
          <Stack direction="row" spacing={1}>
          
            <SelectHocVienForm isHoiDong= {true}/>
            <SelectVaiTro isHoiDong= {true}/>
          </Stack>
        }
      />
    </Card>
  );
}

export default ThanhVienHoiDongTable;
