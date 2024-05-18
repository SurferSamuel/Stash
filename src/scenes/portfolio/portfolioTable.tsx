import { PortfolioFormValues } from "./index";
import { useEffect, useState } from "react";
import { useFormikContext } from "formik";

// Material UI
import { DataGrid, GridRowsProp, GridColDef } from '@mui/x-data-grid';

interface Props {}

const PortfolioTable = (props: Props) => {
  const { values } = useFormikContext<PortfolioFormValues>();
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Data grid columns
  const columns: GridColDef[] = [
    { field: "asxcode", headerName: "Code", width: 100 },
    { field: "units", headerName: "Units", width: 100 },
    { field: "avgBuyPrice", headerName: "Avg Buy Price", width: 160 },
    { field: "currentPrice", headerName: "Current Price", width: 160 },
    { field: "dailyChangePerc", headerName: "Daily Change %", width: 160 },
    { field: "profitOrLoss", headerName: "Profit", width: 160 },
    { field: "profitOrLossPerc", headerName: "Profit %", width: 160 },
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
        '& .MuiDataGrid-columnHeaders': {
          borderBottomColor: "#ffffff1f"
        },
        '& .MuiDataGrid-footerContainer': {
          borderTopColor: "#ffffff1f"
        },
        '& .MuiDataGrid-overlay': {
          fontSize: 18, 
        },
      }}
    />
  );
}

export default PortfolioTable;
