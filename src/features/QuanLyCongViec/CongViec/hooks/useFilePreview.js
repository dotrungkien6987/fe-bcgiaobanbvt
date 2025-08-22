import { useCallback } from "react";
import apiService from "app/apiService";
import { toast } from "react-toastify";

export default function useFilePreview() {
  const handleViewFile = useCallback(async (file) => {
    try {
      const res = await apiService.get(
        `/workmanagement/files/${file._id}/inline`,
        { responseType: "blob" }
      );
      const url = URL.createObjectURL(res.data);
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Không mở được tệp");
    }
  }, []);

  const handleDownloadFile = useCallback(async (file) => {
    try {
      const res = await apiService.get(
        `/workmanagement/files/${file._id}/download`,
        { responseType: "blob" }
      );
      const blobUrl = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = file.TenGoc || file.TenFile || "download";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Không tải được tệp");
    }
  }, []);

  return { handleViewFile, handleDownloadFile };
}
