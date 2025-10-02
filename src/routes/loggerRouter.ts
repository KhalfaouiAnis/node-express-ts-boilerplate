import Logger from '@libs/logger';
import { Router } from 'express';

const router = Router();

/**
 * @swagger
 * /logger:
 *  get:
 *    description: log different levels of messages and returns a response
 *    responses:
 *      200:
 *        description: Returns a message confirming the lofs
 */
router.get('/', (_, res) => {
  Logger.error('This is an error');
  Logger.warn('This is an error');
  Logger.info('This is an error');
  Logger.http('This is an error');

  res.send('Ok');
});

export default router;
