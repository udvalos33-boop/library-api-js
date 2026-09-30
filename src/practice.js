// dasgal1 nomiin obj
const book = {
    id: 1,
    title: "Node.js Basics",
    author: "Bat",
    price: 45000,
    isAvailable: true
  };
  
  // nomn neriig 2 argr unshih
  console.log(book.title);
  console.log(book["title"]);
  
  // baihgui tailbar unshih
  console.log(book.isbn);
  
  // une uurchluh
  book.price = 50000;
  
  console.log("Шинэ үнэ:", book.price);

  // dasgal2
const books = [
    {
      id: 1,
      title: "Ном1",
      author: "Bat",
      price: 45000,
      isAvailable: true
    },
    {
      id: 2,
      title: "Ном2",
      author: "Saraa",
      price: 52000,
      isAvailable: true
    },
    {
      id: 3,
      title: "Ном3",
      author: "Bold",
      price: 61000,
      isAvailable: false
    },
    {
      id: 4,
      title: "Ном4",
      author: "Naraa",
      price: 35000,
      isAvailable: true
    }
  ];
  
  // shine array
  const titles = books.map((book) => book.title);
  
  // ner&une neg text bolgh
  const labels = books.map(
    (book) => `${book.title} — ${book.price}`
  );
  
  console.log("Номын нэрүүд:", titles);
  console.log("Нэр болон үнэ:", labels);
  console.log("Номын тоо:", books.length);

  // dasgal3 nuhtsuluur songh

// 50000s hymd
const cheap = books.filter(
    (book) => book.price < 50000
  );
  
  // beln baigaa nomnudg haih
  const available = books.filter(
    (book) => book.isAvailable
  );
  
  // ID-3 nom haih
  const book3 = books.find(
    (book) => book.id === 3
  );
  
  // ID-gui nom haih
  const book99 = books.find(
    (book) => book.id === 99
  );
  
  console.log("Хямд номууд:", cheap);
  console.log("Бэлэн номууд:", available);
  console.log("ID 3 ном:", book3);
  console.log("ID 99 ном:", book99 ?? "not found");

  // dasgal4 5-method

// 1. hoyr toonii niilber
function sum(a, b) {
    return a + b;
  }
  
  // 2. nom 5000s unetei eseh
  function isExpensive(book) {
    return book.price > 50000;
  }
  
  // 3. nomiin ner array
  function getTitles(books) {
    return books.map((book) => book.title);
  }
  
  // 4. belen nomn too
  function countAvailable(books) {
    return books.filter(
      (book) => book.isAvailable
    ).length;
  }
  
  // 5. uniig text bolgh
  const formatPrice = (price) => `${price}₮`;
  
  // duudaj shalgah
  console.log("Нийлбэр:", sum(10, 20));
  
  console.log(
    "Express үнэтэй юу?",
    isExpensive(books[1])
  );
  
  console.log("Нэрүүд:", getTitles(books));
  
  console.log(
    "Бэлэн номын тоо:",
    countAvailable(books)
  );
  
  console.log("Үнэ:", formatPrice(45000));