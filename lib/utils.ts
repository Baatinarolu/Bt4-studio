import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-");
}

export function generateLicenseKey(productId: string): string {
  return `CV-${productId.toUpperCase().slice(0, 6)}-${Math.random()
    .toString(36)
    .slice(2, 10)
    .toUpperCase()}`;
}

export function truncate(str: string, length: number) {
  return str.length > length ? str.slice(0, length) + "..." : str;
}
