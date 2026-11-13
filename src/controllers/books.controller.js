import { prisma } from "../db.js";

export async function list(req, res, next) {
  try {
    const books = await prisma.book.findMany();
    res.json({ count: books.length, data: books });
  } catch (error) {
    next(error);
  }
}
// GET /books/:id
export async function getOne(req, res, next) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1 || id > 2147483647) {
    return res.status(400).json({ message: "Invalid book ID" });
  }

  try {
    const book = await prisma.book.findUnique({ where: { id } });

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json(book);
  } catch (error) {
    next(error);
  }
}

// POST /books
export async function create(req, res, next) {
  const { title, price } = req.body ?? {};

  if (typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({ message: "title is required" });
  }

  if (!Number.isInteger(price)) {
    return res.status(400).json({ message: "price must be an integer" });
  }

  try {
    const book = await prisma.book.create({
      data: { title: title.trim(), price }
    });

    res.status(201).json(book);
  } catch (error) {
    next(error);
  }
}

// PATCH /books/:id
export async function update(req, res, next) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1 || id > 2147483647) {
    return res.status(400).json({ message: "Invalid book ID" });
  }

  const {
    title,
    price,
    isAvailable
  } = req.body ?? {};

  const changes = {};

  if (title !== undefined) {
    changes.title = title;
  }

  if (price !== undefined) {
    changes.price = price;
  }

  if (isAvailable !== undefined) {
    changes.isAvailable = isAvailable;
  }

  try {
    const book = await prisma.book.update({
      where: { id },
      data: changes
    });

    res.json(book);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Book not found" });
    }

    next(error);
  }
}

// DELETE /books/:id
export async function remove(req, res, next) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1 || id > 2147483647) {
    return res.status(400).json({ message: "Invalid book ID" });
  }

  try {
    await prisma.book.delete({ where: { id } });
    res.status(204).end();
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Book not found" });
    }

    next(error);
  }
}
// GET /books/search?q=node
export async function search(req, res, next) {
  const { q = "" } = req.query;

  if (typeof q !== "string") {
    return res.status(400).json({ message: "q must be a string" });
  }

  try {
    const results = await prisma.book.findMany({
      where: {
        title: { contains: q.trim(), mode: "insensitive" }
      }
    });

    res.json({ count: results.length, data: results });
  } catch (error) {
    next(error);
  }
}
