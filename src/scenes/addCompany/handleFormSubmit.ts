import { Option, OptionKey, MainData } from "../../../electron/types";
import { Dispatch, SetStateAction } from "react";
import { AddCompanyFormValues } from "./index";
import Slide from "@mui/material/Slide";

// A helper function. Used to sort an array by label, alphabetically.
const byLabel = (a: { label: string }, b: { label: string }) => a.label.localeCompare(b.label);

// A helper function. Provided a key and the selected options, saves any new options for that field.
const saveNewOptions = async (key: OptionKey, selectedOptions: Option[]) => {
  const existingOptions = await window.electronAPI.getData(key);
  const newOptions = selectedOptions.filter((targetValue) => {
    return !existingOptions.some((value) => value.label === targetValue.label);
  });
  // Call API to save the new options
  window.electronAPI.setData(key, existingOptions.concat(newOptions).sort(byLabel));
};

const handleFormSubmit = async (
  values: AddCompanyFormValues,
  setOpenSnackbar: Dispatch<SetStateAction<boolean>>,
  setTransition: Dispatch<any>
) => {
  // Save any new options that the user has inputted
  saveNewOptions("miningStatus", values.miningStatus);
  saveNewOptions("financialStatus", values.financialStatus);
  saveNewOptions("resources", values.resources);
  saveNewOptions("products", values.products);
  saveNewOptions("recommendations", values.recommendations);
  saveNewOptions("monitor", values.monitor);

  // Reformat data structure
  const formattedValues: MainData = {
    asxcode: values.asxcode.toUpperCase(),
    operatingCountries: values.operatingCountries,
    financialStatus: values.financialStatus,
    miningStatus: values.miningStatus,
    resources: values.resources,
    products: values.products,
    recommendations: values.recommendations,
    monitor: values.monitor,
    reasonsToBuy: values.noteToBuy,
    reasonsNotToBuy: values.noteNotToBuy,
    positives: values.notePositives,
    negatives: values.noteNegatives,
    notes: [],
    dateNotifications: [],
    priceNotifications: [],
    shares: [],
  };

  // If note was provided
  if (values.noteTitle !== "") {
    formattedValues.notes.push({
      title: values.noteTitle,
      date: values.noteDate,
      description: values.noteDescription,
    });
  }

  // If notification (date) was provided
  if (values.notificationDateTitle !== "") {
    formattedValues.dateNotifications.push({
      title: values.notificationDateTitle,
      date: values.notificationDate,
    });
  }

  // If notification (price) was provided
  if (values.notificationPriceHigh !== "" || values.notificationPriceLow !== "") {
    formattedValues.priceNotifications.push({
      title: values.notificationPriceTitle,
      lowPrice: values.notificationPriceLow,
      highPrice: values.notificationPriceHigh,
    });
  }

  const data = await window.electronAPI.getData("data");

  // Add the formatted values into the existing data
  window.electronAPI.setData("data", data.concat(formattedValues));

  // Open accordion to show success message
  setOpenSnackbar(true);
  setTransition(() => Slide);
};

export default handleFormSubmit;
