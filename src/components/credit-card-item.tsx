"use client";

import Image from "next/image";
import { useState } from "react";
import { MoreVertical, Edit, Trash2, Banknote, ChevronDown } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle as AlertDialogTitleComponent } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { CreditCard } from "@/lib/types";
import { useCardStore } from "@/hooks/use-card-store";
import { getCardStatus, cn, formatCurrency } from "@/lib/utils";
import { GenericCardLogo } from "@/components/icons";
import { PaymentForm } from "./payment-form";
import { PaymentHistory } from "./payment-history";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface CreditCardItemProps {
  card: CreditCard;
  onEdit: (card: CreditCard) => void;
}

const CreditCardItem = ({ card, onEdit }: CreditCardItemProps) => {
  const { deleteCard } = useCardStore();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const paidAmount = card.payments.reduce((sum, p) => sum + p.amount, 0);
  const remainingAmount = card.billAmount - paidAmount;
  const status = getCardStatus(card);
  const availableLimit = card.cardLimit - remainingAmount;

  const statusText = {
    paid: "Paid",
    unpaid: "Unpaid",
    "partially-paid": "Partially Paid",
  };

  const handleDelete = () => {
    deleteCard(card.id);
    setIsDeleteDialogOpen(false);
    toast({
        title: "Card Deleted",
        description: `${card.cardType} ending in ${card.cardNumber.slice(-4)} has been deleted.`,
    });
  };

  const handlePaymentFormClose = () => {
    setIsPaymentFormOpen(false);
  };

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      setDeleteConfirmation("");
    }
    setIsDeleteDialogOpen(open);
  };

  return (
    <>
      <Card className="flex flex-col">
        <CardHeader className="relative flex-row items-start justify-between">
          <div>
            <CardTitle>{card.cardholderName}</CardTitle>
            <CardDescription>
              {card.bankName} &middot; {card.cardType} {card.cardVariant && `(${card.cardVariant})`} &middot; Due: {new Date(card.dueDate).toLocaleDateString()}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(card)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-destructive focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col justify-between gap-4">
          <div className="space-y-4">
            {card.cardImageFront || card.cardImageBack ? (
                <Dialog>
                    <DialogTrigger asChild>
                        <Image
                            src={card.cardImageFront || card.cardImageBack!}
                            alt="Credit Card Image"
                            width={300}
                            height={180}
                            className="rounded-lg object-cover aspect-[1.586] w-full cursor-pointer"
                        />
                    </DialogTrigger>
                    <DialogContent className="p-0 border-0 bg-transparent shadow-none max-w-fit">
                        <DialogHeader>
                          <DialogTitle className="sr-only">Full-size Card Image</DialogTitle>
                        </DialogHeader>
                        <Carousel className="w-full max-w-4xl">
                            <CarouselContent>
                                {card.cardImageFront && (
                                <CarouselItem>
                                    <Image
                                    src={card.cardImageFront}
                                    alt="Credit Card Front"
                                    width={800}
                                    height={500}
                                    className="rounded-lg object-contain"
                                    />
                                </CarouselItem>
                                )}
                                {card.cardImageBack && (
                                <CarouselItem>
                                    <Image
                                    src={card.cardImageBack}
                                    alt="Credit Card Back"
                                    width={800}
                                    height={500}
                                    className="rounded-lg object-contain"
                                    />
                                </CarouselItem>
                                )}
                            </CarouselContent>
                            {(card.cardImageFront && card.cardImageBack) && (
                                <>
                                <CarouselPrevious />
                                <CarouselNext />
                                </>
                            )}
                        </Carousel>
                    </DialogContent>
                </Dialog>
            ) : (
                <div className="aspect-[1.586] w-full rounded-lg bg-muted flex items-center justify-center">
                    <GenericCardLogo className="h-16 w-16 text-muted-foreground" />
                </div>
            )}
            <div className="flex items-center justify-between">
                <p className="font-mono text-sm tracking-wider">**** **** **** {card.cardNumber.slice(-4)}</p>
                <p className="text-xs text-muted-foreground">Expires {card.expiryDate}</p>
            </div>
             <div className="space-y-1 text-sm pt-2 border-t">
                <div className="flex justify-between pt-2">
                    <span className="text-muted-foreground">Available Limit</span>
                    <span>{formatCurrency(availableLimit)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Limit</span>
                    <span>{formatCurrency(card.cardLimit)}</span>
                </div>
            </div>
          </div>
          <div className="flex items-end justify-between">
            <Badge variant={status === 'paid' ? 'default' : 'outline'}
                className={cn({
                    'bg-accent text-accent-foreground': status === 'paid',
                    'bg-destructive text-destructive-foreground': status === 'unpaid',
                    'bg-orange-400 text-white border-orange-400': status === 'partially-paid',
                })}>
                {statusText[status]}
            </Badge>
            <div className="text-right">
                <p className="text-lg font-semibold">{formatCurrency(remainingAmount)}</p>
                <p className="text-xs text-muted-foreground">Remaining of {formatCurrency(card.billAmount)}</p>
            </div>
          </div>
        </CardContent>
        {status !== 'paid' && (
            <CardFooter>
                 <Button className="w-full" onClick={() => setIsPaymentFormOpen(true)}>
                    <Banknote className="mr-2 h-4 w-4" />
                    Record Payment
                </Button>
            </CardFooter>
        )}
        <Collapsible open={isHistoryOpen} onOpenChange={setIsHistoryOpen} className="border-t">
          <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-center gap-2 text-sm rounded-t-none">
                  Payment History
                  <ChevronDown className={cn("h-4 w-4 transition-transform", isHistoryOpen && "rotate-180")} />
              </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="px-6 pb-4">
              <PaymentHistory card={card} />
          </CollapsibleContent>
        </Collapsible>
      </Card>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={handleDialogChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitleComponent>Delete {card.cardType} ending in {card.cardNumber.slice(-4)}?</AlertDialogTitleComponent>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this credit card. To confirm, please type <strong>DELETE</strong> below.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="delete-confirm" className="sr-only">Type DELETE to confirm</Label>
            <Input
                id="delete-confirm"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="DELETE"
                autoComplete="off"
                autoFocus
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleteConfirmation !== 'DELETE'} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {isPaymentFormOpen && (
        <PaymentForm
            isOpen={isPaymentFormOpen}
            onClose={handlePaymentFormClose}
            card={card}
        />
      )}
    </>
  );
};

export default CreditCardItem;
