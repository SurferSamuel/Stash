import { useFormikContext } from "formik";
import { 
  Dispatch, 
  SetStateAction,
  useEffect, 
} from "react";

// Types
import { PortfolioGraphData, PortfolioTableData } from "../../../electron/types";
import { PortfolioFormValues } from "./index";

interface Props {
  setGraphData: Dispatch<SetStateAction<PortfolioGraphData>>;
  setTableData: Dispatch<SetStateAction<PortfolioTableData>>;
  setGraphLoading: Dispatch<SetStateAction<boolean>>;
  setTableLoading: Dispatch<SetStateAction<boolean>>;
}

const UpdateData = (props: Props): null => {
  const { values } = useFormikContext<PortfolioFormValues>();
  const { 
    setGraphData, 
    setTableData,
    setGraphLoading,
    setTableLoading,
  } = props;

  // A helper function that handles when an error is received from backend API
  const handleError = (error: any) => {
    // Split message since Electron wraps the original error message with additional text.
    const splitMsg = error.message.split('Error: ');
    const msg = (splitMsg.length === 2) ? splitMsg[1] : error.message;
    console.error(msg);
  }

  // Update Graph data
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        // Show loading icon on table while waiting for request
        setGraphLoading(true);
        const graphData = await window.electronAPI.getPortfolioGraphData(values);
        if (isMounted) {
          setGraphData(graphData);
        }
        setGraphLoading(false);
      } catch (error) {
        handleError(error);
      }
    })();
    // Clean up
    return () => { isMounted = false };
  }, [values]);


  // Update Table and Text data
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        // Show loading icon on table while waiting for request
        setTableLoading(true);
        const tableData = await window.electronAPI.getPortfolioTableData(values);
        if (isMounted) {
          setTableData(tableData);
          // Also show the skipped companies (if any)
          if (tableData.skipped.length !== 0) {
            console.warn(`WARNING: Skipped ${tableData.skipped}`);
          }
        }
        setTableLoading(false);
      } catch (error) {
        handleError(error);
      }
    })();
    // Clean up
    return () => { isMounted = false };
  }, 
  // Don't trigger useEffect when values.graphRange is updated
  [
    values.user,
    values.financialStatus,
    values.miningStatus,
    values.resources,
    values.products,
    values.recommendations
  ]);

  return null;
}

export default UpdateData;
