import { Box, Button, Card, Stack, Typography } from "@mui/material";
import { getAllNhanVien } from "features/NhanVien/nhanvienSlice";

import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import StickyTable from "sections/react-table/StickyTable";

import SelectHocVienForm from "./SelectHocVienForm";
import SelectVaiTro from "./SelectVaiTro";
import RemoveHocVienTrongLop from "./RemoveHocVienTrongLop";
import SaveIcon from "@mui/icons-material/Save";

import {
  insertOrUpdateLopDaoTaoNhanVien,
  updateHoiDongForLopDaoTao,
} from "../daotaoSlice";

import { formatDate_getDate } from "utils/formatTime";
import DongBoHocViensTamButton from "./DongBoHocViensTamButton";
import useAuth from "hooks/useAuth";
import SelectHoiDong from "../HoiDong/ChonHoiDong/SelectHoiDong";

function HocVienLopTable({ setSelectedRows }) {
  const { user } = useAuth();
  const { hoidongCurrent, vaitroquydoiCurents } = useSelector(
    (state) => state.daotao
  );
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
  useEffect(() => {
    // Gọi hàm để lấy danh sách cán bộ khi component được tạo
    dispatch(getAllNhanVien());
  }, [dispatch]);

  const { hocvienCurrents, lopdaotaoCurrent } = useSelector(
    (state) => state.daotao
  );
  function validateHocVien(hocvienCurrents, vaitro) {
    // Bước 1: Kiểm tra NhanVienID trùng lặp
    const nhanVienIDSet = new Set();

    for (let i = 0; i < hocvienCurrents.length; i++) {
      const hocvien = hocvienCurrents[i];

      if (nhanVienIDSet.has(hocvien.NhanVienID)) {
        return {
          value: false,
          message: `Trùng NhanVienID: ${hocvien.Ten} có NhanVienID: ${hocvien.NhanVienID}`,
        };
      }
      nhanVienIDSet.add(hocvien.NhanVienID);
    }

    // Bước 2: Kiểm tra VaiTro có hợp lệ không
    const validVaiTroSet = new Set(vaitro.map((item) => item.VaiTro));

    for (let i = 0; i < hocvienCurrents.length; i++) {
      const hocvien = hocvienCurrents[i];

      if (!validVaiTroSet.has(hocvien.VaiTro)) {
        return {
          value: false,
          message: `Vai trò không hợp lệ cho: ${hocvien.Ten} với vai trò: ${hocvien.VaiTro}`,
        };
      }
    }

    // Nếu tất cả điều kiện đều thỏa mãn
    return {
      value: true,
      message: "",
    };
  }

  const handleClickSave = () => {
    //validate dữ liệu trước khi lưu
    const check = validateHocVien(hocvienCurrents, vaitroquydoiCurents);
    if (!check.value) {
      alert(check.message);
      return;
    }
    //Validate đối với DDT06 chỉ có 1 học viên
    if (
      lopdaotaoCurrent.MaHinhThucCapNhat?.startsWith("ĐT06") &&
      hocvienCurrents.length > 1
    ) {
      alert("Lớp đào tạo sau đại học chỉ được phép có một học viên .");
      return;
    }
    if (
      lopdaotaoCurrent &&
      lopdaotaoCurrent._id &&
      lopdaotaoCurrent._id !== 0
    ) {
      const lopdaotaonhanvienData = hocvienCurrents.map((hv) => ({
        LopDaoTaoID: lopdaotaoCurrent._id,
        NhanVienID: hv.NhanVienID,
        VaiTro: hv.VaiTro,
      }));
      if (hoidongCurrent !== "0")
        dispatch(
          updateHoiDongForLopDaoTao({
            hoidongID: hoidongCurrent,
            lopdaotaoID: lopdaotaoCurrent._id,
          })
        );
      else
        dispatch(
          updateHoiDongForLopDaoTao({
            hoidongID: null,
            lopdaotaoID: lopdaotaoCurrent._id,
          })
        );
      dispatch(
        insertOrUpdateLopDaoTaoNhanVien({
          lopdaotaonhanvienData,
          lopdaotaoID: lopdaotaoCurrent._id,
        })
      );
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
        <SelectHoiDong />
        {lopdaotaoCurrent &&
          lopdaotaoCurrent._id &&
          lopdaotaoCurrent._id !== 0 &&
          user._id === lopdaotaoCurrent.UserIDCreated && (
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleClickSave}
            >
              Lưu thành viên tham gia
            </Button>
          )}
      </Stack>

      <StickyTable
        data={data}
        columns={columns}
        setSelectedRows={setSelectedRows}
        sx={{ height: 598 }}
        additionalComponent={
          <Stack direction="row" spacing={1}>
            {lopdaotaoCurrent &&
              lopdaotaoCurrent._id &&
              (lopdaotaoCurrent.MaHinhThucCapNhat?.startsWith("ĐT") ? (
                <DongBoHocViensTamButton lopdaotaoID={lopdaotaoCurrent._id} />
              ) : (
                <></>
              ))}
            <SelectHocVienForm />
            <SelectVaiTro />
          </Stack>
        }
      />
    </Card>
  );
}

export default HocVienLopTable;
