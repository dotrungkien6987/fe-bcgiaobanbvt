import { IconButton, Tooltip } from "@mui/material";
import React, { useState } from "react";

import { Edit } from "iconsax-react";

import QuocGiaForm from "./QuocGiaForm";

function UpdateQuocGiaButton({ index }) {
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
      <QuocGiaForm
        open={openForm}
        handleClose={() => setOpenForm(false)}
        index={index}
      />
    </div>
  );
}

export default UpdateQuocGiaButton;
