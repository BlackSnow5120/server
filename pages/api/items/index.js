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
      const { qty, name, img, price, detail, delivery } = req.body; // Extract data from the body
    
      // Check if the id is provided, else create a unique ID (or use a custom logic to create numeric ids)
      const uniqueID = Math.floor(Math.random() * 1000000); // Use a random number or your logic for generating a numeric ID
      const show=1;
      try {
        // Find the existing cart item
          const newItem = new Item({
            qty,
            img, // Use the img from the request body (e.g., gym_images/p2.jpg)
            name, // Add name from the request body
            price, // Add price from the request body
            detail, // Add detail from the request body
            delivery, // Add delivery from the request body
            id: uniqueID, // Set the generated or provided numeric id
            show, // Set default value for show (can be adjusted as per your requirements)
          });
          await newItem.save();
          return res.status(201).json({ message: 'Item added to store' });
        }
       catch (error) {
        res.status(500).send(error);
      }
    }
    
    
  

    if (req.method === 'PUT') {
      const { id } = req.query;
    
      console.log('Raw Body:', req.body);
    
      const { name, img, detail, price, delivery, qty } = req.body || {};
      if (!id) {
        return handleError(res, 400, 'Item ID is required');
      }
    
      console.log('Updating Item:', { id, name, detail, price, delivery, qty, img });
    
      const normalizedImg = Array.isArray(img) ? img[0] : img;
    
      try {
        const updatedItem = await Item.findOneAndUpdate(
          { id },
          { name, img: normalizedImg, detail, price, delivery, qty },
          { new: true } // Return updated document
        );
    
        if (!updatedItem) {
          return handleError(res, 404, 'Item not found');
        }
    
        return res.status(200).json({ message: 'Item updated successfully', item: updatedItem });
      } catch (error) {
        return handleError(res, 500, 'Error updating item', error);
      }
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
