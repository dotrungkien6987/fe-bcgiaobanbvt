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
          <TextField {...params} label={label} placeholder="Tìm mã..." />
        )}
        renderTags={(tagValue, getTagProps) =>
          tagValue.map((option, index) => (
            <Chip
              variant="outlined"
              label={option.label}
              {...getTagProps({ index })}
              key={option.value}
            />
          ))
        }
        sx={{ flex: 1 }}
      />
      <Button onClick={handleSelectAll} variant="outlined" size="small">
        Chọn tất cả
      </Button>
      <Button onClick={handleClear} variant="text" size="small">
        Bỏ chọn
      </Button>
    </Stack>
  );
}
