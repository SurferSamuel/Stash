import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

interface Option {
  label: string;
}

interface Props {
  label: string;
  valueName: string;
  value: Option[];
  handleChange: (e: { target: { name: string; value: Option[] } }) => void;
  options: Option[];
}

const filter = createFilterOptions();

const MultiSelectInput = (props: Props) => {
  const { label, valueName, value, handleChange, options } = props;

  const handleChangeInput = (event, newArray) => {
    // If newArray is empty, then set value as empty array
    if (newArray.length === 0) {
      return handleChange({
        target: {
          name: valueName,
          value: [],
        },
      });
    }

    // New value will always be the last value in the array
    const index = newArray.length - 1;
    const newValue = newArray[index];

    // Value selected with enter, right from the input
    if (typeof newValue === "string") {
      // If the new value already exists
      const isExisting =
        options.some((option) => newValue === option.label) ||
        value.some((option) => newValue === option.label);
      if (isExisting) return;
      newArray[index] = { label: newValue };
    }

    // Add option created dynamically
    else if (newValue && newValue.inputValue) {
      newArray[index] = { label: newValue.inputValue };
    }

    handleChange({
      target: {
        name: valueName,
        value: newArray,
      },
    });
  };

  return (
    <Autocomplete
      multiple
      freeSolo
      clearOnBlur
      handleHomeEndKeys
      disableCloseOnSelect
      options={options}
      onChange={handleChangeInput}
      value={value}
      sx={{ gridColumn: "span 2" }}
      renderOption={(props, option) => <li {...props}>{option.label}</li>}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          inputProps={{
            ...params.inputProps,
          }}
        />
      )}
      getOptionLabel={(option) => {
        // Value selected with enter, right from the input
        if (typeof option === "string") {
          return option;
        }
        // Add option created dynamically
        if (option.inputValue) {
          return option.inputValue;
        }
        // Regular option
        return option.label;
      }}
      filterOptions={(options, params) => {
        const filtered = filter(options, params);
        const { inputValue } = params;
        // Suggest the creation of a new value
        const isExisting =
          options.some((option) => inputValue === option.label) ||
          value.some((option) => inputValue === option.label);
        if (inputValue !== "" && !isExisting) {
          filtered.push({
            inputValue,
            label: `Add "${inputValue}"`,
          });
        }
        return filtered;
      }}
    />
  );
};

export default MultiSelectInput;
