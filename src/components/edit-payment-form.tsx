"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";
import { Loader2, CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "./ui/textarea";
import { editPaymentFormSchema, type EditPaymentFormValues } from "@/lib/schemas";
import type { CreditCard, Payment } from "@/lib/types";
import { useCardStore } from "@/hooks/use-card-store";
import { cn } from "@/lib/utils";


interface EditPaymentFormProps {
  isOpen: boolean;
  onClose: () => void;
  card: CreditCard;
  payment: Payment;
}

export function EditPaymentForm({ isOpen, onClose, card, payment }: EditPaymentFormProps) {
  const { updateCard } = useCardStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EditPaymentFormValues>({
    resolver: zodResolver(editPaymentFormSchema),
    defaultValues: {
      amount: payment.amount,
      date: new Date(payment.date),
      note: payment.note || "",
    },
  });

  useEffect(() => {
    if (payment) {
        form.reset({
            amount: payment.amount,
            date: new Date(payment.date),
            note: payment.note || "",
        })
    }
  }, [payment, form, isOpen]);


  const onSubmit = (values: EditPaymentFormValues) => {
    setIsSubmitting(true);
    const updatedPayments = card.payments.map(p => 
        p.id === payment.id 
        ? { ...p, amount: values.amount, date: values.date.toISOString(), note: values.note } 
        : p
    );
    
    const paidAmountWithoutCurrent = card.payments.filter(p => p.id !== payment.id).reduce((sum, p) => sum + p.amount, 0);
    const totalPaid = paidAmountWithoutCurrent + values.amount;

    if (totalPaid > card.billAmount) {
        form.setError("amount", { type: "manual", message: `Total payments cannot exceed bill amount of ${card.billAmount}.` });
        setIsSubmitting(false);
        return;
    }

    const cardToUpdate: CreditCard = { ...card, payments: updatedPayments };

    updateCard(cardToUpdate);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Payment</DialogTitle>
          <DialogDescription>
            Update the payment details for your {card.cardType} card.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Payment Date</FormLabel>
                   <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add a note for this payment..." {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
