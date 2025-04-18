import { IconButton, Tooltip } from "@mui/material";
import React, { useState } from "react";
import { Edit } from "iconsax-react";
import KhoaForm from "./KhoaForm";

function UpdateKhoaButton({ khoa }) {
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
      <KhoaForm
        open={openForm}
        handleClose={() => setOpenForm(false)}
        khoa={khoa} 
      />
    </div>
  );
}

export default UpdateKhoaButton;