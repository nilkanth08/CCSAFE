"use client";

import { useState, useEffect, useCallback } from "react";
import type { CreditCard, Payment } from "@/lib/types";

const STORE_KEY = "credit-cards";

const migrateCard = (card: any): CreditCard => {
  const migratedCard: any = { ...card };

  if (migratedCard.payments === undefined && typeof migratedCard.paidAmount === 'number') {
    const payments: Payment[] = [];
    if (migratedCard.paidAmount > 0) {
      payments.push({
        id: new Date().toISOString() + '-migrated',
        amount: migratedCard.paidAmount,
        date: migratedCard.dueDate,
      });
    }
    migratedCard.payments = payments;
  }

  if (migratedCard.cardImage) {
    migratedCard.cardImageFront = migratedCard.cardImage;
  }

  delete migratedCard.paidAmount;
  delete migratedCard.cardImage;

  return {
    id: migratedCard.id,
    cardholderName: migratedCard.cardholderName,
    bankName: migratedCard.bankName || '',
    mobileNumber: migratedCard.mobileNumber || '',
    cardType: migratedCard.cardType,
    cardNumber: migratedCard.cardNumber,
    expiryDate: migratedCard.expiryDate,
    cvv: migratedCard.cvv,
    billAmount: migratedCard.billAmount,
    payments: migratedCard.payments || [],
    billDate: migratedCard.billDate || migratedCard.dueDate,
    dueDate: migratedCard.dueDate,
    cardImageFront: migratedCard.cardImageFront,
    cardImageBack: migratedCard.cardImageBack,
    cardPin: migratedCard.cardPin,
    birthDate: migratedCard.birthDate,
    appPin: migratedCard.appPin,
    ifscCode: migratedCard.ifscCode,
    statementPassword: migratedCard.statementPassword,
    cardLimit: migratedCard.cardLimit ?? 0,
    cardVariant: migratedCard.cardVariant,
  };
};


export const useCardStore = () => {
  const [cards, setCards] = useState<CreditCard[]>([]);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(STORE_KEY);
      if (item) {
        const parsedCards = JSON.parse(item);
        const migratedCards = parsedCards.map(migrateCard);
        setCards(migratedCards);
      }
    } catch (error) {
      console.error("Failed to parse cards from localStorage", error);
      setCards([]);
    }
  }, []);

  const saveCards = (updatedCards: CreditCard[]) => {
    try {
      setCards(updatedCards);
      window.localStorage.setItem(STORE_KEY, JSON.stringify(updatedCards));
    } catch (error) {
      console.error("Failed to save cards to localStorage", error);
    }
  };

  const addCard = useCallback((card: Omit<CreditCard, 'id' | 'payments'>) => {
    const newCard: CreditCard = { ...card, id: new Date().toISOString(), payments: [] };
    saveCards([...cards, newCard]);
  }, [cards]);

  const bulkAddCards = useCallback((newCards: Omit<CreditCard, 'id' | 'payments'>[]) => {
    const cardsToAdd = newCards.map(card => ({
        ...card,
        id: `${new Date().toISOString()}-${Math.random()}`,
        payments: []
    }));
    saveCards([...cards, ...cardsToAdd]);
  }, [cards]);

  const updateCard = useCallback((updatedCard: CreditCard) => {
    const updatedCards = cards.map((card) =>
      card.id === updatedCard.id ? updatedCard : card
    );
    saveCards(updatedCards);
  }, [cards]);

  const deleteCard = useCallback((cardId: string) => {
    const updatedCards = cards.filter((card) => card.id !== cardId);
    saveCards(updatedCards);
  }, [cards]);

  return { cards, addCard, updateCard, deleteCard, bulkAddCards };
};
