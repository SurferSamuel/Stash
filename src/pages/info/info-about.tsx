import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AboutData } from "@/generated";

import { useEffect, useRef, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

const aboutFields: { key: keyof Omit<AboutData, "description">; label: string; format?: (v: number | string) => string }[] = [
  { key: "industry", label: "Industry" },
  { key: "sector", label: "Sector" },
  { key: "employees", label: "Employees", format: (v) => Number(v).toLocaleString() },
  { key: "country", label: "Country" },
  { key: "fund_family", label: "Fund Family" },
  { key: "fund_inception_date", label: "Inception Date", format: (v) => new Date(Number(v) * 1000).toLocaleDateString() },
  { key: "legal_type", label: "Legal Type" },
];

export const About = ({ data, loading }: { data: AboutData | undefined; loading: boolean }) => {
  const [expanded, setExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const descriptionRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = descriptionRef.current;
    if (!el) return;

    const check = () => setIsClamped(el.scrollHeight > el.clientHeight);
    check();

    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, [data?.description]);

  const description = data?.description ?? null;
  const visibleFields = aboutFields.filter(({ key }) => data?.[key] != null);

  return (
    <Card className="py-4 gap-1">
      <CardHeader className="px-6">
        <CardTitle className="text-lg font-semibold">About</CardTitle>
      </CardHeader>
      <CardContent className="px-6">
        {loading
          ? (
              <div className="w-full flex justify-center items-center h-30 text-muted-foreground">
                <Spinner className="size-7 [animate-duration:0.8s]" />
              </div>
            )
          : (
              <div className="flex flex-col">
                {description && (
                  <div className="flex flex-col gap-1 pt-2">
                    <p
                      ref={descriptionRef}
                      className={cn("text-sm leading-relaxed", !expanded && "line-clamp-2")}
                    >
                      {description}
                    </p>
                    {(isClamped || expanded) && (
                      <button
                        onClick={() => {
                          if (expanded) setIsClamped(true);
                          setExpanded((prev) => !prev);
                        }}
                        className="self-end text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {expanded ? "Show less" : "Show more"}
                      </button>
                    )}
                  </div>
                )}
                {visibleFields.length > 0 && (
                  <div className="grid grid-cols-2">
                    {visibleFields.map(({ key, label, format }) => {
                      const raw = data?.[key] as string | number;
                      const value = format ? format(raw) : String(raw);
                      return (
                        <div key={key} className="flex flex-col gap-1 py-2">
                          <span className="text-sm text-muted-foreground">{label}</span>
                          <span className="text-sm font-medium">{value}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
      </CardContent>
    </Card>
  );
};
