import { Router } from "express";
import * as authors from "../controllers/authors.controller.js";

import { createForAuthor } from "../controllers/books.controller.js";

const router = Router();

router.get("/", authors.getAuthors);
router.get("/:id", authors.getAuthor);
router.post("/", authors.createAuthor);
router.get("/:id/books", authors.getAuthorBooks);

router.post("/:id/books", createForAuthor);
router.delete("/:id", authors.removeAuthor);

export default router;
