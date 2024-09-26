import { FormikErrors, FormikTouched, useFormikContext } from "formik";
import { SyntheticEvent } from "react";

// Material UI
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

// Types
import { Option } from "../../electron/types";


interface Props {
  label: string;
  valueName: string;
  value: Option;
  options: Option[];
  touched?: FormikTouched<any>;
  errors?: FormikErrors<any>;
  capitaliseInput?: boolean | undefined;
  width?: number;
  span?: number;
  small?: boolean;
}

const SelectInput = (props: Props) => {
  const { setFieldValue } = useFormikContext();
  const { 
    label,
    valueName,
    value,
    options,
    errors,
    touched,
    capitaliseInput,
    small,
    span,
    width,
  } = props;

  /**
   * Handle value change when input is updated.
   * @param event Native event
   * @param newValue Value from input
   */
  const handleChangeInput = (event: SyntheticEvent, newValue: string | Option) => {
    if (newValue === null) {
      setFieldValue(valueName, null);
      return;
    }

    // Convert string into label 
    if (typeof newValue === "string") {
      newValue = { label: newValue };
    }

    // Capitalise value if necessary
    if (capitaliseInput) {
      newValue.label.toUpperCase();
    }

    // Update form value
    setFieldValue(valueName, newValue);
  }

  return (
    <Autocomplete
      clearOnBlur
      handleHomeEndKeys
      disableCloseOnSelect
      id={valueName}
      value={value}
      options={options}
      onChange={handleChangeInput}
      onKeyDown={(event) => {
        // Disable formik submit on enter
        if (event.key === "Enter") event.preventDefault();
      }}
      sx={{ 
        gridColumn: span ? `span ${span}` : undefined,
        width: width ?? "auto",
      }}
      getOptionLabel={(option) => {
        if (typeof option === "string") return option;
        return option.label;
      }}
      isOptionEqualToValue={(option, value) => {
        if (typeof option !== "string") option = option.label;
        if (typeof value !== "string") value = value.label;
        return option === value;
      }}
      renderOption={(props, option) => (
        <li {...props}>
          {typeof option === "string" ? option : option.label}
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          {...(small && { size: "small" })}
          // If touched and errors were given...
          {...(touched && errors && { 
            error: !!touched[valueName] && !!errors[valueName],
            helperText: touched[valueName] && (errors[valueName] as string),
          })}
          slotProps={{
            htmlInput: {
              ...params.inputProps,
              style: capitaliseInput ? { textTransform: "uppercase" } : undefined,
            }
          }}
        />
      )}
    />
  );
};

export default SelectInput;
