"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCardStore } from "@/hooks/use-card-store";
import { useToast } from "@/hooks/use-toast";
import type { CreditCard } from "@/lib/types";
import { Loader2, Upload } from "lucide-react";
import * as XLSX from "xlsx";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { z } from "zod";

interface ImportCsvDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

const csvCardSchema = z.object({
    cardholderName: z.string().min(2),
    bankName: z.string().min(2, { message: "Bank name is required." }),
    mobileNumber: z.string().regex(/^\d{10}$/),
    cardType: z.enum(["RUPAY", "VISA", "MASTER", "AMEX"]),
    cardVariant: z.string().optional(),
    cardNumber: z.string().regex(/^\d{16}$/),
    expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/),
    cvv: z.string().regex(/^\d{3,4}$/),
    cardLimit: z.coerce.number().min(0),
    billAmount: z.coerce.number().min(0),
    billDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Invalid date format" }),
    dueDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Invalid date format" }),
    birthDate: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), { message: "Invalid date format" }),
    cardPin: z.string().optional(),
    appPin: z.string().optional(),
    ifscCode: z.string().optional(),
    statementPassword: z.string().optional(),
}).refine((data) => data.cardLimit >= data.billAmount, {
    message: "Card limit cannot be less than the bill amount.",
    path: ["cardLimit"],
});

export function ImportCsvDialog({ isOpen, onClose }: ImportCsvDialogProps) {
    const { bulkAddCards } = useCardStore();
    const { toast } = useToast();
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFile(event.target.files[0]);
            setError(null);
        }
    };

    const handleImport = () => {
        if (!file) {
            setError("Please select a file to import.");
            return;
        }
        setIsProcessing(true);
        setError(null);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: "binary" });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json: any[] = XLSX.utils.sheet_to_json(worksheet);

                const newCards: Omit<CreditCard, 'id' | 'payments'>[] = [];
                const errors: string[] = [];

                json.forEach((row, index) => {
                    const result = csvCardSchema.safeParse(row);
                    if (result.success) {
                        const { billDate, dueDate, birthDate, ...rest } = result.data;
                        newCards.push({
                            ...rest,
                            billDate: new Date(billDate).toISOString(),
                            dueDate: new Date(dueDate).toISOString(),
                            birthDate: birthDate ? new Date(birthDate).toISOString() : undefined,
                        });
                    } else {
                        const errorMessages = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
                        errors.push(`Row ${index + 2}: ${errorMessages}`);
                    }
                });

                if (errors.length > 0) {
                   setError(`Import failed. Please fix the following errors in your CSV and try again:\n${errors.slice(0, 5).join('\n')}`);
                   if (errors.length > 5) {
                       setError(prev => prev + `\n...and ${errors.length - 5} more errors.`);
                   }
                   return;
                }

                if (newCards.length > 0) {
                    bulkAddCards(newCards);
                    toast({
                        title: "Import Successful",
                        description: `${newCards.length} card(s) have been imported successfully.`,
                    });
                    onClose();
                } else {
                    setError("No valid card data found in the file.");
                }

            } catch (err) {
                console.error(err);
                setError("Failed to process the file. Please ensure it's a valid CSV or Excel file.");
            } finally {
                setIsProcessing(false);
            }
        };
        reader.onerror = () => {
            setError("Failed to read the file.");
            setIsProcessing(false);
        };
        reader.readAsBinaryString(file);
    };
    
    const handleClose = () => {
        setFile(null);
        setError(null);
        setIsProcessing(false);
        onClose();
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Import Cards from CSV</DialogTitle>
                    <DialogDescription>
                        Upload a CSV or Excel file to add multiple cards at once. The file must contain the following headers: 
                        <code className="text-xs bg-muted p-1 rounded-sm">cardholderName</code>, <code className="text-xs bg-muted p-1 rounded-sm">bankName</code>, <code className="text-xs bg-muted p-1 rounded-sm">mobileNumber</code>, <code className="text-xs bg-muted p-1 rounded-sm">cardType</code>, <code className="text-xs bg-muted p-1 rounded-sm">cardNumber</code>, <code className="text-xs bg-muted p-1 rounded-sm">expiryDate</code>, <code className="text-xs bg-muted p-1 rounded-sm">cvv</code>, <code className="text-xs bg-muted p-1 rounded-sm">cardLimit</code>, <code className="text-xs bg-muted p-1 rounded-sm">billAmount</code>, <code className="text-xs bg-muted p-1 rounded-sm">billDate</code>, <code className="text-xs bg-muted p-1 rounded-sm">dueDate</code>.
                        All other fields are optional. Dates should be in a valid date format (e.g., YYYY-MM-DD).
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <Input type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" onChange={handleFileChange} />
                    {error && (
                        <Alert variant="destructive">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription className="whitespace-pre-wrap">{error}</AlertDescription>
                        </Alert>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={isProcessing}>Cancel</Button>
                    <Button onClick={handleImport} disabled={!file || isProcessing}>
                        {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                        Import
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
