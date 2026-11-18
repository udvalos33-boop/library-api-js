import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";

// Жинхэнэ HTTP хүсэлтээр middleware, route, controller-ийг хамтад нь шалгана.
const testDatabaseUrl = process.env.TEST_DATABASE_URL;

test("Seminar 6 authors and existing book API", {
  skip: !testDatabaseUrl && "Set TEST_DATABASE_URL to a migrated and seeded test database"
}, async (t) => {
  const child = spawn(process.execPath, ["src/app.js"], {
    env: { ...process.env, PORT: "0", DATABASE_URL: testDatabaseUrl },
    stdio: ["ignore", "pipe", "pipe"]
  });
  t.after(async () => {
    if (child.exitCode === null) {
      const exited = once(child, "exit");
      child.kill();
      await exited;
    }
  });
  const port = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Server startup timed out")), 5000);
    child.once("error", (error) => { clearTimeout(timer); reject(error); });
    child.once("exit", (code) => { clearTimeout(timer); reject(new Error(`Server exited: ${code}`)); });
    child.stdout.on("data", (chunk) => {
      const match = String(chunk).match(/Server running on port (\d+)/);
      if (match) { clearTimeout(timer); resolve(match[1]); }
    });
  });
  const request = (path, options = {}) => fetch(`http://127.0.0.1:${port}${path}`, {
    ...options, signal: AbortSignal.timeout(3000)
  });
  const json = (method, body) => ({ method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  let createdId;
  await t.test("1. GET /books -> 200", async () => {
    const res = await request("/books");
    assert.equal(res.status, 200);
    const { data, count } = await res.json();
    assert.equal(count, 3);
    assert.deepEqual(data.map((book) => book.author.name), ["Бат", "Бат", "Сараа"]);
  });
  await t.test("2. GET /books/1 -> 200; numeric ID conversion", async () => {
    const res = await request("/books/1");
    assert.equal(res.status, 200);
    assert.equal((await res.json()).title, "Node.js Basics");
  });
  await t.test("3. GET /books/search?q=node -> 200; before /:id", async () => {
    const res = await request("/books/search?q=node");
    assert.equal(res.status, 200);
    const { data, count } = await res.json();
    assert.equal(count, 1);
    assert.deepEqual(data.map((book) => book.title), ["Node.js Basics"]);
    const upper = await request("/books/search?q=NODE");
    assert.equal((await upper.json()).count, 1);
    const empty = await request("/books/search?q=missing");
    assert.deepEqual(await empty.json(), { count: 0, data: [] });
  });
  await t.test("4. POST /books with an existing author -> 201", async () => {
    const res = await request("/books", json("POST", { title: "Go", price: 25000, authorId: 2 }));
    assert.equal(res.status, 201);
    const book = await res.json();
    createdId = book.id;
    assert.equal(book.title, "Go");
    assert.equal(book.isAvailable, true);
    assert.equal(book.authorId, 2);
  });
  await t.test("Author routes and foreign key errors", async () => {
    const authors = await request("/authors");
    assert.equal(authors.status, 200);
    assert.deepEqual((await authors.json()).map(({ name, _count }) => [name, _count.books]), [
      ["Бат", 2], ["Сараа", 2]
    ]);

    const author = await request("/authors/1");
    assert.equal(author.status, 200);
    assert.equal((await author.json()).name, "Бат");

    const books = await request("/authors/1/books");
    assert.equal(books.status, 200);
    assert.deepEqual((await books.json()).map((book) => book.title), [
      "Node.js Basics", "Express in Action"
    ]);

    assert.equal((await request("/authors/99/books")).status, 404);

    const badBook = await request("/books", json("POST", {
      title: "Missing author", price: 25000, authorId: 99
    }));
    assert.equal(badBook.status, 400);
    assert.deepEqual(await badBook.json(), { message: "Зохиолч олдсонгүй" });

    const duplicate = await request("/authors", json("POST", {
      name: "Бат", email: "bat@mail.mn"
    }));
    assert.equal(duplicate.status, 409);

    const created = await request("/authors", json("POST", {
      name: "Дорж", email: "dorj@example.com"
    }));
    assert.equal(created.status, 201);
    const { id } = await created.json();
    const empty = await request(`/authors/${id}/books`);
    assert.equal(empty.status, 200);
    assert.deepEqual(await empty.json(), []);

    const nested = await request(`/authors/${id}/books`, json("POST", {
      title: "Nested book", price: 9000, authorId: 1
    }));
    assert.equal(nested.status, 201);
    const nestedBook = await nested.json();
    assert.equal(nestedBook.authorId, id);
    assert.equal((await request("/authors/99/books", json("POST", {
      title: "Missing author", price: 9000
    }))).status, 400);

    const deleteAuthor = () => request(`/authors/${id}`, { method: "DELETE" });
    assert.equal((await deleteAuthor()).status, 409);
    assert.equal((await request(`/books/${nestedBook.id}`, { method: "DELETE" })).status, 204);
    assert.equal((await deleteAuthor()).status, 204);
    assert.equal((await deleteAuthor()).status, 404);
  });
  await t.test("5. POST /books {} -> 400; return prevents insertion", async () => {
    const before = await (await request("/books")).json();
    const res = await request("/books", json("POST", {}));
    assert.equal(res.status, 400);
    assert.deepEqual(await res.json(), { message: "title is required" });
    const after = await (await request("/books")).json();
    assert.equal(after.count, before.count);
  });
  await t.test("6. GET /unknown -> 404", async () => {
    const res = await request("/unknown");
    assert.equal(res.status, 404);
    assert.deepEqual(await res.json(), { message: "Route not found", path: "/unknown" });
  });
  await t.test("Seminar 3 PATCH and DELETE still work", async () => {
    const patched = await request(`/books/${createdId}`, json("PATCH", { price: 99000 }));
    assert.equal(patched.status, 200);
    assert.equal((await patched.json()).price, 99000);
    const removed = await request(`/books/${createdId}`, { method: "DELETE" });
    assert.equal(removed.status, 204);
    assert.equal(await removed.text(), "");
    const missing = await request(`/books/${createdId}`);
    assert.equal(missing.status, 404);
    assert.deepEqual(await missing.json(), { message: "Book not found" });
    assert.equal((await request(`/books/${createdId}`, { method: "DELETE" })).status, 404);
  });
  await t.test("Malformed JSON -> 400; server continues responding", async () => {
    const res = await request("/books", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{" });
    assert.equal(res.status, 400);
    assert.equal((await request("/books")).status, 200);
  });
});
