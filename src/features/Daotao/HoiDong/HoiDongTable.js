import {
  
  Grid,
  Stack,
 
} from "@mui/material";
import MainCard from "components/MainCard";

import SimpleTable from "pages/tables/MyTable/SimpleTable";

import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";


import { getAllHoiDong } from "features/NhanVien/hinhthuccapnhatSlice";
import AddHoiDongButton from "./AddHoiDongButton";
import UpdateHoiDongButton from "./UpdateHoiDongButton";
import DeleteHoiDongButton from "./DeleteHoiDongButton";

function HoiDongTable() {
  const dispatch = useDispatch();
  
  const { HoiDong } = useSelector(
    (state) => state.hinhthuccapnhat
  );
  useEffect(() => {
    dispatch(getAllHoiDong());
  }, [dispatch]);
  
  const data = useMemo(() => HoiDong, [HoiDong]);

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
              <UpdateHoiDongButton hoidong={row.original} />
              <DeleteHoiDongButton hoidongID={row.original._id} />
          </Stack>
        ),
      },

      {
        Header: "Tên hội đồng",
        Footer: "Tên hội đồng",

        accessor: "Ten",
        disableGroupBy: true,
      },
      
    ],
    []
  );

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} lg={12}>
        <MainCard
          title={`Danh mục hội đồng`}
        >
          <SimpleTable
            data={data}
            columns={columns}
            additionalComponent={<AddHoiDongButton />}
          />
        </MainCard>
      </Grid>
    </Grid>
  );
}

export default HoiDongTable;
