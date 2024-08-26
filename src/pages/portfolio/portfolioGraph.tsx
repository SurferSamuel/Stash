import { tokens } from "../../theme";
import dayjs from "dayjs";

// Material UI
import { AxisValueFormatterContext } from "@mui/x-charts/models/axis";
import { useDrawingArea, useYScale } from '@mui/x-charts';
import useTheme from "@mui/material/styles/useTheme";
import { LineChart } from '@mui/x-charts/LineChart';
import { styled } from '@mui/material/styles';
import Box from "@mui/material/Box";

// Types
import { GraphRange, PortfolioGraphData } from "../../../electron/types";

interface Props {
  loading: boolean;
  yAxis: [number, number];
  bottomOffset: number;
  range: GraphRange;
  data: PortfolioGraphData;
}

const PortfolioGraph = (props: Props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const {
    loading,
    yAxis,
    bottomOffset,
    range,
    data,
  } = props;

  // Currency formatter helper function
  // Note use USD format "$" instead of AUD format "A$"
  const currencyFormat = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format;

  const xAxisValueFormatter = (id: number, context: AxisValueFormatterContext) => {
    // If data point could not be found (eg. if id was invalid)
    const dataPoint = data[range].find(entry => entry.id === id);
    if (dataPoint === undefined) return "";

    // Convert date to dayjs
    const date = dayjs(dataPoint.date);

    // Format for tick (on x-axis)
    if (context.location === "tick") {
      return date.format("DD MMM");
    }

    // Format for hover (window on mouse hover)
    if (dayjs().subtract(range, "month").year() != dayjs().year()) {
      return date.format("D MMM YYYY");
    } else {
      return date.format("ddd, D MMM")
    }
  }

  // Determines whether the x-axis tick should be displayed
  const xAxisTickInterval = (value: number, index: number) => {
    const frequency = Math.floor(data[range].length / 7);
    const offset = Math.ceil((frequency - (data[range].length % frequency)) / 2);
    return index % frequency === Math.max(frequency - offset, 0);
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
    <Box gridColumn="span 4" m="-42px -5px 0px 0px">
      <LineChart
        skipAnimation={true}
        loading={loading}
        margin={{ right: 5 }}
        xAxis={[
          {
            dataKey: "id",
            valueFormatter: xAxisValueFormatter,
            scaleType: 'point',
            tickInterval: xAxisTickInterval,
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
            color: colors.blueAccent[600],
            valueFormatter: currencyFormat,
            area: true,
          }
        ]}
        dataset={data !== null ? data[range] : []}
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
            <stop offset={0} stopColor={colors.blueAccent[600]} stopOpacity={0.2} />
            <stop offset={bottomOffset} stopColor={colors.blueAccent[600]} stopOpacity={0} />
          </linearGradient>
        </defs>
      </LineChart>
    </Box>
  )
}

export default PortfolioGraph;
