import { Table } from 'flowbite-react';
import TextInput from './text-input';
import EditTruckTransactionButton from './truck/edit-truck-transaction-button';
import {
  DataTableTruckTransaction,
  TransactionType,
  UITruckTransaction,
  User,
} from '../types/common';
import React, { useEffect, useState } from 'react';
import { PrinterIcon, CheckCircleIcon } from '@heroicons/react/solid';
import truckTransactionBloc from '../lib/truckTransaction';
import DeleteVariousTransactionButton from './delete-various-transaction-button';
import { useToastContext } from '../lib/toast-context';
import authorizeUser from '../helpers/auth';
import { useRouterRefresh } from '../hooks/hooks';
import { formatRupiah } from '../helpers/hbsHelpers';
import transactionBloc from '../lib/transactions';
import moment from 'moment';

interface DataTableProperties {
  headers: Record<string, string>;
  data: DataTableTruckTransaction[];
  hiddenFields?: string[];
  autoCompleteData: Record<string, string[]>;
  emkl?: boolean;
  endDate: Date;
}

function buildTransactionRow(
  obj: DataTableTruckTransaction,
  user: User,
  hiddenFields?: string[],
  emkl?: boolean
) {
  const tableTransaction: Record<string, string | number | Date | boolean> = {
    ...obj,
  };

  if (hiddenFields) {
    for (const field of hiddenFields) {
      delete tableTransaction[field];
    }
  }

  return (
    <>
      {Object.entries(tableTransaction).map(([key, val], i) => {
        let rowValue = val.toString();
        if (['sellingPrice', 'cost', 'income'].includes(key)) {
          rowValue = Math.round(Number(val)).toLocaleString().replace(/,/g, '.');
        }
        return (
          <Table.Cell
            className={`px-0 text-center ${
              emkl && user.role !== 'user' ? 'cursor-pointer' : ''
            }`}
            key={`td-${obj.id}-${i}`}
          >
            {rowValue}
          </Table.Cell>
        );
      })}
    </>
  );
}

function prepareTruckTransactions(
  dataTableTruckTransaction: DataTableTruckTransaction[]
): UITruckTransaction[] {
  return dataTableTruckTransaction.map((t: DataTableTruckTransaction) => {
    return {
      ...t,
      transactionType: TransactionType.TRUCK_TRANSACTION,
      selected: false,
    };
  });
}

