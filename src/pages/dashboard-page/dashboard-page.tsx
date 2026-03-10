import { useQuery } from "@tanstack/react-query";
import { useGetDashboardOverviewQueryOptions } from "@/api/v2/dashboard/dashboard.hooks";
import { useDashboardFilters } from "./hooks/index";
import {
  DashboardHeader,
  DashboardFilters,
  DataContextStrip,
  DashboardSkeleton,
  DashboardError,
  DashboardFooter,
} from "./components/index";
import {
  DashboardKpis,
  DashboardSalesAndFinancial,
  DashboardDistributions,
  DashboardHRSection,
} from "./sections/index";

function DashboardPage() {
  const {
    filters,
    dateFrom,
    dateTo,
    setDateFrom,
    setDateTo,
    showFilters,
    setShowFilters,
    queryParams,
    periodLabel,
    activeFilters,
    setFilter,
    resetFilters,
  } = useDashboardFilters();

  const { data, isPending, isError, error } = useQuery(
    useGetDashboardOverviewQueryOptions(queryParams)
  );

  return (
    <div className="flex-1 min-h-0 bg-muted/20" dir="rtl">
      <DashboardHeader
        periodLabel={periodLabel}
        showFilters={showFilters}
        onToggleFilters={setShowFilters}
      />

      <div className="space-y-8 pb-8">
        {showFilters && (
          <DashboardFilters
            filters={filters}
            dateFrom={dateFrom}
            dateTo={dateTo}
            onFilterChange={setFilter}
            onDateFromChange={setDateFrom}
            onDateToChange={setDateTo}
            onReset={resetFilters}
          />
        )}

        {isPending && <DashboardSkeleton />}

        {isError && <DashboardError message={error?.message} />}

        {!isPending && !isError && data && (
          <>
            <DataContextStrip
              periodFrom={data.business?.sales?.period?.from}
              periodTo={data.business?.sales?.period?.to}
              generatedAt={data.generated_at}
              activeFilters={activeFilters}
              onResetFilters={resetFilters}
            />

            <DashboardKpis
              sales={data.business?.sales}
              clients={data.business?.clients}
              inventory={data.business?.inventory}
              payments={data.business?.payments}
              activity={data.activity}
            />

            <DashboardSalesAndFinancial
              sales={data.business?.sales}
              financial={data.business?.financial}
            />

            <DashboardDistributions
              activity={data.activity}
              inventory={data.business?.inventory}
              payments={data.business?.payments}
            />

            <DashboardHRSection hr={data.hr} />

            <DashboardFooter />
          </>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
