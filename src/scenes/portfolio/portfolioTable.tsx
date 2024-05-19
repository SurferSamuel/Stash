import { PortfolioFormValues } from "./index";
import { useEffect, useState } from "react";
import { useFormikContext } from "formik";
import clsx from 'clsx';

// Material UI
import {
  DataGrid,
  GridRowsProp,
  GridColDef,
  GridCellParams
} from '@mui/x-data-grid';

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
  const value1 = Number(a.replace('$', '').replace('%', ''));
  const value2 = Number(b.replace('$', '').replace('%', ''));
  if (isNaN(value1)) return -1;
  if (isNaN(value2)) return 1;
  return (value1 < value2) ? -1 : 1;
}

const PortfolioTable = () => {
  const { values } = useFormikContext<PortfolioFormValues>();
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Update rows when values is modified
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        // Show loading icon on table while waiting for request
        setLoading(true);
        const rows = await window.electronAPI.getTableRows(values);
        if (isMounted) setRows(rows);
        setLoading(false);
      } catch (error) {
        // Split message since Electron wraps the original error message with additional text.
        const splitMsg = error.message.split('Error: ');
        const msg = (splitMsg.length === 2) ? splitMsg[1] : error.message;
        console.error(msg);
      }
    })();
    // Clean up
    return () => { isMounted = false };
  }, [values]);

  // Data grid columns
  const columns: GridColDef[] = [
    {
      field: "asxcode",
      headerName: "Code",
      minWidth: 60,
      flex: 2,
      align: "left",
      headerAlign: "left",
    },
    {
      field: "units",
      headerName: "Units",
      minWidth: 60,
      flex: 2,
      align: "right",
      headerAlign: "right",
    },
    {
      field: "avgBuyPrice",
      headerName: "Avg Buy Price",
      minWidth: 120,
      flex: 4,
      align: "right",
      headerAlign: "right",
      sortComparator: sortPriceOrPercent,
    },
    {
      field: "currentPrice",
      headerName: "Current Price",
      minWidth: 120,
      flex: 4,
      align: "right",
      headerAlign: "right",
      sortComparator: sortPriceOrPercent,
    },
    {
      field: "dailyChangePerc",
      headerName: "24hr Change %",
      minWidth: 130,
      flex: 4,
      align: "right",
      headerAlign: "right",
      cellClassName: makeClassName,
      sortComparator: sortPriceOrPercent,
    },
    {
      field: "dailyProfit",
      headerName: "24hr Profit",
      minWidth: 100,
      flex: 3,
      align: "right",
      headerAlign: "right",
      cellClassName: makeClassName,
      sortComparator: sortPriceOrPercent,
    },
    {
      field: "profitOrLoss",
      headerName: "Profit",
      minWidth: 80,
      flex: 3,
      align: "right",
      headerAlign: "right",
      cellClassName: makeClassName,
      sortComparator: sortPriceOrPercent,
    },
    {
      field: "profitOrLossPerc",
      headerName: "Profit %",
      minWidth: 80,
      flex: 3,
      align: "right",
      headerAlign: "right",
      cellClassName: makeClassName,
      sortComparator: sortPriceOrPercent,
    },
  ];

  return (
    <DataGrid 
      disableRowSelectionOnClick 
      columns={columns}
      rows={rows}
      loading={loading}
      initialState={{
        pagination: { paginationModel: { pageSize: 8 } },
      }}
      pageSizeOptions={[8, 16, 32, 64]}
      sx={{
        mt: "-20px",
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
          fontSize: 18, 
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
