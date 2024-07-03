import { Formik, FormikErrors } from "formik";
import { useEffect, useState } from "react";
import { tokens } from "../../theme";
import * as yup from "yup";
import dayjs from "dayjs";

import OperatingCountriesInput from "./operatingCountries";
import handleFormSubmit from "./handleFormSubmit";

// Yup validation functions
import {
  cleanUpValidation,
  futureDate,
  greaterThanHighPrice,
  lessThanLowPrice,
  missingPrice,
  noteDateRequired,
  noteTitleRequired,
  notificationDateRequired,
  validateASXCode,
} from "./validation";

// Material UI
import CircularProgress from "@mui/material/CircularProgress";
import useMediaQuery from "@mui/material/useMediaQuery";
import useTheme from "@mui/material/styles/useTheme";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Snackbar from "@mui/material/Snackbar";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";

// Components
import { Accordion, AccordionSummary, AccordionDetails } from "../../components/accordion";
import { PerformantTextField } from "../../components/PerformantTextField";
import MultiSelectInput from "../../components/multiSelect";
import DatePicker from "../../components/datePicker";
import TextArea from "../../components/textArea";
import Header from "../../components/header";

// Types
import { Country, Option } from "../../../electron/types";

export interface AddCompanyFormValues {
  asxcode: string;
  operatingCountries: Country[];
  financialStatus: Option[];
  miningStatus: Option[];
  resources: Option[];
  products: Option[];
  recommendations: Option[];
  monitor: Option[];
  noteTitle: string;
  noteDate: dayjs.Dayjs;
  noteDescription: string;
  noteToBuy: string;
  noteNotToBuy: string;
  notePositives: string;
  noteNegatives: string;
  notificationDateTitle: string;
  notificationDate: dayjs.Dayjs;
  notificationPriceTitle: string;
  notificationPriceHigh: string;
  notificationPriceLow: string;
}

