import { Info } from "@/generated";

import { Dividends } from "./info-dividends";
import { Summary } from "./info-summary";
import { Header } from "./info-header";
import { About } from "./info-about";
import { Chart } from "./info-chart";

interface InfoPageProps {
  data: Info | undefined;
  loading: boolean;
}

export const InfoPage = ({ data, loading }: InfoPageProps) => {
  return (
    <>
      <Header data={data?.header} loading={loading} />
      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-4 pt-4">
        <div className="flex flex-col gap-4">
          <Chart data={null} loading={false} />
          <About data={data?.about} loading={loading} />
        </div>
        <div className="flex flex-col gap-4">
          <Summary data={data?.summary} loading={loading} />
          <Dividends data={data?.dividends} loading={loading} />
        </div>
      </div>
    </>
  );
};
