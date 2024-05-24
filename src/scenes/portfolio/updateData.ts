import { useFormikContext } from "formik";
import { scaleLinear } from "d3";
import { 
  Dispatch, 
  SetStateAction,
  useEffect, 
} from "react";

// Types
import { GraphRange, PortfolioDataPoint, PortfolioGraphData, PortfolioTableData } from "../../../electron/types";
import { PortfolioFormValues } from "./index";
import { useDrawingArea } from "@mui/x-charts";

interface Props {
  graphRange: GraphRange;
  graphData: PortfolioGraphData;
  setGraphData: Dispatch<SetStateAction<PortfolioGraphData>>;
  setTableData: Dispatch<SetStateAction<PortfolioTableData>>;
  setGraphLoading: Dispatch<SetStateAction<boolean>>;
  setTableLoading: Dispatch<SetStateAction<boolean>>;
  setGraphYAxis: Dispatch<SetStateAction<[number, number]>>;
  setGraphBottomOffset: Dispatch<SetStateAction<number>>;
}

const UpdateData = (props: Props): null => {
  const { values } = useFormikContext<PortfolioFormValues>();
  const { top, height } = useDrawingArea();
  const {
    graphRange,
    graphData,
    setGraphData, 
    setTableData,
    setGraphLoading,
    setTableLoading,
    setGraphYAxis,
    setGraphBottomOffset,
  } = props;

  // A helper function that handles when an error is received from backend API
  const handleError = (error: any) => {
    // Split message since Electron wraps the original error message with additional text.
    const splitMsg = error.message.split('Error: ');
    const msg = (splitMsg.length === 2) ? splitMsg[1] : error.message;
    console.error(msg);
  }

  // A helper function that calculates and updates the y-axis limits and 
  // bottom offset using the given data 
  const updateYAxisAndOffset = (graphData: PortfolioGraphData, graphRange: GraphRange) => {
    if (graphData === null || graphData[graphRange].length === 0) {
      setGraphYAxis([0, 0]);
      setGraphBottomOffset(1);
      return;
    }

    // Calculate y-axis limits and bottom offset using values
    const values = graphData[graphRange].map(point => point.value);
    const extremums = [Math.min(...values), Math.max(...values)];
    const range = [top + height, top];
    const tickNumber = Math.floor(Math.abs(range[1] - range[0]) / 50);

    // Use d3 to calculate a nice domain
    const niceDomain = scaleLinear(extremums, range).nice(tickNumber).domain();
    const bottomOffset = 0.9 * (niceDomain[1] - niceDomain[0]) / niceDomain[1];
    
    // Update states
    setGraphYAxis(niceDomain as [number, number]);
    setGraphBottomOffset(bottomOffset);
  }

  // Handle updating graph range
  useEffect(() => {
    updateYAxisAndOffset(graphData, graphRange);
  }, [graphRange]);

  // Handle updating graph data
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        // Show loading text on graph while waiting for request
        setGraphLoading(true);
        console.log("before");
        const graphData = await window.electronAPI.getPortfolioGraphData(values);
        console.log("after");
        if (isMounted) {
          updateYAxisAndOffset(graphData, graphRange);
          setGraphData(graphData);
          setGraphLoading(false);
        }
      } catch (error) {
        handleError(error);
      }
    })();
    // Clean up
    return () => { isMounted = false };
  }, [values]);


  // Update table and text data
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        // Show loading icon on table while waiting for request
        setTableLoading(true);
        const tableData = await window.electronAPI.getPortfolioTableData(values);
        if (isMounted) {
          setTableData(tableData);
          setTableLoading(false);
          // Also show the skipped companies (if any)
          if (tableData.skipped.length !== 0) {
            console.warn(`WARNING: Skipped ${tableData.skipped}`);
          }
        }
      } catch (error) {
        handleError(error);
      }
    })();
    // Clean up
    return () => { isMounted = false };
  }, [values]);

  return null;
}

export default UpdateData;
