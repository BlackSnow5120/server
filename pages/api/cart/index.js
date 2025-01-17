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

  const { userID } = req.query;
  
  if (req.method === 'GET') {
    // Fetch the cart items for the user
    try {
      const items = await CartItem.find({ userID });
      res.status(200).json(items);
    } catch {
      res.status(500).send('Server Error');
    }
  }

  if (req.method === 'POST') {
    // Adding a new item or updating existing ones
    const { itemID, itemQty, userID } = req.body;

    try {
      const existingItem = await CartItem.findOne({ userID, itemID });

      if (existingItem) {
        // If the item exists, update its quantity
        existingItem.itemQty += itemQty;
        await existingItem.save();
        return res.status(200).json({ message: 'Cart updated successfully' });
      } else {
        // If the item doesn't exist, add it to the cart
        const newItem = new CartItem({ userID, itemID, itemQty });
        await newItem.save();
        return res.status(201).json({ message: 'Item added to cart' });
      }
    } catch {
      res.status(500).send('Server Error');
    }
  }

  if (req.method === 'PUT') {
    // Updating an item’s quantity in the cart
    const { itemID, itemQty, userID } = req.body;

    try {
      const updatedItem = await CartItem.findOneAndUpdate(
        { userID, itemID },
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
    // Deleting an item from the cart
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
