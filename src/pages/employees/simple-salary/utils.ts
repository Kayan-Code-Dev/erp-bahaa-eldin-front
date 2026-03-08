/** Format amount for display in simple salary UI */
export function formatSimpleSalaryMoney(
  value: number | null | undefined
): string {
  if (value == null) return "—";
  return `${Number(value).toLocaleString("ar-EG", { minimumFractionDigits: 2 })}`;
}
