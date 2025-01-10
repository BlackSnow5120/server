import { connectToDatabase } from '../../../lib/mongodb';
import Payment from '../../../models/Payment';
import CartItem from '../../../models/CartItem';

export default async (req, res) => {
  await connectToDatabase();

  if (req.method === 'POST') {
    const { uid, amount, invoice_no } = req.body;

    try {
      const newPayment = new Payment({
        uid,
        amount,
        invoice_no,
        payment_date: new Date(),
      });

      await newPayment.save();
      await CartItem.deleteMany({ userID: uid });

      res.status(200).json({ message: 'Payment created successfully', payment: newPayment });
    } catch (error) {
      res.status(500).send('Server Error');
    }
  }

  if (req.method === 'GET') {
    const { uid } = req.query;

    try {
      const payments = await Payment.find({ uid });
      if (payments.length === 0) {
        return res.status(404).json({ message: 'No payments found for this user' });
      }
      res.json(payments);
    } catch (error) {
      res.status(500).send('Server Error');
    }
  }
};
