import React, { useEffect } from 'react'
import TableBasic from './tables/react-table/TableBasic'
import { Card, Stack } from '@mui/material'
import { Car } from 'iconsax-react'
import { useDispatch } from 'react-redux'
import { getDataFix } from 'features/NhanVien/nhanvienSlice'


function Test() {
  const dispatch = useDispatch()
  useEffect(()=>{
    dispatch(getDataFix())
  })
  return (
    <Stack>
      <Card sx={{m:2}}>
<Card> Quản lý cán bộ</Card>
    <TableBasic/>
      </Card>
    </Stack>
  )
}

export default Test