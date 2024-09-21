import { Dispatch, SetStateAction, useEffect } from "react";
import { AddTradeFormValues } from "./index";
import { useFormikContext } from "formik";

interface Props {
  gstPercent: string;
  setShareValue: Dispatch<SetStateAction<number>>;
  setBrokerage: Dispatch<SetStateAction<number>>;
  setGst: Dispatch<SetStateAction<number>>;
  setTotal: Dispatch<SetStateAction<number>>;
}

// Updates the price breakdown values with the form values
const PriceBreakdownHandler = (props: Props): null => {
  const { values } = useFormikContext<AddTradeFormValues>();
  const { gstPercent, setShareValue, setBrokerage, setGst, setTotal } = props;

  useEffect(() => {
    let total = 0;

    // If quantity or unit price is empty, then set share value to default $0.00
    if (values.quantity === "" || values.unitPrice === "") {
      setShareValue(0);
    }
    // Otherwise update the share value
    else {
      const shareValue = Number(values.quantity) * Number(values.unitPrice);
      setShareValue(shareValue);
      total += shareValue;
    }

    // If brokerage is empty, then set brokerage and gst to default $0.00
    if (values.brokerage === "") {
      setBrokerage(0);
      setGst(0);
    }
    // Otherwise update the brokerage and gst
    else {
      // Brokerage and gst is positive when buying, negative when selling
      const brokerage = (values.type === "BUY" ? 1 : -1) * Number(values.brokerage);
      const gst = brokerage * (Number(gstPercent) / 100);
      setBrokerage(brokerage);
      setGst(gst);
      total += brokerage + gst;
    }

    // Update the total
    setTotal(total);
  }, [values, gstPercent]);

  return null;
};

export default PriceBreakdownHandler;
