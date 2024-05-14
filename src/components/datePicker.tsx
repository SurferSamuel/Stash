import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { FormikErrors, FormikTouched } from "formik";
import { ColorType } from "../theme";
import { Dayjs } from "dayjs";

interface Props {
  label: string;
  valueName: string;
  value: Dayjs;
  handleChange: (e: { target: { name: string; value: Dayjs } }) => void;
  touched: FormikTouched<any>;
  errors: FormikErrors<any>;
  colors: ColorType;
  disablePast?: boolean;
  span: number;
}

const DatePicker = (props: Props) => {
  const { label, valueName, value, handleChange, touched, errors, colors, disablePast, span } =
    props;
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DesktopDatePicker
        {...(disablePast && { disablePast: true })}
        format="DD/MM/YYYY"
        value={value}
        onChange={(newValue) => {
          handleChange({
            target: {
              name: valueName,
              value: newValue,
            },
          });
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
          layout: {
            sx: {
              ".MuiDateCalendar-root": {
                backgroundColor: colors.grey[900],
              },
              ".MuiPickersDay-root.Mui-selected": {
                backgroundColor: colors.blueAccent[400],
              },
              ".MuiPickersDay-root.Mui-selected:hover": {
                backgroundColor: colors.blueAccent[400],
                color: "black",
              },
              ".MuiPickersDay-root.Mui-selected:focus": {
                backgroundColor: colors.blueAccent[400],
              },
            },
          },
        }}
      />
    </LocalizationProvider>
  );
};

export default DatePicker;
