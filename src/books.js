const book = {
    id: 1,
    title: "Node.js Basics",
    author: "Bat",
    price: 45000,
    isAvailable: true
  };
  // nom ugugdul
export const books = [
    {
      id: 1,
      title: "Node",
      author: "Bat",
      price: 45000,
      isAvailable: true
    },
    {
      id: 2,
      title: "Express",
      author: "Saraa",
      price: 52000,
      isAvailable: true
    },
    {
      id: 3,
      title: "Prisma",
      author: "Bold",
      price: 61000,
      isAvailable: false
    },
    {
      id: 4,
      title: "JavaScript",
      author: "Naraa",
      price: 35000,
      isAvailable: true
    }
  ];
  
  // ID-r nom oloh
  export function findBookById(id) {
    return books.find((book) => book.id === id);
  }
  
  // nerr haih 
  export function searchByTitle(keyword) {
    return books.filter((book) =>
      book.title
        .toLowerCase()
        .includes(keyword.toLowerCase())
    );
  }
  
  // belen nomn too
  export function countAvailable() {
    return books.filter(
      (book) => book.isAvailable
    ).length;
  }

  // Database-s ugugdul ireh
export function getBooksFromDb() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(books);
      }, 500);
    });
  }
  // nom oldohgui bol
export function getBookOrThrow(id) {
    const book = findBookById(id);
  
    if (!book) {
      throw new Error("Book not found");
    }
  
    return book;
  }