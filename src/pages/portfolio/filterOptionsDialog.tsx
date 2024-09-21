import { useFormikContext } from "formik";

// Material UI
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

// Components
import MultiSelectInput from "../../components/multiSelect";

// Types
import { Option } from "../../../electron/types";
import { PortfolioFormValues } from "./index";

interface Props {
  open: boolean;
  handleClose: () => void;
  financialStatusList: Option[];
  miningStatusList: Option[];
  resourcesList: Option[];
  productsList: Option[];
  recommendationList: Option[];
}

const FilterOptionsDialog = (props: Props) => {
  const { values, setValues } = useFormikContext<PortfolioFormValues>();
  const {
    open,
    handleClose,
    financialStatusList,
    miningStatusList,
    resourcesList,
    productsList,
    recommendationList,  
  } = props;
  
  const handleReset = () => {
    // Skip if values are already all empty
    const alreadyEmpty = (
      values.financialStatus.length === 0 &&
      values.miningStatus.length === 0 &&
      values.resources.length === 0 &&
      values.products.length === 0 &&
      values.recommendations.length === 0
    );
    if (alreadyEmpty) return;

    // Otherwise, set all values to empty (except for account)
    setValues({
      account: values.account,
      financialStatus: [],
      miningStatus: [],
      resources: [],
      products: [],
      recommendations: [],
    });
  }

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      open={open}
      onClose={handleClose}
    >
      <DialogTitle variant="h4" fontWeight={500}>
        Filter Options
      </DialogTitle>
      <DialogContent>
        <DialogContentText fontSize="14px">
          Select options to filter your portfolio
        </DialogContentText>
        <Box
          display="grid"
          gap="30px"
          pt="25px"
          gridTemplateColumns="repeat(4, minmax(0, 1fr))"
          sx={{
            "& > div": {
              gridColumn: "span 2",
            },
          }}
        >
          {/* Financial Status Input */}
          <MultiSelectInput
            label="Financial Status"
            valueName="financialStatus"
            value={values.financialStatus}
            options={financialStatusList}
          />
          {/* Mining Status Input */}
          <MultiSelectInput
            label="Mining Status"
            valueName="miningStatus"
            value={values.miningStatus}
            options={miningStatusList}
          />
          {/* Resources Input */}
          <MultiSelectInput
            label="Resources"
            valueName="resources"
            value={values.resources}
            options={resourcesList}
          />
          {/* Products Input */}
          <MultiSelectInput
            label="Products"
            valueName="products"
            value={values.products}
            options={productsList}
          />
          {/* Recommendations Input */}
          <MultiSelectInput
            label="Recommendations"
            valueName="recommendations"
            value={values.recommendations}
            options={recommendationList}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ mt: "-60px" }}>
        <Button
          variant="outlined"
          onClick={handleReset}
        >
          Reset
        </Button>
        <Button
          variant="contained"
          onClick={handleClose}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default FilterOptionsDialog;