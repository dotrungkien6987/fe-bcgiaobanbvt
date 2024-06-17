import PropTypes from "prop-types";
import { useEffect, useMemo, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
// material-ui
import { styled, alpha, useTheme } from "@mui/material/styles";
import {
  Box,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableRow,
  Typography,
  TextField,
  Select,
  MenuItem,
  Slider,
  Tooltip,
  IconButton,
  Button,
} from "@mui/material";

// third-party
import { Formik, Form } from "formik";
import * as Yup from "yup";
import update from "immutability-helper";
import { useSticky } from "react-table-sticky";
import { NumericFormat } from "react-number-format";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import { isMobile } from "react-device-detect";

import {
  useColumnOrder,
  useExpanded,
  useFilters,
  useGroupBy,
  useGlobalFilter,
  usePagination,
  useRowSelect,
  useSortBy,
  useTable,
} from "react-table";

// project-imports
import MainCard from "components/MainCard";
import Avatar from "components/@extended/Avatar";
import ScrollX from "components/ScrollX";
import LinearWithLabel from "components/@extended/progress/LinearWithLabel";

import makeData from "data/react-table";
import SyntaxHighlight from "utils/SyntaxHighlight";

import {
  DraggableHeader,
  DragPreview,
  HidingSelect,
  HeaderSort,
  IndeterminateCheckbox,
  TablePagination,
  TableRowSelection,
  CSVExport,
  EmptyTable,
} from "components/third-party/ReactTable";

import {
  roundedMedian,
  renderFilterTypes,
  filterGreaterThan,
  GlobalFilter,
  DefaultColumnFilter,
  SelectColumnFilter,
  SliderColumnFilter,
  NumberRangeColumnFilter,
  DateColumnFilter,
} from "utils/react-table";
import { ThemeMode } from "configAble";

// assets
import {
  ArrowDown2,
  ArrowRight2,
  Edit,
  LayoutMaximize,
  Maximize1,
  Send,
} from "iconsax-react";
import { useDispatch, useSelector } from "react-redux";
import { values } from "lodash";
import ActionSuco from "features/BaoCaoSuCo/ActionSuco";
import ActionSucoForReactTable from "features/BaoCaoSuCo/ActionSucoForReactTable";
import { getBaoCaoSuCoForDataGrid } from "features/BaoCaoSuCo/baocaosucoSlice";
import AddNhanVienButton from "features/Daotao/AddNhanVienButton";
import { setIsOpenUpdateNhanVien, setNhanVienCurent } from "features/NhanVien/nhanvienSlice";

import UpdateNhanVienButton from "features/Daotao/UpdateNhanVienButton";
import DeleteNhanVienButton from "features/Daotao/DeleteNhanVienButton";
import ThongTinNhanVien from "features/Daotao/ThongTinNhanVien";

const avatarImage = require.context("assets/images/users", true);
const TableWrapper = styled("div")(() => ({
  ".header": {
    position: "sticky",
    zIndex: 1,
    width: "fit-content",
  },
  "& th[data-sticky-td]": {
    position: "sticky",
    zIndex: "5 !important",
  },
}));
// ==============================|| REACT TABLE ||============================== //

const EditableRow = ({
  value: initialValue,
  row: { index },
  column: { id, dataType },
  editableRowIndex,
}) => {
  const [value, setValue] = useState(initialValue);
  const theme = useTheme();
  const onChange = (e) => {
    setValue(e.target.value);
  };

  const ShowStatus = (value) => {
    switch (value) {
      case "Complicated":
        return (
          <Chip
            color="error"
            label="Complicated"
            size="small"
            variant="light"
          />
        );
      case "Relationship":
        return (
          <Chip
            color="success"
            label="Relationship"
            size="small"
            variant="light"
          />
        );
      case "Single":
      default:
        return (
          <Chip color="info" label="Single" size="small" variant="light" />
        );
    }
  };
  const ShowTenKhoa = (value) => {
    return value.TenKhoa;
  };
  let element;
  let userInfoSchema;

  switch (id) {
    case "email":
      userInfoSchema = Yup.object().shape({
        userInfo: Yup.string()
          .email("Enter valid email ")
          .required("Email is a required field"),
      });
      break;
    case "age":
      userInfoSchema = Yup.object().shape({
        userInfo: Yup.number()
          .required("Age is required")
          .typeError("Age must be number")
          .min(18, "You must be at least 18 years")
          .max(100, "You must be at most 60 years"),
      });
      break;
    case "visits":
      userInfoSchema = Yup.object().shape({
        userInfo: Yup.number()
          .typeError("Visits must be number")
          .required("Required"),
      });
      break;
    default:
      userInfoSchema = Yup.object().shape({
        userInfo: Yup.string()
          .min(2, "Too Short!")
          .max(50, "Too Long!")
          .required("Name is Required"),
      });
      break;
  }

  let IsEditAble = index === editableRowIndex;

  switch (dataType) {
    case "text":
      element = (
        <>
          {IsEditAble ? (
            <>
              <Formik
                initialValues={{
                  userInfo: value,
                }}
                enableReinitialize
                validationSchema={userInfoSchema}
                onSubmit={() => {}}
              >
                {({ values, handleChange, handleBlur, errors, touched }) => (
                  <Form>
                    <TextField
                      value={values.userInfo}
                      id={`${index}-${id}`}
                      name="userInfo"
                      onChange={(e) => {
                        handleChange(e);
                        onChange(e);
                      }}
                      onBlur={handleBlur}
                      error={touched.userInfo && Boolean(errors.userInfo)}
                      helperText={
                        touched.userInfo && errors.userInfo && errors.userInfo
                      }
                      sx={{
                        "& .MuiOutlinedInput-input": {
                          py: 0.75,
                          px: 1,
                          backgroundColor:
                            theme.palette.mode === ThemeMode.DARK
                              ? "inherit"
                              : "common.white",
                        },
                      }}
                    />
                  </Form>
                )}
              </Formik>
            </>
          ) : (
            value
          )}
        </>
      );
      break;
    case "select":
      element = (
        <>
          {IsEditAble ? (
            <Select
              labelId="demo-simple-select-label"
              sx={{
                "& .MuiOutlinedInput-input": {
                  py: 0.75,
                  px: 1,
                  backgroundColor:
                    theme.palette.mode === ThemeMode.DARK
                      ? "inherit"
                      : "common.white",
                },
              }}
              id="demo-simple-select"
              value={value}
              onChange={onChange}
            >
              <MenuItem value={"Complicated"}>
                <Chip
                  color="error"
                  label="Complicated"
                  size="small"
                  variant="light"
                />
              </MenuItem>
              <MenuItem value={"Relationship"}>
                <Chip
                  color="success"
                  label="Relationship"
                  size="small"
                  variant="light"
                />
              </MenuItem>
              <MenuItem value={"Single"}>
                <Chip
                  color="info"
                  label="Single"
                  size="small"
                  variant="light"
                />
              </MenuItem>
            </Select>
          ) : (
            ShowStatus(value)
          )}
        </>
      );
      break;
    case "progress":
      element = (
        <>
          {IsEditAble ? (
            <>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ pl: 1, minWidth: 120 }}
              >
                <Slider
                  value={value}
                  min={0}
                  max={100}
                  step={1}
                  onChange={(event, newValue) => {
                    setValue(newValue);
                  }}
                  valueLabelDisplay="auto"
                  aria-labelledby="non-linear-slider"
                />
              </Stack>
            </>
          ) : (
            <div>
              <LinearWithLabel value={value} sx={{ minWidth: 75 }} />
            </div>
          )}
        </>
      );
      break;
    case "TenKhoa":
      element = ShowTenKhoa(value);
      break;
    default:
      element = <span>{value}</span>;
      break;
  }
  return element;
};

