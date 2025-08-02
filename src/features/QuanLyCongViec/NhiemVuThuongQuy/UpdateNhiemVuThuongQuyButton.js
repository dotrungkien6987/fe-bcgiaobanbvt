import React, { useState } from "react";
import { Tooltip } from "@mui/material";
import IconButton from "components/@extended/IconButton";
import { Edit } from "iconsax-react";
import ThongTinNhiemVuThuongQuy from "./ThongTinNhiemVuThuongQuy";

function UpdateNhiemVuThuongQuyButton({ nhiemvuThuongQuy }) {
  const [openDialog, setOpenDialog] = useState(false);

  return (
    <>
      <Tooltip title="Chỉnh sửa">
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

      <ThongTinNhiemVuThuongQuy
        open={openDialog}
        handleClose={() => setOpenDialog(false)}
        nhiemvuThuongQuy={nhiemvuThuongQuy}
      />
    </>
  );
}

export default UpdateNhiemVuThuongQuyButton;
