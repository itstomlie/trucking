import {
  EditTruckTransactionPayload,
  TransactionType,
  TruckTransaction,
  TruckTransactionPayload,
  AdditionalTruckTransaction,
  TransactionSummaryQuery,
  FilterTransactionsQuery,
  Transaction,
} from '../../types/common';
import { TransactionModel } from './transaction.model';
import { Document } from 'mongoose';
import _ from 'lodash';
import { CustomerModel } from '../customer/customer.model';

const convertDocumentToObject = <T>(document: Document) =>
  document.toObject({ getters: true }) as T;

const mapTruckTransaction = (document: Document) => {
  const truckTransaction = document.toObject({
    getters: true,
  }) as TruckTransaction;
  truckTransaction.customer = _.get(truckTransaction, 'customer.initial');
  return truckTransaction;
};

const getTruckTransactions = async () => {
  const documents = await TransactionModel.find({
    transactionType: TransactionType.TRUCK_TRANSACTION,
  }).sort({ date: -1 });
  const truckTransactions = documents.map((doc) =>
    convertDocumentToObject<TruckTransaction>(doc)
  );
  return truckTransactions;
};

const getAllTransactions = async ({
  startDate,
  endDate,
}: TransactionSummaryQuery) => {
  const startDateISO = new Date(startDate);
  const endDateISO = new Date(endDate);
  const documents = await TransactionModel.find({
    date: {
      $gte: startDateISO,
      $lte: endDateISO,
    },
  });
  const allTransactions = documents.map((doc) =>
    convertDocumentToObject<TruckTransaction>(doc)
  );

  return allTransactions;
};

const getTransactions = async ({
  startDate,
  endDate,
}: TransactionSummaryQuery) => {
  const documents = await TransactionModel.find({
    date: {
      $gte: startDate,
      $lte: endDate,
    },
    transactionType: TransactionType.ADDITIONAL_TRANSACTION,
  }).sort({ date: -1 });
  const transactions = documents.map((doc) =>
    convertDocumentToObject<TruckTransaction>(doc)
  );

  return transactions;
};

const getTruckTransactionsByCustomerId = async (
  customerId: string,
  startDate: Date,
  endDate: Date
) => {
  const documents = await TransactionModel.find({
    date: {
      $gte: startDate,
      $lte: endDate,
    },
    'customer.customerId': customerId,
    transactionType: TransactionType.TRUCK_TRANSACTION,
  }).sort({ date: -1 });
  const truckTransactions = documents.map((doc) => mapTruckTransaction(doc));
  
  return truckTransactions;
};

const getTruckTransactionsByTruckId = async (
  truckId: string,
  startDate: Date,
  endDate: Date
) => {
  const documents = await TransactionModel.find({
    date: {
      $gte: startDate,
      $lte: endDate,
    },
    truckId,
    transactionType: TransactionType.TRUCK_TRANSACTION,
  }).sort({ date: -1 });
  const truckTransactions = documents.map((doc) => mapTruckTransaction(doc));
  return truckTransactions;
};

const getAdditionalTruckTransactionsByTruckId = async (
  truckId: string,
  startDate: Date,
  endDate: Date
) => {
  const documents = await TransactionModel.find({
    date: {
      $gte: startDate,
      $lte: endDate,
    },
    truckId,
    transactionType: TransactionType.TRUCK_ADDITIONAL_TRANSACTION,
  }).sort({ date: -1 });
  const truckTransactions = documents.map((doc) => mapTruckTransaction(doc));
  return truckTransactions;
};

const createTruckTransaction = async (
  truckTransactionPayload: TruckTransactionPayload
) => {
  const document = await TransactionModel.create(truckTransactionPayload);
  const truckTransaction = convertDocumentToObject<TruckTransaction>(document);
  return truckTransaction;
};

const createTransaction = async (transactionPayload: Transaction) => {
  const document = await TransactionModel.create(transactionPayload);
  const transaction = convertDocumentToObject<Transaction>(document);
  return transaction;
};

const createAdditionalTruckTransaction = async (
  transactionPayload: AdditionalTruckTransaction
) => {
  const document = await TransactionModel.create(transactionPayload);
  const transaction =
    convertDocumentToObject<AdditionalTruckTransaction>(document);
  return transaction;
};

const editTruckTransaction = async (
  editTruckTransactionPayload: EditTruckTransactionPayload
) => {
  const document = await TransactionModel.findOneAndUpdate(
    { _id: editTruckTransactionPayload.id },
    editTruckTransactionPayload
  );
  const truckTransaction = convertDocumentToObject<TruckTransaction>(document);
  return truckTransaction;
};

const editTransaction = async (editTransactionPayload: Transaction) => {
  const document = await TransactionModel.findOneAndUpdate(
    { _id: editTransactionPayload.id },
    editTransactionPayload
  );
  const transaction = convertDocumentToObject<Transaction>(document);
  return transaction;
};

const deleteTransaction = async (transactionId: string) => {
  const document = await TransactionModel.findOneAndDelete({
    _id: transactionId,
  });
  const transaction = convertDocumentToObject<Transaction>(document);
  return transaction;
};

const editAdditionalTruckTransaction = async (
  editAdditionalTruckTransactionPayload: AdditionalTruckTransaction
) => {
  const document = await TransactionModel.findOneAndUpdate(
    { _id: editAdditionalTruckTransactionPayload.id },
    editAdditionalTruckTransactionPayload
  );
  const truckTransaction = convertDocumentToObject<TruckTransaction>(document);
  return truckTransaction;
};

const getTruckTransactionAutoComplete = async (): Promise<
  Record<string, string[]>
> => {
  const fields = ['destination', 'bon'];
  const [destinations, bon] = await Promise.all(
    fields.map((field) =>
      TransactionModel.distinct(field, {
        type: TransactionType.TRUCK_TRANSACTION,
      })
    )
  );

  const customers = (await CustomerModel.find({})).map((c) => c.initial);

  const result = {
    destination: destinations.filter((_) => _),
    bon: bon.filter((_) => _),
    customer: customers.filter((_) => _),
  };

  return result;
};

const printTransaction = async (transactionIds: string[]) => {
  const documents = await TransactionModel.find({
    _id: { $in: transactionIds },
  });

  const truckTransactions = documents.map((doc) => mapTruckTransaction(doc));
  return truckTransactions;
};

const filterTruckTransactions = async (query: FilterTransactionsQuery) => {
  // TODO
};

const updatePrintStatus = async (transactionIds: string[], type: string) => {
  let option = {};
  if (type === 'bon') {
    option = { isPrintedBon: true };
  } else {
    option = { isPrintedInvoice: true };
  }

  const response = await TransactionModel.updateMany(
    { _id: { $in: transactionIds } },
    option
  );
  return response;
};

const updateLunasStatus = async (
  transactionIds: string[],
  isLunas: boolean
) => {
  const response = await TransactionModel.updateMany(
    { _id: { $in: transactionIds } },
    { isLunas }
  );
  return response;
};

const transactionRepository = {
  createAdditionalTruckTransaction,
  getTruckTransactions,
  getAllTransactions,
  getTransactions,
  deleteTransaction,
  getTruckTransactionsByCustomerId,
  getTruckTransactionsByTruckId,
  getAdditionalTruckTransactionsByTruckId,
  createTruckTransaction,
  editTruckTransaction,
  editAdditionalTruckTransaction,
  getTruckTransactionAutoComplete,
  printTransaction,
  filterTruckTransactions,
  createTransaction,
  editTransaction,
  updatePrintStatus,
  updateLunasStatus,
};

export default transactionRepository;
