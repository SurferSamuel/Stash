import { AddTradeFormValues } from "./index";
import { useEffect, useState } from "react";
import { useFormikContext } from "formik";

// Material UI
import Typography from "@mui/material/Typography";
import InfoIcon from '@mui/icons-material/Info';
import Box from "@mui/material/Box";

interface Props {}

const ShowAvailableUnits = (props: Props) => {
  const { values } = useFormikContext<AddTradeFormValues>();
  const [show, setShow] = useState<boolean>(false);
  const [units, setUnits] = useState<number>(0);

  // Update units state when the required values are modified
  useEffect(() => {
    (async () => {
      // Show available shares only when trade type is SELL and asxcode/user is non-empty
      let show = values.type === "SELL" && values.asxcode !== "" && values.user !== "";

      // Skip API call if not going to show the available shares
      if (!show) {
        setShow(false);
        return;
      };
      
      // Attempt to set the units state using backend API call
      try {
        setUnits(await window.electronAPI.availableShares(values.asxcode.toUpperCase(), values.user));
        setShow(true);
      } catch (error) {
        // If an error was caught (ie. asxcode was not found), then don't show available shares
        setShow(false);
      }
      
    })();
  }, [values.asxcode, values.type, values.user]);

  return (
    show &&
    <Box
      display="flex"
      flexDirection="row"
      gridColumn="span 4"
      gap="6px"
      ml="5px"
    >
      <InfoIcon
        color="secondary"
      />
      <Typography
        color="secondary"
        variant="h5"
      >
        {values.user} has {units.toString()} units of {values.asxcode} to sell.
      </Typography>
    </Box>
  );
}

export default ShowAvailableUnits;