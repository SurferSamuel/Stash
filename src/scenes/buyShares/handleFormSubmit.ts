import { Dispatch, SetStateAction } from "react";
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
  // Attempt to save the form values
  const success = await window.electronAPI.buyShare(values, gstPercent);
  if (success) {
    // Open accordion to show success message
    setSeverity("success");
    setAlertMessage("Successfully saved!");
    setOpenSnackbar(true);
    setTransition(() => Slide);
  } else {
    // Open accordion to show error message
    setSeverity("error");
    setAlertMessage(`ERROR: Could not find data for '${values.asxcode}'`);
    setOpenSnackbar(true);
    setTransition(() => Slide);
  }
};

export default handleFormSubmit;
