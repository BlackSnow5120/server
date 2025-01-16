import mongoose from 'mongoose';
import AutoIncrement from 'mongoose-sequence';

const autoIncrement = AutoIncrement(mongoose);

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobileNumber: { type: String, required: true },
  password: { type: String, required: true },
  address: { type: String, required: true },
  gender: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  role: { type: String, default: 'user' },
  uid: { type: Number, unique: true }
});

// Apply the auto-increment plugin only once
if (mongoose.models.User) {
  userSchema.plugin(autoIncrement, { inc_field: 'uid' });
}

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
