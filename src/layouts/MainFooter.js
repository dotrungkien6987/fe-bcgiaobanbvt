import React from 'react'
import {Link, Typography} from '@mui/material'
function MainFooter() {
  return (
    <Typography
    variant='body2'
    color="text.secondary"
    align='center'
    p={1}
    >
      <Link color = "inherit" href = "https://www.coderschool.vn">
      Bệnh viện đa khoa tỉnh Phú Thọ
      </Link> {" "}
{new Date().getFullYear()}
{"."}
    </Typography>
  )
}

export default MainFooter