import mongoose from 'mongoose';
import AutoIncrement from 'mongoose-sequence';

const autoIncrement = AutoIncrement(mongoose);

const paymentSchema = new mongoose.Schema({
  uid: { type: String, required: true },
  amount: { type: Number, required: true },
  invoice_no: { type: String, required: true },
  payment_date: { type: Date, default: Date.now },
});

paymentSchema.plugin(autoIncrement, { inc_field: 'pid' });

const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);

export default Payment;
