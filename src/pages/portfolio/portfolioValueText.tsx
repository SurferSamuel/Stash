import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

// Loading text
export const loadingText = "Loading";

interface Props {
  totalValue: string;
  dailyChange: string;
  dailyChangePerc: string;
  totalChange: string;
  totalChangePerc: string;
}

const PortfolioValueText = (props: Props) => {
  const {
    totalValue,
    dailyChange,
    dailyChangePerc,
    totalChange,
    totalChangePerc,
  } = props;

  // A helper function that determines the color based on the given string
  const getColor = (str: string): string => {
    if (str === loadingText || str === "+0.00") return "white";
    return (str[0] === "+") ? "success.main" : "error.main";
  }

  return (
    <Box
      display="flex"
      alignItems="flex-end"
      gap="30px"
      ml="3px"
      gridColumn="span 4"
    >
      {/* Portfolio Value Box */}
      <Box
        display="flex"
        flexDirection="column"
        gap="2px"
      >
        <Typography
          variant="h6"
          fontWeight={400}
          color="secondary"
        >
          Portfolio Value
        </Typography>
        <Typography 
          variant="h1"
          fontWeight={600}
          fontSize={36}
        >
          {totalValue}
        </Typography>
      </Box>
      {/* Today's Change Box */}
      <Box
        display="flex"
        flexDirection="column"
        gap="2px"
      >
        <Typography 
          variant="h6"
          fontWeight={400}
          color="secondary"
        >
          Today's Change
        </Typography>
        <Typography 
          variant="h6"
          fontWeight={700}
          color={getColor(dailyChange)}
        >
          {dailyChangePerc === "" ? dailyChange : `${dailyChange} (${dailyChangePerc})`}
        </Typography>
      </Box>
      {/* Total Change Box */}
      <Box
        display="flex"
        flexDirection="column"
        gap="2px"
      >
        <Typography 
          variant="h6"
          fontWeight={400}
          color="secondary"
        >
          Total Change
        </Typography>
        <Typography
          variant="h6"
          fontWeight={700}
          color={getColor(totalChange)}
        >
          {totalChangePerc === "" ?  totalChange : `${totalChange} (${totalChangePerc})`}
        </Typography>
      </Box>
    </Box>
  );
}

export default PortfolioValueText;