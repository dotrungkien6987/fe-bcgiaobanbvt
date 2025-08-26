import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import FilesSidebar from "./FilesSidebar";
import TaskMetaSidebar from "./TaskMetaSidebar";

const TaskSidebarPanel = ({
  theme,
  dragSidebarActive,
  setDragSidebarActive,
  fileCount,
  filesState,
  uploadFilesForTask,
  congViecId,
  dispatch,
  handleViewFile,
  handleDownloadFile,
  deleteFileThunk,
  congViec,
  extDue,
  cooperators,
  handleSidebarDragOver,
  handleSidebarDragEnter,
  handleSidebarDragLeave,
  handleSidebarDrop,
  handleSidebarPaste,
}) => (
  <Card
    elevation={2}
    sx={{ borderRadius: 2, border: (t) => `1px solid ${t.palette.divider}` }}
  >
    <CardContent sx={{ p: 3 }}>
      <Typography
        variant="h6"
        sx={{
          mb: 3,
          fontWeight: 600,
          color: theme.palette.text.primary,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        ℹ️ Thông tin chi tiết
      </Typography>
      <Box
        onDragOver={handleSidebarDragOver}
        onDragEnter={handleSidebarDragEnter}
        onDragLeave={handleSidebarDragLeave}
        onDrop={handleSidebarDrop}
        onPaste={handleSidebarPaste}
        tabIndex={0}
        sx={{ position: "relative" }}
      >
        <FilesSidebar
          theme={theme}
          dragSidebarActive={dragSidebarActive}
          setDragSidebarActive={setDragSidebarActive}
          fileCount={fileCount}
          filesState={filesState}
          onUploadFiles={async (files) =>
            dispatch(uploadFilesForTask(congViecId, files))
          }
          onViewFile={handleViewFile}
          onDownloadFile={handleDownloadFile}
          onDeleteFile={(f) => dispatch(deleteFileThunk(congViecId, f._id))}
        />
        {dragSidebarActive && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              border: "2px dashed",
              borderColor: theme.palette.primary.main,
              bgcolor: "rgba(0,0,0,0.04)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: theme.palette.primary.main,
              fontWeight: 600,
              pointerEvents: "none",
              zIndex: 1,
            }}
          >
            Thả tệp vào đây để tải lên
          </Box>
        )}
      </Box>
      <TaskMetaSidebar
        theme={theme}
        congViec={congViec}
        overdue={extDue === "QUA_HAN" || extDue === "HOAN_THANH_TRE_HAN"}
        cooperators={cooperators}
      />
    </CardContent>
  </Card>
);

export default TaskSidebarPanel;
