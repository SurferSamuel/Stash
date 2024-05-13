import * as yup from "yup";
import dayjs from "dayjs";
import React from "react";

// Used in validateASXCode
let prevErrorMsg: string = undefined;

/** Reset local variables when screen is unmounted */
export const cleanUpValidation = () => {
  prevErrorMsg = undefined;
};

export const validateASXCode = (
  setCompanyName: React.Dispatch<React.SetStateAction<string>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  return async (value: string, context: yup.TestContext) => {
    const { path, createError } = context;

    // Helper function.
    const sendError = (message: string) => {
      setCompanyName("");
      prevErrorMsg = message;
      return createError({ path, message });
    };

    // ASX Code must be 3-5 characters long
    if (!/^[a-zA-Z0-9]{3,5}$/.test(value)) {
      return sendError("Invalid Format");
    }

    // ASX Code must be new and not in the existing data
    const existingData = await window.electronAPI.getData("companies");
    if (existingData.some((obj) => obj.asxcode === value.toUpperCase())) {
      return sendError("Already Exists");
    }

    // Only call API if asxcode is being actively edited (to reduce number of API calls)
    if (document.activeElement.id === "asxcode") {
      try {
        // Display loading icon while API request is being processed
        setLoading(true);
        const res = await window.electronAPI.fetchQuote(value);
        setLoading(false);

        // If quote is empty (no results), then it is invalid
        if (!res.quote) {
          return sendError("Invalid");
        }

        // Otherwise if asxcode is valid...
        if (res.quote.longName) setCompanyName(res.quote.longName.toUpperCase());
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

export const noteTitleRequired = (value: string, context: yup.TestContext) => {
  const { createError } = context;

  // Only check if title has not been entered
  if (value !== undefined) return true;

  // If "note description" field is not empty, then a title must be provided
  if (context.parent.noteDescription) {
    return createError();
  } else {
    return true;
  }
};

export const noteDateRequired = (value: Date, context: yup.TestContext) => {
  const { createError } = context;

  // Date is required if any "note" related field is not empty
  const nonEmpty = context.parent.noteTitle || context.parent.noteDescription;

  if (nonEmpty && value === null) {
    createError();
  } else {
    return true;
  }
};

export const notificationDateRequired = (value: Date, context: yup.TestContext) => {
  const { createError } = context;

  // Notification date is required if title is not empty
  if (context.parent.notificationDateTitle && value === null) {
    createError();
  } else {
    return true;
  }
};

export const futureDate = (value: Date, context: yup.TestContext) => {
  const { createError } = context;

  // Ignore if date is not provided
  if (value === null) return true;

  // Notification date must be greater than or equal to today
  if (dayjs(value).isBefore(dayjs()) && !dayjs(value).isSame(dayjs(), "day")) {
    createError();
  } else {
    return true;
  }
};

export const missingPrice = (value: number, context: yup.TestContext) => {
  const { path, createError } = context;

  // Ignore if title is empty
  if (!context.parent.notificationPriceTitle) return true;

  // If title is provided, then a price must be provided
  if (context.parent.notificationPriceHigh || context.parent.notificationPriceLow) {
    return true;
  } else {
    createError({ path });
  }
};

export const lessThanLowPrice = (value: number, context: yup.TestContext) => {
  const { path, createError } = context;

  // Ignore if low price is invalid
  const lowPrice = context.parent.notificationPriceLow;
  if (isNaN(lowPrice)) return true;

  // Create error if value (high price) is less than low price
  if (value < lowPrice) {
    createError({ path });
  } else {
    return true;
  }
};

export const greaterThanHighPrice = (value: number, context: yup.TestContext) => {
  const { path, createError } = context;

  // Ignore if high price is invalid
  const highPrice = context.parent.notificationPriceHigh;
  if (isNaN(highPrice)) return true;

  // Create error if value (low price) is greater than high price
  if (value > highPrice) {
    createError({ path });
  } else {
    return true;
  }
};
