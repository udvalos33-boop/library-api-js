import { prisma } from "../db.js";
import { isId, isText } from "../inputs.js";

export async function getAuthors(req, res) {
  const authors = await prisma.author.findMany({
    include: { _count: { select: { books: true } } },
    orderBy: { id: "asc" }
  });
  res.json(authors);
}

export async function getAuthor(req, res) {
  const id = Number(req.params.id);
  if (!isId(id)) return res.status(400).json({ message: "Invalid author ID" });

  const author = await prisma.author.findUnique({ where: { id } });
  if (!author) return res.status(404).json({ message: "Зохиолч олдсонгүй" });

  res.json(author);
}

export async function createAuthor(req, res) {
  const { name, email } = req.body ?? {};
  if (!isText(name) || !isText(email)) {
    return res.status(400).json({ message: "name and email are required" });
  }

  try {
    const author = await prisma.author.create({
      data: { name: name.trim(), email: email.trim() }
    });
    res.status(201).json(author);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ message: "Email already exists" });
    }
    throw error;
  }
}

export async function getAuthorBooks(req, res) {
  const id = Number(req.params.id);
  if (!isId(id)) return res.status(400).json({ message: "Invalid author ID" });

  const author = await prisma.author.findUnique({
    where: { id },
    include: { books: { orderBy: { id: "asc" } } }
  });
  if (!author) return res.status(404).json({ message: "Зохиолч олдсонгүй" });

  res.json(author.books);
}

export async function removeAuthor(req, res) {
  const id = Number(req.params.id);
  if (!isId(id)) return res.status(400).json({ message: "Invalid author ID" });

  try {
    await prisma.author.delete({ where: { id } });
    res.status(204).end();
  } catch (error) {
    if (error.code === "P2003") {
      return res.status(409).json({ message: "Зохиолч бүртгэлтэй номтой байна" });
    }
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Зохиолч олдсонгүй" });
    }
    throw error;
  }
}
