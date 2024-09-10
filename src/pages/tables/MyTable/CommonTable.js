import PropTypes from "prop-types";
import { Fragment,  useMemo, useState } from "react";

// material-ui
import { styled, alpha, useTheme } from "@mui/material/styles";
import {
  Box,

  Stack,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableRow,
  
} from "@mui/material";

// third-party

import update from "immutability-helper";
import { useSticky } from "react-table-sticky";

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

import {
  DraggableHeader,
  DragPreview,
  HidingSelect,
  HeaderSort,
  
  TablePagination,
  
  CSVExport,
  EmptyTable,
} from "components/third-party/ReactTable";

import {
  
  renderFilterTypes,
  
  GlobalFilter,
  DefaultColumnFilter,
 
} from "utils/react-table";


// assets
import {
  ArrowDown2,
  ArrowRight2,

  LayoutMaximize,
  Maximize1,

} from "iconsax-react";

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

function ReactTable({
  columns,
  data,
  init,
  additionalComponent,
  
  renderRowSubComponent,
}) {
  const theme = useTheme();
  const filterTypes = useMemo(() => renderFilterTypes, []);
  const [editableRowIndex, setEditableRowIndex] = useState(null);

  const defaultColumn = useMemo(
    () => ({
      Filter: DefaultColumnFilter,
    }),
    []
  );

  const initialState = useMemo(() => ({ init }), []);

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
    visibleColumns,
    state: {
      globalFilter,
      hiddenColumns,
      pageIndex,
      pageSize,
      columnOrder,
      
      expanded,
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
    useSticky
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

  const getCellTextColor = (value) => {
    // Tùy chỉnh logic để xác định màu sắc dựa trên giá trị của cell
    if (value > 50) return "green";
    if (value < 20) return "red";
    return "black";
  };
  
  return (
    <>
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
                page.map((row, i) => {
                  prepareRow(row);
                  const rowProps = row.getRowProps();
                  return (
                    <Fragment key={i}>
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
                            bgcolor = alpha(
                              theme.palette.primary.lighter,
                              0.35
                            );
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
                      {renderRowSubComponent &&
                        row.isExpanded &&
                        renderRowSubComponent({
                          row,
                          rowProps,
                          visibleColumns,
                          expanded,
                        })}
                    </Fragment>
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
       
        {/* 
        <SyntaxHighlight>
          {JSON.stringify(
            {
              selectedRowIndices: selectedRowIds,
              'selectedFlatRows[].original': selectedFlatRows.map((d) => d.original)
            },
            null,
            2
          )}
        </SyntaxHighlight> */}
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

const CommonTable = ({
  data,
  columns,
  additionalComponent,
  onSelectedRowsChange,
  renderRowSubComponent,
  sx,
}) => {
  return (
    // <MainCard
    //   title="Quản lý cán bộ"
    //   subheader="This page consist combination of most possible features of react-table in to one table. Sorting, grouping, row selection, hidden row, filter, search, pagination, footer row available in below table."
    //   content={false}
    // >
    // <ScrollX sx={{ ...sx }}>
      <TableWrapper>
        <DndProvider backend={isMobile ? TouchBackend : HTML5Backend}>
          <ReactTable
            columns={columns}
            data={data}
            additionalComponent={additionalComponent}
            onSelectedRowsChange={onSelectedRowsChange}
            renderRowSubComponent={renderRowSubComponent}
          />
          <DragPreview />
        </DndProvider>
      </TableWrapper>
    // </ScrollX>
    // </MainCard>
  );
};

CommonTable.propTypes = {
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

export default CommonTable;
