import { Typography, Box } from "@mui/material";

interface Props {
  title: string;
  subtitle?: string;
}

const Header = (props: Props) => {
  return (
    <Box mb="30px">
      <Typography
        variant="h2"
        fontWeight={600}
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
