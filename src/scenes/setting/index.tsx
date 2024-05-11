import { useEffect, useState } from "react";
import { Formik } from "formik";
import * as yup from "yup";

import { Settings } from "../../../electron/types";
import handleFormSubmit from "./handleFormSubmit";
import LoadSettings from "./loadSettings";
import { tokens } from "../../theme";
import RowLabel from "./rowLabel";

// Material UI
import useTheme from "@mui/material/styles/useTheme";
import Typography from "@mui/material/Typography";
import Snackbar from "@mui/material/Snackbar";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import Switch from "@mui/material/Switch";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";

// Components
import CustomTextField from "../../components/customTextField";
import Header from "../../components/header";

const Settings = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [storagePath, setStoragePath] = useState<string>("Loading...");

  // Success alert states
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [transition, setTransition] = useState(undefined);

  // On page render, get data from API
  useEffect(() => {
    let isMounted = true;
    (async () => {
      const path = await window.electronAPI.getStoragePath();
      if (isMounted) setStoragePath(path);
    })();
    // Clean up
    return () => {
      isMounted = false;
    };
  }, []);

  const initialValues: Settings = {
    unitPriceAutoFill: true,
    gstPercent: "",
    brokerageAutoFill: "",
  };

  const validationSchema = () =>
    yup.object().shape({
      gstPercent: yup.number().typeError("Invalid Type").required("Required"),
    });

  return (
    <Box m="25px 30px 15px 30px">
      <Formik
        onSubmit={(values: Settings) => {
          handleFormSubmit(values, setOpenSnackbar, setTransition);
        }}
        initialValues={initialValues}
        validationSchema={validationSchema}
      >
        {({ values, errors, touched, handleBlur, handleChange, handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            {/* Load settings from storage */}
            <LoadSettings />
            <Header title="Settings" subtitle="Manage application settings" />
            {/* STORAGE */}
            <Typography variant="h4" m="0px 0px 10px 0px">
              Storage
            </Typography>
            <Divider />
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              m="12px 6px 0px 0px"
            >
              {/* Left Side */}
              <RowLabel title="Storage Location" subtitle={storagePath} />
              {/* Right Side */}
              <Box>
                <Button
                  color="secondary"
                  variant="outlined"
                  onClick={() => window.electronAPI.openStoragePath()}
                  sx={{ width: 130 }}
                >
                  Open Location
                </Button>
              </Box>
            </Box>
            {/* BUY SHARES */}
            <Typography variant="h4" m="30px 0px 10px 0px">
              Buy Shares
            </Typography>
            <Divider />
            {/* UNIT COST AUTO FILL */}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              m="12px 6px 0px 0px"
            >
              {/* Left Side */}
              <RowLabel
                title="Unit Price Auto Fill"
                subtitle="Automatically prefill forms using the current share price"
              />
              {/* Right Side */}
              <Switch
                color="secondary"
                name="unitPriceAutoFill"
                checked={values.unitPriceAutoFill}
                onChange={handleChange}
                inputProps={{ "aria-label": "controlled" }}
              />
            </Box>
            {/* GST PERCENT */}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              m="12px 6px 0px 0px"
            >
              {/* Left Side */}
              <RowLabel
                title="GST Percentage"
                subtitle="The % of brokerage used to calculate GST"
              />
              {/* Right Side */}
              <CustomTextField
                percentInput
                type="text"
                name="gstPercent"
                size="small"
                value={values.gstPercent}
                onBlur={handleBlur}
                onChange={handleChange}
                error={!!touched.gstPercent && !!errors.gstPercent}
                sx={{ width: 130 }}
              />
            </Box>
            {/* BROKERAGE AUTO FILL */}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              m="12px 6px 0px 0px"
            >
              {/* Left Side */}
              <RowLabel
                title="Brokerage Auto Fill"
                subtitle="Automatically prefill forms with this brokerage"
              />
              {/* Right Side */}
              <CustomTextField
                currencyInput
                type="text"
                name="brokerageAutoFill"
                size="small"
                value={values.brokerageAutoFill}
                onBlur={handleBlur}
                onChange={handleChange}
                error={!!touched.brokerageAutoFill && !!errors.brokerageAutoFill}
                sx={{ width: 130 }}
              />
            </Box>
            <Box display="flex" justifyContent="end" mt="20px" mr="6px">
              <Button type="submit" color="secondary" variant="contained" sx={{ width: 130 }}>
                Save Changes
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

export default Settings;
