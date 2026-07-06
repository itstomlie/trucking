import { NextApiRequest, NextApiResponse } from 'next';
import connectDb from '../../../src/mongodb/connection';
import transactionService from '../../../src/transaction/transaction.service';
import _ from 'lodash';

interface LunasAPIRequest extends NextApiRequest {
  body: {
    transactionIds: string[];
    isLunas: boolean;
  };
}

export default async function handler(
  req: LunasAPIRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case 'POST':
      try {
        await connectDb();
        const { transactionIds, isLunas } = req.body;
        await transactionService.updateLunasStatus(transactionIds, isLunas);
        res.status(200).json({ message: 'Lunas status updated' });
      } catch (err) {
        res.status(500).json({ message: _.get(err, 'message') });
      }
      break;
    default:
      res.status(405).json({ message: 'Method not allowed' });
  }
}
