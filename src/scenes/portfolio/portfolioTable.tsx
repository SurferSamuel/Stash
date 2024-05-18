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

interface Props {}

// A helper function that assigns a class whether it is a positive/negative value
const makeClassName = (params: GridCellParams<any, string>) => {
  // Don't assign class if no value, or value is "-"
  if (params.value == null || params.value === "-") return "";
  return clsx('color-cell', {
    negative: params.value[0] === '-',
    positive: params.value[0] !== '-',
  });
}

const PortfolioTable = (props: Props) => {
  const { values } = useFormikContext<PortfolioFormValues>();
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Data grid columns
  const columns: GridColDef[] = [
    {
      field: "asxcode",
      headerName: "Code",
      width: 100,
      align: "left",
      headerAlign: "left"
    },
    {
      field: "units",
      headerName: "Units",
      width: 100,
      align: "right",
      headerAlign: "right"
    },
    {
      field: "avgBuyPrice",
      headerName: "Avg Buy Price",
      width: 180,
      align: "right",
      headerAlign: "right"
    },
    {
      field: "currentPrice",
      headerName: "Current Price",
      width: 160,
      align: "right",
      headerAlign: "right"
    },
    {
      field: "dailyChangePerc",
      headerName: "Daily Change %",
      width: 180,
      align: "right",
      headerAlign: "right",
      cellClassName: makeClassName
    },
    {
      field: "profitOrLoss",
      headerName: "Profit",
      width: 140,
      align: "right",
      headerAlign: "right",
      cellClassName: makeClassName
    },
    {
      field: "profitOrLossPerc",
      headerName: "Profit %",
      width: 140,
      align: "right",
      headerAlign: "right",
      cellClassName: makeClassName
    },
  ];

  // Update rows when values is modified
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        // Show loading icon on table while waiting for request
        setLoading(true);
        const rows = await window.electronAPI.getTableRows(values);
        setLoading(false);
        if (isMounted) setRows(rows);
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

  return (
    <DataGrid 
      columns={columns}
      rows={rows}
      loading={loading}
      sx={{
        mt: "-20px",
        height: 400, 
        gridColumn: "span 4",
        border: 0,
        '& .MuiDataGrid-columnHeaderTitle': {
          fontWeight: 500,
          fontSize: 16,
          color: "secondary.main"
        },
        '& .MuiDataGrid-cell': {
          fontSize: 14,
          borderTopColor: "#ffffff1f",
          borderBottomColor: "#ffffff1f"
        },
        '& .MuiDataGrid-cell:focus': {
          outline: 'none',
        },
        '& .MuiDataGrid-columnHeaders': {
          borderBottomColor: "#ffffff1f"
        },
        '& .MuiDataGrid-footerContainer': {
          borderTopColor: "#ffffff1f"
        },
        '& .MuiDataGrid-overlay': {
          fontSize: 18, 
        },
        '& .color-cell.positive': {
          color: "#209620",
          fontWeight: 600
        },
        '& .color-cell.negative': {
          color: "#de2a2a",
          fontWeight: 600
        }
      }}
    />
  );
}

export default PortfolioTable;
