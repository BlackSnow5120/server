import mongoose from 'mongoose';
import AutoIncrement from 'mongoose-sequence';

const autoIncrement = AutoIncrement(mongoose);

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  img: { type: String },
  detail: { type: String, required: true },
  price: { type: Number, required: true },
  delivery: { type: String, required: true },
  qty: { type: Number, required: true },
  show: { type: Number, required: true },
});

itemSchema.plugin(autoIncrement, { inc_field: 'id' });

const Item = mongoose.models.Item || mongoose.model('Item', itemSchema);

export default Item;
