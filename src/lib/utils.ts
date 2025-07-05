import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(date: string): string {
  return date.slice(0, 10); // Use a fixed format for SSR safety
}

export function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function getMonthName(monthString: string): string {
  const [year, month] = monthString.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function validateTransaction(data: unknown): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (typeof data !== 'object' || data === null) {
    return { isValid: false, errors: ['Invalid data'] };
  }
  const d = data as Record<string, unknown>;
  if (
    typeof d.amount !== 'number' ||
    isNaN(d.amount) ||
    d.amount <= 0
  ) {
    errors.push('Amount must be a positive number');
  }
  if (typeof d.date !== 'string' || !d.date) {
    errors.push('Date is required');
  } else {
    const date = new Date(d.date);
    if (isNaN(date.getTime())) {
      errors.push('Invalid date format');
    }
  }
  if (typeof d.description !== 'string' || d.description.trim().length === 0) {
    errors.push('Description is required');
  }
  if (typeof d.type !== 'string' || !['expense', 'income'].includes(d.type)) {
    errors.push('Type must be either expense or income');
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
} 