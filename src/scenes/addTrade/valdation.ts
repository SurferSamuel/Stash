import { Dispatch, SetStateAction, useState } from "react";
import { CompanyData } from "../../../electron/types";
import * as yup from "yup";

// Used in validateASXCode
let prevErrorMsg: string = undefined;
let prevValue: string = undefined;

// Reset local variables when screen is unmounted
export const cleanUpValidation = () => {
  prevErrorMsg = undefined;
  prevValue = undefined;
};

export const validateASXCode = (
  data: CompanyData[],
  setCompanyName: Dispatch<SetStateAction<string>>,
  setLoading: Dispatch<SetStateAction<boolean>>,
  setUnitPrice: Dispatch<SetStateAction<string>>
) => {
  return async (value: string, context: yup.TestContext) => {
    const { path, createError } = context;

    // Helper function
    const sendError = (message: string) => {
      setCompanyName("");
      prevErrorMsg = message;
      return createError({ path, message });
    };

    // If ASX Code is missing
    if (value === undefined) {
      setUnitPrice(undefined);
      prevValue = undefined;
      return sendError("Required");
    }

    // Only run test if asxcode is being actively edited (and has been changed since last call)
    if (document.activeElement.id === "asxcode" && value !== prevValue) {
      setCompanyName("");
      prevValue = value;

      // ASX Code must be a valid option (ie. in data)
      if (!data.some((element) => element.asxcode === value)) {
        return sendError("ASX Code Not Found");
      }

      try {
        // Display loading icon while API request is being processed
        setLoading(true);
        const res = await window.electronAPI.fetchQuote(value);
        setLoading(false);

        // If quote is empty (no results)
        if (!res.quote) {
          return sendError(`ERROR: Empty quote for '${value}'`);
        }

        // Update states
        if (res.quote.longName) setCompanyName(res.quote.longName.toUpperCase());
        if (res.quote.regularMarketPrice) setUnitPrice(res.quote.regularMarketPrice.toString());
        prevErrorMsg = undefined;
        return true;
      } catch (error) {
        // Handle any errors
        setLoading(false);
        console.error(error); // Show error for future debugging
        return sendError(`ERROR: Could not fetch quote for '${value}'`);
      }
    }
    // Keep showing previous error...
    return !prevErrorMsg || createError({ path, message: prevErrorMsg });
  };
};
