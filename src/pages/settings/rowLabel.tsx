import { FC, memo } from "react";

// Material UI
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { Skeleton } from "@mui/material";

interface LabelProps {
  title: string;
  subtitle: string;
}

const RowLabel: FC<LabelProps> = memo((props) => {
  const { title, subtitle } = props;

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
    <Box>
      <Typography variant="h6" fontWeight={400} color="primary">
        {title}
      </Typography>
      <Typography variant="h6" fontWeight={400} color="secondary">
        {subtitle === "" ? skeleton(440) : subtitle}
      </Typography>
    </Box>
  );
});

export default RowLabel;
