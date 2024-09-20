import { useEffect, useState } from "react";
import { Formik } from "formik";

// Page Components
import PortfolioTable from "./portfolioTable";
import Graph from "../../components/graph";
import UpdateData from "./updateData";

// Material UI
import Box from "@mui/material/Box";

// Types
import { Option, PortfolioData } from "../../../electron/types";
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
  // Dropdown data states
  const [usersList, setUsersList] = useState<Option[]>([]);
  const [financialStatusList, setFinancialStatusList] = useState<Option[]>([]);
  const [miningStatusList, setMiningStatusList] = useState<Option[]>([]);
  const [resourcesList, setResourcesList] = useState<Option[]>([]);
  const [productsList, setProductsList] = useState<Option[]>([]);
  const [recommendationList, setRecommendationList] = useState<Option[]>([]);

  // Portfolio data states
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<PortfolioData>({
    graph: { 1: [], 3: [], 6: [], 12: [], 60: [] },
    table: [],
    text: {
      totalValue: "",
      dailyChange: "",
      dailyChangePerc: "",
      totalChange: "",
      totalChangePerc: "",
    }
  });

  
  // On page render, get dropdown data from API
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
          // Do nothing on submit
        }}
        initialValues={initialValues}
      >
        <Box
          display="grid"
          pb="30px"
          gridTemplateColumns="repeat(4, minmax(0, 1fr))"
        >
          {/* Update data when form values change */}
          <UpdateData
            setLoading={setLoading}
            setData={setData}
          />
          {/* Portfolio value, today's change and total change */}
          <PortfolioValueText
            loading={loading}
            data={data.text}
          />
          {/* Graph of portfolio value over time */}
          <Graph
            loading={loading}
            data={data.graph}
          />
          {/* Table showing current shares */}
          <PortfolioTable 
            loading={loading}
            data={data.table}
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