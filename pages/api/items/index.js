import { connectToDatabase } from '../../../lib/mongodb';
import Item from '../../../models/Item';
import multer from 'multer';

// Set up multer for file uploads
const storage = multer.memoryStorage(); // Use memory storage if you don't need to save files to disk
const upload = multer({ storage });

// Disable body parsing for this API route
export const config = {
  api: {
    bodyParser: false,
  },
};

// Middleware to handle file uploads and parse multipart/form-data
const runMiddleware = (req, res, fn) =>
  new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });

const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://powerhouse-e955.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
};

const handleError = (res, statusCode, message, error = null) => {
  console.error(message, error || '');
  res.status(statusCode).json({ message, error });
};

const handler = async (req, res) => {
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res);
    return res.status(204).end();
  }

  setCorsHeaders(res);

  try {
    await connectToDatabase();

    if (req.method === 'PUT') {
      // Parse multipart/form-data
      await runMiddleware(req, res, upload.single('img'));

      const { id } = req.query;
      const { name, detail, price, delivery, qty } = req.body;
      const img = req.file ? req.file.buffer.toString('base64') : req.body.img;

      if (!id) {
        return handleError(res, 400, 'Item ID is required');
      }

      console.log('Received data:', id, name, detail, price, delivery, qty);

      const updatedItem = await Item.findOneAndUpdate(
        { id },
        { name, img, detail, price, delivery, qty },
        { new: true }
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
