import { connectToDatabase } from '../../../lib/mongodb';
import Item from '../../../models/Item';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = path.join(__dirname, '..', 'public', 'gym_images');

// Create the directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage }).single('img');

const handleItemRequest = async (req, res) => {
  await connectToDatabase();

  if (req.method === 'GET') {
    if (req.query.id) {
      // Get a specific item by ID
      try {
        const item = await Item.findOne({ id: req.query.id });
        if (!item) {
          return res.status(404).json({ message: 'Item not found' });
        }
        return res.status(200).json(item);
      } catch {
        return res.status(500).json({ message: 'Error fetching item' });
      }
    } else {
      // Get all items
      try {
        const items = await Item.find();
        return res.status(200).json(items);
      } catch {
        return res.status(500).json({ message: 'Error fetching items' });
      }
    }
  }

  if (req.method === 'POST') {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error uploading image' });
      }

      const { id, name, detail, price, delivery, qty } = req.body;
      const img = req.file ? '/gym_images/' + req.file.filename : '';

      const newItem = new Item({ id, name, img, detail, price, delivery, qty });

      try {
        await newItem.save();
        return res.status(201).json({ message: 'Item added successfully', item: newItem });
      } catch {
        return res.status(500).json({ message: 'Error adding item' });
      }
    });
  }

  if (req.method === 'PUT') {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error uploading image' });
      }

      const { id } = req.query;
      const { name, detail, price, delivery, qty } = req.body;

      let img = req.body.img;
      if (req.file) {
        img = '/gym_images/' + req.file.filename;
      }

      try {
        const updatedItem = await Item.findOneAndUpdate(
          { id },
          { name, img, detail, price, delivery, qty },
          { new: true }
        );

        if (!updatedItem) {
          return res.status(404).json({ message: 'Item not found' });
        }

        return res.status(200).json({ message: 'Item updated successfully', item: updatedItem });
      } catch {
        return res.status(500).json({ message: 'Error updating item' });
      }
    });
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    try {
      const deletedItem = await Item.findOneAndDelete({ id });
      if (!deletedItem) {
        return res.status(404).json({ message: 'Item not found' });
      }
      return res.status(200).json({ message: 'Item deleted successfully' });
    } catch {
      return res.status(500).json({ message: 'Error deleting item' });
    }
  }
};

export default handleItemRequest;
