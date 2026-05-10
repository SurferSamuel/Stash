import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SummaryData } from "@/generated";
import { InfoIcon } from "lucide-react";

const formatMarketCap = (v: number): string => {
  if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(2)}M`;
  if (v >= 1e3) return `$${(v / 1e3).toFixed(2)}K`;
  return `$${v.toLocaleString()}`;
};

const summaryFields: { key: keyof SummaryData; label: string; description: string; format?: (v: number) => string}[] = [
  {
    key: "previous_close",
    label: "Previous Close",
    description: "The closing price of the security from the previous trading day.",
    format: (v) => `$${v.toFixed(2)}`,
  },
  {
    key: "open",
    label: "Open",
    description: "The price at which the security traded upon the opening of the latest trading day.",
    format: (v) => `$${v.toFixed(2)}`,
  },
  {
    key: "day_low",
    label: "Day Low",
    description: "The lowest price at which the security has traded during the latest trading day.",
    format: (v) => `$${v.toFixed(2)}`,
  },
  {
    key: "day_high",
    label: "Day High",
    description: "The highest price at which the security has traded during the latest trading day.",
    format: (v) => `$${v.toFixed(2)}`,
  },
  {
    key: "bid",
    label: "Bid",
    description: "The highest price a buyer is currently willing to pay for the security.",
    format: (v) => `$${v.toFixed(2)}`,
  },
  {
    key: "ask",
    label: "Ask",
    description: "The lowest price a seller is currently willing to accept for the security.",
    format: (v) => `$${v.toFixed(2)}`,
  },
  {
    key: "bid_size",
    label: "Bid Size",
    description: "The number of units buyers are willing to purchase at the current bid price.",
    format: (v) => v.toLocaleString(),
  },
  {
    key: "ask_size",
    label: "Ask Size",
    description: "The number of units sellers are offering at the current ask price.",
    format: (v) => v.toLocaleString(),
  },
  {
    key: "volume",
    label: "Volume",
    description: "The total number of units traded during the latest trading day.",
    format: (v) => v.toLocaleString(),
  },
  {
    key: "average_volume",
    label: "Avg. Volume",
    description: "The average number of units traded per day, over the past 3 months.",
    format: (v) => v.toLocaleString(),
  },
  {
    key: "market_cap",
    label: "Market Cap",
    description: "The total market value of outstanding units, calculated as latest price multiplied by outstanding units.",
    format: formatMarketCap,
  },
  {
    key: "beta",
    label: "Beta",
    description: "A measure of the security's volatility relative to the overall market. A beta above 1 means more volatile than the market.",
    format: (v) => v.toFixed(2),
  },
  {
    key: "fifty_two_week_low",
    label: "52W Low",
    description: "The lowest price at which the security has traded in the past 52 weeks.",
    format: (v) => `$${v.toFixed(2)}`,
  },
  {
    key: "fifty_two_week_high",
    label: "52W High",
    description: "The highest price at which the security has traded in the past 52 weeks.",
    format: (v) => `$${v.toFixed(2)}`,
  },
  {
    key: "trailing_price_to_earnings",
    label: "P/E Ratio (TTM)",
    description: "The Price-to-Earnings ratio (P/E Ratio) is the ratio of the security's price to its earnings per share. It indicates how investors value a company's earnings.",
    format: (v) => v.toFixed(2),
  },
  {
    key: "trailing_price_to_sales",
    label: "P/S Ratio (TTM)",
    description: "The Price-to-Sales ratio (P/S Ratio) is the ratio of the security's price to its sales (revenue) per share.",
    format: (v) => v.toFixed(2),
  },
];

export const Summary = ({ data, loading }: { data: SummaryData | undefined; loading: boolean }) => (
  <Card className="py-4 gap-1">
    <CardHeader className="px-6">
      <CardTitle className="text-lg font-semibold">Summary</CardTitle>
    </CardHeader>
    <CardContent className="px-6">
      <div className="grid grid-cols-2">
        {summaryFields.map(({ key, label, description, format }) => {
          const raw = data?.[key];
          const value = raw ? (format ? format(raw) : String(raw)) : "—";
          return (
            <SummaryItem
              key={key}
              label={label}
              description={description}
              value={value}
              loading={loading}
            />
          );
        })}
      </div>
    </CardContent>
  </Card>
);

const SummaryItem = ({ label, description, value, loading }: { label: string; description: string; value: string; loading: boolean }) => (
  <div className="flex flex-col gap-1 py-2">
    <div className="flex items-center gap-1.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <InfoIcon className="size-3 text-muted-foreground/70" />
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-60 text-center bg-popover text-popover-foreground border border-border shadow-md">
            <p>{description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
    {loading ? <Skeleton className="h-4.5 w-24" /> : <span className="h-4.5 text-sm font-medium">{value}</span>}
  </div>
);
