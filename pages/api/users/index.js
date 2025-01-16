import { connectToDatabase } from '../../../lib/mongodb';
import User from '../../../models/User';

const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://powerhouse-e955.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
};

const handleUserRequest = async (req, res) => {
  setCorsHeaders(res); // Set CORS headers

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  await connectToDatabase();

  // Handle user registration (POST request)
  if (req.method === 'POST' && req.body.addusers) {
    const { name, email, mobileNumber, password, role, address, gender, dateOfBirth } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const newUser = new User({
      name,
      email,
      mobileNumber,
      password,
      role,
      address,
      gender,
      dateOfBirth,
    });

    try {
      await newUser.save();
      req.session.userId = newUser.uid; // Store user ID in session
      req.session.isLoggedIn = true;
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      console.error('Error saving user:', error);
      res.status(500).json({ message: 'Error registering user' });
    }
  }

  // Handle user login (POST request)
  if (req.method === 'POST' && req.body.login) {
    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user || user.password !== password) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }

      req.session.userId = user.uid;
      req.session.user = user;
      req.session.isLoggedIn = true;
      user.password = ''; // Don't send password in response

      res.status(200).json({ message: 'Login successful', user: user });
    } catch (error) {
      console.error('Error logging in:', error);
      res.status(500).json({ message: 'Error logging in' });
    }
  }

  // Handle user logout (POST request)
  if (req.method === 'POST' && req.body.logout) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Error logging out' });
      }
      res.clearCookie('connect.sid'); // Clear session cookie
      res.status(200).json({ message: 'Logged out successfully' });
    });
  }

  // Handle password update (PUT request)
  if (req.method === 'PUT' && req.body.updatePassword) {
    const { currentPassword, newPassword } = req.body;

    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      const user = await User.findOne({ uid: req.session.userId });
      if (!user || user.password !== currentPassword) {
        return res.status(400).json({ message: 'Incorrect current password' });
      }

      user.password = newPassword;
      await user.save();
      res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Error updating password:', error);
      res.status(500).json({ message: 'Error updating password' });
    }
  }

  // Handle user profile update (PUT request)
  if (req.method === 'PUT' && req.body.updateProfile) {
    const { email, name, mobileNumber, address, gender, dateOfBirth } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.name = name;
      user.mobileNumber = mobileNumber;
      user.address = address;
      user.gender = gender;
      user.dateOfBirth = dateOfBirth;

      await user.save();
      res.status(200).json({ message: 'Profile updated successfully', user });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ message: 'Error updating profile' });
    }
  }

  // Handle checking login status (GET request)
  if (req.method === 'GET') {
    if (req.session && req.session.userId) {
      try {
        const user = await User.findOne({ uid: req.session.userId });
        if (user) {
          user.password = ''; // Don't send password
          return res.json({ loggedIn: true, user });
        }
      } catch (error) {
        console.error('Error checking login status:', error);
        res.status(500).json({ message: 'Error checking login status' });
      }
    }
    res.json({ loggedIn: false });
  }

  // Handle unsupported methods
  res.status(405).json({ message: 'Method Not Allowed' });
};

export default handleUserRequest;
