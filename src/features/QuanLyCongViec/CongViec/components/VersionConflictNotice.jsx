import React from "react";
import { Box, Typography, Button } from "@mui/material";

const VersionConflictNotice = ({ onResolve }) => (
  <Box
    sx={{
      m: 2,
      mb: 0,
      p: 2,
      border: "1px solid",
      borderColor: "warning.main",
      borderRadius: 1,
      bgcolor: "warning.light",
    }}
  >
    <Typography variant="subtitle2" sx={{ fontWeight: 600 }} gutterBottom>
      Xung đột phiên bản / Version conflict
    </Typography>
    <Typography variant="body2" paragraph>
      Dữ liệu công việc đã thay đổi bởi người khác trước thao tác của bạn. Bản
      mới nhất đã được tải lại. Vui lòng kiểm tra trước khi thực hiện lại.
    </Typography>
    <Button size="small" variant="outlined" color="warning" onClick={onResolve}>
      Đã hiểu
    </Button>
  </Box>
);

export default VersionConflictNotice;
