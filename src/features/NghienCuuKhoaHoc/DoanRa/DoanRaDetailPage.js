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
import { getDoanRaById } from "./doanraSlice";
import DoanRaView from "./DoanRaView";

function DoanRaDetailPage() {
  const { doanRaId } = useParams();
  const dispatch = useDispatch();
  const { currentDoanRa, isLoading } = useSelector((s) => s.doanra);

  useEffect(() => {
    if (doanRaId) dispatch(getDoanRaById(doanRaId));
  }, [doanRaId, dispatch]);

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} underline="hover" to="/doandi">
          Đoàn Ra
        </Link>
        <Typography color="text.primary">Chi tiết</Typography>
      </Breadcrumbs>
      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={32} />
        </Box>
      )}
      {!isLoading && currentDoanRa && (
        <DoanRaView data={currentDoanRa} dense={false} />
      )}
    </Container>
  );
}

export default DoanRaDetailPage;
