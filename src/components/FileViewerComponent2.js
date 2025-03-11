import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";

// Cấu hình worker của pdfjs qua CDN
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const FileViewerComponent2 = ({ fileBlob, fileName }) => {
  const [documentUrl, setDocumentUrl] = useState(null);

  useEffect(() => {
    if (fileBlob) {
      const tempDocumentUrl = URL.createObjectURL(fileBlob);
      setDocumentUrl(tempDocumentUrl);

      return () => {
        URL.revokeObjectURL(tempDocumentUrl);
      };
    }
  }, [fileBlob]);

  const getFileType = (fileName) => {
    const ext = fileName.split(".").pop().toLowerCase();
    if (["jpg", "jpeg", "png", "gif"].includes(ext)) return "image";
    if (ext === "pdf") return "pdf";
    if (["doc", "docx", "xls", "xlsx"].includes(ext)) return "doc-viewer";
    return "unknown";
  };

  const fileType = getFileType(fileName);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        File Viewer
      </Typography>
      {fileType === "image" && documentUrl && (
        <img src={documentUrl} alt={fileName} style={{ maxWidth: "100%" }} />
      )}
      {fileType === "pdf" && documentUrl && (
        <Document file={documentUrl}>
          <Page pageNumber={1} />
        </Document>
      )}
      {fileType === "doc-viewer" && documentUrl && (
        <Box sx={{ height: "600px" }}>
          <DocViewer
            documents={[{ uri: documentUrl }]}
            pluginRenderers={DocViewerRenderers}
            config={{
              header: {
                disableHeader: true,
              },
            }}
          />
        </Box>
      )}
      {fileType === "unknown" && (
        <Typography variant="body1">
          Cannot display this file type.{" "}
          <a href={documentUrl} target="_blank" rel="noopener noreferrer">
            Download File
          </a>
        </Typography>
      )}
    </Box>
  );
};

export default FileViewerComponent2;