function ReactTable({ columns, data}) {
  const theme = useTheme();
  const filterTypes = useMemo(() => renderFilterTypes, []);
  const [editableRowIndex, setEditableRowIndex] = useState(null);
  const dispatch = useDispatch();
  const { nhanvienCurent,isOpenDeleteNhanVien,isOpenUpdateNhanVien } = useSelector((state) => state.nhanvien);
  const defaultColumn = useMemo(
    () => ({
      Filter: DefaultColumnFilter,
      Cell: EditableRow,
    }),
    []
  );

  const initialState = useMemo(
    () => ({
      filters: [{ id: "status", value: "" }],
      hiddenColumns: ["_id"],
      columnOrder: [
        "Ten",
        "MaNhanVien",
        "GioiTinh",
        "NgaySinh",
        "Loai",
        "TenKhoa",
        "TrinhDoChuyenMon",
        "SoDienThoai",
        "Email",
      ],
      pageIndex: 0,
      pageSize: 5,
    }),
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    footerGroups,
    rows,
    page,
    prepareRow,
    setColumnOrder,
    gotoPage,
    setPageSize,
    setHiddenColumns,
    allColumns,
    state: {
      globalFilter,
      hiddenColumns,
      pageIndex,
      pageSize,
      columnOrder,
      selectedRowIds,
    },
    preGlobalFilteredRows,
    setGlobalFilter,
    selectedFlatRows,
  } = useTable(
    {
      columns,
      data,
      defaultColumn,
      initialState,
      filterTypes,
      editableRowIndex,
      setEditableRowIndex,
    },
    useGlobalFilter,
    useFilters,
    useColumnOrder,
    useGroupBy,
    useSortBy,
    useExpanded,
    usePagination,
    useRowSelect,
    useSticky,
    (hooks) => {
      hooks.allColumns.push((columns) => [
        ...columns,
        {
          accessor: "update",
          id: "update",
          Footer: "Action3",
          Header: "Action3",
          sticky: "right",
          width: 50,
          disableFilters: true,
          disableSortBy: true,
          disableGroupBy: true,
          groupByBoundary: true,
          Cell: ({ row, setEditableRowIndex, editableRowIndex }) => (
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={0}>
          <UpdateNhanVienButton nhanvien={row.original}/>
          <DeleteNhanVienButton nhanvienid = {row.original._id}/>
          </Stack>
          ),
        },
        
      ]);
    }
  );

  const reorder = (item, newIndex) => {
    const { index: currentIndex } = item;

    let dragRecord = columnOrder[currentIndex];
    if (!columnOrder.includes(item.id)) {
      dragRecord = item.id;
    }

    setColumnOrder(
      update(columnOrder, {
        $splice: [
          [currentIndex, 1],
          [newIndex, 0, dragRecord],
        ],
      })
    );
  };

  let headers = [];
  allColumns.map((item) => {
    if (
      !hiddenColumns?.includes(item.id) &&
      item.id !== "selection" &&
      item.id !== "edit"
    ) {
      headers.push({
        label: typeof item.Header === "string" ? item.Header : "#",
        key: item.id,
      });
    }
    return item;
  });
  const handleThemMoi = () => {
    console.log("them moi");
  };

  return (
    <>
      
      <TableRowSelection selected={Object.keys(selectedRowIds).length} />
      <Stack spacing={2}>
        <Stack
          direction="row"
          justifyContent="space-between"
          sx={{ p: 2, pb: 0 }}
        >
          <GlobalFilter
            preGlobalFilteredRows={preGlobalFilteredRows}
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
            size="small"
          />
          <Stack direction="row" spacing={2}>
            <HidingSelect
              hiddenColumns={hiddenColumns}
              setHiddenColumns={setHiddenColumns}
              allColumns={allColumns}
            />
            <CSVExport
              data={
                selectedFlatRows.length > 0
                  ? selectedFlatRows.map((d) => d.original)
                  : data
              }
              filename={"umbrella-table.csv"}
              headers={headers}
            />
            <AddNhanVienButton />
          </Stack>
         
        </Stack>

        <Box sx={{ width: "100%", overflowX: "auto", display: "block" }}>
          <Table {...getTableProps()} stickyHeader>
            <TableHead sx={{ borderTopWidth: 2 }}>
              {headerGroups.map((headerGroup) => (
                <TableRow
                  key={headerGroup}
                  {...headerGroup.getHeaderGroupProps()}
                >
                  {headerGroup.headers.map((column, index) => {
                    const groupIcon = column.isGrouped ? (
                      <Maximize1 size={18} />
                    ) : (
                      <LayoutMaximize size={18} />
                    );
                    return (
                      <TableCell
                        key={column}
                        {...column.getHeaderProps([
                          { className: column.className },
                        ])}
                      >
                        <DraggableHeader
                          reorder={reorder}
                          key={column.id}
                          column={column}
                          index={index}
                        >
                          <Stack
                            direction="row"
                            spacing={1.15}
                            alignItems="center"
                            sx={{ display: "inline-flex" }}
                          >
                            {column.canGroupBy ? (
                              <Box
                                sx={{
                                  color: column.isGrouped
                                    ? "error.main"
                                    : "primary.main",
                                  fontSize: "1rem",
                                }}
                                {...column.getGroupByToggleProps()}
                              >
                                {groupIcon}
                              </Box>
                            ) : null}
                            <HeaderSort column={column} sort />
                          </Stack>
                        </DraggableHeader>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableHead>

            {/* striped table -> add class 'striped' */}
            <TableBody {...getTableBodyProps()} className="striped">
              {headerGroups.map((group) => (
                <TableRow key={group} {...group.getHeaderGroupProps()}>
                  {group.headers.map((column) => (
                    <TableCell
                      key={column}
                      {...column.getHeaderProps([
                        { className: column.className },
                      ])}
                    >
                      {column.canFilter ? column.render("Filter") : null}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              {page.length > 0 ? (
                page.map((row) => {
                  prepareRow(row);
                  return (
                    <TableRow
                      key={row}
                      {...row.getRowProps()}
                      {...(editableRowIndex !== row.index && {
                        onClick: () => {
                          row.toggleRowSelected();
                        },
                      })}
                      sx={{
                        cursor: "pointer",
                        bgcolor: row.isSelected
                          ? alpha(theme.palette.primary.lighter, 0.35)
                          : "inherit",
                      }}
                    >
                      {row.cells.map((cell) => {
                        let bgcolor = "inherit";
                        if (cell.isGrouped) bgcolor = "success.lighter";
                        if (cell.isAggregated) bgcolor = "warning.lighter";
                        if (cell.isPlaceholder) bgcolor = "error.lighter";
                        if (cell.isPlaceholder) bgcolor = "error.lighter";
                        if (row.isSelected)
                          bgcolor = alpha(theme.palette.primary.lighter, 0.35);
                        const collapseIcon = row.isExpanded ? (
                          <ArrowDown2 />
                        ) : (
                          <ArrowRight2 />
                        );

                        return (
                          <TableCell
                            key={cell}
                            {...cell.getCellProps([
                              { className: cell.column.className },
                            ])}
                            sx={{ bgcolor }}
                          >
                            {cell.isGrouped ? (
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                sx={{ display: "inline-flex" }}
                              >
                                <Box
                                  sx={{
                                    pr: 1.25,
                                    fontSize: "0.75rem",
                                    color: "text.secondary",
                                  }}
                                  onClick={(e) => {
                                    row.toggleRowExpanded();
                                    e.stopPropagation();
                                  }}
                                >
                                  {collapseIcon}
                                </Box>
                                {cell.render("Cell")} ({row.subRows.length})
                              </Stack>
                            ) : cell.isAggregated ? (
                              cell.render("Aggregated")
                            ) : cell.isPlaceholder ? null : (
                              cell.render("Cell")
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })
              ) : (
                <EmptyTable msg="No Data" colSpan={9} />
              )}
            </TableBody>

            {/* footer table */}
            <TableFooter sx={{ borderBottomWidth: 2 }}>
              {footerGroups.map((group) => (
                <TableRow key={group} {...group.getFooterGroupProps()}>
                  {group.headers.map((column) => (
                    <TableCell
                      key={column}
                      {...column.getFooterProps([
                        { className: column.className },
                      ])}
                    >
                      {column.render("Footer")}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableFooter>
          </Table>
        </Box>
        <Box sx={{ p: 2, py: 0 }}>
          <TablePagination
            gotoPage={gotoPage}
            rows={rows}
            setPageSize={setPageSize}
            pageIndex={pageIndex}
            pageSize={pageSize}
          />
        </Box>

        <SyntaxHighlight>
          {JSON.stringify(
            {
              selectedRowIndices: selectedRowIds,
              "selectedFlatRows[].original": selectedFlatRows.map(
                (d) => d.original
              ),
            },
            null,
            2
          )}
        </SyntaxHighlight>
      </Stack>
     
    </>
  );
}

ReactTable.propTypes = {
  columns: PropTypes.array,
  data: PropTypes.array,
  row: PropTypes.object,
  index: PropTypes.string,
  getRowProps: PropTypes.func,
  setEditableRowIndex: PropTypes.func,
  editableRowIndex: PropTypes.func,
  toggleRowSelected: PropTypes.func,
  isSelected: PropTypes.bool,
  isExpanded: PropTypes.bool,
  toggleRowExpanded: PropTypes.func,
  subRows: PropTypes.object,
  length: PropTypes.string,
};

// ==============================|| REACT TABLE - UMBRELLA ||============================== //

const NhanVienTable = ({ data, columns }) => {
  return (
    <MainCard
      title="Umbrella Table"
      subheader="This page consist combination of most possible features of react-table in to one table. Sorting, grouping, row selection, hidden row, filter, search, pagination, footer row available in below table."
      content={false}
    >
      <ScrollX sx={{ height: 500 }}>
        <TableWrapper>
          <DndProvider backend={isMobile ? TouchBackend : HTML5Backend}>
            <ReactTable columns={columns} data={data} />
            
            <DragPreview />
          </DndProvider>
        </TableWrapper>
      </ScrollX>
    </MainCard>
  );
};

NhanVienTable.propTypes = {
  row: PropTypes.object,
  setEditableRowIndex: PropTypes.func,
  editableRowIndex: PropTypes.string,
  index: PropTypes.string,
  getRowProps: PropTypes.func,
  toggleRowSelected: PropTypes.func,
  isSelected: PropTypes.bool,
  isExpanded: PropTypes.bool,
  toggleRowExpanded: PropTypes.func,
  subRows: PropTypes.object,
  length: PropTypes.string,
  getToggleAllPageRowsSelectedProps: PropTypes.func,
  getToggleRowSelectedProps: PropTypes.func,
  value: PropTypes.string,
};

export default NhanVienTable;
