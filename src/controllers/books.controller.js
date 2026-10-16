import {
    books,
    findBookById,
    searchByTitle,
    addBook,
    updateBook,
    removeBook
  } from "../data/books.js";
  
  // GET /books
  export function list(req, res) {
    const q = req.query.q;
  
    const data =
      typeof q === "string" && q.trim() !== ""
        ? searchByTitle(q.trim())
        : books;
  
    res.json({
      count: data.length,
      data
    });
  }
  
  // GET /books/:id
  export function getOne(req, res) {
    const id = Number(req.params.id);
    const book = findBookById(id);
  
    if (!book) {
      return res.status(404).json({
        message: "Book not found"
      });
    }
  
    res.json(book);
  }
  
  // POST /books
  export function create(req, res) {
    const { title, price } = req.body ?? {};
  
    if (typeof title !== "string" || title.trim() === "") {
      return res.status(400).json({
        message: "title is required"
      });
    }
  
    const book = addBook({
      title: title.trim(),
      price
    });
  
    res.status(201).json(book);
  }
  
  // PATCH /books/:id
  export function update(req, res) {
    const id = Number(req.params.id);
    const body = req.body ?? {};
    const changes = {};
  
    // Зөвхөн өөрчлөхийг зөвшөөрсөн талбаруудыг авна
    if (body.title !== undefined) {
      if (
        typeof body.title !== "string" ||
        body.title.trim() === ""
      ) {
        return res.status(400).json({
          message: "title is required"
        });
      }
  
      changes.title = body.title.trim();
    }
  
    if (body.price !== undefined) {
      changes.price = body.price;
    }
  
    if (body.isAvailable !== undefined) {
      changes.isAvailable = body.isAvailable;
    }
  
    const updated = updateBook(id, changes);
  
    if (!updated) {
      return res.status(404).json({
        message: "Book not found"
      });
    }
  
    res.json(updated);
  }
  
  // DELETE /books/:id
  export function remove(req, res) {
    const id = Number(req.params.id);
    const ok = removeBook(id);
  
    if (!ok) {
      return res.status(404).json({
        message: "Book not found"
      });
    }
  
    res.status(204).send();
  }