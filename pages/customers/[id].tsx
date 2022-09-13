import Head from 'next/head';
import { InferGetServerSidePropsType } from 'next';
import truckTransactionBloc from '../../lib/truckTransaction';
import {
  Customer,
  DataTableTruckTransaction,
  redirectToLogin,
  TruckTransaction,
} from '../../types/common';
import TruckTransactionDataTable from '../../components/truck-transaction-data-table';
import customerBloc from '../../lib/customer';
import { useEffect, useState } from 'react';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import * as jwt from 'jsonwebtoken';
import { getCookie } from 'cookies-next';
import authorizeUser from '../../helpers/auth';
import { useRouter } from 'next/router';
import moment from 'moment';

const defaultStartDate = moment().startOf('month').toDate();
const defaultEndDate = moment().endOf('day').toDate();
function getStartDateEndDate(urlQuery: any) {
  const startDateQuery: string = urlQuery.startDate;
  const endDateQuery: string = urlQuery.endDate;

  const startDate = startDateQuery
    ? new Date(startDateQuery)
    : defaultStartDate;
  const endDate = endDateQuery ? new Date(endDateQuery) : defaultEndDate;

  return {
    startDate,
    endDate,
  };
}

export default function CustomerDetails({
  truckTransactions,
  autoCompleteData,
  customer,
  customerId,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const user = authorizeUser();
  const router = useRouter();

  const dataTableHeaders = {
    Tanggal: 'w-1/12',
    'No. Container': 'w-2/12',
    'No. Bon': 'w-1/12',
    Tujuan: 'w-2/12',
    Borongan: 'w-1/12',
    Pembayaran: 'w-1/12',
    EMKL: 'w-1/12',
    Bon: 'w-2/12',
    'Info Tambahan': 'w-1/12',
  };

  if (user.role === 'user') {
    delete dataTableHeaders.Pembayaran;
  }

  const formatTruckTransaction = (
    truckTransaction: TruckTransaction,
    index: number
  ): DataTableTruckTransaction => {
    return {
      no: index,
      id: truckTransaction.id,
      date: new Date(truckTransaction.date).toLocaleDateString('id-ID'),
      containerNo: truckTransaction.containerNo,
      invoiceNo: truckTransaction.invoiceNo,
      destination: truckTransaction.destination,
      cost: truckTransaction.cost,
      sellingPrice: truckTransaction.sellingPrice,
      income: truckTransaction.income
        ? truckTransaction.income
        : truckTransaction.sellingPrice,
      pph: truckTransaction.pph,
      customer: truckTransaction.customer,
      bon: truckTransaction.bon,
      details: truckTransaction.details,
      truckId: truckTransaction.truckId,
      isPrintedBon: truckTransaction.isPrintedBon,
      isPrintedInvoice: truckTransaction.isPrintedInvoice,
      editableByUserUntil: truckTransaction.editableByUserUntil,
    };
  };

  const [truckTransactionsState, setTruckTransactionsState] =
    useState(truckTransactions);

  useEffect(() => {
    setTruckTransactionsState(truckTransactions);
  }, [truckTransactions]);

  const [startDate, setStartDate] = useState(
    getStartDateEndDate(router.query).startDate
  );
  const [endDate, setEndDate] = useState(
    getStartDateEndDate(router.query).endDate
  );

  async function filterByMonth() {
    router.push(
      {
        pathname: router.asPath.split('?')[0],
        query: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      },
      undefined,
      { shallow: true }
    );
    const truckTransactions =
      await truckTransactionBloc.getTruckTransactionsByCustomerId(
        user.access_token,
        customerId,
        startDate,
        endDate
      );

    setTruckTransactionsState(truckTransactions);
  }
  return (
    <>
      <Head>
        <title>Truck Details</title>
      </Head>

      <div className="container p-8 mb-60 flex-col">
        <h1 className="text-center text-7xl mb-5">{customer.initial}</h1>

        <div className="flex w-56 gap-5 mx-3 my-5">
          <DatePicker
            dateFormat="dd/MM/yyyy"
            selected={startDate}
            onChange={(date: Date) =>
              setStartDate(new Date(new Date(date).setHours(0, 0, 0)))
            }
          />
          <span className="text-3xl">-</span>
          <DatePicker
            dateFormat="dd/MM/yyyy"
            selected={endDate}
            onChange={(date: Date) =>
              setEndDate(new Date(new Date(date).setHours(23, 59, 59)))
            }
            minDate={startDate}
          />
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={filterByMonth}
          >
            Filter
          </button>
        </div>

        <TruckTransactionDataTable
          headers={dataTableHeaders}
          data={truckTransactionsState.map((t, i) =>
            formatTruckTransaction(t, i + 1)
          )}
          hiddenFields={[
            'id',
            'truckId',
            'isPrintedBon',
            'isPrintedInvoice',
            'pph',
            'sellingPrice',
            'editableByUserUntil',
            user?.role === 'user' ? 'income' : '',
          ]}
          autoCompleteData={autoCompleteData}
          emkl={true}
          endDate={endDate}
        />
      </div>
    </>
  );
}

export const getServerSideProps = async (context: any) => {
  const access_token = getCookie('access_token', {
    req: context.req,
    res: context.res,
  });

  if (!access_token) return redirectToLogin;

  try {
    jwt.verify(access_token.toString(), process.env.SECRET_KEY);
  } catch (e) {
    return redirectToLogin;
  }

  const customerId: string = context.params.id;
  const { startDate, endDate } = getStartDateEndDate(context.query);

  const customer: Customer = await customerBloc.getCustomerByCustomerId(
    customerId
  );
  const truckTransactions =
    await truckTransactionBloc.getTruckTransactionsByCustomerId(
      access_token,
      customerId,
      startDate,
      endDate
    );
  const autoCompleteData =
    await truckTransactionBloc.getTruckTransactionAutoComplete();

  return {
    props: { truckTransactions, autoCompleteData, customer, customerId },
  };
};
