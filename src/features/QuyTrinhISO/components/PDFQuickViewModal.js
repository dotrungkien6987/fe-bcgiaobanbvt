import { useState, useEffect, useCallback, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
  Typography,
  useMediaQuery,
  useTheme,
  CircularProgress,
  ButtonGroup,
} from "@mui/material";
import { CloseCircle, DocumentDownload } from "iconsax-react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import { downloadUrl } from "../../../shared/services/attachments.api";
import apiService from "../../../app/apiService";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

/**
 * PDFQuickViewModal - Modal xem PDF nhanh với react-pdf
 *
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - file: { _id, TenFile, TenGoc, DuongDan, KichThuoc }
 */
function PDFQuickViewModal({ open, onClose, file }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [zoomScale, setZoomScale] = useState(1);
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Measure container width for auto-fit
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [blobUrl]);

  // Calculate page width based on container and zoom
  // Mobile: fit full width with padding
  // Desktop: use reasonable max width (850px) or container width
  const getPageWidth = () => {
    if (!containerWidth) return undefined;
    const padding = isMobile ? 16 : 32;
    const availableWidth = containerWidth - padding;
    const baseWidth = isMobile ? availableWidth : Math.min(availableWidth, 850);
    return Math.round(baseWidth * zoomScale);
  };

  // Fetch PDF as blob when modal opens
  const fetchPdf = useCallback(async () => {
    if (!file?._id) return;

    setLoading(true);
    setError(null);
    try {
      const res = await apiService.get(
        `/attachments/files/${file._id}/inline`,
        {
          responseType: "blob",
        },
      );
      const url = URL.createObjectURL(res.data);
      setBlobUrl(url);
    } catch (err) {
      console.error("Error loading PDF:", err);
      setError(err?.response?.data?.message || "Không thể tải file PDF");
    } finally {
      setLoading(false);
    }
  }, [file?._id]);

  // Fetch when modal opens with a file
  useEffect(() => {
    if (open && file?._id) {
      fetchPdf();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, file?._id]);

  // Cleanup blob URL when modal closes or file changes
  useEffect(() => {
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);

  const handleClose = () => {
    // Cleanup current blob URL
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
      setBlobUrl(null);
    }
    setError(null);
    setZoomScale(1);
    setNumPages(null);
    setContainerWidth(0);
    onClose();
  };

  const handleDownload = async () => {
    if (!file?._id) return;
    try {
      const res = await apiService.get(
        `/attachments/files/${file._id}/download`,
        { responseType: "blob" },
      );
      const blobUrl = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = file.TenGoc || file.TenFile || "download";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 30000);
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          py: 1,
          gap: 2,
        }}
      >
        <Box flex={1}>
          <Typography variant="subtitle1" component="span">
            📄 {file?.TenGoc || file?.TenFile}
          </Typography>
          {file?.KichThuoc && (
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
              ({formatFileSize(file.KichThuoc)})
            </Typography>
          )}
          {numPages && (
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
              • {numPages} trang
            </Typography>
          )}
        </Box>

        {blobUrl && !isMobile && (
          <ButtonGroup size="small" variant="outlined">
            <Button
              onClick={() => setZoomScale(0.9)}
              variant={zoomScale === 0.9 ? "contained" : "outlined"}
              sx={{ minWidth: 50, fontSize: "0.75rem" }}
            >
              90%
            </Button>
            <Button
              onClick={() => setZoomScale(1)}
              variant={zoomScale === 1 ? "contained" : "outlined"}
              sx={{ minWidth: 55, fontSize: "0.75rem" }}
            >
              100%
            </Button>
            <Button
              onClick={() => setZoomScale(1.25)}
              variant={zoomScale === 1.25 ? "contained" : "outlined"}
              sx={{ minWidth: 55, fontSize: "0.75rem" }}
            >
              125%
            </Button>
            <Button
              onClick={() => setZoomScale(1.5)}
              variant={zoomScale === 1.5 ? "contained" : "outlined"}
              sx={{ minWidth: 55, fontSize: "0.75rem" }}
            >
              150%
            </Button>
          </ButtonGroup>
        )}

        <IconButton onClick={handleClose} size="small">
          <CloseCircle size={24} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, bgcolor: "#525659" }}>
        {loading ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height={isMobile ? "calc(100vh - 180px)" : "80vh"}
            gap={2}
          >
            <CircularProgress />
            <Typography color="white">Đang tải PDF...</Typography>
          </Box>
        ) : error ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height={400}
            gap={2}
          >
            <Typography color="error">{error}</Typography>
            <Button
              variant="outlined"
              color="primary"
              onClick={fetchPdf}
              sx={{ mt: 1 }}
            >
              Thử lại
            </Button>
          </Box>
        ) : blobUrl ? (
          <Box
            ref={containerRef}
            sx={{
              height: isMobile ? "calc(100vh - 120px)" : "80vh",
              overflow: "auto",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              py: 2,
              px: isMobile ? 1 : 2,
            }}
          >
            <Document
              file={blobUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={(err) => setError("Lỗi khi tải PDF: " + err.message)}
              loading={
                <Box py={4}>
                  <CircularProgress sx={{ color: "white" }} />
                </Box>
              }
            >
              {Array.from(new Array(numPages || 0), (el, index) => (
                <Box key={`page_${index + 1}`} sx={{ mb: 2 }}>
                  <Page
                    pageNumber={index + 1}
                    width={getPageWidth()}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    loading={
                      <Box py={2}>
                        <CircularProgress size={24} sx={{ color: "white" }} />
                      </Box>
                    }
                  />
                </Box>
              ))}
            </Document>
          </Box>
        ) : (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            height={400}
          >
            <Typography color="text.secondary">
              Không thể hiển thị file PDF
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button
          startIcon={<DocumentDownload size={18} />}
          onClick={handleDownload}
          disabled={!file?._id}
        >
          Tải xuống
        </Button>
        <Button onClick={handleClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
}

export default PDFQuickViewModal;
