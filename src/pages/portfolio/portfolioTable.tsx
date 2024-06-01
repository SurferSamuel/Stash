import clsx from 'clsx';

// Material UI
import {
  DataGrid,
  GridColDef,
  GridCellParams
} from '@mui/x-data-grid';

// Types
import { PortfolioTableRow } from '../../../electron/types';

interface Props {
  loading: boolean;
  rows: PortfolioTableRow[];
}

// A helper function that assigns a class whether it is a positive/negative value
const makeClassName = (params: GridCellParams<any, string>) => {
  // Don't assign class if no value, or value is "-"
  if (params.value == null || params.value === "-") return "";
  return clsx('color-cell', {
    negative: params.value[0] === '-',
    positive: params.value[0] !== '-' && params.value.replaceAll('0', '').length > 2,
  });
}

// A helper function for sorting prices and percentages
const sortPriceOrPercent = (a: string, b: string) => {
  // Remove all ["$" "%" ","] from strings, then parse as numbers
  const value1 = Number(a.replace(/[$%,]/g, ''));
  const value2 = Number(b.replace(/[$%,]/g, ''));
  if (isNaN(value1)) return -1;
  if (isNaN(value2)) return 1;
  return (value1 < value2) ? -1 : 1;
}

// Data grid columns
const columns: GridColDef[] = [
  {
    field: "asxcode",
    headerName: "Code",
    minWidth: 70,
    flex: 3,
    align: "left",
    headerAlign: "left",
  },
  {
    field: "units",
    headerName: "Units",
    minWidth: 60,
    flex: 3,
    align: "right",
    headerAlign: "right",
  },
  {
    field: "avgBuyPrice",
    headerName: "Avg Buy Price",
    minWidth: 130,
    flex: 6,
    align: "right",
    headerAlign: "right",
    sortComparator: sortPriceOrPercent,
  },
  {
    field: "currentPrice",
    headerName: "Current Price",
    minWidth: 130,
    flex: 6,
    align: "right",
    headerAlign: "right",
    sortComparator: sortPriceOrPercent,
  },
  {
    field: "dailyChangePerc",
    headerName: "Change %",
    minWidth: 100,
    flex: 5,
    align: "right",
    headerAlign: "right",
    cellClassName: makeClassName,
    sortComparator: sortPriceOrPercent,
  },
  {
    field: "dailyProfit",
    headerName: "Today's Profit",
    minWidth: 130,
    flex: 6,
    align: "right",
    headerAlign: "right",
    cellClassName: makeClassName,
    sortComparator: sortPriceOrPercent,
  },
  {
    field: "profitOrLoss",
    headerName: "Profit",
    minWidth: 80,
    flex: 4,
    align: "right",
    headerAlign: "right",
    cellClassName: makeClassName,
    sortComparator: sortPriceOrPercent,
  },
  {
    field: "profitOrLossPerc",
    headerName: "Profit %",
    minWidth: 90,
    flex: 4,
    align: "right",
    headerAlign: "right",
    cellClassName: makeClassName,
    sortComparator: sortPriceOrPercent,
  },
];

const PortfolioTable = (props: Props) => {
  const { loading, rows } = props;
  return (
    <DataGrid 
      disableRowSelectionOnClick
      disableColumnMenu
      columns={columns}
      rows={rows}
      loading={loading}
      initialState={{
        pagination: { paginationModel: { pageSize: 8 } },
      }}
      pageSizeOptions={[8, 16, 32, 64]}
      sx={{
        height: 525, 
        gridColumn: "span 4",
        border: 0,
        '& .MuiDataGrid-columnHeaderTitle': {
          fontWeight: 500,
          fontSize: 16,
          color: "secondary.main",
        },
        '& .MuiDataGrid-cell': {
          fontSize: 14,
          borderBottomColor: "#ffffff1f",
        },
        '& .MuiDataGrid-cell:focus': {
          outline: 'none',
        },
        '.MuiDataGrid-columnHeader:focus': {
          outline: 'none',
        },
        '& .MuiDataGrid-columnHeaders': {
          borderBottomColor: "#ffffff1f",
        },
        '& .MuiDataGrid-footerContainer': {
          borderTopColor: "#ffffff1f",
        },
        '& .MuiDataGrid-overlay': {
          fontSize: 14, 
        },
        '& .color-cell.positive': {
          color: "#049104",
          fontWeight: 600,
        },
        '& .color-cell.negative': {
          color: "#e32020",
          fontWeight: 600,
        },
        '& .MuiTablePagination-selectLabel': {
          fontSize: 14,
        },
        '& .MuiTablePagination-input': {
          fontSize: 14,
        },
        '& .MuiTablePagination-displayedRows': {
          fontSize: 14,
        }
      }}
    />
  );
}

export default PortfolioTable;
