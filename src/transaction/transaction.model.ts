import mongoose, { Schema } from 'mongoose';
import { TransactionType } from '../../types/common';

const customerTransactionSchema = new Schema(
  {
    customerId: {
      type: String,
    },
    initial: {
      type: String,
    },
  },
  { _id: false, versionKey: false }
);

const transactionSchema = new Schema<any>(
  {
    date: {
      type: Date,
      required: true,
      default: new Date(),
    },
    details: {
      type: String,
    },
    bon: {
      type: String,
    },
    cost: {
      type: Number,
      required: true,
    },
    transactionType: {
      type: String,
      enum: Object.values(TransactionType),
      required: true,
    },
    containerNo: {
      type: String,
    },
    invoiceNo: {
      type: String,
    },
    destination: {
      type: String,
      trim: true,
    },
    sellingPrice: {
      type: Number,
    },
    pph: {
      type: Number,
    },
    income: {
      type: Number,
    },
    customer: {
      type: customerTransactionSchema,
    },
    truckId: {
      type: String,
    },
    isPrintedBon: {
      type: Boolean,
    },
    isPrintedInvoice: {
      type: Boolean,
    },
    isLunas: {
      type: Boolean,
    },
    editableByUserUntil:{
      type: Date
    }
  },
  { versionKey: false }
);

export const TransactionModel =
  mongoose.models.transaction ||
  mongoose.model<any>('transaction', transactionSchema);
