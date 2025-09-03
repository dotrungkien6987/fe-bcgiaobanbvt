import React from "react";
import { Box } from "@mui/material";
import TaskMindMapHierarchical from "../../components/TaskMindMap/TaskMindMapHierarchical";

export default function TaskMindMapHierarchicalPage() {
  return (
    <Box sx={{ width: "100%", height: "100vh", overflow: "auto" }}>
      <TaskMindMapHierarchical />
    </Box>
  );
}
