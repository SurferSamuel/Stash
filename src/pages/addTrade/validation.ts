import { Dispatch, SetStateAction } from "react";
import { Option } from "../../../electron/types";
import { TestContext } from "yup";

let prevErrorMsg: string = undefined;
let prevValue: string = undefined;
let requestId = 0;

/**
 * Cleans up validation variables for all fields. Call when page is unmounted.
 */
export const cleanUpValidation = () => {
  prevErrorMsg = undefined;
  prevValue = undefined;
  requestId = 0;
};

/**
 * Validates the ASX code field in the yup validation schema for the
 * "Add Trade" page. Sets the company name (empty string if not valid)
 * and sets the unit price (not changed if not valid).
 * 
 * @param setCompanyName Set company name function
 * @param setLoading Set loading function
 * @param setUnitPrice Set unit price function
 * @returns True/false if field is valid
 */
export const validateASXCode = (
  setCompanyName: Dispatch<SetStateAction<string>>,
  setLoading: Dispatch<SetStateAction<boolean>>,
  setUnitPrice: Dispatch<SetStateAction<string>>
) => {
  return async (currentOption: Option, context: TestContext) => {
    const value = currentOption.label;
    const { createError } = context;

    // If asxcode input is being actively edited and has changed since last call
    if (document.activeElement.id === "asxcode" && value !== prevValue) {
      const currentRequestId = ++requestId;
      prevValue = value;
      setCompanyName("");
      setLoading(true);

      // Wait for validation request to be processed
      const res = await window.electronAPI.validateASXCode(value, true);
      
      // If current request id is outdated, don't update anything and
      // just show the previous error (if one)
      if (currentRequestId !== requestId) {
        return !prevErrorMsg || createError({ message: prevErrorMsg });
      }

      // Update states
      setLoading(false);
      setCompanyName(res.companyName);
      setUnitPrice(res.unitPrice);

      // Create error if asxcode was not valid
      if (res.status !== "Valid") {
        prevErrorMsg = res.status;
        return createError({ message: res.status });
      } 
      
      // Otherwise, if it is valid...
      prevErrorMsg = undefined;
      return true;
    }

    // If not currently being edited, keep showing previous error (if one)
    return !prevErrorMsg || createError({ message: prevErrorMsg });
  };
};
