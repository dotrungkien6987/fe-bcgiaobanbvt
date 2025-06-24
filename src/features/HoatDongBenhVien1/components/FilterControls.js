import React from "react";
import { Grid, Button, Box, TextField, Autocomplete } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useHoatDongBenhVien } from "../HoatDongBenhVienProvider";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchBar from "./SearchBar";

const FilterControls = () => {
  const {
    selectedDate,
    setSelectedDate,
    selectedGroup,
    setSelectedGroup,
    departmentGroups,
    refreshData,
    loading,
    loadingSoThuTu,
  } = useHoatDongBenhVien();
  return (
    <>
      <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
        {" "}
        <Grid item xs={12} md={4}>
          <DatePicker
            label="Chọn ngày"
            value={selectedDate}
            onChange={(newDate) => {
              // Nếu newDate không null, set selectedDate mới
              if (newDate) {
                // Chuyển đổi múi giờ sang Việt Nam (UTC+7)
                // Giữ nguyên ngày tháng năm, bỏ qua giờ phút giây
                const vietnamDate = new Date(
                  newDate.getFullYear(),
                  newDate.getMonth(),
                  newDate.getDate(),
                  7, // 7 giờ sáng theo giờ Việt Nam
                  0,
                  0
                );
                setSelectedDate(vietnamDate);
              }
            }}
            slotProps={{
              textField: {
                fullWidth: true,
                variant: "outlined",
                size: "small",
                helperText: loading ? "Đang tải dữ liệu..." : null,
              },
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Autocomplete
            id="department-group-select"
            options={[{ id: "", ten: "Tất cả" }, ...departmentGroups]}
            getOptionLabel={(option) => option.ten || ""}
            value={
              departmentGroups.find((group) => group.id === selectedGroup) || {
                id: "",
                ten: "Tất cả",
              }
            }
            onChange={(event, newValue) => setSelectedGroup(newValue?.id || "")}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Chọn nhóm khoa"
                size="small"
                fullWidth
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Box display="flex" justifyContent="flex-end">
            {" "}
            <Button
              variant="contained"
              color="primary"
              startIcon={loading || loadingSoThuTu ? null : <RefreshIcon />}
              onClick={refreshData}
              disabled={loading || loadingSoThuTu}
              sx={{
                color: "white",
                "&.Mui-disabled": {
                  color: "rgba(255, 255, 255, 0.8)", // Màu chữ khi nút bị disable
                  backgroundColor: "rgba(25, 118, 210, 0.7)", // Màu nền khi nút bị disable
                },
              }}
            >
              {loading || loadingSoThuTu ? (
                <>
                  <RefreshIcon
                    sx={{
                      animation: "spin 1.5s linear infinite",
                      "@keyframes spin": {
                        "0%": { transform: "rotate(0deg)" },
                        "100%": { transform: "rotate(360deg)" },
                      },
                      mr: 1,
                    }}
                  />
                  {loadingSoThuTu
                    ? "Đang tải số thứ tự..."
                    : "Đang tải dữ liệu..."}
                </>
              ) : (
                "Làm mới dữ liệu"
              )}
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Thêm thanh tìm kiếm */}
      <SearchBar />
    </>
  );
};

export default FilterControls;
