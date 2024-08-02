import React from 'react';
import Chip from '@mui/material/Chip';

const TrangThaiLopDaoTao = ({ trangthai,title,...other }) => {
  if (trangthai) {
    return (
      <Chip
        label={title}
          size="small"
        style={{
          backgroundColor: '#1939B7',
        //   backgroundColor: '#08099a',
          color: 'white',
          fontSize: '1rem',
          padding: '4px',
          borderRadius: '8px'
        }}
      />
    );
  } else {
    return (
      <Chip
      label={title}
        size="small"
        style={{
        //   backgroundColor: '#d4aabf',
          backgroundColor: '#bb1515',
        //   backgroundColor: '#fe0808',
        //   backgroundColor: 'red',
          color: 'white',
          fontSize: '1rem',
          padding: '4px',
          borderRadius: '8px'
        }}
      />
    );
  }
};

export default TrangThaiLopDaoTao;
