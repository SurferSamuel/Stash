import { GraphRange } from "../../../electron/types";
import { Dispatch, SetStateAction } from "react";
import { tokens } from "../../theme";

// Material UI
import useTheme from "@mui/material/styles/useTheme";
import Button from "@mui/material/Button";

type RangeLabel = "1M" | "3M" | "6M" | "1Y" | "5Y";

interface Props {
  label: RangeLabel;
  range: GraphRange;
  setRange: Dispatch<SetStateAction<GraphRange>>;
}

const GraphRangeButton = (props: Props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { 
    label, 
    range, 
    setRange
  } = props;
  

  const value: GraphRange = 
    label === "1M" ? 1 :
    label === "3M" ? 3 :
    label === "6M" ? 6 :
    label === "1Y" ? 12 :
    60;

  return (
    <Button
      disableRipple
      variant="text"
      onClick={() => setRange(value)}
      sx={{ 
        color: range === value ? "white" : colors.blueAccent[600],
        zIndex: 1,
        '&:hover': {
          backgroundColor: 'transparent',
        },
      }}
    >
      {label}
    </Button>
  );
}

export default GraphRangeButton;