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
import {
  useTable,
  useSortBy,
  useGlobalFilter,
  useFilters,
  usePagination,
  useResizeColumns,
  useBlockLayout,
} from "react-table";
import { useSticky } from "react-table-sticky";

// project-imports
import MainCard from "components/MainCard";
import ScrollX from "components/ScrollX";
import {
  CSVExport,
  HeaderSort,
  HidingSelect,
  TablePagination,
} from "components/third-party/ReactTable";
import { ThemeMode } from "configAble";
import {
  DefaultColumnFilter,
  GlobalFilter,
  renderFilterTypes,
} from "utils/react-table";
import AddNhanVienButton from "features/Daotao/AddNhanVienButton";
// import { ThemeMode } from 'config';

// ==============================|| REACT TABLE ||============================== //

// table style
const TableWrapper = styled("div")(() => ({
  ".header": {
    position: "sticky",
    zIndex: 3,
    width: "fit-content",
  },
  ".filter": {
    position: "sticky",
    zIndex: 3,
    width: "fit-content",
    top: 56, // Adjust the value of 'top' as needed to match the height of the header
  },
  "& th[data-sticky-td]": {
    position: "sticky",
    zIndex: "2 !important",
  },
  "& td[data-sticky-td]": {
    position: "sticky",
    zIndex: "1 !important",
  },
}));

function ReactTable({ columns, data, getHeaderProps, title }) {
  const filterTypes = useMemo(() => renderFilterTypes, []);
  const defaultColumn = useMemo(
    () => ({
      minWidth: 50,
      width: 100,
      maxWidth: 400,
      Filter: DefaultColumnFilter,
    }),
    []
  );
  const initialState = useMemo(
    () => ({
      filters: [{ id: "status", value: "" }],
      hiddenColumns: ["SoDienThoai"],
      // columnOrder: [
      //   "selection",
      //   "avatar",
      //   "lastName",
      //   "firstName",
      //   "email",
      //   "age",
      //   "visits",
      //   "status",
      //   "progress",
      // ],
      pageIndex: 0,
      pageSize: 10,
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
  } = useTable(
    {
      columns,
      data,
      defaultColumn,
      initialState,
      filterTypes,
    },
    useFilters,
    useGlobalFilter,
    useSticky,
    useSortBy,
    usePagination,
    // useBlockLayout,
    // useResizeColumns,
  );
  let headers = [];
  allColumns.map((item) => {
    if (!hiddenColumns?.includes(item.id)) {
      headers.push({ label: item.Header, key: item.id });
    }
    return item;
  });

  const sortingRow = rows.slice(0, 19);
  let sortedData = sortingRow.map((d) => d.original);
  Object.keys(sortedData).forEach(
    (key) =>
      sortedData[Number(key)] === undefined && delete sortedData[Number(key)]
  );

  return (
    <Stack spacing={1}>
      <Stack
        direction="row"
        justifyContent="flex-end"
        sx={{ p: 1, pb: 0 }}
      >
        <GlobalFilter
          preGlobalFilteredRows={preGlobalFilteredRows}
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
        />

        <Box sx={{ p: 2 }}>
          <TablePagination
            gotoPage={gotoPage}
            rows={rows}
            setPageSize={setPageSize}
            pageIndex={pageIndex}
            pageSize={pageSize}
          />
        </Box>

        <HidingSelect
          hiddenColumns={hiddenColumns}
          setHiddenColumns={setHiddenColumns}
          allColumns={allColumns}
        />
         <CSVExport
            data={sortedData}
            filename={
              title === "Sticky Header"
                ? "sticky-header-table.csv"
                : "sticky-column-table.csv"
            }
          />
           <AddNhanVienButton />
      </Stack>

    
        <ScrollX sx={{ height: 500 }}>
          <TableWrapper>
            <Table {...getTableProps()} stickyHeader>
              <TableHead sx={{ borderTopWidth: 2 }}>
                {headerGroups.map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    {...headerGroup.getHeaderGroupProps()}
                  >
                    {headerGroup.headers.map((column) => {
                      const stickyLeft =
                        column.sticky === "left"
                          ? { position: "sticky", left: 0, zIndex: 2 }
                          : {};
                      return (
                        <TableCell
                          key={column.id}
                          sx={{ ...stickyLeft, top: 0 }}
                          {...column.getHeaderProps([
                            { className: column.className },
                            getHeaderProps(column),
                          ])}
                        >
                          <HeaderSort column={column} />
                          {/* {column.render("Header")} */}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
                {headerGroups.map((group) => (
                  <TableRow
                    key={group.id}
                    className="filter"
                    {...group.getHeaderGroupProps()}
                  >
                    {group.headers.map((column) => {
                      const stickyLeft =
                        column.sticky === "left"
                          ? { position: "sticky", left: 0, zIndex: 2 }
                          : {};
                      return (
                        <TableCell
                          key={column.id}
                          sx={{ ...stickyLeft, top: 56, zIndex: 3 }} // Adjust the value of 'top' as needed
                          {...column.getHeaderProps([
                            { className: column.className },
                          ])}
                        >
                          {column.canFilter ? column.render("Filter") : null}
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
                    <TableRow key={row.id} {...row.getRowProps()}>
                      {row.cells.map((cell) => {
                        const stickyLeft =
                          cell.column.sticky === "left"
                            ? { position: "sticky", left: 0, zIndex: 1 }
                            : {};
                        return (
                          <TableCell
                            key={cell.id}
                            sx={{
                              ...stickyLeft,
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

const StickyTable = ({ columns, data, title }) => {
  return (
    <ReactTable
      columns={columns}
      data={data}
      title={title}
      getHeaderProps={(column) => column.getSortByToggleProps()}
    />
  );
};

StickyTable.propTypes = {
  columns: PropTypes.array,
  data: PropTypes.array,
  title: PropTypes.string,
};

export default StickyTable;
