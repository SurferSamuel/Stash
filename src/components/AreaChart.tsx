import { AreaSeries, createChart, IChartApi, ISeriesApi } from 'lightweight-charts';
import { useEffect, useRef } from 'react';
import dayjs from 'dayjs';

import ButtonGroup from '@mui/material/ButtonGroup';
import { useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

import {
  ChartDataPoint,
  ChartRange,
  chartRangeDisplay,
  chartRanges,
} from '@types';
import { Box, Typography } from '@mui/material';
import { numberFormat } from '@utils';

interface ChartProps {
  data: ChartDataPoint[] | undefined;
  currency: string | undefined;
  defaultRange: ChartRange;
  loading: boolean;
}

const Chart = ({ data = [], currency = 'AUD', defaultRange, loading }: ChartProps) => {
  const { palette } = useTheme();

  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const areaSeriesRef = useRef<ISeriesApi<'Area'> | null>(null);

  const tooltipBoxRef = useRef<HTMLDivElement | null>(null);
  const tooltipPriceRef = useRef<HTMLSpanElement | null>(null);
  const tooltipTimeRef = useRef<HTMLSpanElement | null>(null);

  const currencyRef = useRef(currency);

  const setChartRange = (range: ChartRange) => {
    if (!chartRef.current || data.length === 0) return;
    chartRef.current.timeScale().setVisibleLogicalRange({
      from: data.findIndex((point) => !dayjs().subtract(range, 'month').isAfter(point.time)),
      to: data.length - 1.5,
    });
    chartRef.current.priceScale('left').applyOptions({ autoScale: true });
  };

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      height: 350,
      layout: {
        background: { color: 'transparent' },
        fontFamily: 'Geist-Variable',
        textColor: palette.primary.main,
      },
      timeScale: {
        borderVisible: false,
      },
      rightPriceScale: {
        visible: false,
        borderVisible: false,
      },
      leftPriceScale: {
        visible: true,
        borderVisible: false,
      },
      crosshair: {
        horzLine: {
          visible: false,
          labelVisible: false,
        },
        vertLine: {
          visible: true,
          style: 3,
          labelVisible: false,
        },
      },
      handleScale: {
        mouseWheel: false,
      },
    });

    const areaSeries = chart.addSeries(AreaSeries, {
      priceLineVisible: false,
      lastValueVisible: false,
    });

    areaSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.1,
        bottom: 0.093,
      },
    });

    chartRef.current = chart;
    areaSeriesRef.current = areaSeries;

    chart.subscribeCrosshairMove((param) => {
      if (!tooltipBoxRef.current || !tooltipPriceRef.current || !tooltipTimeRef.current) {
        return;
      }

      if (!param.time || !param.point) {
        tooltipBoxRef.current.style.display = 'none';
        tooltipPriceRef.current.textContent = '';
        tooltipTimeRef.current.textContent = '';
        return;
      }

      const dataPoint = param.seriesData.get(areaSeries) as ChartDataPoint;
      if (dataPoint !== undefined) {
        tooltipPriceRef.current.textContent = numberFormat('currency', dataPoint.value, { currency: currencyRef.current });
        tooltipTimeRef.current.textContent = dayjs(dataPoint.time).format('MMM D, YYYY');

        const gap = { x: 16, y: 2 };

        let left = param.point.x as number;
        const timeScaleWidth = chart.timeScale().width();
        const priceScaleWidth = chart.priceScale('left').width();
        left += priceScaleWidth + gap.x;
        if (left > priceScaleWidth + timeScaleWidth - tooltipBoxRef.current.clientWidth) {
          left -= 2 * gap.x + tooltipBoxRef.current.clientWidth;
        }

        let top = param.point.y as number;
        top -= gap.y;

        tooltipBoxRef.current.style.display = 'block';
        tooltipBoxRef.current.style.left = `${left}px`;
        tooltipBoxRef.current.style.top = `${top}px`;
      }
    });

    const resizeObserver = new ResizeObserver(() => {
      if (!chartContainerRef.current) return;
      chart.applyOptions({ width: chartContainerRef.current!.clientWidth });
    });
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (!areaSeriesRef.current || data.length === 0) return;

    // Set default chart range on first load
    if (areaSeriesRef.current.data().length === 0) {
      setChartRange(defaultRange);
    }

    areaSeriesRef.current.setData(data);
  }, [data]);

  useEffect(() => {
    if (!chartRef.current || !areaSeriesRef.current) return;

    chartRef.current.applyOptions({
      layout: {
        textColor: palette.primary.main,
      },
      grid: {
        horzLines: { color: palette.grey[700] },
        vertLines: { visible: false },
      },
      crosshair: {
        vertLine: {
          color: palette.grey[400],
        },
      },
    });

    areaSeriesRef.current.applyOptions({
      lineColor: palette.blueAccent[600],
      topColor: palette.blueAccent[600] + '77',
      bottomColor: palette.blueAccent[600] + '00',
    });
  }, [palette]);

  useEffect(() => {
    if (!chartRef.current || !currencyRef.current) return;

    chartRef.current.applyOptions({
      localization: {
        priceFormatter: Intl.NumberFormat('en-AU', {
          style: 'currency',
          currency,
          currencyDisplay: 'narrowSymbol',
          notation: 'compact',
          minimumFractionDigits: 0,
        }).format,
      },
    });

    currencyRef.current = currency;
  }, [currency]);

  return (
    <Stack ml="-12px">
      {/* Chart range buttons */}
      <Stack direction="row-reverse" mb="10px">
        <ButtonGroup>
          {chartRanges.map((value) => (
            <Button
              disableRipple
              key={value}
              onClick={() => setChartRange(value)}
              sx={{
                color: palette.blueAccent[600],
                backgroundColor: 'transparent',
                border: 'none',
                pr: value === 60 ? '0px' : undefined,
                '&:hover': {
                  color: palette.grey[100],
                },
              }}
            >
              {chartRangeDisplay[value]}
            </Button>
          ))}
        </ButtonGroup>
      </Stack>
      {/* Chart */}
      <div ref={chartContainerRef} style={{ position: 'relative' }}>
        {/* Tooltip */}
        <Box
          ref={tooltipBoxRef}
          sx={{
            position: 'absolute',
            display: 'none',
            background: palette.grey[900],
            pointerEvents: 'none',
            top: '0px',
            paddingY: '8px',
            paddingX: '12px',
            border: `1px solid ${palette.grey[700]}`,
            borderRadius: '4px',
            whiteSpace: 'nowrap',
            alignItems: 'center',
            textAlign: 'center',
            zIndex: 1000,
          }}
        >
          <Typography ref={tooltipPriceRef} fontSize={17} fontWeight={500} />
          <Typography ref={tooltipTimeRef} fontSize={13} color="secondary" />
        </Box>
      </div>
    </Stack>
  );
};

export default Chart;
