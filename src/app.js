import "dotenv/config";
import express from "express";

import booksRouter from "./routes/books.router.js";
import { logger } from "./middlewares/logger.js";
import {
  notFound,
  errorHandler
} from "./middlewares/error.js";

const app = express();

const PORT = process.env.PORT ?? 3000;

app.use(express.json());

app.use(logger);

app.use("/books", booksRouter);

app.use(notFound);

app.use(errorHandler);

const server = app.listen(PORT, (error) => {
  if (error) {
    console.error(error);
    process.exitCode = 1;
    return;
  }
  console.log(`Server running on port ${server.address().port}`);
});