import { connectToDatabase } from '../../../lib/mongodb';
import Item from '../../../models/Item';

export default async (req, res) => {
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
        res.status(500).json({ message: 'Error fetching item' });
      }
    } else {
      try {
        const items = await Item.find();
        res.status(200).json(items);
      } catch (error) {
        res.status(500).json({ message: 'Error fetching items' });
      }
    }
  }

  if (req.method === 'POST') {
    const { id, name, img, detail, price, delivery, qty } = req.body;

    // If the image is in Base64 format, we save it directly
     // imgBase64 should be passed as part of the request body

    const newItem = new Item({ id, name, img, detail, price, delivery, qty });

    try {
      await newItem.save();
      res.status(201).json({ message: 'Item added successfully', item: newItem });
    } catch (error) {
      res.status(500).json({ message: 'Error adding item', error });
    }
  }

  if (req.method === 'PUT') {
    const { id } = req.query;
    const { name, img, detail, price, delivery, qty } = req.body;

     // imgBase64 should be passed as part of the request body

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
      res.status(500).json({ message: 'Error deleting item', error });
    }
  }
};
