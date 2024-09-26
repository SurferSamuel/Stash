import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

// Types
import { PortfolioText } from "../../../electron/types";
import { Skeleton } from "@mui/material";

interface Props {
  loading: boolean;
  data: PortfolioText;
}

const PortfolioValueText = (props: Props) => {
  const { loading, data } = props;
  const {
    totalValue,
    dailyChange,
    dailyChangePerc,
    totalChange,
    totalChangePerc,
  } = data;

  /**
   * A helper function that determines the color based on the given string.
   * @param str Value string
   * @returns The color to use
   */
  const getColor = (str: string): string => {
    if (str === "+0.00") return "white";
    return (str[0] === "+") ? "success.main" : "error.main";
  }

  /**
   * A helper function that returns a skeleton component with the given width.
   * @param width How many pixels wide
   * @returns Skeleton component
   */
  const skeleton = (width: number) => {
    return (
      <Skeleton
        width={width}
        animation="wave"
        sx={{ animationDuration: "0.8s" }}
      />
    )
  }

  return (
    <Box display="flex" alignItems="flex-end" gap="30px" ml="3px">
      {/* Portfolio Value container */}
      <Box display="flex" flexDirection="column" gap="2px">
        <Typography variant="h6" fontWeight={400} color="secondary">
          Portfolio Value
        </Typography>
        <Typography variant="h1" fontWeight={600} fontSize={36}>
          {loading ? skeleton(200) : totalValue}
        </Typography>
      </Box>
      {/* Today's Change container */}
      <Box display="flex" flexDirection="column" gap="2px">
        <Typography variant="h6" fontWeight={400} color="secondary">
          Today's Change
        </Typography>
        <Typography variant="h6" fontWeight={700} color={getColor(dailyChange)}>
          {loading ? skeleton(120) : dailyChange + (dailyChangePerc === "" ? "" : ` (${dailyChangePerc})`)}
        </Typography>
      </Box>
      {/* Total Change container */}
      <Box display="flex" flexDirection="column" gap="2px">
        <Typography variant="h6" fontWeight={400} color="secondary">
          Total Change
        </Typography>
        <Typography variant="h6" fontWeight={700} color={getColor(totalChange)}>
          {loading ? skeleton(120) : totalChange + (totalChangePerc === "" ? "" : ` (${totalChangePerc})`)}
        </Typography>
      </Box>
    </Box>
  );
}

export default PortfolioValueText;