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
  // Convert dates Dayjs objects to strings (since can't send "Dayjs" types over IPC)
  const sendValues = {
    ...values,
    date: values.date.format("DD/MM/YYYY hh:mm A"),
  };

  // Attempt to save the form values
  try {
    if (values.type === "BUY") {
      await window.electronAPI.buyShare(sendValues, gstPercent);
    } else {
      await window.electronAPI.sellShare(sendValues, gstPercent);
    }

    // Set success message
    setSeverity("success");
    setAlertMessage("Successfully saved!");
  }
  // If IPC threw an error
  catch (error) {
    // Set error message
    setSeverity("error");

    // Split message since Electron wraps the original error message with additional text.
    const splitMsg = error.message.split('Error: ');
    const msg = (splitMsg.length === 2) ? splitMsg[1] : error.message;

    // Display error message in both console and accordion
    console.error(msg);
    setAlertMessage(msg); 
  }
  
  // Open accordion to show message
  setOpenSnackbar(true);
  setTransition(() => Slide);
};

export default handleFormSubmit;
