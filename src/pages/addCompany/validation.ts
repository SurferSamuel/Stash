import { Dispatch, SetStateAction } from "react";
import { TestContext } from "yup";
import dayjs from "dayjs";

let prevErrorMsg: string = undefined;
let prevValue: string = undefined;
let requestId = 0;

/**
 * Cleans up validation variables for all fields.
 */
export const cleanUpValidation = () => {
  prevErrorMsg = undefined;
  prevValue = undefined;
  requestId = 0;
};

/**
 * Validates the ASX code field in the yup validation schema for the
 * "Add Company" page. Sets the company name (empty string if not valid).
 * 
 * @param setCompanyName Set company name function
 * @param setLoading Set loading function
 * @returns True/false if field is valid
 */
export const validateASXCode = (
  setCompanyName: Dispatch<SetStateAction<string>>,
  setLoading: Dispatch<SetStateAction<boolean>>
) => {
  return async (value: string, context: TestContext) => {
    const { createError } = context;

    // If asxcode input is being actively edited and has changed since last call
    if (document.activeElement.id === "asxcode" && value !== prevValue) {
      const currentRequestId = ++requestId;
      prevValue = value;
      setCompanyName("");
      setLoading(true);

      // Wait for validation request to be processed
      const res = await window.electronAPI.validateASXCode(value, false);
      
      // If current request id is outdated, don't update anything and
      // just show the previous error (if one)
      if (currentRequestId !== requestId) {
        return !prevErrorMsg || createError({ message: prevErrorMsg });
      }

      // Update states
      setLoading(false);
      setCompanyName(res.companyName);

      // Create error if asxcode was not valid
      if (res.status !== "Valid") {
        prevErrorMsg = res.status;
        return createError({ message: res.status });
      } 
      
      // Otherwise, if it is valid...
      prevErrorMsg = undefined;
      return true;
    }

    // Use a quicker validation when pressing the submit button
    if (document.activeElement.id === "submit") {
      const currentRequestId = ++requestId;
      prevValue = value;

      // Wait for validation request to be processed
      const res = await window.electronAPI.quickValidateASXCode(value);
      
      // If current request id is outdated, don't update anything and
      // just show the previous error (if one)
      if (currentRequestId !== requestId) {
        return !prevErrorMsg || createError({ message: prevErrorMsg });
      }

      // Create error if asxcode was not valid
      if (res !== "Valid") {
        setCompanyName("");
        prevErrorMsg = res;
        return createError({ message: res });
      } 
      
      // Otherwise, if it is valid...
      prevErrorMsg = undefined;
      return true;
    }

    // If not currently being edited, keep showing previous error (if one)
    return !prevErrorMsg || createError({ message: prevErrorMsg });
  };
};

/**
 * Validates the note title field in the yup validation schema for the
 * "Add Company" page. If description is not empty, then a title must be provided.
 * 
 * @param value Note title field
 * @param context Yup context
 * @returns True/false if field is valid
 */
export const noteTitleRequired = (value: string, context: TestContext) => {
  const { createError, parent } = context;
  if (parent.noteDescription && value === undefined) {
    return createError();
  }
  return true;
};

/**
 * Validates the note date field in the yup validation schema for the
 * "Add Company" page. Date is required if any "note" related field is not empty.
 * 
 * @param value Note date field
 * @param context Yup context
 * @returns True/false if field is valid
 */
export const noteDateRequired = (value: Date, context: TestContext) => {
  const { createError, parent } = context;
  if ((parent.noteTitle || parent.noteDescription) && value === undefined) {
    return createError();
  }
  return true;
};

/**
 * Validates the notification date field in the yup validation schema for
 * the "Add Company" page. Notification date is required if title is not empty.
 * 
 * @param value Notification date field
 * @param context Yup context
 * @returns True/false if field is valid
 */
export const notificationDateRequired = (value: Date, context: TestContext) => {
  const { createError, parent } = context;
  if (parent.notificationDateTitle && value === undefined) {
    return createError();
  }
  return true;
};

/**
 * Validates the notification date field in the yup validation schema for
 * the "Add Company" page. Notification date must be in the future. Returns
 * true if no date is provided.
 * 
 * @param value Notification date field
 * @param context Yup context
 * @returns True/false if field is valid
 */
export const futureDate = (value: Date, context: TestContext) => {
  const { createError } = context;
  if (value !== undefined && dayjs().isAfter(value)) {
    return createError();
  }
  return true;
};

/**
 * Validates the notification price fields in the yup validation schema for
 * the "Add Company" page. Notification price is required if title is not empty.
 * Returns true if title is empty.
 * 
 * @param value Notification price field
 * @param context Yup context
 * @returns True/false if field is valid
 */
export const missingPrice = (value: number, context: TestContext) => {
  const { createError, parent } = context;
  if (
    parent.notificationPriceTitle !== undefined && 
    !(parent.notificationPriceHigh || parent.notificationPriceLow)
  ) {
    return createError();
  }
  return true;
};

/**
 * Validates the notification price fields in the yup validation schema for
 * the "Add Company" page. Checks if the upper price is above the lower price.
 * 
 * @param value Notification price field
 * @param context Yup context
 * @returns True/false if field is valid
 */
export const lessThanLowPrice = (value: number, context: TestContext) => {
  const { createError, parent } = context;
  const lowPrice = parent.notificationPriceLow;
  if (!isNaN(lowPrice) && value < lowPrice) {
    return createError();
  }
  return true;
};

/**
 * Validates the notification price fields in the yup validation schema for
 * the "Add Company" page. Checks if the lower price is below the upper price.
 * 
 * @param value Notification price field
 * @param context Yup context
 * @returns True/false if field is valid
 */
export const greaterThanHighPrice = (value: number, context: TestContext) => {
  const { createError, parent } = context;
  const highPrice = parent.notificationPriceHigh;
  if (!isNaN(highPrice) && value > highPrice) {
    return createError();
  }
  return true;
};
