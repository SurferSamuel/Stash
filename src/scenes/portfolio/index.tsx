import { useEffect, useState } from "react";
import { Formik } from "formik";

// Page Components
import GraphRangeButton from "./graphRangeButton";
import PortfolioTable from "./portfolioTable";
import PortfolioGraph from "./portfolioGraph";
import UpdateData from "./updateData";

// Material UI
import useMediaQuery from "@mui/material/useMediaQuery";
import ButtonGroup from "@mui/material/ButtonGroup";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

// Components
import { Accordion, AccordionSummary, AccordionDetails } from "../../components/accordion";
import MultiSelectInput from "../../components/multiSelect";

// Types
import { Option, PortfolioDataPoint, PortfolioGraphData, PortfolioTableData, PortfolioTableRow } from "../../../electron/types";
import { RangeValue } from "./graphRangeButton";
import PortfolioValueText from "./portfolioValueText";

export interface PortfolioFormValues {
  user: Option[];
  financialStatus: Option[];
  miningStatus: Option[];
  resources: Option[];
  products: Option[];
  recommendations: Option[];
  graphRange: RangeValue;
}

const Portfolio = () => {
  const isNonMobile = useMediaQuery("(min-width:800px)");

  // Dropdown data
  const [usersList, setUsersList] = useState<Option[]>([]);
  const [financialStatusList, setFinancialStatusList] = useState<Option[]>([]);
  const [miningStatusList, setMiningStatusList] = useState<Option[]>([]);
  const [resourcesList, setResourcesList] = useState<Option[]>([]);
  const [productsList, setProductsList] = useState<Option[]>([]);
  const [recommendationList, setRecommendationList] = useState<Option[]>([]);

  // Data for graph component
  const [graphLoading, setGraphLoading] = useState<boolean>(false);
  const [graphData, setGraphData] = useState<PortfolioGraphData>({
    minYAxis: 0,
    maxYAxis: 0,
    bottomOffset: 1,
    dataPoints: [],
  });

  // Data for table (and value text) component
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [tableData, setTableData] = useState<PortfolioTableData>({
    totalValue: "Loading",
    dailyChange: "Loading",
    dailyChangePerc: "",
    totalChange: "Loading",
    totalChangePerc: "",
    rows: [],
    skipped: [],
  });
  
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
    return () => { isMounted = false };
  }, []);

  // Formik initial values
  const initialValues: PortfolioFormValues = {
    user: [],
    financialStatus: [],
    miningStatus: [],
    resources: [],
    products: [],
    recommendations: [],
    graphRange: "1M",
  }

  return (
    <Box m="25px 30px 15px 30px">
      <Formik
        onSubmit={() => {}}
        initialValues={initialValues}
      >
        {({values, handleChange}) => (
          <Box
            display="grid"
            pb="30px"
            gridTemplateColumns="repeat(4, minmax(0, 1fr))"
          >
            {/* Update data when filter values change */}
            <UpdateData
              setGraphData={setGraphData}
              setTableData={setTableData}
              setGraphLoading={setGraphLoading}
              setTableLoading={setTableLoading}
            />
            {/* Portfolio Value Box */}
            <PortfolioValueText
              totalValue={tableData.totalValue}
              dailyChange={tableData.dailyChange}
              dailyChangePerc={tableData.dailyChangePerc}
              totalChange={tableData.totalChange}
              totalChangePerc={tableData.totalChangePerc}
            />
            <Box
              display="flex"
              flexDirection="row-reverse"
              gridColumn="span 4"
              height="33px"
              mt="-5px"
            >
              {/* Graph Range Button Group */}
              {graphData.dataPoints.length !== 0 && <ButtonGroup color="secondary">
                <GraphRangeButton handleChange={handleChange} value="1M" />
                <GraphRangeButton handleChange={handleChange} value="3M" />
                <GraphRangeButton handleChange={handleChange} value="6M" />
                <GraphRangeButton handleChange={handleChange} value="1Y" />
                <GraphRangeButton handleChange={handleChange} value="5Y" />
              </ButtonGroup>}
            </Box>
            {/* Graph showing portfolio value */}
            <PortfolioGraph
              loading={graphLoading}
              minYAxis={graphData.minYAxis}
              maxYAxis={graphData.maxYAxis}
              bottomOffset={graphData.bottomOffset}
              dataPoints={graphData.dataPoints}
            />
            {/* Filter Dropdown */}
            <Box mt="-10px" gridColumn="span 4">
              <Accordion>
                <AccordionSummary>
                  <Typography variant="h5">Filter Options</Typography>
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
                    <MultiSelectInput
                      label="Specifc User(s)"
                      valueName={"user"}
                      value={values.user}
                      handleChange={handleChange}
                      options={usersList}
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
            </Box>
            {/* Table showing current shares */}
            <PortfolioTable 
              loading={tableLoading}
              rows={tableData.rows}
            />
          </Box>
        )}
      </Formik>
    </Box>
  )
}

export default Portfolio;