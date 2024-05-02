import { InputAdornment, TextField, TextFieldProps } from "@mui/material";
import { forwardRef } from "react";
import { NumericFormat, NumericFormatProps } from "react-number-format";

type Props = TextFieldProps & {
  currencyInput?: boolean;
  numberInput?: boolean;
  percentInput?: boolean;
};

interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}

const NumericFormatCustom = forwardRef<NumericFormatProps, CustomProps>(
  function NumericFormatCustom(props, ref) {
    const { onChange, ...other } = props;
    return (
      <NumericFormat
        {...other}
        allowNegative={false}
        getInputRef={ref}
        onValueChange={(values) => {
          onChange({
            target: {
              name: props.name,
              value: values.value,
            },
          });
        }}
      />
    );
  }
);

/**
 * Material UI's TextField component with an added 'currencyInput' and 'numberInput' props.
 * Used since setFieldValue() does not work with PerformantTextField.
 */
const CurrencyTextField = (props: Props) => {
  const { currencyInput, numberInput, percentInput, ...otherProps } = props;
  return (
    <TextField
      {...otherProps}
      InputProps={{
        startAdornment: currencyInput && <InputAdornment position="start">$</InputAdornment>,
        endAdornment: percentInput && <InputAdornment position="end">%</InputAdornment>,
        inputComponent:
          (currencyInput || numberInput || percentInput) && (NumericFormatCustom as any),
      }}
    />
  );
};

export default CurrencyTextField;
