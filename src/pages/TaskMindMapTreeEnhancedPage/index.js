import React from "react";
import { Box, Container } from "@mui/material";
import TaskMindMapTreeViewEnhanced from "../../components/TaskMindMap/TaskMindMapTreeViewEnhanced";

export default function TaskMindMapTreeEnhancedPage() {
  return (
    <Container maxWidth="xl">
      <Box sx={{ height: "calc(100vh - 80px)" }}>
        <TaskMindMapTreeViewEnhanced />
      </Box>
    </Container>
  );
}
