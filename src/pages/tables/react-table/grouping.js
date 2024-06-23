import { useMemo } from 'react';

// material-ui
import { Grid } from '@mui/material';

// project-imports
import makeData from 'data/react-table';
import GroupingTable from 'sections/react-table/GroupingTable';
import GroupingColumnTable from 'sections/react-table/GroupingColumnTable';



// ==============================|| REACT TABLE - GROUPING ||============================== //

const Grouping = ({ data,columns }) => {
  
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <GroupingTable data={data}  columns={columns}/>
      </Grid>
      <Grid item xs={12}>
        <GroupingColumnTable data={data} columns={columns}/>
      </Grid>
    </Grid>
  );
};

export default Grouping;
