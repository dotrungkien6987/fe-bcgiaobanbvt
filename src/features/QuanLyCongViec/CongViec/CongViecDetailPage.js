import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import CongViecDetailDialog from "./CongViecDetailDialog";

/**
 * Full-page wrapper for CongViecDetailDialog
 * Route: /congviec/:id
 *
 * Reuses 100% of CongViecDetailDialog logic but renders as a page instead of modal.
 * This provides consistent UX between nested dialogs and dedicated pages.
 */
export default function CongViecDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);

  // Open dialog immediately when page loads
  useEffect(() => {
    if (id) {
      setOpen(true);
    }
  }, [id]);

  const handleClose = () => {
    setOpen(false);
    // Navigate back to previous page or work management home
    navigate(-1);
  };

  return (
    <Box sx={{ height: "100vh", width: "100vw" }}>
      <CongViecDetailDialog
        open={open}
        onClose={handleClose}
        congViecId={id}
        onEdit={null} // No edit callback needed for page view
      />
    </Box>
  );
}
