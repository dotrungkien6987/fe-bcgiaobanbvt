import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import Avatar from "components/@extended/Avatar";
import apiService from "app/apiService";

function getInitial(name) {
  const s = (name || "").trim();
  if (!s) return "?";
  return s.charAt(0).toUpperCase();
}

const blobUrlCache = new Map();

export function invalidateEmployeeAvatar(nhanVienId) {
  if (!nhanVienId) return;
  const entry = blobUrlCache.get(String(nhanVienId));
  if (entry?.url) {
    try {
      URL.revokeObjectURL(entry.url);
    } catch (_) {}
  }
  blobUrlCache.delete(String(nhanVienId));
}

export default function EmployeeAvatar({
  nhanVienId,
  name,
  size = "md",
  cacheKey,
  sx,
  ...other
}) {
  const [failed, setFailed] = useState(false);
  const [src, setSrc] = useState(undefined);
  const id = nhanVienId ? String(nhanVienId) : "";

  const initial = useMemo(() => getInitial(name), [name]);

  useEffect(() => {
    let alive = true;
    if (!id || failed) {
      setSrc(undefined);
      return () => {
        alive = false;
      };
    }

    const cached = blobUrlCache.get(id);
    if (cached && String(cached.cacheKey || "") === String(cacheKey || "")) {
      setSrc(cached.url);
      return () => {
        alive = false;
      };
    }

    // If cacheKey changed, clear old cache entry first
    if (cached) {
      invalidateEmployeeAvatar(id);
    }

    (async () => {
      try {
        const res = await apiService.get(`/nhanvien/${id}/avatar`, {
          responseType: "blob",
        });
        const url = URL.createObjectURL(res.data);
        blobUrlCache.set(id, { url, cacheKey: cacheKey || "" });
        if (alive) setSrc(url);
      } catch (e) {
        if (alive) {
          setFailed(true);
          setSrc(undefined);
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, [id, cacheKey, failed]);

  return (
    <Avatar
      alt={name || "avatar"}
      src={src}
      size={size}
      onError={() => setFailed(true)}
      sx={sx}
      {...other}
    >
      {initial}
    </Avatar>
  );
}

EmployeeAvatar.propTypes = {
  nhanVienId: PropTypes.string,
  name: PropTypes.string,
  size: PropTypes.string,
  cacheKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  sx: PropTypes.object,
};
