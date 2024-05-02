import { useFormikContext } from "formik";
import { useEffect } from "react";

interface Props {
  unitCost: string;
}

// Automatically update the unit cost using the current market value
const AutoUpdateUnitCost = (props: Props) => {
  const { unitCost } = props;
  const { setFieldValue } = useFormikContext();

  useEffect(() => {
    // Ignore empty unitCost
    if (unitCost !== undefined) {
      // Set the unit cost in the form field
      setFieldValue("unitCost", unitCost.toString());
    }
  }, [unitCost]);

  return null;
};

export default AutoUpdateUnitCost;
