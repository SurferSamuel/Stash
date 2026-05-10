import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HeaderData } from "@/generated";
import { PlusIcon } from "lucide-react";

export const Header = ({ data, loading }: { data: HeaderData | undefined; loading: boolean }) => (
  <Card className="pt-5 pb-6">
    <CardContent className="px-6">
      <div className="flex justify-between w-full">
        <div className="flex flex-col gap-1">
          {loading
            ? (
                <>
                  <Skeleton className="h-9.5 w-110" />
                  <Skeleton className="h-5.5 w-82" />
                </>
              )
            : (
                <>
                  <h1 className="h-9.5 text-[26px] font-bold">{data?.name}</h1>
                  <div className="h-5.5 flex items-center">
                    <Badge variant="secondary" className="text-muted-foreground">{data?.kind}</Badge>
                    <span className="text-[15px] text-muted-foreground ml-4">Symbol: {data?.symbol}</span>
                    <span className="text-[15px] text-muted-foreground ml-5">Exchange: {data?.exchange}</span>
                    <span className="text-[15px] text-muted-foreground ml-5">Currency: {data?.currency}</span>
                  </div>
                </>
              )}
        </div>
        <Button>
          <PlusIcon /> Add Security
        </Button>
      </div>
    </CardContent>
  </Card>
);