const AddCompany = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:800px)");
  const [companyName, setCompanyName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Success alert states
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [transition, setTransition] = useState(undefined);

  // Accordion Expanded States
  const [noteExpanded, setNoteExpanded] = useState<boolean>(false);
  const [dateExpanded, setDateExpanded] = useState<boolean>(false);
  const [priceExpanded, setPriceExpanded] = useState<boolean>(false);

  // Dropdown Data
  const [countriesList, setCountriesList] = useState<Country[]>([]);
  const [financialStatusList, setFinancialStatusList] = useState<Option[]>([]);
  const [miningStatusList, setMiningStatusList] = useState<Option[]>([]);
  const [resourcesList, setResourcesList] = useState<Option[]>([]);
  const [productsList, setProductsList] = useState<Option[]>([]);
  const [recommendationList, setRecommendationList] = useState<Option[]>([]);
  const [monitorList, setMonitorList] = useState<Option[]>([]);

  // On page render, get data from API
  useEffect(() => {
    let isMounted = true;
    (async () => {
      const countries = await window.electronAPI.getData("countries");
      const financialStatus = await window.electronAPI.getData("financialStatus");
      const miningStatus = await window.electronAPI.getData("miningStatus");
      const resources = await window.electronAPI.getData("resources");
      const products = await window.electronAPI.getData("products");
      const recommendations = await window.electronAPI.getData("recommendations");
      const monitor = await window.electronAPI.getData("monitor");
      if (isMounted) {
        setCountriesList(countries);
        setFinancialStatusList(financialStatus);
        setMiningStatusList(miningStatus);
        setResourcesList(resources);
        setProductsList(products);
        setRecommendationList(recommendations);
        setMonitorList(monitor);
      }
    })();
    // Clean up
    return () => {
      isMounted = false;
      cleanUpValidation();
    };
  }, []);

  const initialValues: AddCompanyFormValues = {
    asxcode: "",
    operatingCountries: [],
    financialStatus: [],
    miningStatus: [],
    resources: [],
    products: [],
    recommendations: [],
    monitor: [],
    noteTitle: "",
    noteDate: dayjs(), // Today's date
    noteDescription: "",
    noteToBuy: "",
    noteNotToBuy: "",
    notePositives: "",
    noteNegatives: "",
    notificationDateTitle: "",
    notificationDate: dayjs().add(1, "week"), // Date in 1 week
    notificationPriceTitle: "",
    notificationPriceHigh: "",
    notificationPriceLow: "",
  };

  const validationSchema = () =>
    yup.object().shape({
      asxcode: yup
        .string()
        .required("Required")
        .test("asxcode", "", validateASXCode(setCompanyName, setLoading)),
      noteTitle: yup.string().test("noteTitle", "Required", noteTitleRequired),
      noteDate: yup
        .date()
        .typeError("Invalid Date")
        .nullable()
        .test("noteDate", "Required", noteDateRequired),
      notificationDate: yup
        .date()
        .typeError("Invalid Date")
        .nullable()
        .test("notifDate1", "Required", notificationDateRequired)
        .test("notifDate2", "Date must be in the future", futureDate),
      notificationPriceHigh: yup
        .number()
        .typeError("Invalid Price")
        .positive("Price must be positive")
        .test("notifPriceH1", "Price is missing", missingPrice)
        .test("notifPriceH1", "Upper limit must be above lower limit", lessThanLowPrice),
      notificationPriceLow: yup
        .number()
        .typeError("Invalid Price")
        .positive("Price must be positive")
        .test("notifPriceL1", "Price is missing", missingPrice)
        .test("notifPriceL2", "Lower limit must be below upper limit", greaterThanHighPrice),
    });

  // A helper function. Open accordion's that have errors within them,
  // when the submit button is pressed.
  const OpenAccordionOnError = (errors: FormikErrors<AddCompanyFormValues>) => {
    // "Add Note" Accordion
    if (!!errors.noteTitle || !!errors.noteDate || !!errors.noteDescription) {
      setNoteExpanded(true);
    }
    // "Add Notification (Date)" Accordion
    if (!!errors.notificationDateTitle || !!errors.notificationDate) {
      setDateExpanded(true);
    }
    // "Add Notification (Price)" Accordion
    if (
      !!errors.notificationPriceTitle ||
      !!errors.notificationPriceHigh ||
      !!errors.notificationPriceLow
    ) {
      setPriceExpanded(true);
    }
  };

  return (
    <Box m="25px 30px 15px 30px">
      <Header
        title="Add Company"
        subtitle="Add details, notes and notifications for a new company"
      />
      <Formik
        onSubmit={(values: AddCompanyFormValues) => {
          handleFormSubmit(values, setOpenSnackbar, setTransition);
        }}
        initialValues={initialValues}
        validationSchema={validationSchema}
      >
        {({ values, errors, touched, handleBlur, handleChange, handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <Box
              display="grid"
              mb="16px"
              gap="30px"
              gridTemplateColumns="repeat(4, minmax(0, 1fr))"
            >
              {/* ASX Code Input */}
              <TextField
                type="text"
                id="asxcode"
                name="asxcode"
                label="ASX Code"
                value={values.asxcode}
                onBlur={handleBlur}
                onChange={handleChange}
                error={!!errors.asxcode}
                helperText={errors.asxcode}
                inputProps={{ style: { textTransform: "uppercase" } }}
                sx={{ gridColumn: isNonMobile ? "span 2" : "span 4" }}
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
            {/* Company Details Dropdown */}
            <Accordion>
              <AccordionSummary>
                <Typography variant="h5">Company Details</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box
                  display="grid"
                  gap="30px"
                  py="12px"
                  gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                  sx={{
                    "& > div": {
                      gridColumn: isNonMobile ? undefined : "span 4",
                    },
                  }}
                >
                  {/* Operating Countries Input */}
                  <OperatingCountriesInput
                    values={values.operatingCountries}
                    handleChange={handleChange}
                    options={countriesList}
                  />
                  {/* Financial Status Input */}
                  <MultiSelectInput
                    allowNewOptions
                    label="Financial Status"
                    valueName="financialStatus"
                    value={values.financialStatus}
                    handleChange={handleChange}
                    options={financialStatusList}
                  />
                  {/* Mining Status Input */}
                  <MultiSelectInput
                    allowNewOptions
                    label="Mining Status"
                    valueName="miningStatus"
                    value={values.miningStatus}
                    handleChange={handleChange}
                    options={miningStatusList}
                  />
                  {/* Resources Input */}
                  <MultiSelectInput
                    allowNewOptions
                    label="Resources"
                    valueName="resources"
                    value={values.resources}
                    handleChange={handleChange}
                    options={resourcesList}
                  />
                  {/* Products Input */}
                  <MultiSelectInput
                    allowNewOptions
                    label="Products"
                    valueName="products"
                    value={values.products}
                    handleChange={handleChange}
                    options={productsList}
                  />
                  {/* Recommendations Input */}
                  <MultiSelectInput
                    allowNewOptions
                    label="Recommendations"
                    valueName="recommendations"
                    value={values.recommendations}
                    handleChange={handleChange}
                    options={recommendationList}
                  />
                  {/* Monitor Input */}
                  <MultiSelectInput
                    allowNewOptions
                    label="Monitor"
                    valueName="monitor"
                    value={values.monitor}
                    handleChange={handleChange}
                    options={monitorList}
                  />
                  {/* Reasons to Buy Input */}
                  <TextArea
                    label="Reasons To Buy"
                    valueName="noteToBuy"
                    value={values.noteToBuy}
                    handleBlur={handleBlur}
                    handleChange={handleChange}
                    span={2}
                    rows={3}
                  />
                  {/* Reasons Not to Buy Input */}
                  <TextArea
                    label="Reasons Not To Buy"
                    valueName="noteNotToBuy"
                    value={values.noteNotToBuy}
                    handleBlur={handleBlur}
                    handleChange={handleChange}
                    span={2}
                    rows={3}
                  />
                  {/* Positives Input */}
                  <TextArea
                    label="Positives"
                    valueName="notePositives"
                    value={values.notePositives}
                    handleBlur={handleBlur}
                    handleChange={handleChange}
                    span={2}
                    rows={3}
                  />
                  {/* Negatives Input */}
                  <TextArea
                    label="Negatives"
                    valueName="noteNegatives"
                    value={values.noteNegatives}
                    handleBlur={handleBlur}
                    handleChange={handleChange}
                    span={2}
                    rows={3}
                  />
                </Box>
              </AccordionDetails>
            </Accordion>
            {/* Add Note Dropdown */}
            <Accordion expanded={noteExpanded} onChange={() => setNoteExpanded(!noteExpanded)}>
              <AccordionSummary>
                <Typography variant="h5">Add Note</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box
                  display="grid"
                  gap="30px"
                  py="12px"
                  gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                  sx={{
                    "& > div": {
                      gridColumn: isNonMobile ? undefined : "span 4",
                    },
                  }}
                >
                  {/* Note Title Input */}
                  <PerformantTextField
                    type="text"
                    name="noteTitle"
                    label="Title"
                    value={values.noteTitle}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    error={!!touched.noteTitle && !!errors.noteTitle}
                    helperText={touched.noteTitle && errors.noteTitle}
                    sx={{ gridColumn: "span 3" }}
                  />
                  {/* Note Date Input */}
                  <DatePicker
                    label="Date"
                    valueName="noteDate"
                    value={values.noteDate}
                    handleChange={handleChange}
                    touched={touched}
                    errors={errors}
                    colors={colors}
                    span={1}
                  />
                  {/* Note Description Input */}
                  <TextArea
                    label="Description"
                    valueName="noteDescription"
                    value={values.noteDescription}
                    handleBlur={handleBlur}
                    handleChange={handleChange}
                    span={4}
                    rows={8}
                  />
                </Box>
              </AccordionDetails>
            </Accordion>
            {/* Add notification (date) dropdown */}
            <Accordion expanded={dateExpanded} onChange={() => setDateExpanded(!dateExpanded)}>
              <AccordionSummary>
                <Typography variant="h5">Add Notification (Date)</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box
                  display="grid"
                  gap="30px"
                  py="12px"
                  gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                  sx={{
                    "& > div": {
                      gridColumn: isNonMobile ? undefined : "span 4",
                    },
                  }}
                >
                  {/* Notification (Date) Title Input */}
                  <PerformantTextField
                    type="text"
                    name="notificationDateTitle"
                    label="Title"
                    value={values.notificationDateTitle}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    error={!!touched.notificationDateTitle && !!errors.notificationDateTitle}
                    helperText={touched.notificationDateTitle && errors.notificationDateTitle}
                    sx={{ gridColumn: "span 3" }}
                  />
                  {/* Notification (Date) Date Input */}
                  <DatePicker
                    label="Future Date"
                    valueName="notificationDate"
                    value={values.notificationDate}
                    handleChange={handleChange}
                    touched={touched}
                    errors={errors}
                    colors={colors}
                    disablePast
                    span={1}
                  />
                </Box>
              </AccordionDetails>
            </Accordion>
            {/* Add Notification (Price) Input */}
            <Accordion expanded={priceExpanded} onChange={() => setPriceExpanded(!priceExpanded)}>
              <AccordionSummary>
                <Typography variant="h5">Add Notification (Price)</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box
                  display="grid"
                  gap="30px"
                  py="12px"
                  gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                  sx={{
                    "& > div": {
                      gridColumn: isNonMobile ? undefined : "span 4",
                    },
                  }}
                >
                  {/* Notification (Price) Title */}
                  <PerformantTextField
                    type="text"
                    name="notificationPriceTitle"
                    label="Title (Optional)"
                    value={values.notificationPriceTitle}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    error={!!touched.notificationPriceTitle && !!errors.notificationPriceTitle}
                    helperText={touched.notificationPriceTitle && errors.notificationPriceTitle}
                    sx={{ gridColumn: "span 4" }}
                  />
                  {/* Notification (Price) Low Price */}
                  <PerformantTextField
                    currencyInput
                    type="text"
                    name="notificationPriceLow"
                    label="Lower Limit"
                    value={values.notificationPriceLow}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    error={!!touched.notificationPriceLow && !!errors.notificationPriceLow}
                    helperText={touched.notificationPriceLow && errors.notificationPriceLow}
                    sx={{ gridColumn: "span 2" }}
                  />
                  {/* Notification (Price) High Price */}
                  <PerformantTextField
                    currencyInput
                    type="text"
                    name="notificationPriceHigh"
                    label="Upper Limit"
                    value={values.notificationPriceHigh}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    error={!!touched.notificationPriceHigh && !!errors.notificationPriceHigh}
                    helperText={touched.notificationPriceHigh && errors.notificationPriceHigh}
                    sx={{ gridColumn: "span 2" }}
                  />
                </Box>
              </AccordionDetails>
            </Accordion>
            <Box display="flex" justifyContent="end" mt="20px">
              <Button
                type="submit"
                color="secondary"
                variant="contained"
                // Open respective accordion's on input error
                onClick={() => OpenAccordionOnError(errors)}
              >
                Confirm
              </Button>
            </Box>
            {/* Snackbar shown on success */}
            <Snackbar
              open={openSnackbar}
              autoHideDuration={6000}
              onClose={() => setOpenSnackbar(false)}
              anchorOrigin={{ vertical: "top", horizontal: "right" }}
              TransitionComponent={transition}
            >
              <Alert severity="success" onClose={() => setOpenSnackbar(false)}>
                Successfully saved!
              </Alert>
            </Snackbar>
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default AddCompany;
