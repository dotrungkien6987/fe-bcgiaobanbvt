import {
  Box,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import MainCard from "components/MainCard";
import { getDataFix } from "features/NhanVien/nhanvienSlice";
import SimpleTable from "pages/tables/MyTable/SimpleTable";

import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import UpdateNhanVienButton from "./UpdateNhanVienButton";
import DeleteNhanVienButton from "./DeleteNhanVienButton";
import CommonTable from "pages/tables/MyTable/CommonTable";
import AddDataFixButton from "./AddDataFixButton";
import DeleteDataFixButton from "./DeleteDataFixButton";
import UpdateDataFixButton from "./UpdateDataFixButton";
import { useParams } from "react-router-dom";
import { el } from "date-fns/locale";

function DataFixTable() {
  const params = useParams();
  const name = params.field;
  console.log("name", name);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getDataFix());
  }, [dispatch]);
  const {
    VaiTro,
    ChucDanh,
    ChucVu,
    TrinhDoChuyenMon,
    NguonKinhPhi,
    NoiDaoTao,
    DonVi,
    HinhThucDaoTao,
DanToc,
PhamViHanhNghe,
  } = useSelector((state) => state.nhanvien);

  const data = useMemo(() => {
    if (name === "DonVi") {
      return DonVi;
    } else if (name === "VaiTro") {
      return VaiTro;
    } else if (name === "ChucDanh") {
      return ChucDanh;
    } else if (name === "ChucVu") {
      return ChucVu;
    } else if (name === "TrinhDoChuyenMon") {
      return TrinhDoChuyenMon;
    } else if (name === "NguonKinhPhi") {
      return NguonKinhPhi;
    } else if (name === "NoiDaoTao") {
      return NoiDaoTao;
    } else if (name === "HinhThucDaoTao") {
      return HinhThucDaoTao;
    } else if (name === "DanToc") {
      return DanToc;
    } else if (name === "PhamViHanhNghe") {
      return PhamViHanhNghe;
    }

    // Thêm các điều kiện khác nếu cần
    else {
      return []; // Trả về mảng rỗng hoặc giá trị mặc định nếu không khớp
    }
  }, [
    VaiTro,
    ChucDanh,
    ChucVu,
    TrinhDoChuyenMon,
    NguonKinhPhi,
    NoiDaoTao,
    DonVi,
    HinhThucDaoTao,
    DanToc,
    PhamViHanhNghe,
    name,
  ]); // Thêm name vào mảng phụ thuộc

  const title = (type) => {
    if (type === "DonVi") {
      return "Đơn vị";
    } else if (type === "VaiTro") {
      return "Vai trò";
    } else if (type === "ChucDanh") {
      return "Chức danh";
    } else if (type === "ChucVu") {
      return "Chức vụ";
    } else if (type === "TrinhDoChuyenMon") {
      return "Trình độ chuyên môn";
    } else if (type === "NguonKinhPhi") {
      return "Nguồn kinh phí";
    } else if (type === "NoiDaoTao") {
      return "Nơi đào tạo";
    } else if (type === "HinhThucDaoTao") {
      return "Hình thức đào tạo";
    } else if (type === "DanToc") {
      return "Dân tộc";
    } else if (type === "PhamViHanhNghe") {
      return "Phạm vi hành nghề";
    } 
    // Thêm các điều kiện khác nếu cần
    else {
      return ""; // Trả về mảng rỗng hoặc giá trị mặc định nếu không khớp
    }
  };
  const columns = useMemo(
    () => [
      {
        Header: "Action",
        Footer: "Action",
        accessor: "_id",
        disableGroupBy: true,
        sticky: "left",
        Cell: ({ row }) => (
          <Stack
            direction="row"
            alignItems="left"
            justifyContent="left"
            spacing={0}
          >
            <UpdateDataFixButton
              index={row.original.index}
              datafixField={name}
              datafixTitle={title(name)}
            />
            <DeleteDataFixButton
              index={row.original.index}
              datafixField={name}
              datafixTitle={title(name)}
            />
          </Stack>
        ),
      },

      {
        Header: "Index",
        Footer: "Index",

        accessor: "index",
        disableGroupBy: true,
      },
      {
        Header: title(name),
        Footer: title(name),

        accessor: name,
        disableGroupBy: true,
      },
    ],
    [name]
  );

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} lg={12}>
        <MainCard title={`Danh mục ${title(name)}`}>
          <SimpleTable
            data={data}
            columns={columns}
            additionalComponent={
              <AddDataFixButton
                datafixField={name}
                datafixTitle={title(name)}
              />
            }
          />
        </MainCard>
      </Grid>
    </Grid>
  );
}

export default DataFixTable;
