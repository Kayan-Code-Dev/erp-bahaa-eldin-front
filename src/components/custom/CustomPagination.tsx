import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationPrevious,
    PaginationNext,
} from "@/components/ui/pagination";
import { useSearchParams } from "react-router";

type Props = {
    totalElements: number | undefined;
    totalPages: number | undefined;
    totalElementsLabel: string;
    isLoading: boolean
}

const CustomPagination = ({ totalElements, totalPages, totalElementsLabel, isLoading }: Props) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = Number(searchParams.get("page")) || 1;
    // --- Pagination Handlers ---
    const handlePreviousPage = () => {
        const nextPage = Math.max(1, currentPage - 1);
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set("page", String(nextPage));
            return next;
        }, { replace: true });
    };
    const handleNextPage = () => {
        const nextPage = Math.min(currentPage + 1, totalPages || 1);
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set("page", String(nextPage));
            return next;
        }, { replace: true });
    };

    return (
        <div className="w-full flex items-center justify-between">
            <div className="text-sm text-muted-foreground shrink-0">
                {totalElementsLabel}: {totalElements || 0}
            </div>
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationNext // RTL: Next arrow for previous page
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                handlePreviousPage();
                            }}
                            aria-disabled={currentPage === 1}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                            label="السابق"
                        />
                    </PaginationItem>
                    <PaginationItem className="font-medium">
                        صفحة {currentPage} من {totalPages || 1}
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationPrevious // RTL: Previous arrow for next page
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                handleNextPage();
                            }}
                            aria-disabled={currentPage === totalPages || isLoading}
                            className={
                                currentPage === totalPages || isLoading
                                    ? "pointer-events-none opacity-50"
                                    : ""
                            }
                            label="التالي"
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    )
}

export default CustomPagination