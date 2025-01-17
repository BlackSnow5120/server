import { connectToDatabase } from '../../../lib/mongodb';
import CartItem from '../../../models/CartItem';

const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://powerhouse-e955.vercel.app'); // Your frontend URL
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
};

// Handle preflight OPTIONS request
const handleOptionsRequest = (req, res) => {
  if (req.method === 'OPTIONS') {
    res.status(200).end(); // Respond with HTTP 200 OK for OPTIONS preflight request
  }
};

const handleCartRequest = async (req, res) => {
  setCorsHeaders(res); // Set CORS headers for all requests

  if (req.method === 'OPTIONS') {
    return handleOptionsRequest(req, res); // Handle OPTIONS request separately
  }

  await connectToDatabase();

  const { userID } = req.query;

  if (req.method === 'GET') {
    try {
      const items = await CartItem.find({ userID });
      res.status(200).json(items);
    } catch {
      res.status(500).send('Server Error');
    }
  }

  if (req.method === 'POST') {
    const { itemID, itemQty } = req.body;
    console.log(itemID, itemQty);
    try {
      const existingItem = await CartItem.findOne({ userID, itemID });

      if (existingItem) {
        existingItem.itemQty += itemQty;
        await existingItem.save();
        return res.status(200).json({ message: 'Cart updated successfully' });
      } else {
        const newItem = new CartItem({ userID, itemID, itemQty });
        await newItem.save();
        return res.status(201).json({ message: 'Item added to cart' });
      }
    } catch(error) {
      res.status(500).send(error);
    }
  }

  if (req.method === 'PUT') {
    const { itemID, itemQty } = req.body;
    const { cartId } = req.query;

    try {
      const updatedItem = await CartItem.findOneAndUpdate(
        { _id: cartId, userID, itemID },
        { itemQty },
        { new: true }
      );

      if (!updatedItem) {
        return res.status(404).json({ message: 'Item not found in cart' });
      }

      res.status(200).json({ message: 'Cart item updated successfully', item: updatedItem });
    } catch {
      res.status(500).send('Server Error');
    }
  }

  if (req.method === 'DELETE') {
    const { cartId } = req.query;
    try {
      const deletedItem = await CartItem.findOneAndDelete({ _id: mongoose.Types.ObjectId(cartId) });

      if (!deletedItem) {
        return res.status(404).json({ message: 'Item not found in cart' });
      }

      res.status(200).json({ message: 'Item deleted successfully' });
    } catch (error) {
      res.status(500).send('Server Error',error);
    }
  }
};

export default handleCartRequest;
