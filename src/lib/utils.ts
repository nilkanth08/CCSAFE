import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { CreditCard } from "@/lib/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type CardStatus = 'paid' | 'unpaid' | 'partially-paid';

export function getCardStatus(card: Pick<CreditCard, 'billAmount' | 'payments'>): CardStatus {
  const paidAmount = card.payments.reduce((sum, p) => sum + p.amount, 0);
  if (card.billAmount > 0 && paidAmount >= card.billAmount) {
    return 'paid';
  }
  if (paidAmount > 0 && paidAmount < card.billAmount) {
    return 'partially-paid';
  }
  return 'unpaid';
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    currencyDisplay: "code",
  }).format(amount);
}
