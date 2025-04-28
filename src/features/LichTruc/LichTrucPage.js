import React from 'react';
import { Container, Grid } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useAuth from '../../hooks/useAuth';
import LichTrucTable from './LichTrucTable';
import MainCard from 'components/MainCard';

function LichTrucPage() {
  const theme = useTheme();
  const { user } = useAuth();

  return (
    <Container maxWidth={false}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <LichTrucTable />
        </Grid>
      </Grid>
    </Container>
  );
}

export default LichTrucPage;