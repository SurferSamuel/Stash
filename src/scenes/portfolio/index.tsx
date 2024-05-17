import { useEffect, useState } from "react";
import { Formik } from "formik";

// Material UI
import { DataGrid, GridRowsProp, GridColDef } from '@mui/x-data-grid';
import useMediaQuery from "@mui/material/useMediaQuery";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

// Components
import { Accordion, AccordionSummary, AccordionDetails } from "../../components/accordion";
import MultiSelectInput from "../../components/multiSelect";
import SelectInput from "../../components/select";
import Header from "../../components/header";

// Types
import { Option } from "../../../electron/types";

interface PortfolioFormValues {
  user: string;
  financialStatus: Option[];
  miningStatus: Option[];
  resources: Option[];
  products: Option[];
  recommendations: Option[];
}

const Portfolio = () => {
  const isNonMobile = useMediaQuery("(min-width:800px)");

  // Dropdown Data
  const [usersList, setUsersList] = useState<Option[]>([]);
  const [financialStatusList, setFinancialStatusList] = useState<Option[]>([]);
  const [miningStatusList, setMiningStatusList] = useState<Option[]>([]);
  const [resourcesList, setResourcesList] = useState<Option[]>([]);
  const [productsList, setProductsList] = useState<Option[]>([]);
  const [recommendationList, setRecommendationList] = useState<Option[]>([]);

  // On page render, get data from API
  useEffect(() => {
    let isMounted = true;
    (async () => {
      const users = await window.electronAPI.getData("users");
      const financialStatus = await window.electronAPI.getData("financialStatus");
      const miningStatus = await window.electronAPI.getData("miningStatus");
      const resources = await window.electronAPI.getData("resources");
      const products = await window.electronAPI.getData("products");
      const recommendations = await window.electronAPI.getData("recommendations");
      if (isMounted) {
        setUsersList(users);
        setFinancialStatusList(financialStatus);
        setMiningStatusList(miningStatus);
        setResourcesList(resources);
        setProductsList(products);
        setRecommendationList(recommendations);
      }
    })();
    // Clean up
    return () => {
      isMounted = false;
    };
  }, []);

  const initialValues: PortfolioFormValues = {
    user: "",
    financialStatus: [],
    miningStatus: [],
    resources: [],
    products: [],
    recommendations: [],
  }

  return (
    <Box m="25px 30px 15px 30px">
      <Header title="Portfolio" subtitle="View and manage your current shares" />
      <Formik
        onSubmit={() => {}}
        initialValues={initialValues}
      >
        {({values, handleChange}) => (
          <Box
            display="grid"
            pb="30px"
            gap="30px"
            gridTemplateColumns="repeat(4, minmax(0, 1fr))"
          >
            {/* TODO GRAPH */}
            {/* Filter Dropdown */}
            <Accordion>
              <AccordionSummary>
                <Typography variant="h5">Filter</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box
                  display="grid"
                  gap="30px"
                  py="12px"
                  gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                  sx={{
                    "& > div": {
                      gridColumn: isNonMobile ? undefined : "span 4",
                    },
                  }}
                >
                  {/* User Input */}
                  <SelectInput
                    label="Specifc User"
                    valueName={"user"}
                    value={values.user}
                    handleChange={handleChange}
                    options={usersList}
                    span={2}
                  />
                  {/* Financial Status Input */}
                  <MultiSelectInput
                    label="Financial Status"
                    valueName="financialStatus"
                    value={values.financialStatus}
                    handleChange={handleChange}
                    options={financialStatusList}
                  />
                  {/* Mining Status Input */}
                  <MultiSelectInput
                    label="Mining Status"
                    valueName="miningStatus"
                    value={values.miningStatus}
                    handleChange={handleChange}
                    options={miningStatusList}
                  />
                  {/* Resources Input */}
                  <MultiSelectInput
                    label="Resources"
                    valueName="resources"
                    value={values.resources}
                    handleChange={handleChange}
                    options={resourcesList}
                  />
                  {/* Products Input */}
                  <MultiSelectInput
                    label="Products"
                    valueName="products"
                    value={values.products}
                    handleChange={handleChange}
                    options={productsList}
                  />
                  {/* Recommendations Input */}
                  <MultiSelectInput
                    label="Recommendations"
                    valueName="recommendations"
                    value={values.recommendations}
                    handleChange={handleChange}
                    options={recommendationList}
                  />
                </Box>
              </AccordionDetails>
            </Accordion>
            {/* TODO DATA GRID TABLE */}
          </Box>
        )}
      </Formik>
    </Box>
  )
}

export default Portfolio;