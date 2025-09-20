import React, { useEffect } from "react";
import {
  Container,
  Breadcrumbs,
  Link,
  Typography,
  CircularProgress,
  Box,
} from "@mui/material";
import { useParams, Link as RouterLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getDoanVaoById } from "./doanvaoSlice";
import DoanVaoView from "./DoanVaoView";

function DoanVaoDetailPage() {
  const { doanVaoId } = useParams();
  const dispatch = useDispatch();
  const { currentDoanVao, isLoading } = useSelector((s) => s.doanvao || {});

  useEffect(() => {
    if (doanVaoId) dispatch(getDoanVaoById(doanVaoId));
  }, [doanVaoId, dispatch]);

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} underline="hover" to="/doanvao">
          Đoàn Vào
        </Link>
        <Typography color="text.primary">Chi tiết</Typography>
      </Breadcrumbs>
      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={32} />
        </Box>
      )}
      {!isLoading && currentDoanVao && <DoanVaoView data={currentDoanVao} />}
    </Container>
  );
}

export default DoanVaoDetailPage;
