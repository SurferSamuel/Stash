import { Typography, Box, useTheme } from "@mui/material";
import { tokens } from "../theme";

interface Props {
  title: string;
  subtitle?: string;
}

const Header = (props: Props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box mb="30px">
      <Typography
        variant="h2"
        fontWeight={500}
        color="primary"
        sx={{
          mb: "5px",
        }}
      >
        {props.title}
      </Typography>
      <Typography variant="h5" color="secondary">
        {props.subtitle}
      </Typography>
    </Box>
  );
};

export default Header;
