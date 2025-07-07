"use client";

import CreditCardItem from "./credit-card-item";
import type { CreditCard } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { WalletCards } from "lucide-react";
import CreditCardListItem from "./credit-card-list-item";

interface CreditCardListProps {
  cards: CreditCard[];
  onEdit: (card: CreditCard) => void;
  searchTerm: string;
  viewMode: 'grid' | 'list';
}

const CreditCardList = ({ cards, onEdit, searchTerm, viewMode }: CreditCardListProps) => {

  if (cards.length === 0) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <WalletCards className="h-6 w-6" />
            {searchTerm ? 'No Matching Cards' : 'No Cards Yet'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            {searchTerm 
              ? "No cards match your search. Try a different search term." 
              : `You haven't added any credit cards. Click "Add New Card" to get started.`}
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="flex flex-col gap-4">
        {cards.map((card) => (
          <CreditCardListItem key={card.id} card={card} onEdit={onEdit} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {cards.map((card) => (
        <CreditCardItem key={card.id} card={card} onEdit={onEdit} />
      ))}
    </div>
  );
};

export default CreditCardList;
