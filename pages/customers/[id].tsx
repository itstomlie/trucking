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
import { useToastContext } from '../../lib/toast-context';

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
  const addToast = useToastContext();

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
      isLunas: truckTransaction.isLunas,
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
    router.push({
      pathname: router.asPath.split('?')[0],
      query: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    });
    // const truckTransactions =
    //   await truckTransactionBloc.getTruckTransactionsByCustomerId(
    //     user.access_token,
    //     customerId,
    //     startDate,
    //     endDate
    //   );
    // setTruckTransactionsState(truckTransactions);

    addToast('Filter Success!');
  }

  const [query, setQuery] = useState('');

  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResizeWindow = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResizeWindow);

    return () => {
      window.removeEventListener('resize', handleResizeWindow);
    };
  }, []);

  return (
    <>
      <Head>
        <title>Truck Details</title>
      </Head>

      <div className="w-full p-5 mb-60 flex-col">
        <h1 className="text-center text-7xl mb-5">{customer.initial}</h1>
        {width >= 1200 ? (
          <div className="bg-white p-5 rounded">
            <div className="grid grid-cols-3 my-5">
              <form className="items-center">
                <div className="relative w-[20vw]">
                  <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                    <svg
                      aria-hidden="true"
                      className="w-5 h-5 text-gray-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </div>
                  <input
                    type="text"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-green-400 focus:border-green-500 block w-full pl-10 p-2.5"
                  placeholder={'No.Container/No.Bon/Tujuan/Bon'}
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    autoFocus
                  />
                </div>
              </form>
              <div className="flex w-56 gap-5 mx-3">
                <DatePicker
                  className="w-32 text-center mx-1 rounded-sm focus:ring-green-400 focus:border-green-500"
                  dateFormat="dd/MM/yyyy"
                  selected={startDate}
                  onChange={(date: Date) =>
                    setStartDate(new Date(new Date(date).setHours(0, 0, 0)))
                  }
                />
                <span className="text-3xl">-</span>
                <DatePicker
                  className="w-32 text-center mx-1 rounded-sm focus:ring-green-400 focus:border-green-500"
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
              <div></div>
            </div>
            <TruckTransactionDataTable
              headers={dataTableHeaders}
              data={truckTransactionsState
                .filter((truckTransaction) => {
                  if (query === '') {
                    return truckTransaction;
                  } else if (
                    truckTransaction.containerNo
                      .toLowerCase()
                      .includes(query.toLowerCase()) ||
                    truckTransaction.invoiceNo
                      .toLowerCase()
                      .includes(query.toLowerCase()) ||
                    truckTransaction.destination
                      .toLowerCase()
                      .includes(query.toLowerCase()) ||
                    truckTransaction.bon
                      .toLowerCase()
                      .includes(query.toLowerCase())
                  ) {
                    return truckTransaction;
                  }
                })
                .map((t, i) => formatTruckTransaction(t, i + 1))}
              hiddenFields={[
                'id',
                'truckId',
                'isPrintedBon',
                'isPrintedInvoice',
                'isLunas',
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
        ) : (
          <div className="bg-white p-5 rounded">
            <div className="flex-col my-5">
              <div className="flex justify-center my-3">
                <div className='flex gap-3'>
                  <DatePicker
                    className="w-32 text-center mx-1 rounded-sm focus:ring-green-400 focus:border-green-500"
                    dateFormat="dd/MM/yyyy"
                    selected={startDate}
                    onChange={(date: Date) =>
                      setStartDate(new Date(new Date(date).setHours(0, 0, 0)))
                    }
                  />
                  <span className="text-3xl">-</span>
                  <DatePicker
                    className="w-32 text-center mx-1 rounded-sm focus:ring-green-400 focus:border-green-500"
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
              </div>
              <form className="flex justify-center items-center">
                <div className="relative w-[44vw]">
                  <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                    <svg
                      aria-hidden="true"
                      className="w-5 h-5 text-gray-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </div>
                  <input
                    type="text"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-green-400 focus:border-green-500 block w-full pl-10 p-2.5"
                    placeholder={'Truk/No.Container/No.Bon/Tujuan/Bon'}
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    autoFocus
                  />
                </div>
              </form>

              <div></div>
            </div>
            <TruckTransactionDataTable
              headers={dataTableHeaders}
              data={truckTransactionsState
                .filter((truckTransaction) => {
                  if (query === '') {
                    return truckTransaction;
                  } else if (
                    truckTransaction.containerNo
                      .toLowerCase()
                      .includes(query.toLowerCase()) ||
                    truckTransaction.invoiceNo
                      .toLowerCase()
                      .includes(query.toLowerCase()) ||
                    truckTransaction.destination
                      .toLowerCase()
                      .includes(query.toLowerCase()) ||
                    truckTransaction.bon
                      .toLowerCase()
                      .includes(query.toLowerCase())
                  ) {
                    return truckTransaction;
                  }
                })
                .map((t, i) => formatTruckTransaction(t, i + 1))}
              hiddenFields={[
                'id',
                'truckId',
                'isPrintedBon',
                'isPrintedInvoice',
                'isLunas',
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
        )}
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
