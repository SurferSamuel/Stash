import { useSearchSecurities } from "@/hooks/use-search-securities";
import { Spinner } from "@/components/ui/spinner";
import React from "react";
import {
  ActionImpl,
  KBarResults,
  useKBar,
  useMatches,
} from "kbar";

export const Results = () => {
  const { isLoading } = useSearchSecurities();
  const { results } = useMatches();

  const { searchQuery } = useKBar((state) => ({
    searchQuery: state.searchQuery,
  }));

  // Empty search query
  if (searchQuery === "") {
    return (
      <div className="w-full flex justify-center items-center h-20 text-muted-foreground">
        <h2>Search for stocks, etfs, and more.</h2>
      </div>
    );
  }

  // Query still loading
  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center h-20 text-muted-foreground">
        <Spinner className="size-7 [animate-duration:0.8s]" />
      </div>
    );
  }

  // No results found
  if (results.length === 0) {
    return (
      <div className="w-full flex justify-center items-center h-20 text-muted-foreground">
        <h2>No results found.</h2>
      </div>
    );
  }

  return (
    <KBarResults
      items={results}
      onRender={({ item, active }) =>
        typeof item === "string"
          ? (
              <div>{item}</div>
            )
          : (
              <ResultItem
                action={item}
                active={active}
              />
            )}
    />
  );
};

const ResultItem = React.forwardRef<HTMLDivElement, { action: ActionImpl; active: boolean }>(
  ({ action, active }, ref) => (
    <div ref={ref} className={`flex justify-between items-center px-4 pb-2.75 pt-3 gap-2 border-l-2 border-solid rounded-xs rounded-l-none ${active ? "bg-accent border-l-foreground" : "border-l-transparent"}`}>
      <div className="flex flex-col w-auto">
        <h2>
          {action.name}
        </h2>
        <h2 className="text-muted-foreground font-light">
          {action.subtitle}
        </h2>
      </div>
      {action.keywords && action.keywords !== "" && (
        <div className="flex flex-col items-end">
          <h2 className="text-muted-foreground font-light">
            {action.keywords.split(" ")[0].toLowerCase()}
          </h2>
          <h2 className="text-muted-foreground font-light">
            {action.keywords.split(" ")[1] ?? ""}
          </h2>
        </div>
      )}
    </div>
  ),
);
