import { CookieValueTypes } from 'cookies-next';
import { JwtPayload } from 'jsonwebtoken';

export const BASE_URL = 'https://trucking-yang.itstomlie.my.id';
// export const BASE_URL = 'http://localhost:3000';


export const redirectToLogin = {
  redirect: {
    permanent: false,
    destination: `/login`,
  },
};

export enum TransactionType {
  TRUCK_TRANSACTION = 'TRUCK_TRANSACTION',
  TRUCK_ADDITIONAL_TRANSACTION = 'TRUCK_ADDITIONAL_TRANSACTION',
  ADDITIONAL_TRANSACTION = 'ADDITIONAL_TRANSACTION',
}

export interface Customer {
  id: string;
  initial: string;
  name?: string;
  address?: string;
}

export interface Truck {
  id: string;
  name: string;
  licenseNumber?: string;
}

export interface Transaction {
  id: string;
  date: Date | string;
  details?: string;
  cost: number;
  transactionType: TransactionType;
  editableByUserUntil: Date;
}

export interface TruckTransaction extends Transaction {
  truckId: string;
  truckName?: string;
  containerNo: string;
  invoiceNo: string;
  destination: string;
  sellingPrice: number;
  pph: number;
  income?: number;
  customer: string;
  bon: string;
  isPrintedBon: boolean;
  isPrintedInvoice: boolean;
}

export interface AdditionalTruckTransaction extends Transaction {
  truckId: string;
}

export type DataTableTransaction = Omit<Transaction, 'transactionType'>;

export type DataTableAdditionalTransaction = Omit<
  AdditionalTruckTransaction,
  'transactionType'
> & {
  no: number;
};

export type DataTableTruckTransaction = Omit<
  TruckTransaction,
  'transactionType'
> & {
  no: number;
};
export type TruckTransactionPayload = Omit<
  TruckTransaction,
  'id' | 'customer'
> & {
  customer: {
    customerId: string;
    initial: string;
  };
};

export type EditTruckTransactionPayload = Omit<TruckTransaction, 'customer'> & {
  customer: {
    customerId: string;
    initial: string;
  };
};

export type UITruckTransaction = TruckTransaction & { selected: boolean };

export interface FilterTransactionsQuery {
  customer: string;
  startDate?: string;
  endDate?: string;
  containerNo?: string;
  invoiceNo?: string;
  destination?: string;
}

export interface TransactionSummaryQuery {
  access_token: CookieValueTypes;
  startDate: Date;
  endDate: Date;
}

export interface TransactionSummary {
  [truckName: string]: {
    truckId: string;
    cost: number;
    additionalCost: number;
    sellingPrice: number;
    margin: number;
    truckTransactionList: TruckTransaction[]; 
  };
}

export interface TotalSummary {
  totalAdditionalCost: number;
  totalTripCost: number;
  totalTripSellingPrice: number;
  totalMargin: number;
}

export interface User {
  id: string;
  username: string;
  password: string;
  email?: string;
  role: string;
  phoneNumber?: string;
}

export interface UserTokenPayload extends JwtPayload {
  access_token: CookieValueTypes;
  id: string;
  username: string;
  role: string;
}

export interface DateQuery {
  startDate: Date;
  endDate: Date;
}

export interface CustomerIdQuery extends DateQuery {
  customerId: string;
}

export interface TruckIdQuery extends DateQuery {
  truckId: string;
}