import { Dispatch, SetStateAction } from "react";
import { AddCompanyFormValues } from "./index";
import Slide from "@mui/material/Slide";

const handleFormSubmit = async (
  values: AddCompanyFormValues,
  setOpenSnackbar: Dispatch<SetStateAction<boolean>>,
  setTransition: Dispatch<any>
) => {
  // Convert Dayjs objects to strings (since can't send "Dayjs" types over IPC)
  const sendValues = {
    ...values,
    noteDate: values.noteDate.format("DD/MM/YYYY hh:mm A"),
    notificationDate: values.notificationDate.format("DD/MM/YYYY hh:mm A"),
  };

  // Save new company form values
  await window.electronAPI.addCompany(sendValues);

  // Open accordion to show success message
  setOpenSnackbar(true);
  setTransition(() => Slide);
};

export default handleFormSubmit;
