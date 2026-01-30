import { Chip, Grid, Stack } from "@mui/material";
import MainCard from "components/MainCard";
import SimpleTable from "pages/tables/MyTable/SimpleTable";
import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import AddKhoaButton from "./AddKhoaButton";
import UpdateKhoaButton from "./UpdateKhoaButton";
import DeleteKhoaButton from "./DeleteKhoaButton";
import { getAllKhoa } from "./khoaSlice";

function KhoaTable() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllKhoa());
  }, [dispatch]);

  const { Khoa } = useSelector((state) => state.khoa);

  const data = useMemo(() => Khoa, [Khoa]);

  const getLoaiKhoaLabel = (loaiKhoa) => {
    const loaiKhoaOptions = {
      kcc: "Khoa cấp cứu",
      kkb: "Khoa khám bệnh",
      noi: "Nội",
      ngoai: "Ngoại",
      cskh: "Chăm sóc khách hàng",
      gmhs: "Gây mê hồi sức",
      cdha: "Chẩn đoán hình ảnh",
      tdcn: "Thăm dò chức năng",
      clc: "Chất lượng cao",
      xn: "Xét nghiệm",
      hhtm: "Huyết học truyền máu",
      pkyc: "Phòng khám yêu cầu",
      khac: "Khác",
    };

    return loaiKhoaOptions[loaiKhoa] || loaiKhoa;
  };

  const columns = useMemo(
    () => [
      {
        Header: "Thao tác",
        Footer: "Thao tác",
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
            <UpdateKhoaButton khoa={row.original} />
            <DeleteKhoaButton khoaID={row.original._id} />
          </Stack>
        ),
      },
      {
        Header: "STT",
        Footer: "STT",
        accessor: "STT",
        disableGroupBy: true,
      },
      {
        Header: "Mã khoa",
        Footer: "Mã khoa",
        accessor: "MaKhoa",
        disableGroupBy: true,
      },
      {
        Header: "Tên khoa",
        Footer: "Tên khoa",
        accessor: "TenKhoa",
        disableGroupBy: true,
      },
      {
        Header: "Loại khoa",
        Footer: "Loại khoa",
        accessor: "LoaiKhoa",
        disableGroupBy: true,
        Cell: ({ value }) => getLoaiKhoaLabel(value),
      },
      {
        Header: "ISO",
        Footer: "ISO",
        accessor: "IsISORelevant",
        disableGroupBy: true,
        Cell: ({ value }) =>
          value ? (
            <Chip label="ISO" color="success" size="small" />
          ) : (
            <Chip label="-" color="default" size="small" variant="outlined" />
          ),
      },
      {
        Header: "HIS Department ID",
        Footer: "HIS Department ID",
        accessor: "HisDepartmentID",
        disableGroupBy: true,
      },
      {
        Header: "HIS Department Group ID",
        Footer: "HIS Department Group ID",
        accessor: "HisDepartmentGroupID",
        disableGroupBy: true,
      },
      {
        Header: "HIS Department Type",
        Footer: "HIS Department Type",
        accessor: "HisDepartmentType",
        disableGroupBy: true,
      },
    ],
    [],
  );

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} lg={12}>
        <MainCard title="Danh mục khoa">
          <SimpleTable
            data={data}
            columns={columns}
            additionalComponent={<AddKhoaButton />}
          />
        </MainCard>
      </Grid>
    </Grid>
  );
}

export default KhoaTable;
