import React, { useState } from "react";
import { Button } from "@mui/material";
import { Edit } from "iconsax-react";
import DoanRaForm from "./DoanRaForm";

function UpdateDoanRaButton({ doanRaID }) {
  const [openForm, setOpenForm] = useState(false);

  const handleOpenForm = () => {
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
  };

  const handleSuccess = () => {};

  return (
    <>
      <Button
        color="primary"
        size="small"
        onClick={handleOpenForm}
        startIcon={<Edit size={18} />}
      >
        Sửa
      </Button>

      <DoanRaForm
        open={openForm}
        onClose={handleCloseForm}
        doanRaId={doanRaID}
        onSuccess={handleSuccess}
      />
    </>
  );
}

export default UpdateDoanRaButton;
