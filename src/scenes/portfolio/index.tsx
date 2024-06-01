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
import { GraphRange, Option, PortfolioGraphData, PortfolioTableData } from "../../../electron/types";
import PortfolioValueText from "./portfolioValueText";

export interface PortfolioFormValues {
  user: Option[];
  financialStatus: Option[];
  miningStatus: Option[];
  resources: Option[];
  products: Option[];
  recommendations: Option[];
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
  const [graphYAxis, setGraphYAxis] = useState<[number, number]>([0, 0]);
  const [graphBottomOffset, setGraphBottomOffset] = useState<number>(1);
  const [graphRange, setGraphRange] = useState<GraphRange>(1);
  const [graphData, setGraphData] = useState<PortfolioGraphData>({
    1: [],
    3: [],
    6: [],
    12: [],
    60: [],
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
  }

  return (
    <Box m="25px 30px 15px 30px">
      <Formik
        onSubmit={() => {
          // Do nothing on submit...
        }}
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
              graphRange={graphRange}
              graphData={graphData}
              setGraphData={setGraphData}
              setTableData={setTableData}
              setGraphLoading={setGraphLoading}
              setTableLoading={setTableLoading}
              setGraphYAxis={setGraphYAxis}
              setGraphBottomOffset={setGraphBottomOffset}
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
              {graphData !== null && <ButtonGroup color="secondary">
                <GraphRangeButton label="1M" range={graphRange} setRange={setGraphRange} />
                <GraphRangeButton label="3M" range={graphRange} setRange={setGraphRange}/>
                <GraphRangeButton label="6M" range={graphRange} setRange={setGraphRange}/>
                <GraphRangeButton label="1Y" range={graphRange} setRange={setGraphRange}/>
                <GraphRangeButton label="5Y" range={graphRange} setRange={setGraphRange}/>
              </ButtonGroup>}
            </Box>
            {/* Graph showing portfolio value */}
            <PortfolioGraph
              loading={graphLoading}
              yAxis={graphYAxis}
              bottomOffset={graphBottomOffset}
              range={graphRange}
              data={graphData}
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