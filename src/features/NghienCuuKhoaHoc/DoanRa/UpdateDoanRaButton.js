import React, { useState } from "react";
import { Button } from "@mui/material";
import { useDispatch } from "react-redux";
import { getDoanRas } from "./doanraSlice";
import { Edit } from "iconsax-react";
import DoanRaForm from "./DoanRaForm";

function UpdateDoanRaButton({ doanRaID }) {
  const dispatch = useDispatch();
  const [openForm, setOpenForm] = useState(false);

  const handleOpenForm = () => {
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
  };

  const handleSuccess = () => {
    // Refresh danh sách sau khi cập nhật thành công
    dispatch(getDoanRas());
  };

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
