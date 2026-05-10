import { queryOptions, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/pages/info/info-page";
import { info } from "@/generated";

const infoSymbolQueryOptions = (symbol: string) => queryOptions({
  queryKey: ["info", "symbol", symbol],
  queryFn: () => info({ symbol }),
});

export const Route = createFileRoute("/search/$symbol")({
  loader: ({ context: { queryClient }, params: { symbol } }) => {
    queryClient.ensureQueryData(infoSymbolQueryOptions(symbol));
  },
  component: () => {
    const { symbol } = Route.useParams();
    const { data, isLoading } = useQuery(infoSymbolQueryOptions(symbol));
    return (
      <InfoPage
        data={data}
        loading={isLoading}
      />
    );
  },
});
