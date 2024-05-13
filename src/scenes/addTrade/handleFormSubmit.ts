import { Dispatch, SetStateAction } from "react";
import { AddTradeFormValues } from "./index";
import Slide from "@mui/material/Slide";

const handleFormSubmit = async (
  values: AddTradeFormValues,
  gstPercent: string,
  setOpenSnackbar: Dispatch<SetStateAction<boolean>>,
  setTransition: Dispatch<any>,
  setSeverity: Dispatch<SetStateAction<"success" | "error">>,
  setAlertMessage: Dispatch<SetStateAction<string>>
) => {
  try {
    // Attempt to save the form values
    if (values.type === "BUY") {
      await window.electronAPI.buyShare(values, gstPercent);
    } else {
      // TODO: Handle when type is SELL
    }
    // Set success message
    setSeverity("success");
    setAlertMessage("Successfully saved!");
  } catch (error) {
    // Set error message
    setSeverity("error");
    // Need to split message since Electron wraps the original error message with additional text.
    const errorMessage = error.message.split('Error: ')[1];
    console.error(errorMessage);
    setAlertMessage(errorMessage); 
  }
  
  // Open accordion to show message
  setOpenSnackbar(true);
  setTransition(() => Slide);
};

export default handleFormSubmit;
