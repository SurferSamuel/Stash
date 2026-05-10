import { ArrowUpDownIcon, CornerDownLeftIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Results } from "./results";
import {
  KBarAnimator,
  KBarPortal,
  KBarPositioner,
  KBarSearch,
} from "kbar";

export const CommandBar = () => {
  return (
    <KBarPortal>
      <KBarPositioner className="bg-black/10 supports-backdrop-filter:backdrop-blur-xs">
        <KBarAnimator className="max-w-2xl w-full bg-popover border rounded-lg overflow-hidden">
          <KBarSearch
            className="w-full font-light placeholder:text-muted-foreground p-4 outline-0 border-0 text-base"
            defaultPlaceholder="Search symbol..."
          />
          <Separator />
          <Results />
          <Separator />
          <div className="flex justify-center items-center gap-5 py-2">
            <div className="flex items-center gap-1">
              <ArrowUpDownIcon className="size-5 text-muted-foreground" />
              <h2 className="text-muted-foreground">to navigate</h2>
            </div>
            <div className="flex items-center gap-1">
              <CornerDownLeftIcon className="size-5 text-muted-foreground" />
              <h2 className="text-muted-foreground">to use</h2>
            </div>
            <div className="flex items-center gap-1">
              <h2 className="text-muted-foreground font-semibold">esc</h2>
              <h2 className="text-muted-foreground">to dismiss</h2>
            </div>
          </div>
        </KBarAnimator>
      </KBarPositioner>
    </KBarPortal>
  );
};
