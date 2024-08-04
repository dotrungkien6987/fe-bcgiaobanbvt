import {
  Box,
  Button,
  Card,
  CardHeader,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { getAllNhanVien } from "features/NhanVien/nhanvienSlice";
import UmbrellaTable from "pages/tables/react-table/umbrella";
import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import UpdateNhanVienButton from "../UpdateNhanVienButton";
import DeleteNhanVienButton from "../DeleteNhanVienButton";
import MainCard from "components/MainCard";
import CommonTable from "pages/tables/MyTable/CommonTable";
import AddNhanVienButton from "../AddNhanVienButton";
import ExcelButton from "components/ExcelButton";
import StickyTable from "sections/react-table/StickyTable";
import AddHocVienToLop from "../AddHocVienToLop";
import SelectHocVienForm from "./SelectHocVienForm";
import SelectVaiTro from "./SelectVaiTro";
import RemoveHocVienTrongLop from "./RemoveHocVienTrongLop";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import { insertOrUpdateLopDaoTaoNhanVien } from "../daotaoSlice";
import ScrollX from "components/ScrollX";
function HocVienLopTable({ setSelectedRows }) {
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

        accessor: "GioiTinh",
        aggregate: "count",
        // disableGroupBy: true,
      },
      {
        Header: "Ngày sinh",
        Footer: "Ngày sinh",

        accessor: "NgaySinh",

        disableGroupBy: true,
        Cell: ({ value }) => new Date(value).toDateString(),
      },

      // {
      //   Header: 'Khoa',
      //   Footer: 'Khoa',
      //   accessor: 'KhoaID',
      //   dataType: 'TenKhoa',
      //   filter: 'fuzzyText',
      //   disableGroupBy: true
      // },
    ],
    []
  );

  const dispatch = useDispatch();
  useEffect(() => {
    // Gọi hàm để lấy danh sách cán bộ khi component được tạo
    dispatch(getAllNhanVien());
  }, [dispatch]);

  const { hocvienCurrents,lopdaotaoCurrent } = useSelector((state) => state.daotao);
  const handleClickSave = () => {
    if (lopdaotaoCurrent && lopdaotaoCurrent._id && lopdaotaoCurrent._id !== 0) {
      const lopdaotaonhanvienData = hocvienCurrents.map((hv) => ({
        LopDaoTaoID: lopdaotaoCurrent._id,
        NhanVienID: hv._id,
        VaiTro: hv.VaiTro,
      
      }));
      
      dispatch(insertOrUpdateLopDaoTaoNhanVien({lopdaotaonhanvienData,lopdaotaoID:lopdaotaoCurrent._id}));
  } else {
      // Hiển thị thông báo cho người dùng
      alert("Vui lòng cập nhật thông tin lớp đào tạo hợp lệ trước.");
  }
   
    
  };
  const data = useMemo(() => hocvienCurrents, [hocvienCurrents]);
  return (
    <Card variant="outlined" sx={{ p: 1 }}>
      <Stack direction="row" mb={2}>
        <Typography fontSize={18} fontWeight={"bold"}>
          {" "}
          Danh sách học viên trong lớp
        </Typography>
        <Box sx={{ flexGrow: 1 }}></Box>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleClickSave}
        >
          Lưu thành viên tham gia
        </Button>
      </Stack>
      
      <StickyTable
        data={data}
        columns={columns}
        setSelectedRows={setSelectedRows}
        sx={{ height: 598 }}
        additionalComponent={
          <Stack direction="row">
            <SelectHocVienForm />
            <SelectVaiTro />
          </Stack>
        }
      />
    </Card>
  );
}

export default HocVienLopTable;
