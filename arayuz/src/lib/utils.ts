import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind sınıflarını birleştirir; çakışanlarda sonuncusu kazanır. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
