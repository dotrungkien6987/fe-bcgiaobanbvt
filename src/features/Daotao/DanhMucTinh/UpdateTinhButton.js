import { Button, IconButton, Stack, Tooltip } from "@mui/material";
import React, { useEffect, useState } from "react";

import { Edit } from "iconsax-react";

import TinhForm from "./TinhForm";

function UpdateTinhButton({ index }) {
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
      <TinhForm
        open={openForm}
        handleClose={() => setOpenForm(false)}
        index={index}
      />
    </div>
  );
}

export default UpdateTinhButton;
