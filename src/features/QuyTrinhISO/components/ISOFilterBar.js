import {
  Box,
  InputAdornment,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Autocomplete,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { SearchNormal1 } from "iconsax-react";

/**
 * ISOFilterBar — Reusable filter bar dùng chung cho List, Distribution, DistributedToMe
 *
 * @param {Object}   props
 * @param {string}   props.search              - Giá trị ô tìm kiếm
 * @param {Function} props.onSearchChange      - (e) => void
 * @param {Function} [props.onSearchSubmit]    - (e) => void — xử lý Enter
 * @param {Object}   [props.khoa]              - Khoa xây dựng đang chọn {_id, TenKhoa}
 * @param {Function} [props.onKhoaChange]      - (_, newVal) => void
 * @param {Array}    [props.khoaOptions]       - [{_id, TenKhoa}]
 * @param {Object}   [props.khoaPhanPhoi]      - Khoa nhận phân phối đang chọn {_id, TenKhoa}
 * @param {Function} [props.onKhoaPhanPhoiChange] - (_, newVal) => void
 * @param {Array}    [props.khoaPhanPhoiOptions]   - [{_id, TenKhoa}]
 * @param {string}   [props.trangThai]         - '' | 'ACTIVE' | 'DRAFT' | 'INACTIVE'
 * @param {Function} [props.onTrangThaiChange] - (_, newVal) => void
 * @param {boolean}  [props.showTrangThai]     - Hiện filter trạng thái (default true)
 * @param {boolean}  [props.showKhoa]          - Hiện filter khoa xây dựng (default true)
 * @param {boolean}  [props.showKhoaPhanPhoi]  - Hiện filter khoa nhận phân phối (default false)
 * @param {boolean}  [props.showSearch]        - Hiện ô tìm kiếm (default true)
 * @param {string}   [props.searchPlaceholder]
 */
function ISOFilterBar({
  search = "",
  onSearchChange,
  onSearchSubmit,
  khoa = null,
  onKhoaChange,
  khoaOptions = [],
  khoaPhanPhoi = null,
  onKhoaPhanPhoiChange,
  khoaPhanPhoiOptions = [],
  trangThai = "",
  onTrangThaiChange,
  showTrangThai = true,
  showKhoa = true,
  showKhoaPhanPhoi = false,
  showSearch = true,
  searchPlaceholder = "Tìm mã hoặc tên quy trình...",
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box sx={{ py: 1.5 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        alignItems={{ xs: "stretch", sm: "center" }}
        flexWrap="wrap"
        useFlexGap
      >
        {/* Search */}
        {showSearch && (
          <Box
            component="form"
            onSubmit={onSearchSubmit}
            sx={{ flex: { sm: 1 }, minWidth: 200 }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder={searchPlaceholder}
              value={search}
              onChange={onSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchNormal1 size={16} color="#9e9e9e" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        )}

        {/* Khoa xây dựng filter */}
        {showKhoa && onKhoaChange && (
          <Autocomplete
            size="small"
            options={khoaOptions}
            value={khoa}
            onChange={onKhoaChange}
            getOptionLabel={(o) => o.TenKhoa || ""}
            isOptionEqualToValue={(o, v) => o._id === v._id}
            sx={{ width: { xs: "100%", sm: 220 } }}
            renderInput={(params) => (
              <TextField {...params} placeholder="Khoa xây dựng" />
            )}
            renderOption={(props, option) => (
              <li {...props} key={option._id}>
                <Typography variant="body2">{option.TenKhoa}</Typography>
              </li>
            )}
          />
        )}

        {/* Khoa nhận phân phối filter */}
        {showKhoaPhanPhoi && onKhoaPhanPhoiChange && (
          <Autocomplete
            size="small"
            options={khoaPhanPhoiOptions}
            value={khoaPhanPhoi}
            onChange={onKhoaPhanPhoiChange}
            getOptionLabel={(o) => o.TenKhoa || ""}
            isOptionEqualToValue={(o, v) => o._id === v._id}
            sx={{ width: { xs: "100%", sm: 220 } }}
            renderInput={(params) => (
              <TextField {...params} placeholder="Khoa nhận phân phối" />
            )}
            renderOption={(props, option) => (
              <li {...props} key={option._id}>
                <Typography variant="body2">{option.TenKhoa}</Typography>
              </li>
            )}
          />
        )}

        {/* TrangThai toggle */}
        {showTrangThai && onTrangThaiChange && (
          <ToggleButtonGroup
            size="small"
            value={trangThai}
            exclusive
            onChange={onTrangThaiChange}
            sx={{ flexShrink: 0 }}
          >
            <ToggleButton
              value=""
              sx={{ px: isMobile ? 1 : 1.5, fontSize: "0.78rem" }}
            >
              Tất cả
            </ToggleButton>
            <ToggleButton
              value="ACTIVE"
              sx={{
                px: isMobile ? 1 : 1.5,
                fontSize: "0.78rem",
                color: "success.main",
                "&.Mui-selected": {
                  bgcolor: "success.lighter",
                  color: "success.dark",
                },
              }}
            >
              Hiệu lực
            </ToggleButton>
            <ToggleButton
              value="DRAFT"
              sx={{
                px: isMobile ? 1 : 1.5,
                fontSize: "0.78rem",
                "&.Mui-selected": { bgcolor: "grey.200", color: "grey.800" },
              }}
            >
              Nháp
            </ToggleButton>
            <ToggleButton
              value="INACTIVE"
              sx={{
                px: isMobile ? 1 : 1.5,
                fontSize: "0.78rem",
                color: "warning.main",
                "&.Mui-selected": {
                  bgcolor: "warning.lighter",
                  color: "warning.dark",
                },
              }}
            >
              Thu hồi
            </ToggleButton>
          </ToggleButtonGroup>
        )}
      </Stack>
    </Box>
  );
}

export default ISOFilterBar;
