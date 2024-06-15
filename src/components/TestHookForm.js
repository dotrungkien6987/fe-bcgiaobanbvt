import {
  Autocomplete,
  Box,
  FormControl,
  FormControlLabel,
  FormLabel,
  Input,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import { getKhoas } from "features/BaoCaoNgay/baocaongaySlice";

import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { FTextField, FormProvider } from "./form";
import FAutocomplete from "./form/FAutocomplete";
import { LoadingButton } from "@mui/lab";
import FDatePicker from "./form/FDatePicker";
import { SignalCellularNullTwoTone } from "@mui/icons-material";
import FKRadioGroup from "./form/FKRadioGroup";

function TestHookForm() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getKhoas());
  }, []);
  const [department, setDepartment] = React.useState("NoiTM");
  const { khoas } = useSelector((state) => state.baocaongay);
  const khoasLabel = khoas.map((khoa) => ({ label: khoa.TenKhoa }));
  const methods = useForm({
    defaultValues: {
      firstName: "",
      Ngay: null,
      select: null,
      gioitinh: 0,
    },
  });
  const [value, setValue] = React.useState("female");

  const handleChange = (event) => {
    setValue(event.target.value);
  };
  const {
    handleSubmit,
    reset,

    formState: { isSubmitting },
  } = methods;
  const onSubmit = (data) => {
    console.log(data);
  };
  const handleGenderChange = (event) => {
    console.log("Gender changed:", event.target.value);
    // Thực hiện các logic khác tại đây
  };

  return (
    <Box>
      {/* <form onSubmit={handleSubmit(onSubmit)}>
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
     */}

      <Stack spacing={1} sx={{ width: 300 }}>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <FTextField multiline name="fisrtname" label="Ho ten:" />
          <FAutocomplete
            name="select"
            options={khoas}
            displayField="TenKhoa"
            label="Chon khoa"
          />

          <FDatePicker name="Ngay" label="Ngày sinh" sx={{ m: 3 }} />

          <FKRadioGroup
            name="gioitinh"
            label="Giới tính"
            options={[
              { value: 0, label: "Female" },
              { value: 1, label: "Male" },
              { value: 2, label: "Other" },
            ]}
            onChange={handleGenderChange}
          />
          <LoadingButton
            type="submit"
            variant="contained"
            size="small"
            loading={isSubmitting}
          >
            Submit
          </LoadingButton>
        </FormProvider>

        <FormControl>
          <FormLabel id="demo-controlled-radio-buttons-group">Gender</FormLabel>
          <RadioGroup
            aria-labelledby="demo-controlled-radio-buttons-group"
            name="controlled-radio-buttons-group"
            value={value}
            onChange={handleChange}
          >
            <FormControlLabel
              value="female"
              control={<Radio />}
              label="Female"
            />
            <FormControlLabel value="male" control={<Radio />} label="Male" />
          </RadioGroup>
        </FormControl>
      </Stack>
    </Box>
  );
}

export default TestHookForm;
