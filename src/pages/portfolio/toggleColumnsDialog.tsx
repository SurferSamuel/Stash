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

// Types
import { Dispatch, SetStateAction } from 'react';
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

  const handleToggleColumn = (field: string) => {
    if (hiddenColumns.includes(field)) {
      setHiddenColumns(hiddenColumns.filter(column => column !== field));
    } else {
      setHiddenColumns([...hiddenColumns, field]);
    }
  };

  const handleDefault = () => {
    setHiddenColumns(["purchaseCost", "firstPurchaseDate", "lastPurchaseDate"]);
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
        <FormGroup
          sx={{ mt: "12px" }}
        >
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