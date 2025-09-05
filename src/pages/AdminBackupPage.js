import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  listBackups,
  downloadBackup,
  restoreBackup,
  downloadExistingBackup,
} from "../features/Backup/backupSlice";
import {
  Button,
  Stack,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  LinearProgress,
} from "@mui/material";
import dayjs from "dayjs";

export default function AdminBackupPage() {
  const dispatch = useDispatch();
  const { files, isLoading } = useSelector((s) => s.backup);
  const fileRef = useRef();
  const [selectedFileName, setSelectedFileName] = useState("");

  useEffect(() => {
    dispatch(listBackups());
  }, [dispatch]);

  const onDownload = async () => {
    await dispatch(downloadBackup());
    // Sau khi tạo backup mới, làm tươi danh sách
    dispatch(listBackups());
  };

  const onRestore = () => {
    const file = fileRef.current.files[0];
    if (!file) return alert("Chọn file .zip để restore");
    if (!window.confirm("Khôi phục sẽ ghi đè dữ liệu hiện tại. Tiếp tục?"))
      return;
    dispatch(restoreBackup(file));
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6">Sao lưu & Phục hồi</Typography>
        <Stack direction="row" spacing={2}>
          <Button variant="contained" color="primary" onClick={onDownload}>
            Tạo & Tải backup
          </Button>
          <Button variant="outlined" component="label">
            {selectedFileName || "Chọn file"}
            <input
              hidden
              type="file"
              ref={fileRef}
              accept=".zip"
              onChange={(e) => {
                const f = e.target.files?.[0];
                setSelectedFileName(f ? f.name : "");
              }}
            />
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={onRestore}
            disabled={
              !fileRef.current || !fileRef.current.files.length || isLoading
            }
          >
            Phục hồi
          </Button>
        </Stack>
      </Stack>
      {isLoading && <LinearProgress sx={{ mb: 2 }} />}
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Tên file</TableCell>
            <TableCell>Kích thước (MB)</TableCell>
            <TableCell>Thời gian</TableCell>
            <TableCell align="right">Tải xuống</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {files.map((f) => (
            <TableRow key={f.file}>
              <TableCell>{f.file}</TableCell>
              <TableCell>{(f.size / 1024 / 1024).toFixed(2)}</TableCell>
              <TableCell>
                {dayjs(f.mtime).format("YYYY-MM-DD HH:mm:ss")}
              </TableCell>
              <TableCell align="right">
                <Button
                  size="small"
                  onClick={() => dispatch(downloadExistingBackup(f.file))}
                  disabled={isLoading}
                >
                  Tải
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {files.length === 0 && !isLoading && (
            <TableRow>
              <TableCell colSpan={4}>Chưa có backup</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Typography variant="caption" display="block" mt={2}>
        Lưu ý: Phục hồi sẽ xóa và ghi đè toàn bộ dữ liệu hiện có (mongorestore
        --drop).
      </Typography>
    </Paper>
  );
}
