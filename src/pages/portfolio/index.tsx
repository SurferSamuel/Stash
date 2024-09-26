import { useEffect, useState } from "react";
import { Formik } from "formik";

// Components
import SelectInput from "../../components/select";
import PortfolioTable from "./portfolioTable";
import Graph from "../../components/graph";
import UpdateData from "./updateData";

// Material UI
import Box from "@mui/material/Box";

// Types
import { Option, PortfolioData } from "../../../electron/types";
import PortfolioValueText from "./portfolioValueText";

export interface PortfolioFormValues {
  account: Option;
  financialStatus: Option[];
  miningStatus: Option[];
  resources: Option[];
  products: Option[];
  recommendations: Option[];
}

const Portfolio = () => {
  // Dropdown data states
  const [accountsList, setAccountsList] = useState<Option[]>([]);
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

  // "All Accounts" option
  const allAccountsOption = { label: "All Accounts" };

  // A helper function. Used to sort an array by label, alphabetically.
  const byLabel = (a: { label: string }, b: { label: string }) => a.label.localeCompare(b.label);

  // On page render, get dropdown data from API
  useEffect(() => {
    let isMounted = true;
    (async () => {
      const accounts = await window.electronAPI.getData("accounts");
      const financialStatus = await window.electronAPI.getData("financialStatus");
      const miningStatus = await window.electronAPI.getData("miningStatus");
      const resources = await window.electronAPI.getData("resources");
      const products = await window.electronAPI.getData("products");
      const recommendations = await window.electronAPI.getData("recommendations");
      if (isMounted) {
        // Format accounts as options
        const newAccountsList: Option[] = accounts.map(element => ({ 
          label: element.name, 
          accountId: element.accountId
        })).sort(byLabel);

        // Add "All Accounts" option to top of list
        newAccountsList.unshift(allAccountsOption);

        // Update states
        setAccountsList(newAccountsList);
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
    account: allAccountsOption,
    financialStatus: [],
    miningStatus: [],
    resources: [],
    products: [],
    recommendations: [],
  }

  return (
    <Box m="25px 30px 15px 30px">
      <Formik
        onSubmit={() => { /* Do nothing on submit */ }}
        initialValues={initialValues}
      >
        {({ values }) => (
          <Box
            display="grid"
            pb="30px"
            gridTemplateColumns="repeat(4, minmax(0, 1fr))"
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              gridColumn="span 4"
            >
              {/* Portfolio value, today's change and total change */}
              <PortfolioValueText
                loading={loading}
                data={data.text}
              />
              {/* Account select */}
              <SelectInput
                small
                label={null}
                valueName={"account"}
                value={values.account}
                options={accountsList}
                width={220}
              />
            </Box>
            {/* Graph of portfolio value over time */}
            <Graph
              loading={loading}
              data={data.graph}
            />
            {/* Table showing current shares */}
            <PortfolioTable 
              loading={loading}
              data={data.table}
              financialStatusList={financialStatusList}
              miningStatusList={miningStatusList}
              resourcesList={resourcesList}
              productsList={productsList}
              recommendationList={recommendationList}
            />
            {/* Update data when form values change */}
            <UpdateData
              setLoading={setLoading}
              setData={setData}
            />
          </Box>
        )}
      </Formik>
    </Box>
  )
}

export default Portfolio;