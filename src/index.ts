import express from 'express';

const app = express();
const port = process.env.PORT || 5000;

app.get('/', (_, res) => {
  res.send('Hello, Typescript with Express!');
});

const server = app.listen(port, () =>
  console.log(`Server is running on http://localhost:${port}`),
);

export { app, server };
