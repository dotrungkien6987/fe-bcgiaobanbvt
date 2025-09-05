import { useFormContext, Controller } from "react-hook-form";
import { TextField } from "@mui/material";

function FSelect({
  name,
  children,
  options,
  placeholder = "-- Chọn --",
  ...other
}) {
  const { control } = useFormContext();

  const renderOptions = () => {
    if (!options) return children;

    return [
      <option key="_empty" value="">
        {placeholder}
      </option>,
      ...options.map((o) =>
        typeof o === "object" ? (
          <option key={o.value ?? o.label} value={o.value ?? o.label}>
            {o.label ?? o.value}
          </option>
        ) : (
          <option key={String(o)} value={o}>
            {String(o)}
          </option>
        )
      ),
    ];
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          select
          fullWidth
          SelectProps={{ native: true }}
          error={!!error}
          helperText={error?.message}
          {...other}
        >
          {renderOptions()}
        </TextField>
      )}
    />
  );
}

export default FSelect;
