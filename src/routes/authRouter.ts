import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { generateToken } from '@utils/jwt';
import { users, User } from '@models/User';
import Logger from '@libs/logger';

const router = Router();

const isUniqueUser = (username: string, email: string) => {
  return !users.some(
    (user) => user.username === username || user.email === email,
  );
};

router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password || !role) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  if (!isUniqueUser(username, email)) {
    return res
      .status(400)
      .json({ message: 'Username or email already in use' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser: User = {
    id: Date.now().toString(),
    username,
    email,
    password: hashedPassword,
    role,
    createdAt: new Date(),
  };

  users.push(newUser);

  res.status(201).json({ message: 'account created successfuly' });

  Logger.info(`Account created: ${JSON.stringify(newUser, null, 2)}`);
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username);

  if (!user) {
    Logger.error('400: Invalid credentials');
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    Logger.error('400: Invalid credentials');
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const token = generateToken({ userId: user.id, role: user.role });
  res.json({ token });
});

export default router;
