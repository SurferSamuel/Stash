import { Dispatch, SetStateAction } from "react";
import { TestContext } from "yup";
import dayjs from "dayjs";

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
  setLoading: Dispatch<SetStateAction<boolean>>
) => {
  return async (value: string, context: TestContext) => {
    const { createError } = context;

    // Only validate if asxcode input is being actively edited and has changed since last call
    if (document.activeElement.id === "asxcode" && value !== prevValue) {
      // Keep track of the current request id
      const currentRequestId = ++requestId;

      // Update previous value
      prevValue = value;

      // Update states
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
      
      // Otherwise if it is valid
      prevErrorMsg = undefined;
      return true;
    }

    // If not currently being edited, keep showing previous error (if one)
    return !prevErrorMsg || createError({ message: prevErrorMsg });
  };
};

export const noteTitleRequired = (value: string, context: TestContext) => {
  const { createError, parent } = context;

  // If "note description" field is not empty, then a title must be provided
  if (parent.noteDescription && value === undefined) {
    return createError();
  }
  return true;
};

export const noteDateRequired = (value: Date, context: TestContext) => {
  const { createError, parent } = context;

  // Date is required if any "note" related field is not empty
  const nonEmpty = parent.noteTitle || parent.noteDescription;
  if (nonEmpty && value === undefined) {
    return createError();
  }
  return true;
};

export const notificationDateRequired = (value: Date, context: TestContext) => {
  const { createError, parent } = context;

  // Notification date is required if title is not empty
  if (parent.notificationDateTitle && value === undefined) {
    return createError();
  }
  return true;
};

export const futureDate = (value: Date, context: TestContext) => {
  const { createError } = context;

  // Ignore if date is not provided
  if (value === undefined) return true;

  // Notification date must be greater than or equal to today
  if (dayjs().isAfter(value)) {
    return createError();
  }
  return true;
};

export const missingPrice = (value: number, context: TestContext) => {
  const { createError, parent } = context;

  // Ignore if title is empty
  if (!parent.notificationPriceTitle) return true;

  // If title is provided, then a price must be provided
  if (!parent.notificationPriceHigh && !parent.notificationPriceLow) {
    return createError();
  }
  return true;
};

export const lessThanLowPrice = (value: number, context: TestContext) => {
  const { createError, parent } = context;

  // Ignore if low price is invalid
  const lowPrice = parent.notificationPriceLow;
  if (isNaN(lowPrice)) return true;

  // Create error if value (high price) is less than low price
  if (value < lowPrice) {
    return createError();
  }
  return true;
};

export const greaterThanHighPrice = (value: number, context: TestContext) => {
  const { createError, parent } = context;

  // Ignore if high price is invalid
  const highPrice = parent.notificationPriceHigh;
  if (isNaN(highPrice)) return true;

  // Create error if value (low price) is greater than high price
  if (value > highPrice) {
    return createError();
  }
  return true;
};
