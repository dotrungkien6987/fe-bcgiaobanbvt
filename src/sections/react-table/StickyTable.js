import PropTypes from "prop-types";
import { useMemo } from "react";

// material-ui
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Stack,
  Box,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";

// third-party
import { useTable, useSortBy, useGlobalFilter, usePagination } from "react-table";
import { useSticky } from "react-table-sticky";

// project-imports
import MainCard from "components/MainCard";
import ScrollX from "components/ScrollX";
import { CSVExport, HeaderSort, HidingSelect, TablePagination } from "components/third-party/ReactTable";
import { ThemeMode } from "configAble";
import { GlobalFilter } from "utils/react-table";

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

function ReactTable({ columns, data, getHeaderProps, title,additionalComponent, sx }) {
  const defaultColumn = useMemo(
    () => ({
      minWidth: 50,
      width: 100,
      maxWidth: 400,
      
    }),
    []
  );
  const theme = useTheme();
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    page,
    prepareRow,
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
      
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
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
        <Box sx={{ p: 2, py: 0 }}>
          <TablePagination
            gotoPage={gotoPage}
            rows={rows}
            setPageSize={setPageSize}
            pageIndex={pageIndex}
            pageSize={pageSize}
          />
        </Box>
        <ScrollX sx={sx}>
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
                {page.map((row) => {
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

const StickyTable = ({ columns, data, title,additionalComponent,sx }) => {
  return (
    <ReactTable
      columns={columns}
      data={data}
      title={title}
      additionalComponent={additionalComponent}
      getHeaderProps={(column) => column.getSortByToggleProps()}
      sx={sx}
    />
  );
};

StickyTable.propTypes = {
  columns: PropTypes.array,
  data: PropTypes.array,
  title: PropTypes.string,
};

export default StickyTable;
