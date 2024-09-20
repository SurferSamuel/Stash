import { currencyFormat, dayjsDate, precentFormat } from '../../../electron/api/format';
import { useEffect, useState } from 'react';
import clsx from 'clsx';

// Components
import FilterOptionsDialog from './filterOptionsDialog';
import ToggleColumnsDialog from './toggleColumnsDialog';

// Material UI
import {
  DataGrid,
  GridColDef,
  GridCellParams
} from '@mui/x-data-grid';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';

// Material UI Icons
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';

// Types
import { Option, PortfolioTableRow } from '../../../electron/types';

interface Props {
  loading: boolean;
  data: PortfolioTableRow[];
  usersList: Option[];
  financialStatusList: Option[];
  miningStatusList: Option[];
  resourcesList: Option[];
  productsList: Option[];
  recommendationList: Option[];
}

// A helper function that assigns a class whether it is a positive/negative value
const colorValue = (params: GridCellParams<any, number>) => {
  // Don't assign class if no value
  if (params.value == null) return "";
  return clsx('color-cell', {
    negative: params.value < 0,
    positive: params.value > 0,
  });
}

// A helper function for formatting prices
const formatPriceValue = (decimals: number) => (value: number) => {
  // If no value
  if (value == null) return "-";
  return currencyFormat(value, decimals);
}

// A helper function for formatting precents
const formatPercentValue = (decimals: number) => (value: number) => {
  // If no value
  if (value == null) return "-";
  return precentFormat(value, decimals);
}

// A helper function for formatting dates
const formatDateValue = (value: string) => {
  return value.split(" ")[0];
}

// A helper function for sorting with dates
const sortDateValue = (value1: string, value2: string) => {
  return dayjsDate(value1).isAfter(value2) ? 1 : -1;
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
    valueFormatter: formatPriceValue(3),
  },
  {
    field: "currentPrice",
    headerName: "Current Price",
    minWidth: 130,
    flex: 6,
    align: "right",
    headerAlign: "right",
    valueFormatter: formatPriceValue(3),
  },
  {
    field: "marketValue",
    headerName: "Market Value",
    minWidth: 130,
    flex: 6,
    align: "right",
    headerAlign: "right",
    valueFormatter: formatPriceValue(2),
  },
  {
    field: "purchaseCost",
    headerName: "Purchase Cost",
    minWidth: 140,
    flex: 6,
    align: "right",
    headerAlign: "right",
    valueFormatter: formatPriceValue(2),
  },
  {
    field: "dailyChangePerc",
    headerName: "Change %",
    minWidth: 100,
    flex: 5,
    align: "right",
    headerAlign: "right",
    cellClassName: colorValue,
    valueFormatter: formatPercentValue(2),
  },
  {
    field: "dailyProfit",
    headerName: "Today's Profit",
    minWidth: 130,
    flex: 6,
    align: "right",
    headerAlign: "right",
    cellClassName: colorValue,
    valueFormatter: formatPriceValue(2),
  },
  {
    field: "profitOrLoss",
    headerName: "Profit",
    minWidth: 80,
    flex: 4,
    align: "right",
    headerAlign: "right",
    cellClassName: colorValue,
    valueFormatter: formatPriceValue(2),
  },
  {
    field: "profitOrLossPerc",
    headerName: "Profit %",
    minWidth: 90,
    flex: 4,
    align: "right",
    headerAlign: "right",
    cellClassName: colorValue,
    valueFormatter: formatPercentValue(2),
  },
  {
    field: "firstPurchaseDate",
    headerName: "First Purchase",
    minWidth: 130,
    flex: 6,
    align: "right",
    headerAlign: "right",
    valueFormatter: formatDateValue,
    sortComparator: sortDateValue,
  },
  {
    field: "lastPurchaseDate",
    headerName: "Last Purchase",
    minWidth: 130,
    flex: 6,
    align: "right",
    headerAlign: "right",
    valueFormatter: formatDateValue,
    sortComparator: sortDateValue,
  },
  {
    field: "weightPerc",
    headerName: "Weight %",
    minWidth: 100,
    flex: 4,
    align: "right",
    headerAlign: "right",
    valueFormatter: formatPercentValue(2),
  },
];

