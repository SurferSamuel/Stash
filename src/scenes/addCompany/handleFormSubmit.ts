import { Dispatch, SetStateAction } from "react";
import { AddCompanyFormValues } from "./index";
import Slide from "@mui/material/Slide";

const handleFormSubmit = async (
  values: AddCompanyFormValues,
  setOpenSnackbar: Dispatch<SetStateAction<boolean>>,
  setTransition: Dispatch<any>
) => {
  // Save new company form values
  await window.electronAPI.addCompany(values);

  // Open accordion to show success message
  setOpenSnackbar(true);
  setTransition(() => Slide);
};

export default handleFormSubmit;
