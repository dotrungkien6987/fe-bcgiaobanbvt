import PropTypes from 'prop-types';
import { useMemo } from 'react';

// material-ui
import { Chip, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

// third-party
import { useTable, useSortBy } from 'react-table';

// project-imports
import makeData from 'data/react-table';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import LinearWithLabel from 'components/@extended/progress/LinearWithLabel';
import { CSVExport, HeaderSort } from 'components/third-party/ReactTable';

// ==============================|| REACT TABLE ||============================== //

function ReactTable({ columns, data }) {
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
    {
      columns,
      data,
      initialState: {
        sortBy: [
          {
            id: 'firstName',
            desc: false
          }
        ]
      }
    },
    useSortBy
  );

  const sortingRow = rows.slice(0, 9);
  let sortedData = sortingRow.map((d) => d.original);
  Object.keys(sortedData).forEach((key) => sortedData[Number(key)] === undefined && delete sortedData[Number(key)]);

  return (
    <MainCard title="Sorting Table" content={false} secondary={<CSVExport data={sortedData} filename={'sorting-table.csv'} />}>
      <ScrollX>
        <Table {...getTableProps()}>
          <TableHead>
            {headerGroups.map((headerGroup) => (
              <TableRow key={headerGroup} {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <TableCell key={column} {...column.getHeaderProps([{ className: column.className }])}>
                    <HeaderSort column={column} sort />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody {...getTableBodyProps()}>
            {sortingRow.map((row) => {
              prepareRow(row);
              return (
                <TableRow key={row} {...row.getRowProps()}>
                  {row.cells.map((cell) => (
                    <TableCell key={cell} {...cell.getCellProps([{ className: cell.column.className }])}>
                      {cell.render('Cell')}
                    </TableCell>
                  ))}
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
  data: PropTypes.array,
  getHeaderProps: PropTypes.func
};

// ==============================|| REACT TABLE - SORTING ||============================== //

const SortingTable = ({columns,data}) => {
  
  return <ReactTable columns={columns} data={data} />;
};

SortingTable.propTypes = {
  value: PropTypes.string
};

export default SortingTable;
