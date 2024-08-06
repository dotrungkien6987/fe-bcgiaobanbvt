import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { TextField } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from 'dayjs';
function FDatePicker({ name, label, ...other }) {
  const { control } = useFormContext();

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <DatePicker
          label={label}
          value={value ? dayjs(value) : null} // Đảm bảo giá trị là null nếu không có giá trị
            onChange={(date) => {
              onChange(date); // Ensure date is in correct format
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                
                variant="standard"
                error={!!error}
                helperText={error ? error.message : null}
                InputLabelProps={{ shrink: true }} // Ensure label is shown
              />
            )}
            {...other}
          />
        )}
      />
    </LocalizationProvider>
  );
}


export default FDatePicker;
