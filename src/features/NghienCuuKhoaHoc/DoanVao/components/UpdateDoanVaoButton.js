import React from "react";
import { Button } from "@mui/material";
import { Edit } from "iconsax-react";

function UpdateDoanVaoButton({ doanVaoID, onOpen }) {
  const handleOpen = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (onOpen) onOpen(doanVaoID);
    else console.warn("UpdateDoanVaoButton: missing onOpen handler");
  };

  return (
    <Button
      color="primary"
      size="small"
      onClick={handleOpen}
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      startIcon={<Edit size={18} />}
    >
      Sửa
    </Button>
  );
}

export default UpdateDoanVaoButton;
