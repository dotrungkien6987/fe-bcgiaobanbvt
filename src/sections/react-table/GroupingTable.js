import PropTypes from 'prop-types';
import { useMemo } from 'react';

// material-ui
import { Box, Chip, Stack, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

// third-party
import { useTable, useGroupBy, useExpanded } from 'react-table';

// project-imports
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import { CSVExport } from 'components/third-party/ReactTable';
import LinearWithLabel from 'components/@extended/progress/LinearWithLabel';
import { roundedMedian } from 'utils/react-table';

// assets
import { ArrowDown2, ArrowRight2, LayoutMaximize, Maximize1 } from 'iconsax-react';

// ==============================|| REACT TABLE ||============================== //

function ReactTable({ columns, data }) {
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
    {
      columns,
      data,
      // initialState: { groupBy: ['GioiTinh'] }
    },
    useGroupBy,
    useExpanded
  );

  const firstPageRows = rows.slice(0, rows.length);

  let groupedData = [];
  if (rows.filter((row) => row.original).length) {
    groupedData = rows.map((row) => row.original).filter((row) => row !== undefined);
  } else {
    groupedData = [];
    rows.forEach((row) => {
      if (row.subRows.length) {
        groupedData.push({ ...row.values });
        row.subRows.forEach((subRow) => {
          if (subRow.subRows.length) {
            groupedData.push({ ...subRow.values });
            subRow.subRows.forEach((innerRow) => {
              groupedData.push({
                ...innerRow.values,
                age: undefined,
                status: undefined
              });
            });
          } else {
            groupedData.push({
              ...subRow.values,
              age: undefined
            });
          }
        });
      } else {
        groupedData.push({ ...row.values });
      }
    });
  }

  return (
    <MainCard
      content={false}
      title="Grouping With Seperate Column"
      secondary={
        <Stack direction="row" spacing={2} sx={{ display: { xs: 'none', sm: 'flex' } }}>
          <Legend /> <CSVExport data={groupedData} filename={'grouping-seperate-column-table.csv'} />
        </Stack>
      }
    >
      <Stack direction="row" spacing={2} sx={{ p: { xs: 1, sm: 2.5 }, display: { xs: 'flex', sm: 'none' } }} justifyContent="flex-end">
        <Legend /> <CSVExport data={groupedData} filename={'grouping-seperate-column-table.csv'} />
      </Stack>
      <ScrollX sx={{ maxHeight: 600 }}>
        <Table {...getTableProps()}>
          <TableHead sx={{ position: 'sticky', top: -1, zIndex: 1199 }}>
            {headerGroups.map((headerGroup) => (
              <TableRow key={headerGroup} {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => {
                  const groupIcon = column.isGrouped ? <Maximize1 size={18} /> : <LayoutMaximize size={18} />;
                  return (
                    <TableCell key={column} {...column.getHeaderProps([{ className: column.className }])}>
                      <Stack direction="row" spacing={1.15} alignItems="center" sx={{ display: 'inline-flex' }}>
                        {column.canGroupBy ? (
                          <Box
                            sx={{ color: column.isGrouped ? 'error.main' : 'primary.main', fontSize: '1rem' }}
                            {...column.getGroupByToggleProps()}
                          >
                            {groupIcon}
                          </Box>
                        ) : null}
                        <Box>{column.render('Header')}</Box>
                      </Stack>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableHead>
          <TableBody {...getTableBodyProps()}>
            {firstPageRows.map((row) => {
              prepareRow(row);
              return (
                <TableRow key={row} {...row.getRowProps()}>
                  {row.cells.map((cell) => {
                    let bgcolor = 'background.paper';
                    if (cell.isGrouped) bgcolor = 'success.lighter';
                    if (cell.isAggregated) bgcolor = 'warning.lighter';
                    if (cell.isPlaceholder) bgcolor = 'error.lighter';

                    const collapseIcon = row.isExpanded ? <ArrowDown2 size={16} /> : <ArrowRight2 size={16} />;

                    return (
                      <TableCell key={cell} {...cell.getCellProps([{ className: cell.column.className }])} sx={{ bgcolor }}>
                        {cell.isGrouped ? (
                          <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-start">
                            <Box sx={{ pr: 0.5, fontSize: '0.75rem', color: 'text.secondary' }} {...row.getToggleRowExpandedProps()}>
                              {collapseIcon}
                            </Box>
                            <Box>{cell.render('Cell')}</Box>
                            <Box>({row.subRows.length})</Box>
                          </Stack>
                        ) : cell.isAggregated ? (
                          cell.render('Aggregated')
                        ) : cell.isPlaceholder ? null : (
                          cell.render('Cell')
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </ScrollX>
    </MainCard>
  );
}
ReactTable.propTypes = {
  columns: PropTypes.array,
  data: PropTypes.array
};
// ==============================|| LEGEND ||============================== //

function Legend() {
  return (
    <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
      <Chip color="success" variant="light" label="Grouped" size="small" />
      <Chip color="warning" variant="light" label="Aggregated" size="small" />
      <Chip color="error" variant="light" label="Repeated" size="small" />
    </Stack>
  );
}

// ==============================|| REACT TABLE - GROUPING TABLE ||============================== //

function GroupingTable({ data,columns }) {
 
  return <ReactTable columns={columns} data={data} />;
}

GroupingTable.propTypes = {
  data: PropTypes.array,
  value: PropTypes.string
};

export default GroupingTable;
