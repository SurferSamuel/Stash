// Source: https://github.com/superjose/increase-formik-performance-react

import { TextFieldProps, TextField, InputAdornment } from "@mui/material";
import { NumericFormat, NumericFormatProps } from "react-number-format";
import { forwardRef, memo, useEffect, useState } from "react";
import { usePropagateRef } from "./usePropagateRef";
import { useField } from "formik";

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

export type PerformantTextFieldProps = Omit<TextFieldProps, "name"> & {
  name: string;
  disablePerformance?: boolean; // If true, it will use the traditional method for disabling performance
  loading?: boolean;
  min?: number;
  max?: number;
  currencyInput?: boolean;
  numberInput?: boolean;
};

/**
 * This is kind of hacky solution, but it mostly works. Your mileage may vary
 */
export const PerformantTextField: React.FC<PerformantTextFieldProps> = memo((props) => {
  const [field, meta] = useField(props.name);
  const error = !!meta.error && meta.touched;

  /**
   * For performance reasons (possible due to CSS in JS issues), heavy views
   * affect re-renders (Formik changes state in every re-render), bringing keyboard
   * input to its knees. To control this, we create a setState that handles the field's inner
   * (otherwise you wouldn't be able to type) and then propagate the change to Formik onBlur and
   * onFocus.
   */
  const [fieldValue, setFieldValue] = useState<string | number>(field.value);
  const { disablePerformance, loading, currencyInput, numberInput, ...otherProps } = props;
  usePropagateRef({
    setFieldValue,
    name: props.name,
    value: field.value,
  });

  /**
   * Using this useEffect guarantees us that pre-filled forms
   * such as passwords work.
   */
  useEffect(() => {
    if (meta.touched) {
      return;
    }

    if (field.value !== fieldValue) {
      setFieldValue(field.value);
    }
    // eslint-disable-next-line
  }, [field.value]);

  const onChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setFieldValue(evt.target.value);
  };
  const onBlur = (evt: React.FocusEvent<HTMLInputElement>) => {
    const val = evt.target.value || "";
    window.setTimeout(() => {
      field.onChange({
        target: {
          name: props.name,
          value: props.type === "number" ? parseInt(val, 10) : val,
        },
      });
    }, 0);
  };

  // Will set depending on the performance props
  const performanceProps = disablePerformance
    ? {
        ...field,
        value: loading ? "Loading..." : fieldValue,
      }
    : {
        ...field,
        value: loading ? "Loading..." : fieldValue,
        onChange,
        onBlur,
        onFocus: onBlur,
      };

  return (
    <>
      <TextField
        {...otherProps}
        InputProps={{
          ...((props.type === "number" && {
            inputProps: { min: props?.min, max: props?.max },
          }) ||
            undefined),
          startAdornment: currencyInput && <InputAdornment position="start">$</InputAdornment>,
          inputComponent: (currencyInput || numberInput) && (NumericFormatCustom as any),
        }}
        error={error}
        helperText={meta.touched && meta.error}
        {...performanceProps}
      />
    </>
  );
});
