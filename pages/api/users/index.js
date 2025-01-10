import { connectToDatabase } from '../../../lib/mongodb';
import User from '../../../models/User';

export default async (req, res) => {
  await connectToDatabase();

  if (req.method === 'POST' && req.body.addusers) {
    const { name, email, mobileNumber, password, role, address, gender, dateOfBirth } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const newUser = new User({ name, email, mobileNumber, password, role, address, gender, dateOfBirth });

    try {
      await newUser.save();
      res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
      console.error('Error saving user:', error);
      res.status(500).json({ message: 'Error registering user' });
    }
  }

  if (req.method === 'POST' && req.body.login) {
    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user || user.password !== password) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }

      req.session.userId = user.uid;
      req.session.isLoggedIn = true;
      res.status(200).json({ message: 'Login successful', user: user });
    } catch (error) {
      console.error('Error logging in:', error);
      res.status(500).json({ message: 'Error logging in' });
    }
  }

  if (req.method === 'POST' && req.body.logout) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Error logging out' });
      }
      res.status(200).json({ message: 'Logged out successfully' });
    });
  }

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
};
