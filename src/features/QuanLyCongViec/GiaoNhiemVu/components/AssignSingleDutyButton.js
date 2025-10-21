import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Alert,
  IconButton,
} from "@mui/material";
import { Add, Close } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import FAutocomplete from "components/form/FAutocomplete";
import FTextField from "components/form/FTextField";
import { assignDuty, fetchDutiesByEmployee } from "../giaoNhiemVuSlice";

// ✅ SLICE 1: Validation schema với MucDoKho
const yupSchema = Yup.object().shape({
  employeeId: Yup.string().required("Vui lòng chọn nhân viên"),
  dutyId: Yup.string().required("Vui lòng chọn nhiệm vụ"),
  mucDoKho: Yup.number()
    .required("Vui lòng nhập độ khó")
    .min(1.0, "Độ khó tối thiểu là 1.0")
    .max(10.0, "Độ khó tối đa là 10.0")
    .test(
      "max-one-decimal",
      "Độ khó chỉ cho phép tối đa 1 chữ số thập phân (VD: 5.5, 7.2)",
      (value) => {
        if (value === undefined || value === null) return true;
        return Math.round(value * 10) === value * 10;
      }
    ),
});

function AssignSingleDutyButton({ employees = [] }) {
  const dispatch = useDispatch();
  const { isLoading, duties } = useSelector((state) => state.giaoNhiemVu);

  const [open, setOpen] = useState(false);

  const methods = useForm({
    resolver: yupResolver(yupSchema),
    defaultValues: {
      employeeId: "",
      dutyId: "",
      mucDoKho: "",
    },
  });

  const {
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isSubmitting },
  } = methods;

  const selectedEmployeeId = watch("employeeId");
  const selectedDutyId = watch("dutyId");

  // ✅ Fetch duties when employee is selected
  useEffect(() => {
    if (selectedEmployeeId) {
      dispatch(fetchDutiesByEmployee(selectedEmployeeId));
    }
  }, [selectedEmployeeId, dispatch]);

  // ✅ Pre-fill MucDoKho from duty's MucDoKhoDefault when duty is selected
  useEffect(() => {
    if (selectedDutyId) {
      const duty = duties.find((d) => d._id === selectedDutyId);
      if (duty?.MucDoKhoDefault) {
        setValue("mucDoKho", duty.MucDoKhoDefault);
      }
    }
  }, [selectedDutyId, duties, setValue]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    reset();
  };

  const onSubmit = async (data) => {
    try {
      await dispatch(
        assignDuty({
          employeeId: data.employeeId,
          dutyId: data.dutyId,
          mucDoKho: parseFloat(data.mucDoKho), // ✅ SLICE 1: Send MucDoKho
        })
      ).unwrap();
      handleClose();
    } catch (error) {
      console.error("Assign failed:", error);
    }
  };

  return (
    <>
      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={handleOpen}
        size="small"
      >
        Gán nhiệm vụ đơn lẻ
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            Gán nhiệm vụ với độ khó
            <IconButton onClick={handleClose} size="small">
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogContent dividers>
              <Stack spacing={2.5}>
                <Alert severity="info" sx={{ mb: 1 }}>
                  Độ khó sẽ được sử dụng để tính KPI cho nhân viên này
                </Alert>

                <FAutocomplete
                  name="employeeId"
                  label="Nhân viên *"
                  options={employees}
                  getOptionLabel={(option) =>
                    option?.Ten || option?.HoTen || "N/A"
                  }
                  isOptionEqualToValue={(option, value) =>
                    option?._id === value?._id || option?._id === value
                  }
                  valueKey="_id"
                  placeholder="Chọn nhân viên..."
                />

                <FAutocomplete
                  name="dutyId"
                  label="Nhiệm vụ *"
                  options={duties}
                  getOptionLabel={(option) =>
                    `${option?.TenNhiemVu || "N/A"} ${
                      option?.MucDoKhoDefault
                        ? `(Mặc định: ${option.MucDoKhoDefault})`
                        : ""
                    }`
                  }
                  isOptionEqualToValue={(option, value) =>
                    option?._id === value?._id || option?._id === value
                  }
                  valueKey="_id"
                  placeholder="Chọn nhiệm vụ..."
                />

                <FTextField
                  name="mucDoKho"
                  label="Độ khó (1.0 - 10.0) *"
                  type="number"
                  inputProps={{
                    step: 0.1,
                    min: 1.0,
                    max: 10.0,
                  }}
                  placeholder="VD: 5.5, 7.2"
                  helperText="Độ khó thực tế cho nhân viên này (tối đa 1 chữ số thập phân)"
                />
              </Stack>
            </DialogContent>

            <DialogActions>
              <Button onClick={handleClose} disabled={isSubmitting}>
                Hủy
              </Button>
              <LoadingButton
                type="submit"
                variant="contained"
                loading={isSubmitting || isLoading}
              >
                Gán nhiệm vụ
              </LoadingButton>
            </DialogActions>
          </form>
        </FormProvider>
      </Dialog>
    </>
  );
}

export default AssignSingleDutyButton;
