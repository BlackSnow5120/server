import { connectToDatabase } from '../../../lib/mongodb';
import CartItem from '../../../models/CartItem';
const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://powerhouse-e955.vercel.app'); // Update with your front-end URL
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
};

const handleCartRequest = async (req, res) => {
  setCorsHeaders(res); // Set CORS headers
  await connectToDatabase();

  if (req.method === 'GET') {
    const { userID } = req.query;

    try {
      const items = await CartItem.find({ userID });
      res.status(200).json(items);
    } catch {
      res.status(500).send('Server Error');
    }
  }

  if (req.method === 'POST') {
    const { itemID, itemQty, userID } = req.body;

    try {
      const existingItem = await CartItem.findOne({ userID, itemID });

      if (existingItem) {
        existingItem.itemQty += itemQty;
        await existingItem.save();
      } else {
        const newItem = new CartItem({ userID, itemID, itemQty });
        await newItem.save();
      }

      res.status(200).json({ message: 'Cart updated successfully' });
    } catch {
      res.status(500).send('Server Error');
    }
  }

  if (req.method === 'DELETE') {
    const { cartId } = req.query;

    try {
      const deletedItem = await CartItem.findOneAndDelete({ _id: cartId });

      if (!deletedItem) {
        return res.status(404).json({ message: 'Item not found in cart' });
      }

      res.status(200).json({ message: 'Item deleted successfully' });
    } catch {
      res.status(500).send('Server Error');
    }
  }
};

export default handleCartRequest;
