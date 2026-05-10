import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Chart = ({}: { data: null; loading: boolean }) => (
  <Card className="py-4 gap-1">
    <CardHeader className="px-6">
      <CardTitle className="text-lg font-semibold">Chart</CardTitle>
    </CardHeader>
    <CardContent className="px-6">
      <div className="w-full flex justify-center items-center h-60 text-muted-foreground text-sm">
        Work in progress.
      </div>
    </CardContent>
  </Card>
);
