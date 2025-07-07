"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Banknote, List, CircleAlert } from "lucide-react";
import type { CreditCard as CreditCardType } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface SummaryReportProps {
  cards: CreditCardType[];
}

const SummaryReport = ({ cards }: SummaryReportProps) => {
  const summary = cards.reduce(
    (acc, card) => {
      acc.totalBill += card.billAmount;
      const paidForCard = card.payments.reduce((sum, p) => sum + p.amount, 0);
      acc.totalPaid += paidForCard;
      return acc;
    },
    { totalBill: 0, totalPaid: 0 }
  );

  const outstanding = summary.totalBill - summary.totalPaid;

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
          <List className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{cards.length}</div>
          <p className="text-xs text-muted-foreground">cards managed</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Billed</CardTitle>
          <Banknote className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.totalBill)}</div>
          <p className="text-xs text-muted-foreground">this billing cycle</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
          <Banknote className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.totalPaid)}</div>
          <p className="text-xs text-muted-foreground">across all cards</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Outstanding Dues</CardTitle>
          <CircleAlert className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">
            {formatCurrency(outstanding)}
          </div>
          <p className="text-xs text-muted-foreground">total amount pending</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SummaryReport;
