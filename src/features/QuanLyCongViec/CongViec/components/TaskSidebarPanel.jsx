import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
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
    elevation={0}
    sx={{
      borderRadius: 2,
      border: (t) => `1px solid ${t.palette.divider}`,
      bgcolor: "grey.50",
    }}
  >
    <Box
      sx={{
        background: "linear-gradient(135deg, #64748b 0%, #475569 100%)",
        color: "white",
        p: 2,
        borderBottom: "none",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: 1,
          fontSize: { xs: "1rem", sm: "1.1rem" },
        }}
      >
        <InfoIcon sx={{ fontSize: 24 }} />
        Thông tin chi tiết
      </Typography>
    </Box>
    <CardContent sx={{ p: 3 }}>
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
