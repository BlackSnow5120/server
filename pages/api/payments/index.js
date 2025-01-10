import { connectToDatabase } from '../../../lib/mongodb';
import Payment from '../../../models/Payment';
import CartItem from '../../../models/CartItem';

const handlePaymentRequest = async (req, res) => {
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

      // Clear cart items after payment
      await CartItem.deleteMany({ userID: uid });

      return res.status(200).json({ message: 'Payment created successfully', payment: newPayment });
    } catch (error) {
      console.error('Error creating payment:', error);
      return res.status(500).json({ message: 'Server Error', error: error.message });
    }
  }

  if (req.method === 'GET') {
    const { uid } = req.query;

    try {
      const payments = await Payment.find({ uid });

      if (payments.length === 0) {
        return res.status(404).json({ message: 'No payments found for this user' });
      }

      return res.status(200).json(payments);
    } catch (error) {
      console.error('Error fetching payments:', error);
      return res.status(500).json({ message: 'Server Error', error: error.message });
    }
  }

  // Handle unsupported methods
  res.status(405).json({ message: 'Method Not Allowed' });
};

export default handlePaymentRequest;
