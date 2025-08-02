import { IconButton, Tooltip } from "@mui/material";
import React, { useState } from "react";
import { Edit } from "iconsax-react";
import ThongTinNhomViecUser from "./ThongTinNhomViecUser";

function UpdateNhomViecUserButton({ nhomViecUser }) {
  const [openForm, setOpenForm] = useState(false);

  const handleUpdate = () => {
    setOpenForm(true);
  };

  return (
    <div>
      <Tooltip title="Sửa">
        <IconButton color="primary" onClick={handleUpdate}>
          <Edit />
        </IconButton>
      </Tooltip>

      <ThongTinNhomViecUser
        open={openForm}
        handleClose={() => setOpenForm(false)}
        nhomViecUser={nhomViecUser}
      />
    </div>
  );
}

export default UpdateNhomViecUserButton;
