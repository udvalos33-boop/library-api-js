import express from "express";

import booksRouter from "./routes/books.router.js";
import { logger } from "./middlewares/logger.js";
import {
  notFound,
  errorHandler
} from "./middlewares/error.js";

const app = express();
const PORT = 3000;

app.use(logger);
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Library API",
    version: "3.0.0"
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok"
  });
});

app.use("/books", booksRouter);

// Хуучин /users, /profile зэрэг route байгаа бол
// энэ хэсэгт, notFound-оос ӨМНӨ хадгалж байрлуул.

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});