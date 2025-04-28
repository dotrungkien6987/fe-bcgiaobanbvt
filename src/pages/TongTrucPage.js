import React from 'react'
import NgayTongTruc from '../features/BCGiaoBan/NgayTongTruc'
import { Container } from '@mui/material'

function TongTrucPage() {
  return (
    <Container maxWidth={false} disableGutters sx={{ height: '100%' }}>
      <NgayTongTruc/>
    </Container>
  )
}

export default TongTrucPage
