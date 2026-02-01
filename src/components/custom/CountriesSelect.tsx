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
import { useInfiniteCountriesQueryOptions } from "@/api/v2/content-managment/country/country.hooks";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";

type Props = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

function CountriesSelectContent({ value, onChange, disabled }: Props) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery(useInfiniteCountriesQueryOptions(10));

  return (
    <Select onValueChange={onChange} value={value} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder="اختر الدولة..." />
      </SelectTrigger>
      <SelectContent>
        <ScrollArea className="h-[250px]">
          {/* Map over the pages, then map over the data in each page */}
          {data.pages.map((page, i) => (
            <Fragment key={i}>
              {page?.data.map((country) => (
                <SelectItem key={country.id} value={country.id.toString()}>
                  {country.name}
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

function CountriesSelectSkeleton() {
  return (
    <Select disabled>
      <SelectTrigger>
        <Loader2 className="h-4 w-4 animate-spin" />
      </SelectTrigger>
    </Select>
  );
}

export function CountriesSelect(props: Props) {
  return (
    <Suspense fallback={<CountriesSelectSkeleton />}>
      <CountriesSelectContent {...props} />
    </Suspense>
  );
}
