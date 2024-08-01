import PropTypes from "prop-types";
import { useEffect, useMemo, useState } from "react";

// material-ui
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Stack,
  Select,
  MenuItem,
  Chip,
  TextField,
  Box,
  Slider,
  Tooltip,
  IconButton,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { Formik, Form } from 'formik';
// third-party
import { useTable, useSortBy, useGlobalFilter, useFilters } from "react-table";
import { useSticky } from "react-table-sticky";
import { TickSquare } from 'iconsax-react';
// project-imports
import MainCard from "components/MainCard";
import ScrollX from "components/ScrollX";
import { CSVExport, HeaderSort, HidingSelect } from "components/third-party/ReactTable";
import { ThemeMode } from "configAble";
import { DefaultColumnFilter, GlobalFilter } from "utils/react-table";
import * as Yup from 'yup';
import LinearWithLabel from "components/@extended/progress/LinearWithLabel";
// ==============================|| REACT TABLE ||============================== //

// table style
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

const CellEdit = ({ value: initialValue, row: { index }, column: { id, dataType,editable }, updateData }) => {
  const [value, setValue] = useState(initialValue);
  const [showSelect, setShowSelect] = useState(false);

  const onChange = (e) => {
    setValue(e.target?.value);
  };

  // const onChange = (e) => {
  //   const newValue = e.target?.type === 'checkbox' ? e.target.checked : e.target.value;
  //   setValue(newValue);
  //   updateData(index, id, newValue); // Cập nhật ngay lập tức khi thay đổi giá trị
  // };
  const onBlur = () => {
    updateData(index, id, value);
  };

  useEffect(() => {
    // console.log('initialValue', initialValue);
    setValue(initialValue);
  }, [initialValue]);
// Nếu cột không thể chỉnh sửa, chỉ hiển thị giá trị
if (!editable) {
  return <span>{value}</span>;
}
  let element;
  let userInfoSchema;
  switch (id) {
    case 'email':
      userInfoSchema = Yup.object().shape({
        userInfo: Yup.string().email('Enter valid email ').required('Email is a required field')
      });
      break;
    case 'age':
      userInfoSchema = Yup.object().shape({
        userInfo: Yup.number()
          .required('Age is required')
          .typeError('Age must be number')
          .min(18, 'You must be at least 18 years')
          .max(100, 'You must be at most 60 years')
      });
      break;
    case 'visits':
      userInfoSchema = Yup.object().shape({
        userInfo: Yup.number().typeError('Visits must be number').required('Required')
      });
      break;
    default:
      userInfoSchema = Yup.object().shape({
        userInfo: Yup.string().min(2, 'Too Short!').max(50, 'Too Long!').required('Name is Required')
      });
      break;
  }

  switch (dataType) {
    case 'checkbox': 
    element = (
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => {
          setValue(e.target.checked);
          updateData(index, id, e.target.checked);
        }}
        // onChange={onchange}
        // onBlur={onBlur}
      />
    );
    break;
    // case 'text':
    //   element = (
    //     <>
    //       <Formik
    //         initialValues={{
    //           userInfo: value
    //         }}
    //         enableReinitialize
    //         validationSchema={userInfoSchema}
    //         onSubmit={() => {}}
    //       >
    //         {({ values, handleChange, handleBlur, errors, touched }) => (
    //           <Form>
    //             <TextField
    //               value={values.userInfo}
    //               id={`${index}-${id}`}
    //               name="userInfo"
    //               onChange={(e) => {
    //                 handleChange(e);
    //                 onChange(e);
    //               }}
    //               onBlur={handleBlur}
    //               error={touched.userInfo && Boolean(errors.userInfo)}
    //               helperText={touched.userInfo && errors.userInfo && errors.userInfo}
    //               sx={{
    //                 '& .MuiOutlinedInput-input': { py: 0.75, px: 1, width: id === 'email' ? 150 : 80 },
    //                 '& .MuiOutlinedInput-notchedOutline': { border: 'none' }
    //               }}
    //             />
    //           </Form>
    //         )}
    //       </Formik>
    //     </>
    //   );
    //   break;
    case 'text':
      element = (
        <TextField
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          sx={{ '& .MuiOutlinedInput-input': { py: 0.75, px: 1, width: id === 'email' ? 150 : 80 }, '& .MuiOutlinedInput-notchedOutline': { border: 'none' } }}
        />
      );
      break;
    case 'select':
      element = (
        <>
          <Select
            labelId="editable-select-status-label"
            sx={{ boxShadow: 'none', '.MuiOutlinedInput-notchedOutline': { border: 0 }, svg: { display: 'none' } }}
            id="editable-select-status"
            value={value}
            onChange={onChange}
            onBlur={onBlur}
          >
            <MenuItem value="Complicated">
              <Chip color="error" label="Complicated" size="small" variant="light" />
            </MenuItem>
            <MenuItem value="Relationship">
              <Chip color="success" label="Relationship" size="small" variant="light" />
            </MenuItem>
            <MenuItem value="Single">
              <Chip color="info" label="Single" size="small" variant="light" />
            </MenuItem>
          </Select>
        </>
      );
      break;
    case 'progress':
      element = (
        <>
          {!showSelect ? (
            <Box onClick={() => setShowSelect(true)}>
              <LinearWithLabel value={value} sx={{ minWidth: 75 }} />
            </Box>
          ) : (
            <>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ pl: 1, minWidth: 120 }}>
                <Slider
                  value={value}
                  min={0}
                  max={100}
                  step={1}
                  onBlur={onBlur}
                  onChange={(event, newValue) => {
                    setValue(newValue);
                  }}
                  valueLabelDisplay="auto"
                  aria-labelledby="non-linear-slider"
                />
                <Tooltip title={'Submit'}>
                  <IconButton onClick={() => setShowSelect(false)}>
                    <TickSquare />
                  </IconButton>
                </Tooltip>
              </Stack>
            </>
          )}
        </>
      );
      break;
    default:
      element = <span></span>;
      break;
  }
  return element;
};

