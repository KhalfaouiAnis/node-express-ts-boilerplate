import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

import helmet from 'helmet';
import cors from 'cors';
import morganMiddleware from '@middlewares/morganMiddleware';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import indexRouter from '@routes/indexRouter';
import courseRouter from '@routes/courseRouter';
import enrollmentRouter from '@routes/enrollmentRouter';
import progressRouter from '@routes/progressRouter';
import authRouter from '@routes/authRouter';
import instructorRouter from '@routes/instructorRouter';
import userRouter from '@routes/userRouter';
import path from 'path';

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(morganMiddleware);

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/', indexRouter);
app.use('/api/auth', authRouter);
app.use('/api/courses', courseRouter);
app.use('/api/enrollments', enrollmentRouter);
app.use('/api/progress', progressRouter);
app.use('/api/users', userRouter);
app.use('/api/instructors', instructorRouter);

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
