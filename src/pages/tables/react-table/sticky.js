
import PropTypes from 'prop-types';
import { useMemo } from 'react';

// material-ui
import { Box, Chip, Grid } from '@mui/material';

// project-imports
import makeData from 'data/react-table';
import Avatar from 'components/@extended/Avatar';
import LinearWithLabel from 'components/@extended/progress/LinearWithLabel';
// import StickyTable from 'sections/tables/react-table/StickyTable';

const avatarImage = require.context('assets/images/users', true);

// ==============================|| REACT TABLE - STICKY ||============================== //

const Sticky = ({columns,data}) => {
 

  return (
    <Grid container spacing={3}>
      {/* <Grid item xs={12}>
        <StickyTable title="Sticky Header" columns={columns} data={data} />
      </Grid>
      <Grid item xs={12}>
        <StickyTable title="Sticky Column" columns={columns} data={data} />
      </Grid> */}
    </Grid>
  );
};

Sticky.propTypes = {
  value: PropTypes.string
};

export default Sticky;
