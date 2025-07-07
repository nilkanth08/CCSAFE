
"use client";

import type { CreditCard, Payment } from "./types";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { getCardStatus, CardStatus, formatCurrency } from "./utils";
import { format } from 'date-fns';

export const exportToPdf = (cards: CreditCard[]) => {
  const doc = new jsPDF();
  doc.text("Credit Card Summary Report", 14, 16);

  const summaryHead = [
    [
      "Cardholder",
      "Bank",
      "Type",
      "Number",
      "Limit",
      "Bill Amt",
      "Paid",
      "Due Amt",
      "Due Date",
      "Status",
    ],
  ];

  const summaryBody = cards.map((card) => {
    const paidAmount = card.payments.reduce((sum, p) => sum + p.amount, 0);
    const remainingAmount = card.billAmount - paidAmount;
    const status = getCardStatus(card);
    return [
      card.cardholderName,
      card.bankName,
      `${card.cardType} ${card.cardVariant ? '('+card.cardVariant+')': ''}`,
      `...${card.cardNumber.slice(-4)}`,
      formatCurrency(card.cardLimit),
      formatCurrency(card.billAmount),
      formatCurrency(paidAmount),
      formatCurrency(remainingAmount),
      format(new Date(card.dueDate), "PPP"),
      status,
    ];
  });

  autoTable(doc, {
    head: summaryHead,
    body: summaryBody,
    startY: 20,
    styles: { fontSize: 7 },
    headStyles: { fillColor: [41, 128, 185] }
  });

  cards.forEach((card) => {
    if (card.payments.length > 0) {
      const lastTable = (doc as any).lastAutoTable;
      let startY = lastTable.finalY + 10;
      if (startY > 260) {
          doc.addPage();
          startY = 20;
      }
      
      doc.text(`Payment History for ${card.cardholderName} (...${card.cardNumber.slice(-4)})`, 14, startY);
      
      const paymentHead = [["Payment Date", "Note", "Amount"]];
      const paymentBody = card.payments.map((p) => [
        format(new Date(p.date), "PPP"),
        p.note || "-",
        formatCurrency(p.amount),
      ]);

      autoTable(doc, {
        head: paymentHead,
        body: paymentBody,
        startY: startY + 4,
        theme: "grid",
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] }
      });
    }
  });

  doc.save("card_report.pdf");
};


export const exportToExcel = (cards: CreditCard[]) => {
    const wb = XLSX.utils.book_new();

    const summaryData = cards.map(card => {
        const paidAmount = card.payments.reduce((sum, p) => sum + p.amount, 0);
        const remainingAmount = card.billAmount - paidAmount;
        const availableLimit = card.cardLimit - remainingAmount;
        return {
            'cardholderName': card.cardholderName,
            'bankName': card.bankName,
            'mobileNumber': card.mobileNumber,
            'cardType': card.cardType,
            'cardVariant': card.cardVariant,
            'cardNumber': `'${card.cardNumber}`, // Prepend with ' to treat as text
            'expiryDate': card.expiryDate,
            'cvv': card.cvv,
            'cardPin': card.cardPin,
            'appPin': card.appPin,
            'birthDate': card.birthDate ? format(new Date(card.birthDate), "yyyy-MM-dd") : '',
            'ifscCode': card.ifscCode,
            'statementPassword': card.statementPassword,
            'cardLimit': card.cardLimit,
            'availableLimit': availableLimit,
            'billAmount': card.billAmount,
            'paidAmount': paidAmount,
            'dueAmount': remainingAmount,
            'billDate': format(new Date(card.billDate), "yyyy-MM-dd"),
            'dueDate': format(new Date(card.dueDate), "yyyy-MM-dd"),
            'status': getCardStatus(card)
        };
    });

    const summaryWs = XLSX.utils.json_to_sheet(summaryData, {header: [
        'cardholderName', 'bankName', 'mobileNumber', 'cardType', 'cardVariant', 'cardNumber', 'expiryDate', 'cvv',
        'cardLimit', 'availableLimit', 'billAmount', 'paidAmount', 'dueAmount', 'billDate', 'dueDate', 'status',
        'ifscCode', 'statementPassword', 'cardPin', 'appPin', 'birthDate'
    ]});
    XLSX.utils.book_append_sheet(wb, summaryWs, "Cards Summary");

    cards.forEach(card => {
        if (card.payments.length > 0) {
            const paymentData = card.payments.map(p => ({
                'Date': format(new Date(p.date), "yyyy-MM-dd"),
                'Amount': p.amount,
                'Note': p.note
            }));
            const paymentWs = XLSX.utils.json_to_sheet(paymentData);
            const safeSheetName = `${card.cardholderName.slice(0,15)}_${card.cardNumber.slice(-4)}`.replace(/[\\/?*[\]]/g, '').slice(0, 31);
            XLSX.utils.book_append_sheet(wb, paymentWs, safeSheetName);
        }
    });

    XLSX.writeFile(wb, 'card_report.xlsx');
};
