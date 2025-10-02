import { NextFunction, Request, Response } from 'express';

export const authorizeRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req?.user;

    if (user?.role !== role) {
      return res.status(403).json({
        message: 'Access denied, you do not have the right permissions',
      });
    }

    next();
  };
};
