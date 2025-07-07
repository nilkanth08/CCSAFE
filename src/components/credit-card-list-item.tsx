"use client";

import Image from "next/image";
import { useState } from "react";
import { MoreVertical, Edit, Trash2, Banknote, ChevronDown } from "lucide-react";

import { Card } from "@/components/ui/card";
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

interface CreditCardListItemProps {
  card: CreditCard;
  onEdit: (card: CreditCard) => void;
}

const CreditCardListItem = ({ card, onEdit }: CreditCardListItemProps) => {
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
      <Card>
        <Collapsible open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
          <div className="flex flex-col md:flex-row md:items-center gap-4 p-4">
              <div className="flex items-center gap-4 flex-1">
                  {card.cardImageFront || card.cardImageBack ? (
                      <Dialog>
                          <DialogTrigger asChild>
                              <Image
                                  src={card.cardImageFront || card.cardImageBack!}
                                  alt="Credit Card Image"
                                  width={80}
                                  height={50}
                                  className="rounded-md object-cover aspect-[1.586] cursor-pointer shrink-0"
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
                      <div className="aspect-[1.586] w-[80px] rounded-md bg-muted flex items-center justify-center shrink-0">
                          <GenericCardLogo className="h-8 w-8 text-muted-foreground" />
                      </div>
                  )}
                  <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate" title={card.cardholderName}>{card.cardholderName}</p>
                      <p className="text-sm text-muted-foreground">{card.bankName} &middot; {card.cardType} {card.cardVariant && `(${card.cardVariant})`} &middot; **** {card.cardNumber.slice(-4)}</p>
                  </div>
              </div>

              <div className="flex items-center justify-between md:justify-start gap-4 flex-wrap">
                  <div className="text-left md:text-center w-28 shrink-0">
                       <Badge variant={status === 'paid' ? 'default' : 'outline'}
                          className={cn('text-xs', {
                              'bg-accent text-accent-foreground': status === 'paid',
                              'bg-destructive text-destructive-foreground': status === 'unpaid',
                              'bg-orange-400 text-white border-orange-400': status === 'partially-paid',
                          })}>
                          {statusText[status]}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">Status</p>
                  </div>

                  <div className="text-left md:text-center w-32 shrink-0">
                      <p className="font-semibold">{formatCurrency(remainingAmount)}</p>
                      <p className="text-xs text-muted-foreground">Due of {formatCurrency(card.billAmount)}</p>
                  </div>
                  
                  <div className="text-left md:text-center w-32 shrink-0">
                      <p className="font-semibold">{formatCurrency(availableLimit)}</p>
                      <p className="text-xs text-muted-foreground">of {formatCurrency(card.cardLimit)}</p>
                  </div>

                  <div className="text-left md:text-center w-28 shrink-0">
                      <p className="font-semibold">{new Date(card.billDate).toLocaleDateString()}</p>
                      <p className="text-xs text-muted-foreground">Bill Date</p>
                  </div>

                  <div className="text-left md:text-center w-28 shrink-0">
                      <p className="font-semibold">{new Date(card.dueDate).toLocaleDateString()}</p>
                      <p className="text-xs text-muted-foreground">Due Date</p>
                  </div>
              </div>

              <div className="flex items-center gap-1 ml-auto shrink-0">
                  {status !== 'paid' && (
                       <Button size="sm" onClick={() => setIsPaymentFormOpen(true)}>
                          <Banknote className="mr-2 h-4 w-4" />
                          Pay
                      </Button>
                  )}
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm">
                        History
                        <ChevronDown className={cn("h-4 w-4 transition-transform ml-1", isHistoryOpen && "rotate-180")} />
                    </Button>
                  </CollapsibleTrigger>
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
              </div>
          </div>
          <CollapsibleContent>
            <div className="border-t">
              <div className="px-6 pb-4 pt-4">
                  <PaymentHistory card={card} />
              </div>
            </div>
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

export default CreditCardListItem;
