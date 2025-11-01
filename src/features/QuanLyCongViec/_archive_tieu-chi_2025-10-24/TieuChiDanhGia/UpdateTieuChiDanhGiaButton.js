import React, { useState } from "react";
import IconButton from "components/@extended/IconButton";
import { Edit } from "iconsax-react";
import { Tooltip } from "@mui/material";
import ThongTinTieuChiDanhGia from "./ThongTinTieuChiDanhGia";

function UpdateTieuChiDanhGiaButton({ tieuChi }) {
  const [openDialog, setOpenDialog] = useState(false);

  return (
    <>
      <Tooltip title="Sửa">
        <IconButton
          color="primary"
          onClick={(e) => {
            e.stopPropagation();
            setOpenDialog(true);
          }}
        >
          <Edit />
        </IconButton>
      </Tooltip>

      <ThongTinTieuChiDanhGia
        open={openDialog}
        handleClose={() => setOpenDialog(false)}
        tieuChi={tieuChi}
      />
    </>
  );
}

export default UpdateTieuChiDanhGiaButton;
