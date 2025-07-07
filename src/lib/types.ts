export type CardType = "RUPAY" | "VISA" | "MASTER" | "AMEX";

export interface Payment {
  id: string;
  amount: number;
  date: string; // ISO date string
  note?: string;
}

export interface CreditCard {
  id:string;
  cardholderName: string;
  bankName: string;
  mobileNumber: string;
  cardType: CardType;
  cardNumber: string;
  expiryDate: string; // MM/YY
  cvv: string;
  billAmount: number;
  payments: Payment[];
  billDate: string; // ISO date string
  dueDate: string; // ISO date string
  cardImageFront?: string; // base64 string
  cardImageBack?: string; // base64 string
  cardPin?: string;
  birthDate?: string; // ISO date string
  appPin?: string;
  ifscCode?: string;
  statementPassword?: string;
  cardLimit: number;
  cardVariant?: string;
}
