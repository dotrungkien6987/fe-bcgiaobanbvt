import React from "react";
import CongViecHierarchyTreeDynamic from "../../features/QuanLyCongViec/TreeView/CongViecHierarchyTreeDynamic";
import { Container, Typography } from "@mui/material";

export default function CongViecHierarchyTreeDynamicPage() {
  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <Typography variant="h5" fontWeight={600} mb={2}>
        Cây Công Việc (Động)
      </Typography>
      <CongViecHierarchyTreeDynamic />
    </Container>
  );
}