const PortfolioTable = (props: Props) => {
  const { 
    loading, 
    data,
    usersList,
    financialStatusList,
    miningStatusList,
    resourcesList,
    productsList,
    recommendationList,
  } = props;

  // Hide specific columns from the table
  const defaultHidden = ["purchaseCost", "firstPurchaseDate", "lastPurchaseDate", "weightPerc"];
  const [hiddenColumns, setHiddenColumns] = useState<string[]>(defaultHidden);

  // Dialog states
  const [openFilterDialog, setOpenFilterDialog] = useState<boolean>(false);
  const [openColumnDialog, setOpenColumnDialog] = useState<boolean>(false);

  // Dialog functions
  const handleFilterDialogOpen = () => setOpenFilterDialog(true);
  const handleFilterDialogClose = () => setOpenFilterDialog(false);
  const handleColumnDialogOpen = () => setOpenColumnDialog(true);
  const handleColumnDialogClose = () => setOpenColumnDialog(false);

  // Pagnation states
  const [totalPages, setTotalPages] = useState<number>(1);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 6,
  });

  // Update total pages when data is changed
  useEffect(() => {
    const totalPages = Math.ceil(data.length / paginationModel.pageSize);
    setTotalPages(Math.max(totalPages, 1));
    // Go back to page 0
    setPaginationModel((prevModel) => ({ ...prevModel, page: 0 }));
  }, [data]);

  // Pagnation functions
  const handleNextPage = () => setPaginationModel((prevModel) => (
    { ...prevModel, page: Math.min(prevModel.page + 1, totalPages - 1) }
  ));
  const handlePrevPage = () => setPaginationModel((prevModel) => (
    { ...prevModel, page: Math.max(prevModel.page - 1, 0) }
  ));

  return (
    <Box
      mt="-10px"
      mb="-40px"
      gridColumn="span 4"
    >
      {/* Dialogs */}
      <FilterOptionsDialog 
        open={openFilterDialog}
        handleClose={handleFilterDialogClose}
        usersList={usersList}
        financialStatusList={financialStatusList}
        miningStatusList={miningStatusList}
        resourcesList={resourcesList}
        productsList={productsList}
        recommendationList={recommendationList}
      />
      <ToggleColumnsDialog 
        open={openColumnDialog}
        handleClose={handleColumnDialogClose}
        columns={columns}
        hiddenColumns={hiddenColumns}
        setHiddenColumns={setHiddenColumns}
      />
      {/* Toolbar */}
      <Box
        display="flex"
        justifyContent="flex-end"
        alignItems="center"
        gap="4px"
        mb="-5px"
      >
        {/* Filter Options Button */}
        <IconButton 
          disabled={openFilterDialog}
          onClick={handleFilterDialogOpen}
          sx={{ mr: "4px", zIndex: 10 }}
        >
          <FilterAltIcon />
        </IconButton>
        {/* Toggle Column Button */}
        <IconButton
          disabled={openColumnDialog}
          onClick={handleColumnDialogOpen}
          sx={{ zIndex: 10 }}
        >
          <ViewWeekIcon />
        </IconButton>
        {/* Previous Page Button */}
        <IconButton 
          onClick={handlePrevPage}
          disabled={paginationModel.page === 0}
          sx={{ zIndex: 10 }}
        >
          <KeyboardArrowLeftIcon />
        </IconButton>
        {/* Next Page Button */}
        <IconButton 
          onClick={handleNextPage}
          disabled={paginationModel.page === totalPages - 1}
          sx={{ zIndex: 10 }}
        >
          <KeyboardArrowRightIcon />
        </IconButton>
      </Box>
      {/* Table */}
      <DataGrid 
        disableRowSelectionOnClick
        disableColumnMenu
        pagination
        hideFooter
        paginationModel={paginationModel}
        loading={loading}
        columns={columns.filter(column => !hiddenColumns.includes(column.field))}
        rows={data}
        sx={{
          height: 385, 
          border: 0,
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 500,
            fontSize: 16,
            color: "secondary.main",
          },
          '& .MuiDataGrid-cell': {
            fontSize: 14,
            borderColor: "#ffffff1f",
          },
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
          '.MuiDataGrid-columnHeader:focus': {
            outline: 'none',
          },
          '& .MuiDataGrid-columnHeader .MuiDataGrid-columnSeparator': {
            opacity: 0,
          },
          '& .MuiDataGrid-columnHeader--last .MuiDataGrid-columnSeparator': {
            display: "none",
          },
          '& .MuiDataGrid-columnHeaders:hover .MuiDataGrid-columnSeparator': {
            opacity: 1,
          },
          '& .MuiDataGrid-row--borderBottom .MuiDataGrid-columnHeader': {
            borderBottom: "none",
          },
          '& .MuiDataGrid-filler': {
            '& > *': {
              borderTopColor: "#ffffff1f",
            },
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
          }
        }}
      />
    </Box>
  );
}

export default PortfolioTable;
