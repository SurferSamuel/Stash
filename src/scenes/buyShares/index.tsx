import handleFormSubmit from "./handleFormSubmit";
import { useEffect, useState } from "react";
import { tokens } from "../../theme";
import { Formik } from "formik";
import * as yup from "yup";
import dayjs from "dayjs";

import { cleanUpValidation, validateASXCode } from "./valdation";
import AutoUpdateUnitPrice from "./autoUpdateUnitPrice";
import CostBreakdownHandler from "./costBreakdown";
import LoadBrokerage from "./loadBrokerage";

// Material UI
import CircularProgress from "@mui/material/CircularProgress";
import useMediaQuery from "@mui/material/useMediaQuery";
import useTheme from "@mui/material/styles/useTheme";
import Typography from "@mui/material/Typography";
import Snackbar from "@mui/material/Snackbar";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";

// Components
import CustomTextField from "../../components/customTextField";
import DatePicker from "../../components/datePicker";
import SelectInput from "../../components/select";
import Header from "../../components/header";

// Types
import { CompanyData, Option } from "../../../electron/types";

interface Settings {
  unitPriceAutoFill: boolean;
  gstPercent: string;
  brokerageAutoFill: string;
}

export interface BuySharesFormValues {
  asxcode: string;
  user: string;
  date: dayjs.Dayjs;
  quantity: string;
  unitPrice: string;
  brokerage: string;
}

