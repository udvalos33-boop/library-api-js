import { prisma } from "../db.js";
import { isId, isPrice, isText } from "../inputs.js";

export async function list(req, res) {
  const data = await prisma.book.findMany({
    include: { author: true },
    orderBy: { id: "asc" }
  });
  res.json({ count: data.length, data });
}

export async function getOne(req, res) {
  const id = Number(req.params.id);
  if (!isId(id)) return res.status(400).json({ message: "Invalid book ID" });

  const book = await prisma.book.findUnique({ where: { id } });
  if (!book) return res.status(404).json({ message: "Book not found" });

  res.json(book);
}

export async function create(req, res) {
  return createBook(req.body, req.body?.authorId, res);
}

export async function createForAuthor(req, res) {
  return createBook(req.body, Number(req.params.id), res);
}

async function createBook(body, authorId, res) {
  const { title, price } = body ?? {};
  if (!isText(title)) return res.status(400).json({ message: "title is required" });
  if (!isPrice(price) || !isId(authorId)) {
    return res.status(400).json({ message: "Valid price and authorId are required" });
  }

  try {
    const book = await prisma.book.create({
      data: { title: title.trim(), price, authorId }
    });
    res.status(201).json(book);
  } catch (error) {
    if (error.code === "P2003") {
      return res.status(400).json({ message: "Зохиолч олдсонгүй" });
    }
    throw error;
  }
}

export async function update(req, res) {
  const id = Number(req.params.id);
  if (!isId(id)) return res.status(400).json({ message: "Invalid book ID" });

  const { title, price, isAvailable } = req.body ?? {};
  if (
    (title !== undefined && !isText(title)) ||
    (price !== undefined && !isPrice(price)) ||
    (isAvailable !== undefined && typeof isAvailable !== "boolean")
  ) {
    return res.status(400).json({ message: "Invalid book fields" });
  }

  try {
    const book = await prisma.book.update({
      where: { id },
      data: { title: title?.trim(), price, isAvailable }
    });
    res.json(book);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Book not found" });
    }
    throw error;
  }
}

export async function remove(req, res) {
  const id = Number(req.params.id);
  if (!isId(id)) return res.status(400).json({ message: "Invalid book ID" });

  try {
    await prisma.book.delete({ where: { id } });
    res.status(204).end();
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Book not found" });
    }
    throw error;
  }
}

export async function search(req, res) {
  const { q = "" } = req.query;
  if (typeof q !== "string") {
    return res.status(400).json({ message: "q must be a string" });
  }

  // Escape PostgreSQL LIKE wildcards to keep the search a literal substring.
  const keyword = q.trim().replace(/[\\%_]/g, "\\$&");
  const data = await prisma.book.findMany({
    where: { title: { contains: keyword, mode: "insensitive" } },
    orderBy: { id: "asc" }
  });
  res.json({ count: data.length, data });
}
