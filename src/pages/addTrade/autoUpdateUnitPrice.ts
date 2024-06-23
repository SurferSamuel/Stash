import { useFormikContext } from "formik";
import { useEffect } from "react";

interface Props {
  unitPrice: string;
}

// Automatically update the unit price using the current market value
const AutoUpdateUnitPrice = (props: Props): null => {
  const { unitPrice } = props;
  const { setFieldValue } = useFormikContext();

  useEffect(() => {
    // Ignore empty unitPrice
    if (unitPrice !== undefined) {
      // Set the unit price in the form field
      setFieldValue("unitPrice", unitPrice.toString());
    }
  }, [unitPrice]);

  return null;
};

export default AutoUpdateUnitPrice;
