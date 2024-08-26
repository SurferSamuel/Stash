import { memo } from "react";

// Material UI
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

interface LabelProps {
  title: string;
  subtitle: string;
}

const RowLabel: React.FC<LabelProps> = memo((props) => {
  const { title, subtitle } = props;
  return (
    <Box>
      <Typography variant="h6" fontWeight={400} color="primary">
        {title}
      </Typography>
      <Typography variant="h6" fontWeight={400} color="secondary">
        {subtitle}
      </Typography>
    </Box>
  );
});

export default RowLabel;
