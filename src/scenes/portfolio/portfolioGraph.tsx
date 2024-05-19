import { PortfolioFormValues } from "./index";
import { useEffect, useState } from "react";
import { useFormikContext } from "formik";
import { tokens } from "../../theme";

// Material UI
import { AxisValueFormatterContext } from "@mui/x-charts/models/axis";
import { useDrawingArea, useYScale } from '@mui/x-charts/hooks';
import useTheme from "@mui/material/styles/useTheme";
import { LineChart } from '@mui/x-charts/LineChart';
import { styled } from '@mui/material/styles';
import Box from "@mui/material/Box";

// Types
import { PortfolioDataPoint } from "../../../electron/types";

const PortfolioGraph = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { values } = useFormikContext<PortfolioFormValues>();
  const [dataset, setDataset] = useState<PortfolioDataPoint[]>([]);

  // Update dataset when values is modified
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const data = await window.electronAPI.getPortfolioGraphData(values);
        if (isMounted) setDataset(data);
      } catch (error) {
        // Split message since Electron wraps the original error message with additional text.
        const splitMsg = error.message.split('Error: ');
        const msg = (splitMsg.length === 2) ? splitMsg[1] : error.message;
        console.error(msg);
      }
    })();
    // Clean up
    return () => { isMounted = false };
  }, [values]);

  // Currency formatter helper function
  // Note use USD format "$" instead of AUD format "A$"
  const currencyFormat = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format;

  const xAxisValueFormatter = (id: number, context: AxisValueFormatterContext) => {
    // If data could not be found (eg. if id was invalid)
    const data = dataset.find(entry => entry.id === id);
    if (data === undefined) return "";

    // Format for tick (ticks on axis)
    if (context.location === "tick") {
      // Only show every 3rd tick
      if (id % 3 !== 0) return "";

      // Format date, eg. "Apr 30"
      return data.date.toLocaleString("en-US", { month: "short", day: "numeric" });
    }

    // Format for hover (window on mouse hover)
    // Format date, eg. "Tue, Apr 30"
    return data.date.toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric" });
  }

  const yAxisValueFormatter = (value: number) => {
    // Compact to "245K" or "1.2M" etc.
    if (value < 1000) return `${value}`;
    if (value < 1000000) return `${value / 1000}K`;
    if (value < 1000000000) return `${value / 1000000}M`;
    return `${value / 1000000000}B`;
  }

  const NoDataText = styled('text')(({ theme }) => ({
    transform: 'translateX(-28px)',
    fontSize: 14,
    fill: theme.palette.text.primary,
    shapeRendering: 'crispEdges',
    textAnchor: 'middle',
    dominantBaseline: 'middle',
  }));

  const NoDataOverlay = () => {
    const yScale = useYScale();
    const { left, width, height } = useDrawingArea();
    const [bottom, top] = yScale.range();
    return (
      <g>
        <NoDataText x={left + width / 2} y={top + height / 2}>
          No data to display
        </NoDataText>
      </g>
    );
  }

  return (
    <Box gridColumn="span 4" m="-30px -5px -30px 10px">
      <LineChart
        margin={{ left: 50, right: 5 }}
        xAxis={[
          {
            dataKey: "id",
            valueFormatter: xAxisValueFormatter,
            scaleType: 'point',
          }
        ]}
        yAxis={[
          {
            valueFormatter: yAxisValueFormatter,
          }
        ]}
        series={[
          {
            dataKey: "value",
            curve: "linear",
            showMark: false,
            color: colors.blueAccent[400],
            valueFormatter: currencyFormat,
          }
        ]}
        dataset={dataset}
        height={400}
        grid={{ horizontal: true }}
        slots={{ noDataOverlay: NoDataOverlay }}
        sx={{
          '& .MuiChartsAxis-directionY .MuiChartsAxis-tick': {
            stroke: "none",
          },
          '& .MuiChartsAxis-directionY .MuiChartsAxis-line': {
            stroke: "none",
          },
          '& .MuiChartsAxis-directionX .MuiChartsAxis-tick': {
            stroke: "none",
          },
          '& .MuiChartsAxis-directionX .MuiChartsAxis-line': {
            stroke: "none",
          },
          '& .MuiChartsAxis-directionY .MuiChartsAxis-tickLabel': {
            fill: "#ffffff6f",
          },
          '& .MuiChartsAxis-directionX .MuiChartsAxis-tickLabel': {
            fill: "#ffffff6f",
          },
        }}
      />
    </Box>
  )
}

export default PortfolioGraph;
