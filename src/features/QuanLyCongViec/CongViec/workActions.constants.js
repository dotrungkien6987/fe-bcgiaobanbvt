// FE copy of work action constants (source of truth BE: workActions.constants.js)
export const WORK_ACTIONS = Object.freeze({
  GIAO_VIEC: "GIAO_VIEC",
  HUY_GIAO: "HUY_GIAO",
  TIEP_NHAN: "TIEP_NHAN",
  HOAN_THANH_TAM: "HOAN_THANH_TAM",
  HUY_HOAN_THANH_TAM: "HUY_HOAN_THANH_TAM",
  DUYET_HOAN_THANH: "DUYET_HOAN_THANH",
  HOAN_THANH: "HOAN_THANH",
  MO_LAI_HOAN_THANH: "MO_LAI_HOAN_THANH",
});

export const PERMISSION_ERROR_MESSAGES = {
  NOT_ASSIGNER: "Chỉ người giao việc được thực hiện hành động này",
  NOT_MAIN: "Chỉ người thực hiện chính được thực hiện hành động này",
  FORBIDDEN: "Bạn không có quyền thực hiện hành động này",
};
