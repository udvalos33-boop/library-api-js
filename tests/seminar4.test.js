import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";

// Жинхэнэ HTTP хүсэлтээр middleware, route, controller-ийг хамтад нь шалгана.
test("Seminar 4 acceptance and seminar 3 CRUD regression", async (t) => {
  const child = spawn(process.execPath, ["src/app.js"], {
    env: { ...process.env, PORT: "0" },
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
    assert.equal((await res.json()).count, 3);
  });
  await t.test("2. GET /books/1 -> 200; numeric ID conversion", async () => {
    const res = await request("/books/1");
    assert.equal(res.status, 200);
    assert.equal((await res.json()).title, "JavaScript");
  });
  await t.test("3. GET /books/search?q=node -> 200; before /:id", async () => {
    const res = await request("/books/search?q=node");
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { count: 1, data: [{ id: 2, title: "Node.js", price: 45000, isAvailable: true }] });
    const upper = await request("/books/search?q=NODE");
    assert.equal((await upper.json()).count, 1);
    const empty = await request("/books/search?q=missing");
    assert.deepEqual(await empty.json(), { count: 0, data: [] });
  });
  await t.test("4. POST /books {title: Go} -> 201", async () => {
    const res = await request("/books", json("POST", { title: "Go" }));
    assert.equal(res.status, 201);
    const book = await res.json();
    createdId = book.id;
    assert.equal(book.title, "Go");
    assert.equal(book.isAvailable, true);
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
