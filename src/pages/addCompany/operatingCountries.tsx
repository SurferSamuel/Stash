import { useFormikContext } from "formik";

// Material UI
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";

// Types
import { Country } from "../../../electron/types";

interface Props {
  values: Country[];
  options: Country[];
}

const OperatingCountriesInput = (props: Props) => {
  const { setFieldValue } = useFormikContext();
  const { values, options } = props;
  return (
    <Autocomplete
      multiple
      disableCloseOnSelect
      options={options}
      value={values}
      sx={{ gridColumn: "span 4", mr: "1px" }}
      isOptionEqualToValue={(option, value) => option.label === value.label}
      getOptionLabel={(option) => option.label}
      onChange={(event, newArray) => setFieldValue("operatingCountries", newArray)}
      renderOption={(props, option) => (
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
      renderInput={(params) => <TextField {...params} label="Operating Countries"/>}
    />
  );
};

export default OperatingCountriesInput;
