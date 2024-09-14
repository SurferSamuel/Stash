import { FormikErrors, FormikTouched } from "formik";
import { tokens } from "../theme";
import { Dayjs } from "dayjs";

// Material IU
import { DesktopDateTimePicker } from '@mui/x-date-pickers/DesktopDateTimePicker';
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import useTheme from "@mui/material/styles/useTheme";

interface Props {
  label: string;
  valueName: string;
  value: Dayjs;
  handleChange: (e: { target: { name: string; value: Dayjs } }) => void;
  touched: FormikTouched<any>;
  errors: FormikErrors<any>;
  disableFuture?: boolean;
  disablePast?: boolean;
  span: number;
}

const DatePicker = (props: Props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { 
    label, 
    valueName, 
    value, 
    handleChange, 
    touched, 
    errors, 
    disableFuture,
    disablePast, 
    span 
  } = props;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DesktopDateTimePicker
        {...(disablePast && { disablePast: true })}
        {...(disableFuture && { disableFuture: true })}
        format="DD/MM/YYYY hh:mm A"
        value={value}
        onChange={(newValue) => {
          handleChange({
            target: {
              name: valueName,
              value: newValue,
            },
          });
        }}
        viewRenderers={{
          hours: null,
          minutes: null,
          seconds: null,
        }}
        sx={{ gridColumn: `span ${span}` }}
        slotProps={{
          textField: {
            fullWidth: true,
            name: valueName,
            label: label,
            error: !!touched[valueName] && !!errors[valueName],
            helperText: touched[valueName] && errors[valueName] && String(errors[valueName]),
          },
          actionBar: {
            actions: [],
          },
          desktopPaper: {
            sx: {
              backgroundColor: colors.grey[900],
              backgroundImage: "none",
              boxShadow: "none",
              marginTop: "4px",
              border: `1px solid ${colors.grey[600]}`,
            },
          },
          popper: {
            sx: {
              ".MuiButtonBase-root.Mui-selected:focus": {
                backgroundColor: colors.grey[100],
              },
            },
          },
        }}
      />
    </LocalizationProvider>
  );
};

export default DatePicker;
