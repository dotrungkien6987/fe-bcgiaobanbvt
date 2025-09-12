import React from "react";
import {
  Autocomplete,
  Checkbox,
  Chip,
  TextField,
  Stack,
  Button,
} from "@mui/material";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

/**
 * Props:
 * - options: Array<{ value: string, label: string }>
 * - value: string[]
 * - onChange: (values: string[]) => void
 * - label?: string
 */
export default function CodeMultiSelect({
  options,
  value,
  onChange,
  label = "Chọn mã hiển thị",
}) {
  const selectedOptions = React.useMemo(
    () => options.filter((o) => value?.includes(o.value)),
    [options, value]
  );

  const handleChange = (_, newOptions) => {
    onChange?.(newOptions.map((o) => o.value));
  };

  const handleSelectAll = () => onChange?.(options.map((o) => o.value));
  const handleClear = () => onChange?.([]);

  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      sx={{ minWidth: 360 }}
    >
      <Autocomplete
        multiple
        size="small"
        options={options}
        value={selectedOptions}
        disableCloseOnSelect
        onChange={handleChange}
        getOptionLabel={(o) => o.label}
        isOptionEqualToValue={(o, v) => o.value === v.value}
        renderOption={(props, option, { selected }) => (
          <li {...props} key={option.value}>
            <Checkbox
              icon={icon}
              checkedIcon={checkedIcon}
              style={{ marginRight: 8 }}
              checked={selected}
            />
            {option.label}
          </li>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            placeholder="Tìm mã..."
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 1,
                bgcolor: "transparent",
              },
            }}
          />
        )}
        renderTags={(tagValue, getTagProps) =>
          tagValue.map((option, index) => (
            <Chip
              variant="filled"
              label={option.label}
              {...getTagProps({ index })}
              key={option.value}
              size="small"
              sx={{
                bgcolor: "#1976d2",
                color: "white",
                fontWeight: 500,
                "&:hover": {
                  bgcolor: "#1565c0",
                },
              }}
            />
          ))
        }
        sx={{ flex: 1 }}
      />
      <Button
        onClick={handleSelectAll}
        variant="outlined"
        size="small"
        sx={{
          borderRadius: 1,
          textTransform: "none",
          fontWeight: 600,
        }}
      >
        Tất cả
      </Button>
      <Button
        onClick={handleClear}
        variant="text"
        size="small"
        sx={{
          borderRadius: 1,
          textTransform: "none",
          fontWeight: 600,
        }}
      >
        Xóa
      </Button>
    </Stack>
  );
}
