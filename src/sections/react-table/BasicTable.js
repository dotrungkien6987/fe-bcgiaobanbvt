import PropTypes from 'prop-types';
import { useMemo } from 'react';

// material-ui
import { Chip, Stack, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

// third-party
import { useTable } from 'react-table';

// project-imports
// import MainCard from 'components/MainCard';
// import ScrollX from 'components/ScrollX';
import { CSVExport } from '../../components/third-party/ReactTable';
// import LinearWithLabel from 'components/@extended/progress/LinearWithLabel';
import MainCard from '../../components/MainCard';
import ScrollX from '../../components/ScrollX';
import LinearWithLabel from '../../components/@extended/progress/LinearWithLabel';

// ==============================|| REACT TABLE ||============================== //

function ReactTable({ columns, data, striped }) {
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({
    columns,
    data
  });
// console.log('getTableProps',getTableProps)
console.log('getTableBodyProps',{...getTableBodyProps()})
// console.log('headerGroups',headerGroups)
console.log('rows',rows)
// console.log('prepareRow',prepareRow)
  return (
    <Table {...getTableProps()}>
      <TableHead>
        {headerGroups.map((headerGroup) => (
          <TableRow key={headerGroup} {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              <TableCell key={column} {...column.getHeaderProps([{ className: column.className }])}>
                {column.render('Header')}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableHead>
      <TableBody {...getTableBodyProps()} {...(striped && { className: 'striped' })}>
        {rows.map((row) => {
          prepareRow(row);
          console.log('prepareRow', prepareRow(row))
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
  );
}
ReactTable.propTypes = {
  columns: PropTypes.array,
  data: PropTypes.array,
  striped: PropTypes.bool
};

// ==============================|| REACT TABLE - BASIC ||============================== //

const BasicTable = ({ data, striped, title,columns }) => {
  
  return (
    <MainCard
      content={false}
      title={title}
      secondary={<CSVExport data={data.slice(0, 10)} filename={striped ? 'striped-table.csv' : 'basic-table.csv'} />}
    >
      <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2}></Stack>
      <ScrollX>
        <ReactTable columns={columns} data={data} striped={striped} />
      </ScrollX>
    </MainCard>
  );
};

BasicTable.propTypes = {
  data: PropTypes.array,
  striped: PropTypes.bool,
  title: PropTypes.string,
  value: PropTypes.string
};

export default BasicTable;
