import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import {
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";

function FKRadioGroup({
  name,
  label,
  options,
  onChange: customOnChange,
  ...other
}) {
  const { control } = useFormContext();

  return (
    <FormControl>
      <FormLabel>{label}</FormLabel>
      <Controller
        name={name}
        control={control}
        render={({
          field: { onChange, value = "" },
          fieldState: { error },
        }) => (
          <RadioGroup
            value={value}
            onChange={(e) => {
              const raw = e.target.value;
              let nextVal = raw;
              if (raw === "true") nextVal = true;
              else if (raw === "false") nextVal = false;
              onChange(nextVal);
              if (customOnChange) {
                customOnChange(nextVal);
              }
            }}
            {...other}
          >
            {options.map((option) => (
              <FormControlLabel
                key={option.value}
                value={option.value}
                control={<Radio />}
                label={option.label}
              />
            ))}
          </RadioGroup>
        )}
      />
    </FormControl>
  );
}

export default FKRadioGroup;
