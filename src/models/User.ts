export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role: 'USER' | 'ADMIN';
  createdAt: Date;
}

export const users: User[] = [];
