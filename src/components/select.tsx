import Autocomplete from "@mui/material/Autocomplete";
import { FormikErrors, FormikTouched } from "formik";
import { AutocompleteProps } from "@mui/material";
import TextField from "@mui/material/TextField";

interface Option {
  label: string;
}

interface Props {
  label: string;
  valueName: string;
  value: string;
  handleChange: (e: { target: { name: string; value: string } }) => void;
  options: Option[];
  touched: FormikTouched<any>;
  errors: FormikErrors<any>;
  capitaliseInput?: boolean | undefined;
  span: number;
}

const SelectInput = (props: Props) => {
  const { label, valueName, value, handleChange, options, errors, touched, capitaliseInput, span } =
    props;

  return (
    <Autocomplete
      freeSolo
      clearOnBlur
      handleHomeEndKeys
      disableCloseOnSelect
      id={valueName}
      value={value}
      options={options}
      onKeyDown={(e) => {
        e.key === "Enter" && e.preventDefault(); // Disable formik submit on enter
      }}
      onChange={(event, newValue) => {
        // Convert no new value into empty string
        if (newValue === null) newValue = "";

        // Convert label object into string
        if (typeof newValue !== "string") {
          newValue = newValue.label;
        }

        handleChange({
          target: {
            name: valueName,
            value: capitaliseInput ? newValue.toUpperCase() : newValue,
          },
        });
      }}
      sx={{ gridColumn: `span ${span}` }}
      renderOption={(props, option) => <li {...props}>{option.label}</li>}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          error={!!touched[valueName] && !!errors[valueName]}
          helperText={touched[valueName] && (errors[valueName] as string)}
          inputProps={{
            ...params.inputProps,
            style: capitaliseInput ? { textTransform: "uppercase" } : undefined,
          }}
        />
      )}
      getOptionLabel={(option) => {
        if (typeof option === "string") {
          return option;
        }
        return option.label;
      }}
    />
  );
};

export default SelectInput;
