import { GridColDef } from '@mui/x-data-grid';

// Material UI
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import FormGroup from '@mui/material/FormGroup';
import Switch from '@mui/material/Switch';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

// Types
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

interface Props {
  open: boolean;
  handleClose: () => void;
  columns: GridColDef[];
  hiddenColumns: string[];
  setHiddenColumns: Dispatch<SetStateAction<string[]>>
}

const ToggleColumnsDialog = (props: Props) => {
  const {
    open,
    handleClose,
    columns,
    hiddenColumns,
    setHiddenColumns,
  } = props;

  // Split columns into 2 equal parts
  const [columnsList, setColumnsList] = useState<GridColDef[][]>([[], []]);
  useEffect(() => {
    const midIndex = Math.ceil(columns.length / 2);
    const firstHalf = columns.slice(0, midIndex);
    const secondHalf = columns.slice(midIndex);
    setColumnsList([firstHalf, secondHalf]);
  }, []);

  const handleToggleColumn = (field: string) => {
    if (hiddenColumns.includes(field)) {
      setHiddenColumns(hiddenColumns.filter(column => column !== field));
    } else {
      setHiddenColumns([...hiddenColumns, field]);
    }
  };

  const handleDefault = () => {
    setHiddenColumns(["purchaseCost", "firstPurchaseDate", "lastPurchaseDate", "weightPerc"]);
  }

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      open={open}
      onClose={handleClose}
    >
      <DialogTitle variant="h4" fontWeight={600}>
        Toggle Columns
      </DialogTitle>
      <DialogContent>
        <DialogContentText fontSize="14px">
          View/hide columns from the table
        </DialogContentText>
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          mt="12px"
        >
          {columnsList.map(columns => {
            return (
              <FormGroup sx={{ width: "100%", zIndex: 10 }}>
                {columns.map(column => (
                  <Box 
                    key={column.field} 
                    display="flex" 
                    alignItems="center" 
                    justifyContent="flex-start"
                    my="5px"
                    gap="8px"
                  >
                    <Switch
                      checked={!hiddenColumns.includes(column.field)}
                      onChange={() => handleToggleColumn(column.field)}
                    />
                    <Typography>{column.headerName}</Typography>
                  </Box>
                ))}
              </FormGroup>
            )
          })}
        </Box>
      </DialogContent>
      <DialogActions sx={{ mt: "-30px" }}>
        <Button 
          variant="outlined"
          onClick={handleDefault}
        >
          Default
        </Button>
        <Button 
          variant="contained"
          onClick={handleClose}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ToggleColumnsDialog;