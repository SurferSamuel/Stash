import { useEffect, useState } from "react";
import { Formik } from "formik";

// Page Components
import GraphRangeButton from "./graphRangeButton";
import PortfolioTable from "./portfolioTable";
import PortfolioGraph from "./portfolioGraph";
import UpdateData from "./updateData";

// Material UI
import ButtonGroup from "@mui/material/ButtonGroup";
import Box from "@mui/material/Box";

// Types
import { GraphRange, Option, PortfolioGraphData, PortfolioTableData } from "../../../electron/types";
import PortfolioValueText, { loadingText } from "./portfolioValueText";

export interface PortfolioFormValues {
  user: Option[];
  financialStatus: Option[];
  miningStatus: Option[];
  resources: Option[];
  products: Option[];
  recommendations: Option[];
}

const Portfolio = () => {
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
    totalValue: loadingText,
    dailyChange: loadingText,
    dailyChangePerc: "",
    totalChange: loadingText,
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
            {graphData !== null && <ButtonGroup>
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
          {/* Table showing current shares */}
          <PortfolioTable 
            loading={tableLoading}
            rows={tableData.rows}
            usersList={usersList}
            financialStatusList={financialStatusList}
            miningStatusList={miningStatusList}
            resourcesList={resourcesList}
            productsList={productsList}
            recommendationList={recommendationList}
          />
        </Box>
      </Formik>
    </Box>
  )
}

export default Portfolio;