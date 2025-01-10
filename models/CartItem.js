import mongoose from 'mongoose';
import AutoIncrement from 'mongoose-sequence';

const autoIncrement = AutoIncrement(mongoose);

const cartSchema = new mongoose.Schema({
  userID: { type: String, required: true },
  itemID: { type: String, required: true },
  itemQty: { type: Number, required: true },
  status: { type: Boolean, default: false }, // Add status field with default value false
});

cartSchema.plugin(autoIncrement, { inc_field: 'cid' });

const CartItem = mongoose.models.CartItem || mongoose.model('CartItem', cartSchema);

export default CartItem;
