import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function jsonStringifyBigInt(obj: any): string {
  return JSON.stringify(obj, bigIntReplacer);
}

export function jsonParseBigInt(str: string): any {
  return JSON.parse(str, bigIntReviver);
}

function bigIntReplacer(_key: string, value: any): any {
  if (typeof value === "bigint") {
    return value.toString() + 'n';
  }
  return value;
}

function bigIntReviver(_key: string, value: any): any {
  if (typeof value === 'string' && /^\d+n$/.test(value)) {
    return BigInt(value.slice(0, -1));
  }
  return value;
}
