import { PortfolioFormValues } from "./index";
import { useFormikContext } from "formik";
import Button from "@mui/material/Button";

export type RangeValue = "1M" | "3M" | "6M" | "1Y" | "5Y";

interface Props {
  label: RangeValue;
  value: number;
  handleChange: (e: { target: { name: string; value: number } }) => void;
}

const GraphRangeButton = (props: Props) => {
  const { label, value, handleChange } = props;
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
      {label}
    </Button>
  );
}

export default GraphRangeButton;