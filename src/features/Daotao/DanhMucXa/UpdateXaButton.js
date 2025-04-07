import { Button, IconButton, Stack, Tooltip } from "@mui/material";
import React, { useEffect, useState } from "react";

import { Edit } from "iconsax-react";
import XaForm from "./XaForm";

function UpdateXaButton({ index }) {
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
      <XaForm
        open={openForm}
        handleClose={() => setOpenForm(false)}
        index={index}
      />
    </div>
  );
}

export default UpdateXaButton;
