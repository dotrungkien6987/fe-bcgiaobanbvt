import { useMemo } from 'react';

// material-ui
import { Chip, Grid } from '@mui/material';

// project-imports
// import BasicTable from 'sections/tables/react-table/BasicTable';
// import FooterTable from 'sections/tables/react-table/FooterTable';
import makeData from 'data/react-table';
import BasicTable from 'sections/react-table/BasicTable';
import FooterTable from 'sections/react-table/FooterTable';
import LinearWithLabel from 'components/@extended/progress/LinearWithLabel';

// ==============================|| REACT TABLE - BASIC ||============================== //

const TableBasic = () => {
  const data = useMemo(() => makeData(20), []);
 
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} lg={6}>
        <BasicTable title="TableBasic Table" data={data.slice(0, 10)} />
      </Grid>
      <Grid item xs={12} lg={6}>
        <BasicTable title="Striped Table" data={data.slice(0, 10)} striped />
      </Grid>
      <Grid item xs={12}>
        <FooterTable data={data.slice(10, 19)} />
      </Grid>
    </Grid>
  );
};

export default TableBasic;
