import { useFormContext, Controller } from "react-hook-form";
import { Autocomplete, TextField } from "@mui/material";

function FAutocomplete({ name, children,options,displayField,label, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
    name={name}
    control={control}
    render={({ field: { onChange, value }, fieldState: { error } }) => (
      <Autocomplete
        options={options}
        getOptionLabel={(option) => option[displayField]}
        value={value}
        onChange={(event, newValue) => {
          onChange(newValue);
        }}
        isOptionEqualToValue={(option, value) => option[displayField] === value?.[displayField]}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            variant="standard"
            error={!!error}
            helperText={error ? error.message : null}
          />
        )}
      />
    )}
  />
  );
}

export default FAutocomplete;