import { prisma } from "../db.js";
import { isId, isPrice, isText } from "../inputs.js";

export async function list(req, res) {
  const where = buildWhere(req.query);
  const orderBy = buildOrderBy(req.query);
  const data = await prisma.book.findMany({
    where,
    include: { author: true },
    orderBy
  });
  res.json({ count: data.length, data });
}

function buildWhere(query) {
  const where = {};

  if (query.authorId !== undefined) {
    const authorId = Number(query.authorId);
    if (!isId(authorId)) {
      throw { status: 400, message: "authorId тоо байх ёстой" };
    }
    where.authorId = authorId;
  }

  if (query.available !== undefined) {
    if (query.available !== "true" && query.available !== "false") {
      throw { status: 400, message: "available true эсвэл false байх ёстой" };
    }
    where.isAvailable = query.available === "true";
  }

  if (query.q !== undefined) {
    if (typeof query.q !== "string") {
      throw { status: 400, message: "q текст байх ёстой" };
    }
    if (query.q.trim()) {
      where.title = { contains: query.q.trim(), mode: "insensitive" };
    }
  }

  if (query.author !== undefined) {
    if (typeof query.author !== "string") {
      throw { status: 400, message: "author текст байх ёстой" };
    }
    if (query.author.trim()) {
      where.author = {
        name: { contains: query.author.trim(), mode: "insensitive" }
      };
    }
  }

  const price = {};
  if (query.minPrice !== undefined) {
    const minPrice = Number(query.minPrice);
    if (!isPrice(minPrice)) {
      throw { status: 400, message: "minPrice 0 буюу түүнээс их бүхэл тоо байх ёстой" };
    }
    price.gte = minPrice;
  }
  if (query.maxPrice !== undefined) {
    const maxPrice = Number(query.maxPrice);
    if (!isPrice(maxPrice)) {
      throw { status: 400, message: "maxPrice 0 буюу түүнээс их бүхэл тоо байх ёстой" };
    }
    price.lte = maxPrice;
  }
  if (Object.keys(price).length > 0) {
    where.price = price;
  }

  return where;
}

function buildOrderBy(query) {
  const allowed = ["title", "price", "createdAt"];
  const sort = allowed.includes(query.sort) ? query.sort : "createdAt";
  const order = query.order === "asc" ? "asc" : "desc";
  return { [sort]: order };
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
  const keyword = q.trim().replace(/[\%_]/g, "\$&");
  const data = await prisma.book.findMany({
    where: { title: { contains: keyword, mode: "insensitive" } },
    orderBy: { id: "asc" }
  });
  res.json({ count: data.length, data });
}
