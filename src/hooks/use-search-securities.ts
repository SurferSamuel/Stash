import { search } from "@/generated";
import { useNavigate } from "@tanstack/react-router";
import { Action, useKBar, useRegisterActions } from "kbar";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

export function useSearchSecurities() {
  const [isLoading, setIsLoading] = useState(false);
  const [actions, setActions] = useState<Action[]>([]);
  const navigate = useNavigate();

  const { searchQuery } = useKBar((state) => ({
    searchQuery: state.searchQuery,
  }));

  const debounce = useDebouncedCallback(async () => {
    const searchResults = await search({ query: searchQuery });
    const actions = searchResults.map<Action>((result, index) => ({
      id: `search-query-${searchQuery}-result-${result.symbol}`,
      name: result.symbol,
      subtitle: result.name,
      keywords: result.kind + " " + result.exchange,
      priority: searchResults.length - index,
      perform: async () => {
        navigate({ to: "/search/$symbol", params: { symbol: result.symbol } });
      },
    }));

    setActions(actions);
    setIsLoading(false);
  }, 500);

  const cancelSearch = () => {
    debounce.cancel();
    setActions([]);
    setIsLoading(false);
  };

  useEffect(() => {
    // Clearing search query should stop search
    if (searchQuery === "") {
      cancelSearch();
    } else {
      // Show loading when searching for new securities (while debounce is pending)
      if (!isLoading) {
        setIsLoading(true);
        setActions([]);
      }
      debounce();
    }
  }, [searchQuery]);

  useRegisterActions(actions, [actions]);

  return { isLoading };
}
