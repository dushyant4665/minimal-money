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
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
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

export function validateTransaction(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.amount || isNaN(data.amount) || data.amount <= 0) {
    errors.push('Amount must be a positive number');
  }

  if (!data.date) {
    errors.push('Date is required');
  } else {
    const date = new Date(data.date);
    if (isNaN(date.getTime())) {
      errors.push('Invalid date format');
    }
  }

  if (!data.description || data.description.trim().length === 0) {
    errors.push('Description is required');
  }

  if (!data.type || !['expense', 'income'].includes(data.type)) {
    errors.push('Type must be either expense or income');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
} 