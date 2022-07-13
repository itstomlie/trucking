import {
  TruckTransaction,
  TruckTransactionPayload,
  FilterTransactionsQuery,
  AdditionalTruckTransaction,
  TransactionSummaryQuery,
  TransactionSummary,
} from '../../types/common';
import customerRepository from '../customer/customer.repository';
import transactionRepository from './transaction.repository';
import truckRepository from '../truck/truck.repository';

const validateAndModifyPayload = async (
  truckTransactionPayload: Omit<TruckTransaction, 'id'>
) => {
  const customer = await customerRepository.getCustomerByInitial(
    truckTransactionPayload.customer
  );
  if (!customer) {
    throw new Error('Customer tidak terdaftar');
  }
  const modifiedPayload: TruckTransactionPayload = {
    ...truckTransactionPayload,
    customer: {
      customerId: customer.id,
      initial: customer.initial,
    },
  };
  return modifiedPayload;
};

const createTruckTransaction = async (
  truckTransactionPayload: Omit<TruckTransaction, 'id'>
) => {
  const modifiedPayload = await validateAndModifyPayload(
    truckTransactionPayload
  );
  console.log(modifiedPayload, 'modifiedPayload');
  const newTruckTransaction =
    await transactionRepository.createTruckTransaction(modifiedPayload);
  return newTruckTransaction;
};

const createAdditionalTruckTransaction = async (
  transactionPayload: AdditionalTruckTransaction
) => {
  const newTransaction =
    await transactionRepository.createAdditionalTruckTransaction(
      transactionPayload
    );
  return newTransaction;
};

const getTruckTransactions = async () => {
  const transactions = await transactionRepository.getTruckTransactions();
  return transactions;
};

const getGroupedTruckTransactions = async (date: TransactionSummaryQuery) => {
  const transactions = await transactionRepository.getGroupedTruckTransactions(
    date
  );
  const trucks = await truckRepository.getTrucks();

  const summary: TransactionSummary = {};
  for (const transaction of transactions) {
    const truckName = trucks.find((t) => t.id === transaction.truckId)?.name;
    if (!truckName) {
      console.log(`Truck id not found ${transaction.truckId}`);
      continue;
    }

    if (!summary[truckName]) {
      summary[truckName] = {
        cost: transaction.cost,
        sellingPrice: transaction.sellingPrice,
      };
    } else {
      summary[truckName] = {
        cost: summary[truckName].cost + transaction.cost,
        sellingPrice:
          summary[truckName].sellingPrice + transaction.sellingPrice,
      };
    }
  }

  return summary;
};

const getTruckTransactionsByCustomerId = async (customerId: string) => {
  const transactions =
    await transactionRepository.getTruckTransactionsByCustomerId(customerId);
  return transactions;
};

const getTruckTransactionsByTruckId = async (truckId: string) => {
  const transactions =
    await transactionRepository.getTruckTransactionsByTruckId(truckId);
  return transactions;
};

const getMiscTruckTransactionsByTruckId = async (truckId: string) => {
  const transactions =
    await transactionRepository.getMiscTruckTransactionsByTruckId(truckId);
  return transactions;
};

const editTruckTransaction = async (
  editTruckTransactionPayload: TruckTransaction
) => {
  const modifiedPayload = await validateAndModifyPayload(
    editTruckTransactionPayload
  );

  const editTruckTransaction = await transactionRepository.editTruckTransaction(
    { ...modifiedPayload, id: editTruckTransactionPayload.id }
  );
  return editTruckTransaction;
};

const getTruckTransactionAutoComplete = async () => {
  const truckTransactionAutoComplete =
    await transactionRepository.getTruckTransactionAutoComplete();

  return truckTransactionAutoComplete;
};

const printTransaction = async (transactionIds: string[]) => {
  return await transactionRepository.printTransaction(transactionIds);
};

const filterTruckTransactions = async (query: FilterTransactionsQuery) => {
  // TODO
  transactionRepository.filterTruckTransactions(query);
};

const transactionService = {
  createTruckTransaction,
  createAdditionalTruckTransaction,
  getTruckTransactions,
  getGroupedTruckTransactions,
  getTruckTransactionsByCustomerId,
  getTruckTransactionsByTruckId,
  getMiscTruckTransactionsByTruckId,
  editTruckTransaction,
  getTruckTransactionAutoComplete,
  printTransaction,
  filterTruckTransactions,
};

export default transactionService;
