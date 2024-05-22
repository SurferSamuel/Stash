import { PortfolioFormValues } from "./index";
import { useFormikContext } from "formik";
import Button from "@mui/material/Button";

export type RangeValue = "1M" | "3M" | "6M" | "1Y" | "5Y";

interface Props {
  value: RangeValue;
  handleChange: (e: { target: { name: string; value: string } }) => void;
}

const GraphRangeButton = (props: Props) => {
  const { handleChange, value } = props;
  const { values } = useFormikContext<PortfolioFormValues>();
  return (
    <Button
      disableRipple
      variant="text"
      onClick={() => handleChange({ target: { name: "graphRange", value } })}
      sx={{ 
        color: values.graphRange === value ? "white" : "primary",
        zIndex: 1,
        '&:hover': {
          backgroundColor: 'transparent',
        },
      }}
    >
      {value}
    </Button>
  );
}

export default GraphRangeButton;