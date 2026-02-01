import { Fragment, Suspense } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGetInfiniteBranchesQueryOptions } from "@/api/v2/branches/branches.hooks";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";

type Props = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

function BranchesSelectContent({ value, onChange, disabled }: Props) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isFetching } =
    useSuspenseInfiniteQuery(useGetInfiniteBranchesQueryOptions(10));

  return (
    <Select onValueChange={onChange} value={value} disabled={disabled}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="اختر الفرع..." />
      </SelectTrigger>
      <SelectContent>
        <ScrollArea className="h-[250px]">
          {/* Loading indicator for refetching */}
          {isFetching && !isFetchingNextPage && (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          )}

          {/* Map over the pages, then map over the data in each page */}
          {data.pages.map((page, i) => (
            <Fragment key={i}>
              {page?.data.map((branch) => (
                <SelectItem key={branch.id} value={branch.id.toString()}>
                  {branch.name}
                </SelectItem>
              ))}
            </Fragment>
          ))}

          {/* "Load More" Button */}
          {hasNextPage && (
            <div className="sticky bottom-0 bg-background p-2">
              <Button
                variant="outline"
                className="w-full"
                disabled={isFetchingNextPage}
                // Use onMouseDown to prevent the Select from closing
                onMouseDown={(e) => {
                  e.preventDefault();
                  fetchNextPage();
                }}
              >
                {isFetchingNextPage ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "تحميل المزيد"
                )}
              </Button>
            </div>
          )}
        </ScrollArea>
      </SelectContent>
    </Select>
  );
}

function BranchesSelectSkeleton() {
  return (
    <Select disabled>
      <SelectTrigger className="w-full">
        <Loader2 className="h-4 w-4 animate-spin" />
      </SelectTrigger>
    </Select>
  );
}

export function BranchesSelect(props: Props) {
  return (
    <Suspense fallback={<BranchesSelectSkeleton />}>
      <BranchesSelectContent {...props} />
    </Suspense>
  );
}

