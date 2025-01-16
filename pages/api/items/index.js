import { connectToDatabase } from '../../../lib/mongodb';
import Item from '../../../models/Item';
const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://powerhouse-e955.vercel.app'); // Update with your front-end URL
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
};

const handler = async (req, res) => {
  setCorsHeaders(res); // Set CORS headers
  await connectToDatabase();

  if (req.method === 'GET') {
    if (req.query.id) {
      try {
        const item = await Item.findOne({ id: req.query.id });
        if (!item) {
          return res.status(404).json({ message: 'Item not found' });
        }
        res.status(200).json(item);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching item' });
      }
    } else {
      try {
        const items = await Item.find();
        res.status(200).json(items);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching items' });
      }
    }
  }

  if (req.method === 'POST') {
    const { id, name, img, detail, price, delivery, qty } = req.body;

    const newItem = new Item({ id, name, img, detail, price, delivery, qty });

    try {
      await newItem.save();
      res.status(201).json({ message: 'Item added successfully', item: newItem });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error adding item', error });
    }
  }

  if (req.method === 'PUT') {
    const { id } = req.query;
    const { name, img, detail, price, delivery, qty } = req.body;

    try {
      const updatedItem = await Item.findOneAndUpdate(
        { id },
        { name, img, detail, price, delivery, qty },
        { new: true }
      );

      if (!updatedItem) {
        return res.status(404).json({ message: 'Item not found' });
      }

      res.status(200).json({ message: 'Item updated successfully', item: updatedItem });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error updating item', error });
    }
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    try {
      const deletedItem = await Item.findOneAndDelete({ id });
      if (!deletedItem) {
        return res.status(404).json({ message: 'Item not found' });
      }
      res.status(200).json({ message: 'Item deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error deleting item', error });
    }
  }
};

export default handler;
