import handleFormSubmit from "./handleFormSubmit";
import { useEffect, useState } from "react";
import { tokens } from "../../theme";
import { Formik } from "formik";
import * as yup from "yup";
import dayjs from "dayjs";

import { cleanUpValidation, validateASXCode } from "./validation";
import AutoUpdateUnitPrice from "./autoUpdateUnitPrice";
import ShowAvailableUnits from "./showAvailableUnits";
import PriceBreakdownHandler from "./priceBreakdown";
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
import { Option } from "../../../electron/types";

interface Settings {
  unitPriceAutoFill: boolean;
  gstPercent: string;
  brokerageAutoFill: string;
}

export interface AddTradeFormValues {
  asxcode: Option;
  type: "BUY" | "SELL";
  account: Option;
  date: dayjs.Dayjs;
  quantity: string;
  unitPrice: string;
  brokerage: string;
}

const AddTrade = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:800px)");

  // Core data related states
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
  const [accountsList, setAccountsList] = useState<Option[]>([]);

  // Price breakdown box states
  const [shareValue, setShareValue] = useState<number>(0);
  const [brokerage, setBrokerage] = useState<number>(0);
  const [gst, setGst] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);

  // Alert states
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
      const settings = await window.electronAPI.getData("settings");
      const accounts = await window.electronAPI.getData("accounts");
      const data = await window.electronAPI.getData("companies");
      if (isMounted) {
        setSettings(settings);
        setAccountsList(accounts.map(element => ({ label: element.name, accountId: element.accountId })).sort(byLabel));
        setAsxCodeList(data.map(element => ({ label: element.asxcode })).sort(byLabel));
      }
    })();
    // Clean up
    return () => {
      isMounted = false;
      cleanUpValidation();
    };
  }, []);

  const initialValues: AddTradeFormValues = {
    asxcode: null,
    type: "BUY",
    account: null,
    date: dayjs(),
    quantity: "",
    unitPrice: "",
    brokerage: "",
  };

  const validationSchema = () =>
    yup.object().shape({
      asxcode: yup
        .object()
        .nonNullable("Required")
        .test("asxcode", "", validateASXCode(setCompanyName, setLoading, setUnitPrice)),
      account: yup
        .object()
        .nonNullable("Required"),
      date: yup
        .date()
        .typeError("Invalid Date")
        .test("not-future", "Date cannot be in the future", (value) => dayjs().isAfter(value))
        .required("Required"),
      quantity: yup
        .number()
        .test("non-zero", "Quantity can't be 0", (value) => value !== 0)
        .required("Requried"),
      unitPrice: yup.number().required("Requried"),
      brokerage: yup.number().required("Requried"),
    });

  return (
    <Box m="25px 30px 15px 30px">
      <Header title="Add Trade" subtitle="Record a new trade for an existing company" />
      <Formik
        onSubmit={(values: AddTradeFormValues) => {
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
              {/* Details Header */}
              <Typography variant="h4" ml="6px" gridColumn="span 4">
                Details
              </Typography>
              {/* Account Input */}
              <SelectInput
                label="Account"
                valueName={"account"}
                value={values.account}
                options={accountsList}
                errors={errors}
                touched={touched}
                span={2}
              />
              {/* Date Input */}
              <DatePicker
                disableFuture
                label="Date"
                valueName="date"
                value={values.date}
                handleChange={handleChange}
                touched={touched}
                errors={errors}
                span={2}
              />
              {/* Type Buttons */}
              <Button
                variant={values.type === "BUY" ? "contained" : "outlined"}
                color="success"
                size="large"
                onClick={() => handleChange({ target: { name: "type", value: "BUY" } })} 
                sx={{ 
                  borderColor: theme.palette.success.main,
                  gridColumn: isNonMobile ? "span 2" : "span 4",
                  height: "50px",
                }}
              >
                <Typography variant="h5" fontWeight={500}>BUY</Typography>
              </Button>
              <Button
                variant={values.type === "SELL" ? "contained" : "outlined"} 
                color="error"
                size="large"
                onClick={() => handleChange({ target: { name: "type", value: "SELL" } })}
                sx={{ 
                  borderColor: theme.palette.error.main,
                  gridColumn: isNonMobile ? "span 2" : "span 4",
                  height: "50px",
                }}
              >
                <Typography variant="h5" fontWeight={500}>SELL</Typography>
              </Button>
              {/* Show available units if type is SELL */}
              <ShowAvailableUnits/>
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
              {/* Price Breakdown Box */}
              <Box display="flex" flexDirection="column" gridColumn="span 4">
                <Divider />
                {/* Share Value */}
                <Box display="flex" justifyContent="space-between" p="16px 10px 12px 10px">
                  <Typography variant="h5">
                    Shares <span style={{ color: colors.grey[300] }}>
                      ({values.quantity ? values.quantity : 0} x ${values.unitPrice ? values.unitPrice : 0})
                    </span>
                  </Typography>
                  <Typography variant="h5">{"$" + shareValue.toFixed(2)}</Typography>
                </Box>
                {/* Brokerage */}
                <Box display="flex" justifyContent="space-between" p="0px 10px 12px 10px">
                  <Typography variant="h5">Brokerage</Typography>
                  <Typography variant="h5">{(brokerage < 0 ? "-$" : "$") + Math.abs(brokerage).toFixed(2)}</Typography>
                </Box>
                {/* GST */}
                <Box display="flex" justifyContent="space-between" p="0px 10px 16px 10px">
                  <Typography variant="h5">
                    GST <span style={{ color: colors.grey[300] }}>
                      ({settings.gstPercent}%)
                    </span>
                  </Typography>
                  <Typography variant="h5">{(gst < 0 ? "-$" : "$") + Math.abs(gst).toFixed(2)}</Typography>
                </Box>
                <Divider />
                {/* Total */}
                <Box display="flex" justifyContent="space-between" p="12px 10px 12px 10px">
                  <Typography variant="h5">Total</Typography>
                  <Typography variant="h5">{(total < 0 ? "-$" : "$") + Math.abs(total).toFixed(2)}</Typography>
                </Box>
                <Divider />
              </Box>
            </Box>
            <Box display="flex" justifyContent="end" mt="20px">
              <Button type="submit" variant="contained">
                Confirm
              </Button>
            </Box>
            {/* Calculate price breakdown using form values */}
            <PriceBreakdownHandler
              gstPercent={settings.gstPercent}
              setShareValue={setShareValue}
              setBrokerage={setBrokerage}
              setGst={setGst}
              setTotal={setTotal}
            />
            {/* Load brokerage from settings in storage */}
            <LoadBrokerage />
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

export default AddTrade;
