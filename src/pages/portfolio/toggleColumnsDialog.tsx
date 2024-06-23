import { tokens } from '../../theme';

// Material UI
import DialogContentText from '@mui/material/DialogContentText';
import FormControlLabel from '@mui/material/FormControlLabel';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import useTheme from "@mui/material/styles/useTheme";
import DialogTitle from '@mui/material/DialogTitle';
import FormGroup from '@mui/material/FormGroup';
import Switch from '@mui/material/Switch';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

// Types
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { GridColDef } from '@mui/x-data-grid';

interface Props {
  open: boolean;
  handleClose: () => void;
  columns: GridColDef[];
  hiddenColumns: string[];
  setHiddenColumns: Dispatch<SetStateAction<string[]>>
}

const ToggleColumnsDialog = (props: Props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
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
      <DialogTitle variant="h5" fontWeight={500} sx={{ bgcolor: colors.primary[500] }}>
        Toggle Columns
      </DialogTitle>
      <DialogContent sx={{ bgcolor: colors.primary[500] }}>
        <DialogContentText>
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
              <FormGroup sx={{ width: "100%" }}>
                {columns.map(column => {
                  return (
                    <FormControlLabel
                      key={column.field}
                      control={
                        <Switch
                          color="secondary"
                          checked={!hiddenColumns.includes(column.field)}
                          onChange={() => handleToggleColumn(column.field)}
                        />
                      }
                      label={column.headerName}
                    />
                  );
                })}
              </FormGroup>
            )
          })}
        </Box>
      </DialogContent>
      <DialogActions sx={{ mt: "-30px", bgcolor: colors.primary[500] }}>
        <Button 
          onClick={handleDefault}
          color="secondary"
        >
          Default
        </Button>
        <Button 
          onClick={handleClose}
          color="secondary"
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ToggleColumnsDialog;