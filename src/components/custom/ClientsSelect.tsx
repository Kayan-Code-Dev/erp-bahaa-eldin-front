import { Fragment, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGetInfiniteClientsQueryOptions } from "@/api/v2/clients/clients.hooks";
import { useInfiniteQuery } from "@tanstack/react-query";
import useDebounce from "@/hooks/useDebounce";

type Props = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function ClientsSelect({ value, onChange, disabled }: Props) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce({ value: search, delay: 500 });

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery(
      useGetInfiniteClientsQueryOptions(10, debouncedSearch || undefined)
    );

  return (
    <Select
      onValueChange={onChange}
      value={value}
      disabled={disabled || isLoading}
    >
      <SelectTrigger>
        <SelectValue placeholder="اختر العميل..." />
      </SelectTrigger>
      <SelectContent>
        <div className="p-2">
          {/* --- FIX IS HERE --- */}
          <Input
            placeholder="ابحث عن عميل..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            // This prevents the Select from stealing your keystrokes (Space, Arrows, etc.)
            onKeyDown={(e) => e.stopPropagation()} 
          />
        </div>
        <ScrollArea className="h-[250px]">
          {isLoading && !data && (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          )}
          {/* Map over the pages, then map over the data in each page */}
          {data?.pages.map((page, i) => (
            <Fragment key={i}>
              {page?.data.map((client) => (
                <SelectItem key={client.id} value={client.id.toString()}>
                  {client.first_name} {client.middle_name} {client.last_name}
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