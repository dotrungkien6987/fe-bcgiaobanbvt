import { Autocomplete, Box, Input, Select, Stack, TextField } from "@mui/material";
import { getKhoas } from "features/BaoCaoNgay/baocaongaySlice";

import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";

function TestHookForm() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getKhoas());
  }, []);
  const [department, setDepartment] = React.useState("NoiTM");
  const { khoas } = useSelector((state) => state.baocaongay);
  const khoasLabel = khoas.map((khoa) => ({ label: khoa.TenKhoa }));
  const { control, handleSubmit, register } = useForm({
    defaultValues: {
      firstName: "",
      select: null,
    },
  });
  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <Box>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="firstName"
          control={control}
          render={({ field }) => <Input {...field} />}
        />
     <Controller
          name="select"
          control={control}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <Autocomplete
              options={khoas}
              getOptionLabel={(option) => option.TenKhoa}
              value={value}
              onChange={(event, newValue) => {
                onChange(newValue);
              }}
              isOptionEqualToValue={(option, value) => option.TenKhoa === value?.TenKhoa}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Khoa"
                  variant="standard"
                  error={!!error}
                  helperText={error ? error.message : null}
                />
              )}
            />
          )}
        />
        <input type="submit" />
      </form>
    
<Stack spacing={1} sx={{ width: 300 }}>
    
      {/* <Autocomplete
        {...defaultProps}
        id="controlled-demo"
        value={value}
        
        onChange={(event, newValue) => {
            console.log('new value',newValue)
            console.log('value',value)
          setValue(newValue);
        }}
        isOptionEqualToValue={(option, value) => option.title === value.title && option.year === value.year}
        renderInput={(params) => (
          <TextField {...params} label="controlled" variant="standard" />
        )}
      /> */}
     
    </Stack>

    </Box>
  );
}

export default TestHookForm;
