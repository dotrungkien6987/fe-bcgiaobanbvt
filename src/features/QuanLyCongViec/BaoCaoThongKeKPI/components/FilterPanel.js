import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Button,
  Stack,
  Typography,
} from "@mui/material";
import {
  FilterList as FilterIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";

import { setFilters, resetFilters } from "../baoCaoKPISlice";
import { getChuKyDanhGias } from "features/QuanLyCongViec/KPI/kpiSlice";
import { getAllKhoa } from "features/Daotao/Khoa/khoaSlice";
import useAuth from "hooks/useAuth";

function FilterPanel() {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { filters } = useSelector((state) => state.baoCaoKPI);
  const { chuKyDanhGias = [] } = useSelector((state) => state.kpi);
  const { khoas = [] } = useSelector((state) => state.khoa);

  React.useEffect(() => {
    dispatch(getChuKyDanhGias());
    dispatch(getAllKhoa());
  }, [dispatch]);

  const handleFilterChange = (field, value) => {
    dispatch(setFilters({ [field]: value }));
  };

  const handleClearFilters = () => {
    dispatch(resetFilters());
  };

  // Filter khoa based on user role
  const khoasFiltered = React.useMemo(() => {
    if (!khoas || khoas.length === 0) return [];

    if (user.PhanQuyen < 3) {
      // Manager: chỉ thấy khoa của mình
      return khoas.filter(
        (k) => k._id === user.KhoaID?._id || k._id === user.KhoaID
      );
    }
    // Admin: thấy tất cả
    return khoas;
  }, [khoas, user]);

  return (
    <Paper sx={{ p: 2, bgcolor: "background.paper" }}>
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <FilterIcon color="primary" />
          <Typography variant="h6">Bộ lọc</Typography>
        </Stack>

        <Grid container spacing={2}>
          {/* Chu kỳ đánh giá */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Chu kỳ đánh giá</InputLabel>
              <Select
                value={filters.chuKyId}
                label="Chu kỳ đánh giá"
                onChange={(e) => handleFilterChange("chuKyId", e.target.value)}
              >
                <MenuItem value="">
                  <em>Tất cả chu kỳ</em>
                </MenuItem>
                {chuKyDanhGias.map((chuKy) => (
                  <MenuItem key={chuKy._id} value={chuKy._id}>
                    {chuKy.TenChuKy}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Khoa/Phòng */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Khoa/Phòng</InputLabel>
              <Select
                value={filters.khoaId}
                label="Khoa/Phòng"
                onChange={(e) => handleFilterChange("khoaId", e.target.value)}
                disabled={user.PhanQuyen < 3} // Manager không thể đổi khoa
              >
                <MenuItem value="">
                  <em>Tất cả khoa</em>
                </MenuItem>
                {khoasFiltered.map((khoa) => (
                  <MenuItem key={khoa._id} value={khoa._id}>
                    {khoa.TenKhoa}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Clear filters button */}
        <Stack direction="row" justifyContent="flex-end">
          <Button
            size="small"
            startIcon={<ClearIcon />}
            onClick={handleClearFilters}
            disabled={!filters.chuKyId && !filters.khoaId}
          >
            Xóa bộ lọc
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}

export default FilterPanel;
