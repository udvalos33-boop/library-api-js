import { prisma } from "../src/db.js";

try {
  await prisma.$transaction(async (db) => {
    const bat = await db.author.upsert({
      where: { email: "bat@mail.mn" },
      update: {},
      create: { name: "Бат", email: "bat@mail.mn" }
    });
    const saraa = await db.author.upsert({
      where: { email: "saraa@mail.mn" },
      update: {},
      create: { name: "Сараа", email: "saraa@mail.mn" }
    });
    const bold = await db.author.upsert({
      where: { email: "bold@mail.mn" },
      update: {},
      create: { name: "Болд", email: "bold@mail.mn" }
    });

    const books = [
      { title: "Node.js Basics", price: 45000, authorId: bat.id },
      { title: "Express in Action", price: 52000, authorId: bat.id },
      { title: "SQL for Kids", price: 30000, authorId: saraa.id },
      { title: "Node.js Testing", price: 58000, authorId: bat.id },
      { title: "REST API Design", price: 39000, authorId: saraa.id, isAvailable: false },
      { title: "SQL Joins", price: 27000, authorId: saraa.id },
      { title: "Express Security", price: 66000, authorId: bold.id },
      { title: "Prisma Relations", price: 48000, authorId: bold.id },
      { title: "Node Streams", price: 72000, authorId: bold.id, isAvailable: false }
    ];

    for (const book of books) {
      const existing = await db.book.findFirst({
        where: { title: book.title, authorId: book.authorId }
      });
      if (!existing) await db.book.create({ data: book });
    }
  }, { isolationLevel: "Serializable" });
  console.log("Seminar 9 sample data is ready.");
} finally {
  await prisma.$disconnect();
}
