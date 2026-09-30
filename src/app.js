import express from "express";

import {
  searchByTitle,
  countAvailable,
  getBooksFromDb,
  getBookOrThrow
} from "./books.js";

import {
  users,
  findUserById,
  findByEmail,
  countAdmins
} from "./users.js";

const app = express();
const PORT = 3000;

// Password-gui obj butsaah
function removePassword(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}

// nuur route
app.get("/", (req, res) => {
  res.json({
    message: "Library API ажиллаж байна"
  });
});

// buh nomg avah or nereer haih
app.get("/books", async (req, res) => {
  const allBooks = await getBooksFromDb();
  const q = req.query.q;

  if (typeof q === "string" && q.trim() !== "") {
    return res.json(searchByTitle(q.trim()));
  }

  res.json(allBooks);
});

// ID-r nom avah
app.get("/books/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const book = getBookOrThrow(id);

    res.json(book);
  } catch (error) {
    res.status(404).json({
      message: error.message
    });
  }
});

// buh herglgchiig avah
app.get("/users", (req, res) => {
  const safeUsers = users.map(removePassword);
  res.json(safeUsers);
});

// ID-r herglgch avah
app.get("/users/:id", (req, res) => {
  const id = Number(req.params.id);
  const user = findUserById(id);

  if (!user) {
    return res.status(404).json({
      message: "User not found"
    });
  }

  res.json(removePassword(user));
});

// server asaah, function
app.listen(PORT, () => {
  console.log(`Server: http://localhost:${PORT}`);

  console.log("Бэлэн номын тоо:", countAvailable());
  console.log("Admin хэрэглэгчдийн тоо:", countAdmins());

  const foundUser = findByEmail("UDVAL@example.com");

  console.log(
    "Email-аар олсон хэрэглэгч:",
    foundUser ? removePassword(foundUser) : "User not found"
  );
});