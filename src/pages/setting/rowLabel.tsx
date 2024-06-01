import { memo } from "react";
import { tokens } from "../../theme";

// Material UI
import useTheme from "@mui/material/styles/useTheme";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

interface LabelProps {
  title: string;
  subtitle: string;
}

const RowLabel: React.FC<LabelProps> = memo((props) => {
  const { title, subtitle } = props;
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <Box>
      <Typography variant="h6" fontWeight={400}>
        {title}
      </Typography>
      <Typography variant="h6" fontWeight={400} color={colors.grey[300]}>
        {subtitle}
      </Typography>
    </Box>
  );
});

export default RowLabel;
