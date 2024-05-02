import { Settings } from "../../../electron/types";
import { Dispatch, SetStateAction } from "react";
import Slide from "@mui/material/Slide";

const handleFormSubmit = (
  values: Settings,
  setOpenSnackbar: Dispatch<SetStateAction<boolean>>,
  setTransition: Dispatch<any>
) => {
  // Save new settings to storage
  window.electronAPI.setData("settings", values);

  // Open accordion to show success message
  setOpenSnackbar(true);
  setTransition(() => Slide);
};

export default handleFormSubmit;
