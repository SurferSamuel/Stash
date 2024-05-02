import Autocomplete from "@mui/material/Autocomplete";
import { Country } from "../../../electron/types";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";

interface Props {
  values: Country[];
  handleChange: (event: { target: { name: string; value: Country[] } }) => void;
  options: Country[];
}

const OperatingCountriesInput = (props: Props) => {
  const { values, handleChange, options } = props;
  return (
    <Autocomplete
      multiple
      disableCloseOnSelect
      options={options}
      value={values}
      sx={{ gridColumn: "span 4" }}
      isOptionEqualToValue={(option, value) => option.label === value.label}
      getOptionLabel={(option) => option.label}
      onChange={(event, newArray: Country[]) => {
        handleChange({
          target: {
            name: "operatingCountries",
            value: newArray,
          },
        });
      }}
      renderOption={(props, option, { selected }) => (
        <Box component="li" sx={{ "& > img": { mr: 2, flexShrink: 0 } }} {...props}>
          <img
            loading="lazy"
            width="20"
            srcSet={`https://flagcdn.com/w40/${option.code.toLowerCase()}.png 2x`}
            src={`https://flagcdn.com/w20/${option.code.toLowerCase()}.png`}
            alt=""
          />
          {option.label}
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Operating Countries"
          inputProps={{
            ...params.inputProps,
          }}
        />
      )}
    />
  );
};

export default OperatingCountriesInput;