function ReactTable({ columns, data, getHeaderProps,updateData, skipPageReset, title,additionalComponent }) {
  const defaultColumn = useMemo(
    () => ({
      minWidth: 50,
      width: 100,
      maxWidth: 400,
      Filter: DefaultColumnFilter,
      Cell: CellEdit
    }),
    []
  );
  const theme = useTheme();
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
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
      autoResetPage: !skipPageReset,
      updateData
    },
    useFilters,
    useGlobalFilter,
    useSortBy,
    useSticky
  );

  const sortingRow = rows.slice(0, 19);
  let sortedData = sortingRow.map((d) => d.original);
  Object.keys(sortedData).forEach(
    (key) =>
      sortedData[Number(key)] === undefined && delete sortedData[Number(key)]
  );
  let headers = [];
  allColumns.map((item) => {
    if (!hiddenColumns?.includes(item.id) && item.id !== 'selection' && item.id !== 'edit') {
      headers.push({ label: typeof item.Header === 'string' ? item.Header : '#', key: item.id });
    }
    return item;
  });
  return (
    <Stack spacing={10}>
      <MainCard
        title={title}
        content={false}
        secondary={
          <CSVExport
            data={sortedData}
            filename={
              title === "Sticky Header"
                ? "sticky-header-table.csv"
                : "sticky-column-table.csv"
            }
          />
        }
      >
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
            {/* <CSVExport
              data={
                selectedFlatRows.length > 0
                  ? selectedFlatRows.map((d) => d.original)
                  : data
              }
              filename={"umbrella-table.csv"}
              headers={headers}
            /> */}
            {additionalComponent && additionalComponent}
          </Stack>
        </Stack>
        <ScrollX sx={{ height: 500 }}>
          <TableWrapper>
            <Table {...getTableProps()} stickyHeader>
              <TableHead>
                {headerGroups.map((headerGroup) => (
                  <TableRow
                    key={headerGroup}
                    {...headerGroup.getHeaderGroupProps()}
                  >
                    {headerGroup.headers.map((column) => {
                      return (
                        <TableCell
                          key={column}
                          sx={{ position: "sticky !important" }}
                          {...column.getHeaderProps([
                            { className: column.className },
                            getHeaderProps(column),
                          ])}
                        >
                          <HeaderSort column={column} />
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHead>
              <TableBody {...getTableBodyProps()}>
                {sortingRow.map((row) => {
                  prepareRow(row);
                  return (
                    <TableRow key={row} {...row.getRowProps()}>
                      {row.cells.map((cell) => {
                        return (
                          <TableCell
                            key={cell}
                            sx={{
                              bgcolor:
                                theme.palette.mode === ThemeMode.DARK
                                  ? "secondary.100"
                                  : "common.white",
                            }}
                            {...cell.getCellProps([
                              { className: cell.column.className },
                            ])}
                          >
                            {cell.render("Cell")}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableWrapper>
        </ScrollX>
      </MainCard>
    </Stack>
  );
}

ReactTable.propTypes = {
  columns: PropTypes.array,
  data: PropTypes.array,
  getHeaderProps: PropTypes.func,
  title: PropTypes.string,
};

// ==============================|| REACT TABLE - STICKY ||============================== //

const MyStickyEditTable = ({ columns, data, title,additionalComponent,updateData }) => {
  return (
    <ReactTable
      columns={columns}
      data={data}
      title={title}
      additionalComponent={additionalComponent}
      getHeaderProps={(column) => column.getSortByToggleProps()}
      updateData={updateData}
    />
  );
};

MyStickyEditTable.propTypes = {
  columns: PropTypes.array,
  data: PropTypes.array,
  title: PropTypes.string,
};

export default MyStickyEditTable;
