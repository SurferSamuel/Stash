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
  allowNewOptions?: boolean;
}

const filter = createFilterOptions();

const MultiSelectInput = (props: Props) => {
  const { label, valueName, value, handleChange, options, allowNewOptions } = props;

  const handleChangeInput = (event, newValues) => {
    // If newArray is empty, then set value as empty array
    if (newValues.length === 0) {
      handleChange({ target: { name: valueName, value: [] } });
      return;
    }

    // New value will always be the last value in the array
    const lastIndex = newValues.length - 1;
    const newValue = newValues[lastIndex];
  
    // If new value was created by pressing enter
    if (typeof newValue === "string") {
      const existingOption = options.find((option) => option.label === newValue);
      const selected = value.some((option) => option.label === newValue);

      // If the new value is an existing option that is not currently selected
      if (existingOption && !selected) {
        const updatedValues = [...value, existingOption];
        handleChange({ target: { name: valueName, value: updatedValues } });
      } 
      // If allowing new options
      else if (allowNewOptions && !existingOption) {
        const updatedValues = [...value, { label: newValue }];
        handleChange({ target: { name: valueName, value: updatedValues } });
      }
    }
    // If new value created dynamically on dropdown ("Add [value]")
    else if (newValue && newValue.inputValue) {
      const newOption = { label: newValue.inputValue };
      const updatedValues = [...value, newOption];
      handleChange({ target: { name: valueName, value: updatedValues } });
    } 
    // If the new value was from clicking a normal option on dropdown
    else {
      handleChange({ target: { name: valueName, value: newValues } });
    }

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
        if (allowNewOptions && inputValue !== "" && !isExisting) {
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
