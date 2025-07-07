"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { Loader2 } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { paymentFormSchema, type PaymentFormValues } from "@/lib/schemas";
import type { CreditCard } from "@/lib/types";
import { useCardStore } from "@/hooks/use-card-store";
import { Textarea } from "./ui/textarea";
import { formatCurrency } from "@/lib/utils";

interface PaymentFormProps {
  isOpen: boolean;
  onClose: () => void;
  card: CreditCard;
}

export function PaymentForm({ isOpen, onClose, card }: PaymentFormProps) {
  const { updateCard } = useCardStore();
  const [isPartialSubmitting, setIsPartialSubmitting] = React.useState(false);
  const [isFullSubmitting, setIsFullSubmitting] = React.useState(false);

  const paidAmount = card.payments.reduce((sum, p) => sum + p.amount, 0);
  const remainingAmount = card.billAmount - paidAmount;

  const formSchema = paymentFormSchema(remainingAmount);
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: undefined,
      note: "",
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      form.reset({ amount: undefined, note: "" });
    }
  }, [isOpen, form]);

  const handlePartialPay = (values: PaymentFormValues) => {
    setIsPartialSubmitting(true);
    const newPayment = {
      id: new Date().toISOString(),
      amount: values.amount,
      date: new Date().toISOString(),
      note: values.note,
    };
    const updatedPayments = [...card.payments, newPayment];

    const cardToUpdate: CreditCard = {
      ...card,
      payments: updatedPayments,
    };

    updateCard(cardToUpdate);
    setIsPartialSubmitting(false);
    onClose();
  };
  
  const handleFullPay = async () => {
    const isNoteValid = await form.trigger("note");
    if (!isNoteValid) {
        return;
    }
    
    setIsFullSubmitting(true);

    const cardToUpdate: CreditCard = { ...card };

    if (remainingAmount > 0) {
      const newPayment = {
        id: new Date().toISOString(),
        amount: remainingAmount,
        date: new Date().toISOString(),
        note: form.getValues("note"),
      };
      cardToUpdate.payments = [...card.payments, newPayment];
    }
    
    updateCard(cardToUpdate);

    setIsFullSubmitting(false);
    onClose();
  };

  const isSubmitting = isPartialSubmitting || isFullSubmitting;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Record a payment for {card.cardholderName}'s card.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
                <span className="text-muted-foreground">Total Bill:</span>
                <span>{formatCurrency(card.billAmount)}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-muted-foreground">Paid Amount:</span>
                <span>{formatCurrency(paidAmount)}</span>
            </div>
            <div className="flex justify-between font-medium">
                <span className="text-muted-foreground">Remaining Due:</span>
                <span>{formatCurrency(remainingAmount)}</span>
            </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handlePartialPay)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Amount</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder={formatCurrency(remainingAmount)} {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g. Payment for dining" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="gap-2 sm:justify-between pt-4">
              <Button type="button" variant="secondary" onClick={handleFullPay} disabled={isSubmitting || remainingAmount <= 0}>
                {isFullSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Pay Full Amount
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isPartialSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Record Partial Payment
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
