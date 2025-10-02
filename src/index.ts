import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

import helmet from 'helmet';
import cors from 'cors';
import morganMiddleware from '@middlewares/morganMiddleware';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import indexRouter from '@routes/indexRouter';
import loggerRouter from '@routes/loggerRouter';
import authRouter from '@routes/authRouter';
import protectedRouter from '@routes/protectedRouter';

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(helmet());
app.use(cors());

app.use(morganMiddleware);

app.use('/', indexRouter);
app.use('/logger', loggerRouter);
app.use('/auth', authRouter);
app.use('/protected', protectedRouter);

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: 'Express boilerplate',
      version: '1.0.0',
      description: 'API docs for the express boilerplate',
    },
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

const server = app.listen(port, () =>
  console.log(`Server is running on http://localhost:${port}`),
);

export { app, server };
