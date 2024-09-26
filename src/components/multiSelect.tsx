import { useFormikContext } from "formik";
import { SyntheticEvent } from "react";

// Material UI
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import { FilterOptionsState } from "@mui/material";
import TextField from "@mui/material/TextField";

// Types
import { Option } from "../../electron/types";

interface Props {
  label: string;
  valueName: string;
  value: Option[];
  options: Option[];
  allowNewOptions?: boolean;
}

const filter = createFilterOptions();

const MultiSelectInput = (props: Props) => {
  const { setFieldValue } = useFormikContext();
  const { label, valueName, value, options, allowNewOptions } = props;

  /**
   * Handles value change when input is updated.
   * @param event Native event
   * @param newValue Value from input
   */
  const handleChangeInput = (event: SyntheticEvent, newValues: (Option | string)[]) => {
    // If newArray is empty, then set value as empty array
    if (newValues.length === 0) {
      setFieldValue(valueName, []);
      return;
    }

    // New value will always be the last value in the array
    const newValue = newValues[newValues.length - 1];
  
    // If new value was created by pressing enter
    if (typeof newValue === "string") {
      const existingOption = options.find((option) => option.label === newValue);
      const selected = value.some((option) => option.label === newValue);

      // If the new value is an existing option that is not currently selected
      if (existingOption && !selected) {
        setFieldValue(valueName, [...value, existingOption]);
      } 
      // If allowing new options
      else if (allowNewOptions && !existingOption) {
        setFieldValue(valueName, [...value, { label: newValue }]);
      }
    }
    // If new value created dynamically on dropdown "Add [inputValue]"
    else if (newValue.inputValue !== undefined) {
      const newOption = { label: newValue.inputValue };
      const updatedValues = [...value, newOption];
      setFieldValue(valueName, updatedValues);
    } 
    // If the new value was from clicking a normal option on dropdown
    else {
      setFieldValue(valueName, newValues);
    }
  };

  /**
   * Handles filtering which options to render in the dropdown.
   * @param options All options of the component
   * @param params The state of the component
   * @returns The options to render
   */
  const handleFilterOptions = (options: (Option | string)[], state: FilterOptionsState<Option | string>) => {
    const filtered = filter(options, state) as (Option | string)[];
    const { inputValue } = state;

    // Check if option already exists
    const existingOption = options.some(option => {
      return (typeof option === "string")
        ? inputValue === option
        : inputValue === option.label
    });

    // Check if option is already selected
    const selectedOption = value.some(option => {
      return (typeof option === "string")
        ? inputValue === option
        : inputValue === option.label
    });
    
    // Suggest the creation of a new value
    if (allowNewOptions && inputValue !== "" && !existingOption && !selectedOption) {
      filtered.push({
        inputValue,
        label: `Add "${inputValue}"`,
      });
    }

    return filtered;
  }

  return (
    <Autocomplete
      multiple
      freeSolo
      clearOnBlur
      handleHomeEndKeys
      disableCloseOnSelect
      value={value}
      options={options}
      onChange={handleChangeInput}
      filterOptions={handleFilterOptions}
      sx={{ gridColumn: "span 2" }}
      renderOption={(props, option) => (
        <li {...props}>
          {typeof option === "string" ? option : option.label}
        </li>
      )}
      renderInput={(params) => <TextField {...params} label={label} />}
      getOptionLabel={(option) => {
        // Value selected with enter from the input
        if (typeof option === "string") {
          return option;
        }
        // Add option created dynamically on dropdown
        if (option.inputValue !== undefined) {
          return option.inputValue;
        }
        // Regular option
        return option.label;
      }}
    />
  );
};

export default MultiSelectInput;
