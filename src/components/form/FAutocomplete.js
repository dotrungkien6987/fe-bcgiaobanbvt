import { useFormContext, Controller } from "react-hook-form";
import { Autocomplete, TextField, Tooltip } from "@mui/material";

// Added optional props:
//  - textWrap: cho phép hiển thị nhiều dòng (wrap) cho option và input
//  - showFullOnHover: tooltip hiển thị toàn bộ nội dung khi hover
function FAutocomplete({
  name,
  children,
  options = [],
  displayField,
  label,
  textWrap = false,
  showFullOnHover = true,
  ...other
}) {
  const { control } = useFormContext();

  const listboxProps = textWrap
    ? {
        sx: {
          "& .MuiAutocomplete-option": {
            whiteSpace: "normal",
            lineHeight: 1.3,
            alignItems: "flex-start",
          },
          maxHeight: 320,
        },
      }
    : undefined;

  const wrapSx = textWrap
    ? {
        "& .MuiAutocomplete-inputRoot": {
          flexWrap: "wrap",
          alignItems: "flex-start",
          py: 0.5,
        },
        "& .MuiAutocomplete-input": {
          whiteSpace: "normal",
          lineHeight: 1.3,
          overflow: "visible",
        },
      }
    : undefined;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const labelText = value
          ? displayField
            ? value[displayField]
            : value
          : "";
        const core = (
          <Autocomplete
            options={options}
            getOptionLabel={(option) =>
              option ? (displayField ? option[displayField] : option) : ""
            }
            value={value}
            onChange={(event, newValue) => {
              onChange(newValue);
            }}
            isOptionEqualToValue={(option, v) => {
              if (!option || !v) return false;
              if (displayField)
                return option[displayField] === v?.[displayField];
              return option === v;
            }}
            ListboxProps={listboxProps}
            sx={wrapSx}
            renderInput={(params) => (
              <TextField
                {...params}
                label={label}
                variant="standard"
                error={!!error}
                helperText={error ? error.message : null}
              />
            )}
            {...other}
          />
        );
        return showFullOnHover && labelText ? (
          <Tooltip title={labelText} placement="top-start" arrow>
            <span>{core}</span>
          </Tooltip>
        ) : (
          core
        );
      }}
    />
  );
}

export default FAutocomplete;