export default function TruckTransactionDataTable({
  headers,
  data,
  hiddenFields,
  autoCompleteData,
  emkl = false,
  endDate,
}: DataTableProperties) {
  const user = authorizeUser();
  const refreshData = useRouterRefresh();
  const addToast = useToastContext();
  const [truckTransactions, setTruckTransactions] = useState(
    prepareTruckTransactions(data)
  );
  const [invoiceNum, setInvoiceNum] = useState('');

  useEffect(() => {
    setTruckTransactions(prepareTruckTransactions(data));
  }, [data]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { value } = event.target;

    setInvoiceNum(value);
  }

  async function print(type: string) {
    const markedTransactions = truckTransactions
      .filter((t) => t.selected)
      .map((t) => t.id);

    const customerInitial = truckTransactions.filter((t) => t.selected)[0]
      .customer;

    if (markedTransactions.length < 1) {
      addToast('Mohon pilih transaksi');
      return;
    }

    if (type !== 'bon' && !invoiceNum) {
      addToast('Mohon isi no invoice');
      return;
    }

    addToast('Loading...');

    const response = await truckTransactionBloc.printTransactions(
      invoiceNum,
      customerInitial,
      markedTransactions,
      type,
      endDate
    );

    if (response === 'Print Success') {
      addToast('Print Sukses');
    } else {
      addToast('Mohon coba kembali');
    }
    truckTransactions.forEach((trax) => {
      trax.selected = false;
    });
    setTruckTransactions([...truckTransactions]);
    refreshData();
  }

  async function toggleLunas() {
    const selectedTransactions = truckTransactions.filter((t) => t.selected);
    const markedTransactions = selectedTransactions.map((t) => t.id);

    if (markedTransactions.length < 1) {
      addToast('Mohon pilih transaksi');
      return;
    }

    // smart toggle: if every selected row is already paid, unmark all; else mark all paid
    const isLunas = !selectedTransactions.every((t) => t.isLunas);

    addToast('Loading...');

    const response = await truckTransactionBloc.markAsLunas(
      markedTransactions,
      isLunas
    );

    if (response === 'Success') {
      addToast(isLunas ? 'Ditandai Lunas' : 'Batal Lunas');
    } else {
      addToast('Mohon coba kembali');
    }

    truckTransactions.forEach((trax) => {
      if (trax.selected) {
        trax.isLunas = isLunas;
      }
      trax.selected = false;
    });
    setTruckTransactions([...truckTransactions]);
  }

  const totalCost = data.reduce((acc, obj) => acc + obj.cost, 0);
  const totalSell = data.reduce(
    (acc, obj) => acc + (obj.income ? obj.income : obj.sellingPrice),
    0
  );

  if (truckTransactions.length == 0) {
    return <h1 className="text-3xl text-center mt-10">Tidak ada Transaksi</h1>;
  }

  return (
    <>
      {emkl && user.role !== 'user' && (
        <div className="flex justify-between sticky top-0 z-20 bg-white py-3 border-b border-gray-200">
          <div className="flex gap-3">
            <input
              className="mt-5 ml-6 rounded checked:bg-green-400 checked:border-green-400 focus:ring-green-500 cursor-pointer"
              type="checkbox"
              {...(truckTransactions.every((trax) => trax.selected)
                ? {
                    checked: true,
                  }
                : { checked: false })}
              onClick={
                emkl
                  ? () => {
                      if (truckTransactions.some((trax) => !trax.selected)) {
                        truckTransactions.forEach((trax) => {
                          trax.selected = true;
                        });
                      } else {
                        truckTransactions.forEach((trax) => {
                          trax.selected = !trax.selected;
                        });
                      }

                      setTruckTransactions([...truckTransactions]);
                    }
                  : undefined
              }
            ></input>
            <p className="mt-4">Select all</p>
          </div>

          <div className="flex justify-end gap-5">
            <TextInput
              name="invoiceNum"
              placeholder="No Invoice"
              value={invoiceNum}
              onChange={handleChange}
            />
            <button
              className={`flex my-1 border border-gray-300 rounded shadow-sm px-2 text-gray-600 hover:bg-white`}
              onClick={() => print('tagihan')}
            >
              <PrinterIcon className="h-5 mt-1" />
              <p className={`text-lg font-bold`}>Tagihan</p>
            </button>

            <button
              className={`flex my-1 border border-gray-300 rounded shadow-sm px-2 text-gray-600 hover:bg-white`}
              onClick={() => print('bon')}
            >
              <PrinterIcon className="h-5 mt-1" />
              <p className={`text-lg font-bold`}>Bon</p>
            </button>

            <button
              className={`flex my-1 border border-gray-300 rounded shadow-sm px-2 text-gray-600 hover:bg-white`}
              onClick={toggleLunas}
            >
              <CheckCircleIcon className="h-5 mt-1" />
              <p className={`text-lg font-bold`}>Lunas</p>
            </button>
          </div>
        </div>
      )}

      <Table>
        <Table.Head className="whitespace-nowrap">
          {emkl && user.role !== 'user' && (
            <Table.HeadCell className="text-center">Status</Table.HeadCell>
          )}
          {emkl && <Table.HeadCell className="text-center">No</Table.HeadCell>}

          {Object.entries(headers).map(([header, columnWidth], index) => (
            <Table.HeadCell
              key={index}
              className={`${columnWidth} px-3 text-center`}
            >
              {header}
            </Table.HeadCell>
          ))}
          {user?.role !== 'guest' && <Table.HeadCell>Actions</Table.HeadCell>}
        </Table.Head>
        <Table.Body className="divide-y">
          {data.map((truckTransaction, index) => {
            return (
              <Table.Row
                key={`tr-${index}`}
                className={`${
                  truckTransactions[index]?.selected &&
                  'bg-green-100 hover:bg-green-200'
                } hover:bg-gray-100`}
                onClick={
                  emkl && user.role !== 'user'
                    ? () => {
                        truckTransactions[index].selected =
                          !truckTransactions[index].selected;
                        setTruckTransactions([...truckTransactions]);
                      }
                    : undefined
                }
              >
                {emkl && user.role !== 'user' && (
                  <Table.Cell>
                    <div className="flex gap-3">
                      <input
                        className="mt-5 rounded checked:bg-green-400 checked:border-green-400 focus:ring-green-500"
                        {...(truckTransactions[index]?.selected && {
                          checked: true,
                        })}
                        type="checkbox"
                      ></input>
                      <div>
                        <div
                          className={`my-1 border border-gray-300 rounded px-2 ${
                            truckTransaction.isPrintedBon
                              ? 'bg-green-400 text-gray-100'
                              : 'text-gray-600'
                          }`}
                        >
                          <p className={`text-center font-bold`}>Bon</p>
                        </div>

                        <div
                          className={`my-1 border border-gray-300 rounded px-2 ${
                            truckTransaction.isPrintedInvoice
                              ? 'bg-green-400 text-gray-100'
                              : 'text-gray-600'
                          }`}
                        >
                          <p className={`text-center font-bold`}>Tagihan</p>
                        </div>

                        <div
                          className={`my-1 border border-gray-300 rounded px-2 ${
                            truckTransactions[index]?.isLunas
                              ? 'bg-green-400 text-gray-100'
                              : 'text-gray-600'
                          }`}
                        >
                          <p className={`text-center font-bold`}>Lunas</p>
                        </div>
                      </div>
                    </div>
                  </Table.Cell>
                )}
                {buildTransactionRow(
                  truckTransaction,
                  user,
                  hiddenFields,
                  emkl
                )}
                {truckTransactions[index] && user.role === 'admin' ? (
                  <Table.Cell>
                    <div className="flex flex-row">
                      <EditTruckTransactionButton
                        key={`edit-modal-key${truckTransactions[index]?.id}`}
                        existingTruckTransaction={truckTransactions[index]}
                        autoCompleteData={autoCompleteData}
                        disabled={truckTransactions[index]?.selected}
                      />
                      <DeleteVariousTransactionButton
                        key={`delete-button-${truckTransactions[index]?.id}`}
                        transactionId={truckTransaction.id}
                        disabled={truckTransactions[index]?.selected}
                        transaction={truckTransactions[index]}
                      />
                    </div>
                  </Table.Cell>
                ) : (
                  truckTransactions[index] &&
                  user.role === 'user' &&
                  moment().utcOffset(7, false).valueOf() <
                    new Date(
                      truckTransaction.editableByUserUntil
                    ).getTime() && (
                    <Table.Cell>
                      <div className="flex flex-row">
                        <EditTruckTransactionButton
                          key={`edit-modal-key${truckTransactions[index]?.id}`}
                          existingTruckTransaction={truckTransactions[index]}
                          autoCompleteData={autoCompleteData}
                          disabled={truckTransactions[index]?.selected}
                        />
                        <DeleteVariousTransactionButton
                          key={`delete-button-${truckTransactions[index]?.id}`}
                          transactionId={truckTransaction.id}
                          disabled={truckTransactions[index]?.selected}
                          transaction={truckTransactions[index]}
                        />
                      </div>
                    </Table.Cell>
                  )
                )}
              </Table.Row>
            );
          })}
          <Table.Row>
            {new Array(emkl && user.role !== 'user' ? 6 : 5)
              .fill('')
              .map((_, i) => (
                <Table.Cell key={`c${i}`}></Table.Cell>
              ))}

            {data.length > 0 && (
              <>
                <Table.Cell className="text-center font-bold whitespace-nowrap">
                  {formatRupiah(totalCost)}
                </Table.Cell>
                {totalSell !== 0 && user.role !== 'user' && (
                  <Table.Cell className="text-center font-bold whitespace-nowrap">
                    {formatRupiah(totalSell)}
                  </Table.Cell>
                )}
              </>
            )}
          </Table.Row>
        </Table.Body>
      </Table>
    </>
  );
}