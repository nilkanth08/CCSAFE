"use client";

import React, { useState, useEffect, useMemo } from "react";
import { PlusCircle, Search, FileDown, LayoutGrid, List, Upload } from "lucide-react";
import { addMonths } from "date-fns";

import { Button } from "@/components/ui/button";
import Header from "@/components/header";
import SummaryReport from "@/components/summary-report";
import CreditCardList from "@/components/credit-card-list";
import { CreditCardForm } from "@/components/credit-card-form";
import { ImportCsvDialog } from "@/components/import-csv-dialog";
import { useCardStore } from "@/hooks/use-card-store";
import type { CreditCard } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { getCardStatus, type CardStatus } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportToPdf, exportToExcel } from "@/lib/export";
import withAuth from "@/components/with-auth";

const Home = () => {
  const [isClient, setIsClient] = useState(false);

  const { cards, updateCard } = useCardStore();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    if (!isClient) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueCards = new Set<string>();

    cards.forEach(card => {
        const status = getCardStatus(card);
        if (status !== 'paid') {
            const dueDate = new Date(card.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            if (dueDate <= today) {
                dueCards.add(card.id);
            }
        }
    });

    if (dueCards.size > 0) {
      toast({
          title: "Payment Reminder",
          description: `You have ${dueCards.size} card(s) with payments due or overdue.`,
          variant: "destructive",
      });
    }
  }, [cards, toast, isClient]);

  useEffect(() => {
    if (!isClient) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const cardsToUpdate: CreditCard[] = [];

    cards.forEach(card => {
        const status = getCardStatus(card);
        const billDate = new Date(card.billDate);
        billDate.setHours(0, 0, 0, 0);
        
        if (status === 'paid' && today >= billDate) {
            let futureBillDate = billDate;
            let futureDueDate = new Date(card.dueDate);

            while (today >= futureBillDate) {
                futureBillDate = addMonths(futureBillDate, 1);
                futureDueDate = addMonths(futureDueDate, 1);
            }

            cardsToUpdate.push({
                ...card,
                billDate: futureBillDate.toISOString(),
                dueDate: futureDueDate.toISOString(),
                payments: [],
                billAmount: 0,
            });
        }
    });

    if (cardsToUpdate.length > 0) {
        cardsToUpdate.forEach(c => updateCard(c));
        toast({
            title: "Billing Cycle Updated",
            description: `${cardsToUpdate.length} card(s) have been rolled over to the next cycle. Please update their new bill amounts.`,
        });
    }
  }, [cards, updateCard, toast, isClient]);


  const handleAddCard = () => {
    setEditingCard(undefined);
    setIsFormOpen(true);
  };

  const handleEditCard = (card: CreditCard) => {
    setEditingCard(card);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingCard(undefined);
  };

  const getStatusPriority = (status: CardStatus) => {
    switch (status) {
        case 'unpaid': return 1;
        case 'partially-paid': return 2;
        case 'paid': return 3;
        default: return 4;
    }
  };

  const processedCards = useMemo(() => {
    return cards
      .filter(card => {
        const term = searchTerm.toLowerCase();
        return card.cardholderName.toLowerCase().includes(term) ||
          card.mobileNumber.includes(term) ||
          card.cardNumber.includes(term) ||
          card.bankName.toLowerCase().includes(term) ||
          card.cardType.toLowerCase().includes(term) ||
          (card.cardVariant && card.cardVariant.toLowerCase().includes(term))
      })
      .sort((a, b) => {
        const statusA = getCardStatus(a);
        const statusB = getCardStatus(b);
        const priorityA = getStatusPriority(statusA);
        const priorityB = getStatusPriority(statusB);

        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }

        if (statusA !== 'paid') {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }

        return a.cardholderName.localeCompare(b.cardholderName);
      });
  }, [cards, searchTerm]);

  const handleExportPdf = () => {
    exportToPdf(processedCards);
  };

  const handleExportExcel = () => {
    exportToExcel(processedCards);
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <SummaryReport cards={processedCards} />
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h2 className="text-2xl font-headline font-bold tracking-tight">My Cards</h2>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search by name, bank, number..."
                    className="pl-8 sm:w-[200px] md:w-[300px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="flex items-center gap-1 rounded-md bg-muted p-1">
                <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="sm" className="h-8 w-8 p-0" onClick={() => setViewMode('grid')}>
                    <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="sm" className="h-8 w-8 p-0" onClick={() => setViewMode('list')}>
                    <List className="h-4 w-4" />
                </Button>
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-1.5">
                        <FileDown className="h-4 w-4" />
                        Export
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleExportPdf}>Export as PDF</DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportExcel}>Export as Excel</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={() => setIsImporting(true)} variant="outline" className="gap-1.5">
              <Upload className="h-4 w-4" />
              Import CSV
            </Button>
            <Button onClick={handleAddCard} className="gap-1.5">
              <PlusCircle className="h-4 w-4" />
              Add New Card
            </Button>
          </div>
        </div>
        <CreditCardList cards={processedCards} onEdit={handleEditCard} searchTerm={searchTerm} viewMode={viewMode} />
      </main>
      <CreditCardForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        card={editingCard}
      />
      <ImportCsvDialog
        isOpen={isImporting}
        onClose={() => setIsImporting(false)}
      />
    </div>
  );
}

export default withAuth(Home);
