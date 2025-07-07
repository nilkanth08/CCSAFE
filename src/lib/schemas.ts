import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const cardFormSchema = z
  .object({
    cardholderName: z
      .string()
      .min(2, "Name must be at least 2 characters long."),
    bankName: z.string().min(2, "Bank name is required."),
    mobileNumber: z
      .string()
      .regex(/^\d{10}$/, "Mobile number must be exactly 10 digits."),
    cardType: z.enum(["RUPAY", "VISA", "MASTER", "AMEX"], {
      required_error: "You need to select a card type.",
    }),
    cardVariant: z.string().optional().or(z.literal('')),
    cardNumber: z
      .string()
      .regex(/^\d{16}$/, "Card number must be exactly 16 digits."),
    expiryDate: z
      .string()
      .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Must be in MM/YY format."),
    cvv: z.string().regex(/^\d{3,4}$/, "CVV must be 3 or 4 digits."),
    cardLimit: z.coerce.number().min(0, "Card limit must be a positive number."),
    billAmount: z.coerce.number().min(0, "Bill amount cannot be negative."),
    billDate: z.date({
      required_error: "A bill date is required.",
    }),
    dueDate: z.date({
      required_error: "A due date is required.",
    }),
    cardImageFront: z
      .any()
      .optional()
      .refine(
        (files) => !files || files.length === 0 || files?.[0]?.size <= MAX_FILE_SIZE,
        `Max image size is 5MB.`
      )
      .refine(
        (files) => !files || files.length === 0 || ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
        "Only .jpg, .jpeg, .png and .webp formats are supported."
      ),
    cardImageBack: z
      .any()
      .optional()
      .refine(
        (files) => !files || files.length === 0 || files?.[0]?.size <= MAX_FILE_SIZE,
        `Max image size is 5MB.`
      )
      .refine(
        (files) => !files || files.length === 0 || ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
        "Only .jpg, .jpeg, .png and .webp formats are supported."
      ),
    birthDate: z.date().optional(),
    cardPin: z.string().regex(/^\d{4}$/, "PIN must be 4 digits.").optional().or(z.literal('')),
    appPin: z.string().regex(/^\d{4}$/, "PIN must be 4 digits.").optional().or(z.literal('')),
    ifscCode: z.string().optional().or(z.literal('')),
    statementPassword: z.string().optional().or(z.literal('')),
  })
  .refine((data) => data.cardLimit >= data.billAmount, {
    message: "Card limit cannot be less than the bill amount.",
    path: ["cardLimit"],
  });

export type CardFormValues = z.infer<typeof cardFormSchema>;

export const paymentFormSchema = (maxAmount: number) => z.object({
  amount: z.coerce
    .number({ required_error: "Please enter a valid amount.", invalid_type_error: "Please enter a valid amount." })
    .min(0.01, "Amount must be at least 0.01.")
    .max(maxAmount, `Payment cannot exceed remaining balance of ${maxAmount.toFixed(2)}.`),
  note: z.string().min(1, { message: "A note is required for the payment." }),
});

export type PaymentFormValues = z.infer<ReturnType<typeof paymentFormSchema>>;

export const editPaymentFormSchema = z.object({
  amount: z.coerce.number().min(0.01, "Amount must be positive."),
  date: z.date(),
  note: z.string().optional(),
});

export type EditPaymentFormValues = z.infer<typeof editPaymentFormSchema>;