const BuyShares = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:800px)");

  // Core data related states
  const [data, setData] = useState<CompanyData[]>([]);
  const [settings, setSettings] = useState<Settings>({
    unitPriceAutoFill: false,
    gstPercent: "0",
    brokerageAutoFill: "",
  });

  // ASX Code related states
  const [loading, setLoading] = useState<boolean>(false);
  const [companyName, setCompanyName] = useState<string>("");
  const [unitPrice, setUnitPrice] = useState<string>(undefined);

  // Dropdown data states
  const [asxCodeList, setAsxCodeList] = useState<Option[]>([]);
  const [usersList, setUsersList] = useState<Option[]>([]);

  // Cost breakdown box states
  const [shareValue, setShareValue] = useState<number>(0);
  const [brokerage, setBrokerage] = useState<number>(0);
  const [gst, setGst] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);

  // Success alert states
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [transition, setTransition] = useState(undefined);
  const [severity, setSeverity] = useState<"success" | "error">("success");
  const [alertMessage, setAlertMessage] = useState<string>("");

  // A helper function. Used to sort an array by label, alphabetically.
  const byLabel = (a: { label: string }, b: { label: string }) => a.label.localeCompare(b.label);

  // On page render, get data from API
  useEffect(() => {
    let isMounted = true;
    (async () => {
      const data = await window.electronAPI.getData("companies");
      const users = await window.electronAPI.getData("users");
      const settings = await window.electronAPI.getData("settings");
      if (isMounted) {
        setData(data);
        setUsersList(users);
        setSettings(settings);
        // If data is not empty...
        if (data.constructor === Array) {
          setAsxCodeList(data.map((element) => ({ label: element.asxcode })).sort(byLabel));
        }
      }
    })();
    // Clean up
    return () => {
      isMounted = false;
      cleanUpValidation();
    };
  }, []);

  const initialValues: BuySharesFormValues = {
    asxcode: "",
    user: "",
    date: dayjs(),
    quantity: "",
    unitPrice: "",
    brokerage: "",
  };

  const validationSchema = () =>
    yup.object().shape({
      asxcode: yup
        .string()
        .test("asxcode", "", validateASXCode(data, setCompanyName, setLoading, setUnitPrice)),
      user: yup.string().required("User Required"),
      date: yup.date().typeError("Invalid Date").required("Date Required"),
      quantity: yup.number().required("Quantity Requried"),
      unitPrice: yup.number().required("Unit Price Requried"),
      brokerage: yup.number().required("Brokerage Requried"),
    });

  return (
    <Box m="25px 30px 15px 30px">
      <Header title="Buy Shares" subtitle="Record purchased shares for a company" />
      <Formik
        onSubmit={(values: BuySharesFormValues) => {
          handleFormSubmit(
            values,
            settings.gstPercent,
            setOpenSnackbar,
            setTransition,
            setSeverity,
            setAlertMessage
          );
        }}
        initialValues={initialValues}
        validationSchema={validationSchema}
      >
        {({ values, errors, touched, handleBlur, handleChange, handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            {/* Load brokerage from settings in storage */}
            <LoadBrokerage />
            <Box
              display="grid"
              pb="30px"
              gap="30px"
              gridTemplateColumns="repeat(4, minmax(0, 1fr))"
            >
              {/* ASX Code Input */}
              <SelectInput
                capitaliseInput
                label="ASX Code"
                valueName={"asxcode"}
                value={values.asxcode}
                handleChange={handleChange}
                options={asxCodeList}
                errors={errors}
                touched={touched}
                span={isNonMobile ? 2 : 4}
              />
              {/* Loading Icon */}
              {loading && (
                <CircularProgress
                  color="inherit"
                  size={22}
                  sx={{
                    mt: isNonMobile ? "15px" : "0px",
                    ml: "10px",
                    gridColumn: isNonMobile ? "span 2" : "span 4",
                  }}
                />
              )}
              {/* Company Name */}
              {companyName && (
                <Typography
                  display="flex"
                  alignItems="center"
                  variant="h5"
                  fontWeight={300}
                  color="white"
                  ml="4px"
                  sx={{
                    gridColumn: isNonMobile ? "span 2" : "span 4",
                  }}
                >
                  {companyName}
                </Typography>
              )}
            </Box>
            <Box
              display="grid"
              pb="16px"
              gap="30px"
              gridTemplateColumns="repeat(4, minmax(0, 1fr))"
              sx={{
                "& > div": {
                  gridColumn: isNonMobile ? undefined : "span 4",
                },
              }}
            >
              <Typography variant="h4" ml="6px" gridColumn="span 4">
                Buyer Details
              </Typography>
              {/* User Input */}
              <SelectInput
                label="User"
                valueName={"user"}
                value={values.user}
                handleChange={handleChange}
                options={usersList}
                errors={errors}
                touched={touched}
                span={2}
              />
              {/* Date Input */}
              <DatePicker
                label="Date"
                valueName="date"
                value={values.date}
                handleChange={handleChange}
                touched={touched}
                errors={errors}
                colors={colors}
                span={2}
              />
              <Typography variant="h4" ml="6px" gridColumn="span 4">
                Price Information
              </Typography>
              {/* Quantity Input */}
              <CustomTextField
                numberInput
                type="text"
                name="quantity"
                label="Quantity"
                value={values.quantity}
                onBlur={handleBlur}
                onChange={handleChange}
                error={!!touched.quantity && !!errors.quantity}
                helperText={touched.quantity && errors.quantity}
                sx={{ gridColumn: "span 4" }}
              />
              {/* Unit Price Input */}
              <CustomTextField
                currencyInput
                type="text"
                name="unitPrice"
                label="Unit Price"
                value={values.unitPrice}
                onBlur={handleBlur}
                onChange={handleChange}
                error={!!touched.unitPrice && !!errors.unitPrice}
                helperText={touched.unitPrice && errors.unitPrice}
                sx={{ gridColumn: "span 4" }}
              />
              {/* Brokerage Input */}
              <CustomTextField
                currencyInput
                type="text"
                name="brokerage"
                label="Brokerage"
                value={values.brokerage}
                onBlur={handleBlur}
                onChange={handleChange}
                error={!!touched.brokerage && !!errors.brokerage}
                helperText={touched.brokerage && errors.brokerage}
                sx={{ gridColumn: "span 4" }}
              />
              <Typography variant="h4" ml="6px" gridColumn="span 4">
                Cost Breakdown
              </Typography>
              {/* Cost Breakdown Box */}
              <Box display="flex" flexDirection="column" gridColumn="span 4">
                <Divider />
                {/* Share Value */}
                <Box display="flex" justifyContent="space-between" p="16px 10px 12px 10px">
                  <Typography variant="h5">Share Value:</Typography>
                  <Typography variant="h5">{"$" + shareValue.toFixed(2)}</Typography>
                </Box>
                {/* Brokerage */}
                <Box display="flex" justifyContent="space-between" p="0px 10px 12px 10px">
                  <Typography variant="h5">Brokerage:</Typography>
                  <Typography variant="h5">{"$" + brokerage.toFixed(2)}</Typography>
                </Box>
                {/* GST */}
                <Box display="flex" justifyContent="space-between" p="0px 10px 16px 10px">
                  <Typography variant="h5">GST:</Typography>
                  <Typography variant="h5">{"$" + gst.toFixed(2)}</Typography>
                </Box>
                <Divider />
                {/* Total */}
                <Box display="flex" justifyContent="space-between" p="12px 10px 12px 10px">
                  <Typography variant="h5">Total:</Typography>
                  <Typography variant="h5">{"$" + total.toFixed(2)}</Typography>
                </Box>
                <Divider />
              </Box>
            </Box>
            <Box display="flex" justifyContent="end" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
                Confirm
              </Button>
            </Box>
            {/* Calculate cost breakdown using form values (handled in ./costBreakdown.ts) */}
            <CostBreakdownHandler
              gstPercent={settings.gstPercent}
              setShareValue={setShareValue}
              setBrokerage={setBrokerage}
              setGst={setGst}
              setTotal={setTotal}
            />
            {/* Automatically set unit price using current market price */}
            {settings.unitPriceAutoFill && <AutoUpdateUnitPrice unitPrice={unitPrice} />}
            {/* Snackbar shown on success/error */}
            <Snackbar
              open={openSnackbar}
              autoHideDuration={6000}
              onClose={() => setOpenSnackbar(false)}
              anchorOrigin={{ vertical: "top", horizontal: "right" }}
              TransitionComponent={transition}
            >
              <Alert severity={severity} onClose={() => setOpenSnackbar(false)}>
                {alertMessage}
              </Alert>
            </Snackbar>
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default BuyShares;
