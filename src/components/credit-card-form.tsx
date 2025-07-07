"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import React, { useEffect, useState } from "react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cardFormSchema, type CardFormValues } from "@/lib/schemas";
import type { CreditCard } from "@/lib/types";
import { useCardStore } from "@/hooks/use-card-store";
import { cn } from "@/lib/utils";

interface CreditCardFormProps {
  isOpen: boolean;
  onClose: () => void;
  card?: CreditCard;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export function CreditCardForm({ isOpen, onClose, card }: CreditCardFormProps) {
  const { addCard, updateCard } = useCardStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CardFormValues>({
    resolver: zodResolver(cardFormSchema),
    defaultValues: {
      cardholderName: "",
      bankName: "",
      mobileNumber: "",
      cardType: undefined,
      cardVariant: "",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      cardLimit: 0,
      billAmount: 0,
      billDate: undefined,
      dueDate: undefined,
      cardImageFront: undefined,
      cardImageBack: undefined,
      birthDate: undefined,
      cardPin: "",
      appPin: "",
      ifscCode: "",
      statementPassword: "",
    },
  });

  useEffect(() => {
    if (card) {
      form.reset({
        ...card,
        billDate: new Date(card.billDate),
        dueDate: new Date(card.dueDate),
        birthDate: card.birthDate ? new Date(card.birthDate) : undefined,
        cardImageFront: undefined, // Don't pre-fill file input
        cardImageBack: undefined,
      });
    } else {
      form.reset({
        cardholderName: "",
        bankName: "",
        mobileNumber: "",
        cardType: undefined,
        cardVariant: "",
        cardNumber: "",
        expiryDate: "",
        cvv: "",
        cardLimit: 0,
        billAmount: 0,
        billDate: undefined,
        dueDate: undefined,
        cardImageFront: undefined,
        cardImageBack: undefined,
        birthDate: undefined,
        cardPin: "",
        appPin: "",
        ifscCode: "",
        statementPassword: "",
      });
    }
  }, [card, form, isOpen]);

  const onSubmit = async (values: CardFormValues) => {
    setIsSubmitting(true);
    let imageFrontBase64: string | undefined = card?.cardImageFront;
    if (values.cardImageFront && values.cardImageFront.length > 0) {
      imageFrontBase64 = await fileToBase64(values.cardImageFront[0]);
    }

    let imageBackBase64: string | undefined = card?.cardImageBack;
    if (values.cardImageBack && values.cardImageBack.length > 0) {
      imageBackBase64 = await fileToBase64(values.cardImageBack[0]);
    }

    const cardData = {
        ...values,
        billDate: values.billDate.toISOString(),
        dueDate: values.dueDate.toISOString(),
        birthDate: values.birthDate ? values.birthDate.toISOString() : undefined,
        cardImageFront: imageFrontBase64,
        cardImageBack: imageBackBase64,
    };

    if (card) {
      const updatedCardData = { ...card, ...cardData };
      if (card.billAmount !== values.billAmount) {
        updatedCardData.payments = [];
      }
      updateCard(updatedCardData);
    } else {
      addCard(cardData as Omit<CreditCard, 'id' | 'payments'>);
    }
    
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{card ? "Edit Credit Card" : "Add New Credit Card"}</DialogTitle>
          <DialogDescription>
            {card ? "Update the details of your credit card." : "Enter the details of your new credit card."} All data is saved locally on your device.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <FormField
                control={form.control}
                name="cardholderName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cardholder Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bankName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Acme Bank" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="mobileNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                      <Input placeholder="9876543210" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cardType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Card Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a card type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="VISA">VISA</SelectItem>
                        <SelectItem value="MASTER">MASTER</SelectItem>
                        <SelectItem value="AMEX">AMEX</SelectItem>
                        <SelectItem value="RUPAY">RUPAY</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cardVariant"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Card Variant (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Platinum, Millennia" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cardNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Card Number</FormLabel>
                    <FormControl>
                      <Input placeholder="**** **** **** ****" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry Date</FormLabel>
                    <FormControl>
                      <Input placeholder="MM/YY" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cvv"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CVV</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="***" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cardLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Card Limit</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g. 100000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="billAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bill Amount</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="billDate"
                    render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Bill Date</FormLabel>
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
                    name="dueDate"
                    render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Due Date</FormLabel>
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
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="birthDate"
                    render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Birth Date (Optional)</FormLabel>
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
                            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
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
                  name="cardPin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Card PIN (Optional)</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="1234" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField
                  control={form.control}
                  name="appPin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>App PIN (Optional)</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="4-digit PIN" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="ifscCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IFSC Code (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. SBIN0001234" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            <FormField
              control={form.control}
              name="statementPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Statement Password (Optional)</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="e.g. john_ddmm" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cardImageFront"
                render={() => (
                  <FormItem>
                    <FormLabel>Card Image (Front)</FormLabel>
                     <FormControl>
                        <Input type="file" accept="image/*" {...form.register("cardImageFront")} />
                     </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cardImageBack"
                render={() => (
                  <FormItem>
                    <FormLabel>Card Image (Back)</FormLabel>
                     <FormControl>
                        <Input type="file" accept="image/*" {...form.register("cardImageBack")} />
                     </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {card ? "Save Changes" : "Add Card"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
