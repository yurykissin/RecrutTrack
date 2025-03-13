/**
 * Format a date to a readable string format
 */
export function formatDate(date: string | Date): string {
  const d = date instanceof Date ? date : new Date(date);
  
  if (isNaN(d.getTime())) {
    return "Invalid date";
  }
  
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
}

/**
 * Format a number as currency (USD)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Format a number with commas for thousands
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

/**
 * Format a candidate's availability into a human-readable string
 */
export function formatAvailability(availability: string): string {
  switch (availability) {
    case "immediate":
      return "Immediate";
    case "2weeks":
      return "2 Weeks Notice";
    case "1month":
      return "1 Month Notice";
    case "3months":
      return "3+ Months";
    default:
      return availability;
  }
}

/**
 * Generate a readable list from an array of strings
 */
export function formatList(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  
  const lastItem = items[items.length - 1];
  const otherItems = items.slice(0, items.length - 1);
  
  return `${otherItems.join(", ")} and ${lastItem}`;
}
