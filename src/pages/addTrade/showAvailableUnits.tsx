import { AddTradeFormValues } from "./index";
import { useEffect, useState } from "react";
import { useFormikContext } from "formik";

// Material UI
import Typography from "@mui/material/Typography";
import InfoIcon from '@mui/icons-material/Info';
import Box from "@mui/material/Box";

const ShowAvailableUnits = () => {
  const { values } = useFormikContext<AddTradeFormValues>();
  const [show, setShow] = useState<boolean>(false);
  const [units, setUnits] = useState<number>(0);

  // Update units state when the required values are modified
  useEffect(() => {
    (async () => {
      // Show available shares only when trade type is SELL and asxcode/account is non-empty
      if (
        values.type !== "SELL" || values.asxcode === null || 
        values.account === null || values.account.accountId === undefined
      ) {
        setShow(false);
        return;
      }
      
      // Attempt to set the units state using backend API call
      try {
        const asxcode = values.asxcode.label.toUpperCase();
        setUnits(await window.electronAPI.availableShares(asxcode, values.account.accountId));
        setShow(true);
      } catch {
        // If error (ie. asxcode was not found), then don't show available shares
        setShow(false);
      }
      
    })();
  }, [values.asxcode, values.type, values.account]);

  return (
    show &&
    <Box
      display="flex"
      flexDirection="row"
      gridColumn="span 4"
      gap="6px"
      ml="5px"
    >
      <InfoIcon color="primary"/>
      <Typography color="primary" variant="h5">
        {values.account.label} has {units.toString()} units of {values.asxcode.label}.
      </Typography>
    </Box>
  );
}

export default ShowAvailableUnits;