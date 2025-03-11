import React from "react";
import { Box, Typography } from "@mui/material";
import PDFViewer from "pdf-viewer-reactjs";

// Component hiển thị ảnh
const ImageViewer = ({ url, alt }) => {
  return <img src={url} alt={alt} style={{ maxWidth: "100%" }} />;
};

// Component hiển thị PDF
const PdfViewer = ({ url }) => {
  return (
    <PDFViewer
      document={{
        url: url,
      }}
      css="customViewer"
      canvasCss="customCanvas"
      scale={1.5}
    />
  );
};

const FileViewerComponent = ({ fileUrl, fileName }) => {
  const getFileExtension = (name) => name.split(".").pop().toLowerCase();
  const ext = fileName ? getFileExtension(fileName) : "";

  const isImage = ["jpg", "jpeg", "png", "gif"].includes(ext);
  const isPdf = ext === "pdf";
  const isDocx = ext === "docx";

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        File Viewer
      </Typography>
      {isImage && <ImageViewer url={fileUrl} alt={fileName} />}
      {isPdf && <PdfViewer url={fileUrl} />}
      {/* 
        Nếu bạn cần hiển thị .docx ngay trên trình duyệt, 
        bạn có thể nhúng Google Docs Viewer/Office Online (yêu cầu URL công khai),
        hoặc thực hiện fetch -> blob -> docx-preview như đã nêu trong ví dụ trước.
        
        {isDocx && <DocxViewer docxUrl={fileUrl} />} 
      */}
      {!isImage && !isPdf && !isDocx && (
        <Typography variant="body1">
          Không thể hiển thị file này.{" "}
          <a href={fileUrl} target="_blank" rel="noopener noreferrer">
            Tải xuống
          </a>
        </Typography>
      )}
    </Box>
  );
};

export default FileViewerComponent;