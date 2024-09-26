import { useEffect, useState } from "react";
import { tokens } from "../theme";
import { scaleLinear } from "d3";
import dayjs from "dayjs";

// Material UI
import { AxisValueFormatterContext } from "@mui/x-charts/models/axis";
import { useDrawingArea, useYScale } from "@mui/x-charts/hooks";
import useTheme from "@mui/material/styles/useTheme";
import ButtonGroup from "@mui/material/ButtonGroup";
import { styled } from "@mui/material/styles";
import { LineChart } from "@mui/x-charts";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

// Types
import { GraphDataPoint, GraphRange } from "../../electron/types";

interface Props {
  loading: boolean;
  data: Record<GraphRange, GraphDataPoint[]>;
}

const Graph = (props: Props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const {
    loading,
    data,
  } = props;

  // Graph range state
  const [range, setRange] = useState<GraphRange>(6);
  const rangeValues: GraphRange[] = [1, 3, 6, 12, 60];
  
  // Set width of rect manually
  // Fixes an issue where lines are not rendered when window is resized larger
  const [rectWidth, setRectWidth] = useState<number>(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setRectWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    // Clean up
    return () => window.removeEventListener("resize", handleResize);  
  }, []);
  
  // Set yAxis limits and bottom offset manually
  // Fixes an issue where setting { area: true } property of graph defaults 
  // the yAxis bottom limit to 0.
  const { top, height } = useDrawingArea();
  const [dataset, setDataset] = useState<GraphDataPoint[]>([]);
  const [yAxis, setYAxis] = useState<[number, number]>([null, null]);
  const [bottomOffset, setBottomOffset] = useState<number>(1);
  useEffect(() => {
    // If no data for the range
    if (data[range].length === 0) {
      setYAxis([null, null]);
      setBottomOffset(1);
      setDataset([]);
      return;
    }

    // Find extremum values in data
    const values = data[range].map(point => point.value);
    const extremums = [Math.min(...values), Math.max(...values)];

    // Calculate number to ticks to display
    const drawAreaRange = [top + height, top];
    const tickNumber = Math.floor(Math.abs(drawAreaRange[1] - drawAreaRange[0]) / 50);

    // Use d3 to calculate a nice domain
    const niceDomain = scaleLinear(extremums, drawAreaRange).nice(tickNumber).domain();
    const bottomOffset = 0.9 * (niceDomain[1] - niceDomain[0]) / niceDomain[1];
    
    // Update states
    setBottomOffset(bottomOffset);
    setYAxis(niceDomain as [number, number]);
    setDataset(data[range]);
  }, [data, range]);

  /**
   * Currency formatter helper function.
   * Note use USD format "$" instead of AUD format "A$"
   */
  const currencyFormat = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format;

  /**
   * Formats the values for the x-axis (ie. dates).
   */
  const xAxisValueFormatter = (id: number, context: AxisValueFormatterContext) => {
    // If data point could not be found (eg. if id was invalid)
    const dataPoint = data[range].find(entry => entry.id === id);
    if (dataPoint === undefined) return null;

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

  /**
   * Determines whether the x-axis tick should be displayed.
   */
  const xAxisTickInterval = (value: number, index: number) => {
    const frequency = Math.floor(data[range].length / 7);
    const offset = Math.ceil((frequency - (data[range].length % frequency)) / 2);
    return index % frequency === Math.max(frequency - offset, 0);
  }

   /**
   * Formats the values for the y-axis (ie. prices).
   */
  const yAxisValueFormatter = (value: number) => {
    // Compact to "245K" or "1.2M" etc.
    if (value < 1e3) return `${value}`;
    if (value < 1e6) return `${value / 1e3}K`;
    if (value < 1e9) return `${value / 1e6}M`;
    return `${value / 1e9}B`;
  }

  /**
   * Custom style for overlay text.
   */
  const OverlayText = styled('text')(({ theme }) => ({
    transform: 'translateX(-28px)',
    fill: theme.palette.text.primary,
    fontFamily: theme.typography.fontFamily,
    fontSize: 15,
    textAnchor: 'middle',
    dominantBaseline: 'middle',
  }));

  /**
   * Creates a centered overlay component with the provided text.
   * @param text Text to display
   * @returns Overlay component
   */
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

  /**
   * A helper function that maps a value to is respective label.
   * @param value Graph range value
   * @returns Label of the value
   */
  const valueToLabel = (value: GraphRange) => {
    switch (value) {
      case 1: return "1M";
      case 3: return "3M";
      case 6: return "6M";
      case 12: return "1Y";
      case 60: return "5Y";
    }
  }

  return (
    <Box
      gridColumn="span 4"
      display="flex"
      flexDirection="column"
      mx="-5px"
    >
      {/* Graph range button container */}
      <Box
        display="flex"
        flexDirection="row-reverse"
        gridColumn="span 4"
        height="33px"
        mb="-40px"
      >
        {data[range].length !== 0 && <ButtonGroup>
          {rangeValues.map(value => {
            return (
              <Button
                disableRipple
                variant="text"
                onClick={() => setRange(value)}
                sx={{ 
                  color: range === value ? "white" : colors.blueAccent[600],
                  zIndex: 1,
                  '&:hover': {
                    backgroundColor: 'transparent',
                  },
                }}
              >
                {valueToLabel(value)}
              </Button>
            )
          })}
        </ButtonGroup>}
      </Box>
      <LineChart
        height={400}
        loading={loading}
        dataset={dataset}
        skipAnimation={true}
        margin={{ right: 5 }}
        grid={{ horizontal: true }}
        tooltip={{ trigger: data[range].length === 0 ? "none" : "axis" }}
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
        slots={{ 
          noDataOverlay: Overlay("No data to display"),
          loadingOverlay: Overlay("Loading data..."),
        }}
        sx={{
          '& rect': {
            width: rectWidth,
          },
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
            <stop offset={0} stopColor={colors.blueAccent[600]} stopOpacity={0.25} />
            <stop offset={bottomOffset} stopColor={colors.blueAccent[600]} stopOpacity={0} />
          </linearGradient>
        </defs>
      </LineChart>
    </Box>
  )
}

export default Graph;
