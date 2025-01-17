import { connectToDatabase } from '../../../lib/mongodb';
import Item from '../../../models/Item';

// Reusable CORS Middleware
const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://powerhouse-e955.vercel.app'); // Frontend URL
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
};

// Centralized error response
const handleError = (res, statusCode, message, error = null) => {
  console.error(`Error: ${message}`, error ? `Details: ${error}` : '');
  res.status(statusCode).json({ message, error });
};

const handler = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res);
    return res.status(204).end();
  }

  setCorsHeaders(res); // Set CORS for all requests

  try {
    await connectToDatabase(); // Ensure DB connection

    if (req.method === 'GET') {
      const { id } = req.query;

      if (id) {
        const item = await Item.findOne({ id });
        if (!item) {
          return handleError(res, 404, 'Item not found');
        }
        return res.status(200).json(item);
      }

      const items = await Item.find();
      return res.status(200).json(items);
    }

    if (req.method === 'POST') {
      const { id, name, img, detail, price, delivery, qty } = req.body;

      if (!id || !name || !price || !delivery || !qty) {
        return handleError(res, 400, 'Missing required fields: id, name, price, delivery, qty');
      }

      const normalizedImg = Array.isArray(img) ? img[0] : img; // Handle array case

      const newItem = new Item({ id, name, img: normalizedImg, detail, price, delivery, qty });
      await newItem.save();

      return res.status(201).json({ message: 'Item added successfully', item: newItem });
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      const { name, img, detail, price, delivery, qty } = req.body;

      if (!id) {
        return handleError(res, 400, 'Item ID is required');
      }

      const normalizedImg = Array.isArray(img) ? img[0] : img; // Handle array case

      console.log('Updating Item:', { id, name, detail, price, delivery, qty, img: normalizedImg });

      const updatedItem = await Item.findOneAndUpdate(
        { id },
        { name, img: normalizedImg, detail, price, delivery, qty },
        { new: true } // Return updated document
      );

      if (!updatedItem) {
        return handleError(res, 404, 'Item not found');
      }

      return res.status(200).json({ message: 'Item updated successfully', item: updatedItem });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id) {
        return handleError(res, 400, 'Item ID is required');
      }

      const deletedItem = await Item.findOneAndDelete({ id });
      if (!deletedItem) {
        return handleError(res, 404, 'Item not found');
      }

      return res.status(200).json({ message: 'Item deleted successfully' });
    }

    return handleError(res, 405, `Method ${req.method} not allowed`);
  } catch (error) {
    handleError(res, 500, 'Internal Server Error', error);
  }
};

export default handler;
