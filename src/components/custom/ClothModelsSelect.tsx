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
import { useGetInfiniteClothesModelsOptions } from "@/api/v2/clothes/clothes-models/clothes.models.hooks";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";

type Props = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  per_page?: number;
};

function ClothModelsSelectContent({
  value,
  onChange,
  disabled,
  per_page = 10,
}: Props) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery(useGetInfiniteClothesModelsOptions(per_page));

  return (
    <Select onValueChange={onChange} value={value} disabled={disabled}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="اختر الموديل..." />
      </SelectTrigger>
      <SelectContent>
        <ScrollArea className="h-[250px]">
          {/* Map over the pages, then map over the data in each page */}
          {data.pages.map((page, i) => (
            <Fragment key={i}>
              {page?.data.map((model) => (
                <SelectItem key={model.id} value={model.id.toString()}>
                  {model.name} ({model.code})
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

function ClothModelsSelectSkeleton() {
  return (
    <Select disabled>
      <SelectTrigger className="w-full">
        <Loader2 className="h-4 w-4 animate-spin" />
      </SelectTrigger>
    </Select>
  );
}

export function ClothModelsSelect(props: Props) {
  return (
    <Suspense fallback={<ClothModelsSelectSkeleton />}>
      <ClothModelsSelectContent {...props} />
    </Suspense>
  );
}

