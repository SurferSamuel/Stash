import { Dispatch, SetStateAction } from "react";
import { TestContext } from "yup";

// Global variables used in validateASXCode()
let prevErrorMsg: string = undefined;
let prevValue: string = undefined;
let requestId = 0;

// Clean up variables when page is unmounted
export const cleanUpValidation = () => {
  prevErrorMsg = undefined;
  prevValue = undefined;
  requestId = 0;
};

export const validateASXCode = (
  setCompanyName: Dispatch<SetStateAction<string>>,
  setLoading: Dispatch<SetStateAction<boolean>>,
  setUnitPrice: Dispatch<SetStateAction<string>>
) => {
  return async (value: string, context: TestContext) => {
    const { createError } = context;

    // If asxcode input is being actively edited and has changed since last call
    if (document.activeElement.id === "asxcode" && value !== prevValue) {
      // Keep track of the current request id
      const currentRequestId = ++requestId;

      // Update previous value
      prevValue = value;

      // Update states
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
      
      // Otherwise if it is valid
      prevErrorMsg = undefined;
      return true;
    }

    // If not currently being edited, keep showing previous error (if one)
    return !prevErrorMsg || createError({ message: prevErrorMsg });
  };
};
