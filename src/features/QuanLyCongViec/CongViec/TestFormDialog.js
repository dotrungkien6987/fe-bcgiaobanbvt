import React, { useState } from 'react';
import { Button, Box } from '@mui/material';
import CongViecFormDialog from './CongViecFormDialog';

const TestFormDialog = () => {
  const [open, setOpen] = useState(false);

  return (
    <Box sx={{ p: 2 }}>
      <Button 
        variant="contained" 
        onClick={() => setOpen(true)}
      >
        Test Form Dialog
      </Button>
      
      <CongViecFormDialog
        open={open}
        onClose={() => setOpen(false)}
        isEdit={false}
        nhanVienId="1"
      />
    </Box>
  );
};

export default TestFormDialog;
