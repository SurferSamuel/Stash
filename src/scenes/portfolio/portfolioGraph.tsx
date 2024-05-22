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

interface Props {
  loading: boolean;
  yAxis: [number, number];
  bottomOffset: number;
  dataPoints: PortfolioDataPoint[];
}

const PortfolioGraph = (props: Props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const {
    loading,
    yAxis,
    bottomOffset,
    dataPoints,
  } = props;

  // Currency formatter helper function
  // Note use USD format "$" instead of AUD format "A$"
  const currencyFormat = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format;

  const xAxisValueFormatter = (id: number, context: AxisValueFormatterContext) => {
    // If data could not be found (eg. if id was invalid)
    const data = dataPoints.find(entry => entry.id === id);
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

  const OverlayText = styled('text')(({ theme }) => ({
    transform: 'translateX(-28px)',
    fontSize: 14,
    fill: theme.palette.text.primary,
    shapeRendering: 'crispEdges',
    textAnchor: 'middle',
    dominantBaseline: 'middle',
  }));

  const Overlay = (text: string) => () => {
    const yScale = useYScale();
    const { left, width, height } = useDrawingArea();
    const top = yScale.range()[1];
    return (
      <g>
        <OverlayText x={left + width / 2} y={top + height / 2}>
          {text}
        </OverlayText>
      </g>
    );
  }

  return (
    <Box gridColumn="span 4" m="-42px -5px 0px 10px">
      <LineChart
        skipAnimation={true}
        loading={loading}
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
            min: yAxis[0],
            max: yAxis[1],
          }
        ]}
        series={[
          {
            dataKey: "value",
            curve: "linear",
            showMark: false,
            color: colors.blueAccent[400],
            valueFormatter: currencyFormat,
            area: true,
          }
        ]}
        dataset={dataPoints ? dataPoints : []}
        height={400}
        grid={{ horizontal: true }}
        slots={{ 
          noDataOverlay: Overlay("No data to display"),
          loadingOverlay: Overlay("Loading data..."),
        }}
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
          '& .MuiAreaElement-root': {
            fill: "url('#areaGradient')",
          },
        }}
      >
        <defs>
          <linearGradient id="areaGradient" gradientTransform="rotate(90)">
            <stop offset={0} stopColor={colors.blueAccent[400]} stopOpacity={0.2} />
            <stop offset={bottomOffset} stopColor={colors.blueAccent[400]} stopOpacity={0} />
          </linearGradient>
        </defs>
      </LineChart>
    </Box>
  )
}

export default PortfolioGraph;
