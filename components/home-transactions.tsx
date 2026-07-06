import {
  DataTableTruckTransaction,
  TransactionType,
  UITruckTransaction,
} from '../types/common';
import React, { useEffect, useState } from 'react';
import authorizeUser from '../helpers/auth';
import { formatRupiah } from '../helpers/hbsHelpers';

interface DataTableProperties {
  headers: Record<string, string>;
  data: DataTableTruckTransaction[];
  hiddenFields?: string[];
}

function buildTransactionRow(
  obj: DataTableTruckTransaction,
  hiddenFields?: string[]
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
        let rowValue = val;

        if (['sellingPrice', 'cost', 'income'].includes(key)) {
          rowValue = Math.round(Number(val)).toLocaleString().replace(/,/g, '.');
        }

        if ('customer'.includes(key)) {
          rowValue = val.initial;
        } else {
          rowValue = val.toString();
        }
        return (
          <td className={`p-2 text-center`} key={`td-${obj.id}-${i}`}>
            {rowValue}
          </td>
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

export default function HomeTransactionDataTable({
  headers,
  data,
  hiddenFields,
}: DataTableProperties) {
  const user = authorizeUser();
  const [truckTransactions, setTruckTransactions] = useState(
    prepareTruckTransactions(data)
  );

  useEffect(() => {
    setTruckTransactions(prepareTruckTransactions(data));
  }, [data]);

  const totalCost = data.reduce((acc, obj) => acc + obj.cost, 0);
  const totalSell = data.reduce(
    (acc, obj) => acc + (obj.income ? obj.income : obj.sellingPrice),
    0
  );

  if (truckTransactions.length == 0) {
    return <h1 className="text-3xl text-center mt-10">Tidak ada Transaksi</h1>;
  }

  return (
    <div className='overflow-x-auto'>
      <table className="bg-white mx-3 rounded-md w-[87.5vw]">
        <thead className="whitespace-nowrap">
          {Object.entries(headers).map(([header], index) => (
            <th
              key={index}
              className={`px-3 text-center`}
            >
              {header}
            </th>
          ))}
        </thead>
        <tbody className="divide-y">
          {data.map((truckTransaction, index) => {
            return (
              <tr key={`tr-${index}`} className={`hover:bg-gray-100`}>
                {buildTransactionRow(truckTransaction, hiddenFields)}
              </tr>
            );
          })}
          <tr>
            {new Array(6).fill('').map((_, i) => (
              <td key={`c${i}`}></td>
            ))}

            {data.length > 0 && (
              <>
                <td className="text-center font-bold whitespace-nowrap py-2">
                  {formatRupiah(totalCost)}
                </td>
                {totalSell !== 0 && user.role !== 'user' && (
                  <td className="text-center font-bold whitespace-nowrap py-2">
                    {formatRupiah(totalSell)}
                  </td>
                )}
              </>
            )}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
