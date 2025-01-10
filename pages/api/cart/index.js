import { connectToDatabase } from '../../../lib/mongodb';
import CartItem from '../../../models/CartItem';

export default async (req, res) => {
  await connectToDatabase();

  if (req.method === 'GET') {
    const { userID } = req.query;

    try {
      const items = await CartItem.find({ userID });
      res.json(items);
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
      res.status(500).send('Server Error');
    }
  }
};
