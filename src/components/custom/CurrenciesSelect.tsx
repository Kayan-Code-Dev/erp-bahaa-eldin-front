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
import { useInfiniteCurrenciesQueryOptions } from "@/api/v2/content-managment/currency/currency.hooks";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";

type Props = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

function CurrenciesSelectContent({ value, onChange, disabled }: Props) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery(useInfiniteCurrenciesQueryOptions(10));

  return (
    <Select onValueChange={onChange} value={value} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder="اختر العملة..." />
      </SelectTrigger>
      <SelectContent>
        <ScrollArea className="h-[250px]">
          {data.pages.map((page, i) => (
            <Fragment key={i}>
              {page?.data.map((currency) => (
                <SelectItem key={currency.id} value={currency.id.toString()}>
                  {currency.name} ({currency.code}) {currency.symbol}
                </SelectItem>
              ))}
            </Fragment>
          ))}

          {hasNextPage && (
            <div className="sticky bottom-0 bg-background p-2">
              <Button
                variant="outline"
                className="w-full"
                disabled={isFetchingNextPage}
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

function CurrenciesSelectSkeleton() {
  return (
    <Select disabled>
      <SelectTrigger>
        <Loader2 className="h-4 w-4 animate-spin" />
      </SelectTrigger>
    </Select>
  );
}

export function CurrenciesSelect(props: Props) {
  return (
    <Suspense fallback={<CurrenciesSelectSkeleton />}>
      <CurrenciesSelectContent {...props} />
    </Suspense>
  );
}

