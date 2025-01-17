import { connectToDatabase } from '../../../lib/mongodb';
import CartItem from '../../../models/CartItem';
import Item from '../../../models/Item';

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
    try {
      // Find the existing cart item
      const existingItem = await CartItem.findOne({ userID, itemID });
  
      // Find the item in the store to update its quantity
      const itemInStore = await Item.findOne({id:itemID});
  
      if (existingItem) {
        existingItem.itemQty += itemQty;  // Increment the quantity in the cart
        await existingItem.save();
      } else {
        const newItem = new CartItem({ userID, itemID, itemQty });
        await newItem.save();
      }
  
      // Update the quantity in the store
      if (itemInStore) {
        itemInStore.qty -= itemQty; // Decrease the available quantity in the store
        await itemInStore.save();
      }
  
      return res.status(201).json({ message: 'Item added to cart' });
    } catch (error) {
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
      const deletedItem = await CartItem.findOneAndDelete({ cid: cartId });
      const itemInStore = await Item.findOne({id:deletedItem.itemID});
      if (itemInStore) {
        itemInStore.qty += deletedItem.itemQty; // Increase the quantity in the store
        await itemInStore.save();
      }
      res.status(200).json({ message: 'Item deleted successfully' });
    } catch (error) {
      res.status(500).send('Server Error',error);
    }
  }
};

export default handleCartRequest;
