import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { DividendData } from "@/generated";
import { InfoIcon } from "lucide-react";

const dividendFields: { key: string; label: string; description: string; format?: (data: DividendData) => string }[] = [
  {
    key: "forward_dividend",
    label: "Forward Dividend",
    description: "The expected annual dividend payment per share and its yield, based on the most recent dividend annualized.",
    format: (d) => {
      const rate = d.forward_dividend_rate;
      const yield_ = d.forward_dividend_yield;
      if (!rate && !yield_) return "—";
      const ratePart = rate ? `$${rate.toFixed(2)}` : "—";
      const yieldPart = yield_ ? `(${(yield_ * 100).toFixed(2)}%)` : "";
      return `${ratePart} ${yieldPart}`.trim();
    },
  },
  {
    key: "trailing_dividend",
    label: "Trailing Dividend",
    description: "The actual dividend paid per share over the past 12 months and its yield relative to the current share price.",
    format: (d) => {
      const rate = d.trailing_dividend_rate;
      const yield_ = d.trailing_dividend_yield;
      if (!rate && !yield_) return "—";
      const ratePart = rate ? `$${rate.toFixed(2)}` : "—";
      const yieldPart = yield_ ? `(${(yield_ * 100).toFixed(2)}%)` : "";
      return `${ratePart} ${yieldPart}`.trim();
    },
  },
  {
    key: "ex_dividend_date",
    label: "Ex-Dividend Date",
    description: "The cutoff date to be eligible for the next dividend payment. You must own shares before this date to receive the dividend.",
    format: (d) => d.ex_dividend_date ? new Date(d.ex_dividend_date * 1000).toLocaleDateString() : "—",
  },
  {
    key: "payout_ratio",
    label: "Payout Ratio",
    description: "The proportion of earnings paid out as dividends. A higher ratio means more earnings are returned to shareholders.",
    format: (d) => d.payout_ratio ? `${(d.payout_ratio * 100).toFixed(2)}%` : "—",
  },
];

export const Dividends = ({ data, loading }: { data: DividendData | undefined; loading: boolean }) => {
  const visibleFields = dividendFields.filter(({ key }) => {
    if (key === "forward_dividend") return data?.forward_dividend_rate || data?.forward_dividend_yield;
    if (key === "trailing_dividend") return data?.trailing_dividend_rate || data?.trailing_dividend_yield;
    return data?.[key as keyof DividendData];
  });

  return (
    <Card className="py-4 gap-1">
      <CardHeader className="px-6">
        <CardTitle className="text-lg font-semibold">Dividends</CardTitle>
      </CardHeader>
      <CardContent className="px-6">
        {loading ? (
          <div className="w-full flex justify-center items-center h-20 text-muted-foreground">
            <Spinner className="size-7 [animate-duration:0.8s]" />
          </div>
        ) : visibleFields.length === 0 ? (
          <div className="w-full flex justify-center items-center h-20 text-muted-foreground text-sm">
            No dividend data available.
          </div>
        ) : (
          <div className="grid grid-cols-2">
            {visibleFields.map(({ key, label, description, format }) => {
              const value = format ? format(data!) : "—";
              return (
                <div key={key} className="flex flex-col gap-1 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-muted-foreground">{label}</span>
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InfoIcon className="size-3 text-muted-foreground/70" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-64 text-center bg-popover text-popover-foreground border border-border shadow-md [&>svg]:hidden">
                          <p>{description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <span className="text-sm font-medium">{value}</span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};