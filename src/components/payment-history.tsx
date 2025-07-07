"use client";

import { useState } from "react";
import type { CreditCard, Payment } from "@/lib/types";
import { useCardStore } from "@/hooks/use-card-store";
import { Button } from "./ui/button";
import { Edit, Trash2 } from "lucide-react";
import { EditPaymentForm } from "./edit-payment-form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { formatCurrency } from "@/lib/utils";

interface PaymentHistoryProps {
    card: CreditCard;
}

export function PaymentHistory({ card }: PaymentHistoryProps) {
    const { updateCard } = useCardStore();
    const [editingPayment, setEditingPayment] = useState<Payment | undefined>();

    const handleDeletePayment = (paymentId: string) => {
        const updatedPayments = card.payments.filter(p => p.id !== paymentId);
        updateCard({ ...card, payments: updatedPayments });
    }

    const handleEditPayment = (payment: Payment) => {
        setEditingPayment(payment);
    }
    
    const handleCloseForm = () => {
        setEditingPayment(undefined);
    }

    return (
        <div className="space-y-2 pt-2">
            {card.payments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center">No payments recorded yet.</p>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Note</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="w-[100px] text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {card.payments.slice().sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(payment => (
                            <TableRow key={payment.id}>
                                <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                                <TableCell className="max-w-[150px] truncate" title={payment.note}>{payment.note}</TableCell>
                                <TableCell className="text-right">{formatCurrency(payment.amount)}</TableCell>
                                <TableCell className="flex gap-1 justify-end">
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditPayment(payment)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Delete Payment?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete this payment record.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction onClick={() => handleDeletePayment(payment.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
             {editingPayment && (
                <EditPaymentForm
                    isOpen={!!editingPayment}
                    onClose={handleCloseForm}
                    card={card}
                    payment={editingPayment}
                />
            )}
        </div>
    )
}
