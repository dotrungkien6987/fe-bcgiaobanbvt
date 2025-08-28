import React from "react";
import { useParams } from "react-router-dom";
import { Box } from "@mui/material";
import TaskDetailShell from "./TaskDetailShell";

// Skeleton routed page wrapper for task detail (/congviec/:id)
export default function CongViecDetailPage() {
  const { id } = useParams();
  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <TaskDetailShell congViecId={id} />
    </Box>
  );
}
