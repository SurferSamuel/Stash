import { Dispatch, SetStateAction } from "react";
import { Share } from "../../../electron/types";
import { BuySharesFormValues } from "./index";
import Slide from "@mui/material/Slide";

const handleFormSubmit = async (
  values: BuySharesFormValues,
  gstPercent: string,
  setOpenSnackbar: Dispatch<SetStateAction<boolean>>,
  setTransition: Dispatch<any>,
  setSeverity: Dispatch<SetStateAction<"success" | "error">>,
  setAlertMessage: Dispatch<SetStateAction<string>>
) => {
  // Get existing data from storage
  const data = await window.electronAPI.getData("data");

  // Calculate values
  const quantity = values.quantity;
  const unitCost = values.unitCost;
  const brokerage = values.brokerage;
  const gst = ((parseFloat(brokerage) * parseFloat(gstPercent)) / 100).toString();
  const total = (
    parseFloat(quantity) * parseFloat(unitCost) +
    parseFloat(brokerage) +
    parseFloat(gst)
  ).toString();

  // Construct new object
  const newShare: Share = {
    user: values.user,
    date: values.date,
    quantity,
    unitCost,
    brokerage,
    gst,
    total,
  };

  const companyData = data.find((obj) => obj.asxcode === values.asxcode);
  // If the company's data could not be found...
  if (companyData === undefined) {
    // Open accordion to show error message
    setSeverity("error");
    setAlertMessage(`ERROR: Could not find data for '${values.asxcode}'`);
    setOpenSnackbar(true);
    setTransition(() => Slide);
    return;
  }

  // Add the new share and save it to storage
  companyData.shares.push(newShare);
  window.electronAPI.setData("data", data);

  // Open accordion to show success message
  setSeverity("success");
  setAlertMessage("Successfully saved!");
  setOpenSnackbar(true);
  setTransition(() => Slide);
};

export default handleFormSubmit;
