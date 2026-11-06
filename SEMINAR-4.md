# Семинар 4: өмнөх Library API төслийн үргэлжлэл

## 1. Өмнөх ажлуудтай хэрхэн холбогдсон бэ?

Эх код: `/Users/udvalosgonbold/my-app/library-api-js`. Тэнд байсан `src`, package.json, package-lock.json, .gitignore-ийг одоогийн backend хавтаст хуулж үргэлжлүүлэв. Эхлээд backend хуулбарт бэлдсэн. Дараа нь хэрэглэгчийн хүсэлтээр семинар 4-ийн засварыг VS Code дээр ашиглаж буй анхны library-api-js төсөлд мөн оруулсан. Нууц утга агуулж болзошгүй хуучин .env-ийг хуулалгүй, зөвхөн PORT бүхий шинэ .env үүсгэв.

| Семинар | Өмнө хийсэн зүйл | Семинар 4-т хэрхэн ашигласан |
|---|---|---|
| 1 | Node.js, Express, ES modules, сервер | Express сервер болон .js өргөтгөлтэй import-уудыг хадгалсан |
| 2 | books массив, find/filter, модулиуд | JavaScript, Node.js, React гэсэн өмнөх 3 номыг хадгалж, filter-ээр нэр хайдаг функц нэмсэн |
| 3 | POST/PATCH/DELETE, router/controller, logger, error handler | Бүтэц болон CRUD үйлдлүүдийг хадгалж, ажиллаж байгааг дахин шалгасан |
| 4 | Алдаа оношлох, middleware/route дараалал, .env | Хайлтын route нэмсэн, дарааллыг шалгасан, PORT тохируулсан, 6 үндсэн тест ажиллуулсан |

Өмнөх кодын ихэнх засвар аль хэдийн зөв байсан: import-д .js байсан, logger next() дууддаг, title шалгалт return-тэй, id Number()-оор хөрвөдөг. Эдгээрийг дахин зохиолгүй хадгалсан. Дутуу байсан /books/search замыг нэмсэн. PATCH доторх ямар ч үйлдэлгүй `"NaN"` илэрхийллийг цэвэрлэсэн.

## 2. Ажиллуулах

backend хавтас дотор terminal нээгээд:

```sh
npm ci
npm run dev
```

Энэ орчинд dependency-уудыг `npm ci --offline --ignore-scripts` командаар амжилттай суулгасан. `.env` файлд `PORT=4000` байгаа тул сервер `http://localhost:4000` дээр асна. `.env` байхгүй бол app.js дахь 3000 гэсэн анхдагч утгыг ашиглана. Портыг өөрчилбөл серверээ дахин асаана.

Автомат шалгалт:

```sh
npm test
```

Тест өөрийн түр серверийг сул порт дээр асаагаад, дуусмагц хаана. Өөрийн ажиллуулсан серверийн номын өгөгдлийг өөрчлөхгүй.

## 3. Хийсэн алхмууд

### Алхам 1. ES module import-уудыг шалгасан

package.json-д `"type": "module"` байна. Файлын import-д `.js` өргөтгөл хэрэгтэй:

```js
import booksRouter from "./routes/books.router.js";
```

router нь `export default router` учраас `{ }`-гүй импортлоно. Харин `export function searchByTitle` зэрэг нэртэй export-уудыг `{ searchByTitle }` гэж импортлоно. Зам, өргөтгөл, export/import төрөл зөрвөл сервер хүсэлт хүлээж авахаасаа өмнө алдана.

### Алхам 2. Middleware-ийн дарааллыг шалгасан

src/app.js-д дараах дараалал хадгалагдсан:

```js
app.use(express.json());
app.use(logger);
app.use("/books", booksRouter);
app.use(notFound);
app.use(errorHandler);
```

Express бүртгэсэн дарааллаар ажиллана. express.json() эхэлж JSON body-г req.body болгоно. logger хүсэлтийг ажиглаад next()-ээр дамжуулна. /books хүсэлт router руу орно. Аль ч route таарахгүй бол notFound 404 өгнө. Алдаа дамжвал хамгийн доод errorHandler боловсруулна. notFound-ийг router-оос өмнө тавибал бүх хүсэлт шууд 404 болно.

### Алхам 3. Logger-ийн next()-ийг шалгасан

src/middlewares/logger.js нь хариу дуусахад method, URL, status, зарцуулсан хугацааг хэвлэдэг. Дараах next() нь хүсэлтийг дараагийн middleware руу явуулна:

```js
res.on("finish", () => { /* хариуны мэдээллийг хэвлэнэ */ });
next();
```

Хариу илгээхгүй, next() дуудахгүй бол хүсэлт хүлээлтэд үлдэнэ. Харин хариу өгч дуусгасан middleware заавал next() дуудах шаардлагагүй.

### Алхам 4. Номын ID-г тоо болгож харьцуулсан

URL-ийн /books/1 дэх req.params.id нь `"1"` string. Өгөгдөл дэх id нь 1 number тул:

```js
const id = Number(req.params.id);
const book = findBookById(id);
```

Ингэснээр `1 === 1` үнэн болно. Number() байхгүй бол `1 === "1"` худал болж байгаа ном хүртэл олдохгүй. `/books/abc` нь NaN болж, одоогийн find логикоор ном олдохгүй тул 404 өгнө.

### Алхам 5. Validation-ийн return-ийг хадгалсан

POST /books нь title байхгүй, string биш эсвэл зөвхөн зайтай бол:

```js
return res.status(400).json({ message: "title is required" });
```

res.json() хариу илгээнэ; return нь controller-ийн цаашдын ажиллагааг зогсооно. Return байхгүй бол addBook() ажиллаж буруу ном нэмэх, дараа нь дахин хариу илгээж headers алдаа гаргах эрсдэлтэй. Тестэд буруу POST-ийн өмнөх ба дараах номын тоо ижил эсэхийг шалгасан.

### Алхам 6. Семинар 2-ын filter ойлголтоор хайлт нэмсэн

src/data/books.js:

```js
export function searchByTitle(keyword) {
  return books.filter((book) =>
    book.title.toLowerCase().includes(keyword.toLowerCase())
  );
}
```

filter нь таарсан бүх номыг массив болгон буцаана. Хоёр талыг toLowerCase() болгосноор node, NODE хоёулаа Node.js номтой таарна. Үр дүнгүй бол [] буцаана.

src/controllers/books.controller.js дахь search нь req.query.q-г уншиж, зайг цэвэрлээд хайлтад өгнө. Өмнөх list-тэй ижил `{ count, data }` хэлбэрээр хариулна. q байхгүй эсвэл хоосон бол бүх ном гарна; q нь давтагдсан параметр зэрэг string биш хэлбэртэй бол 400 өгнө.

src/routes/books.router.js-д:

```js
router.get("/", c.list);
router.get("/search", c.search);
router.get("/:id", c.getOne);
```

/search нь тогтмол зам учраас /:id-ээс өмнө байх ёстой. Эсрэг дараалалтай бол Express `search` гэдэг үгийг id гэж ойлгож, getOne дуудаад 404 буцаана.

### Алхам 7. Өмнөх PORT тохиргоог хадгалж, .env жишээ нэмсэн

.env:

```dotenv
PORT=4000
```

Эх төсөлд `dotenv` dependency, src/app.js-ийн эхэнд `import "dotenv/config"`, мөн `process.env.PORT` унших код аль хэдийн байсан. Семинар 4-т эдгээрийг хэвээр хадгалсан. `import "dotenv/config"` тохиргоог ачаална. `const PORT = process.env.PORT ?? 3000` орчны PORT утгыг сонгоно. .env.example нь дахин тохируулах жишээ; .env нь .gitignore-д үлдсэн. Сервер асах алдааг хэвлэж, амжилттай асвал бодит портыг хэвлэдэг болгосон.

### Алхам 8. Шалгаж баталгаажуулсан

Семинарын 13-р слайдын бүх 6 шалгалт амжилттай:

| Хүсэлт | Хүлээх status | Баталсан зүйл |
|---|---|---|
| GET /books | 200 | Анхны 3 ном, count=3 |
| GET /books/1 | 200 | JavaScript ном, ID хөрвүүлэлт |
| GET /books/search?q=node | 200 | Зөвхөн Node.js ном |
| POST /books + {"title":"Go"} | 201 | Шинэ ID, isAvailable=true |
| POST /books + {} | 400 | title is required; ном нэмэгдэхгүй |
| GET /unknown | 404 | Route not found |

Нэмэлтээр NODE хайлт, үр дүнгүй хайлт, PATCH, DELETE, устгасан номын 404, дахин DELETE-ийн 404, эвдэрсэн JSON-ийн 400 болон дараагийн хүсэлт ажиллах эсэхийг шалгасан. `npm test`: нийт 9 test pass (1 ерөнхий тест + 8 дэд тест), fail=0.

## 4. Лекцийн 8 асуултын бичгээр хариу

1. **POST ба PATCH-ийн ялгаа юу вэ?** POST /books шинэ ном үүсгэж 201 буцаана. PATCH /books/:id байгаа номын өгсөн талбаруудыг хэсэгчлэн өөрчилж 200 буцаана. Жишээ нь зөвхөн price шинэчлэхэд title хэвээр үлдэнэ.

2. **req.params ба req.query хоёрын аль нь заавал байх ёстой вэ?** /books/:id замд id нь тухайн route таарахад заавал хэрэгтэй: /books/1 таарна, /books нь энэ route-д таарахгүй. Query нь URL-ийн ?-ийн дараах нэмэлт мэдээлэл. Энэ төслийн q сонголттой; бусад API query-г заавал гэж validation хийж болно.

3. **express.json()-ыг route-уудын доор бичвэл юу болох вэ?** Өмнө байрласан route controller руу хүсэлт ороход JSON parser ажиллаагүй тул req.body undefined байна. JSON parser-ийг body ашиглах route-оос өмнө байрлуулна. Мөн хүсэлт Content-Type: application/json байх хэрэгтэй.

4. **Middleware дотор next() дуудахаа мартвал юу болох вэ?** Хариу ч илгээгээгүй бол дараагийн handler ажиллахгүй, хүсэлт хүлээгдэнэ. res.json() зэрэг аргаар хариулж дуусгасан бол next() дуудахгүй байх нь зөв.

5. **find ба filter юугаараа ялгаатай вэ?** find нь хамгийн эхний таарсан элементийг, олдохгүй бол undefined буцаана. filter нь таарсан бүх элементийн массивыг, олдохгүй бол [] буцаана. ID-гаар нэг ном авахад find, нэрээр олон ном хайхад filter ашигласан.

6. **Ном байхгүй үед ямар status, route байхгүй үед ямар status вэ?** Хоёул 404. Гэхдээ /books/999 нь route таарсан ч ном олдоогүй тул "Book not found". /unknown нь route өөрөө байхгүй тул "Route not found" бөгөөд path дагалдана.

7. **await мартвал ямар утга гарч ирэх вэ?** Promise буцаадаг функцийн бодит үр дүнгийн оронд Promise объект авна. Хүлээгдэж байгаа бол Promise { <pending> } гэж харагдаж болно. Promise дээр шууд .title авахад номын title гарахгүй. async функц дотор await ашигласнаар үр дүнг авна. Одоогийн findBookById нь массив дээр synchronous ажилладаг тул түүнд await шаардлагагүй; database холбох үед async хувилбар хэрэг болно.

8. **Error handler яагаад бусдаас доор бичигддэг вэ?** Express алдаа гарсан цэгээс хойших error middleware руу дамждаг. Иймээс router-уудын дараа байрлуулж тэдгээрээс гарсан алдааг авна. Error handler нь `(error, req, res, next)` гэсэн дөрвөн параметртэй байна.

## 5. Гараар турших жишээ

Сервер асаалттай үед өөр terminal дээр:

```sh
curl -i http://localhost:4000/books
curl -i http://localhost:4000/books/1
curl -i 'http://localhost:4000/books/search?q=node'
curl -i -X POST http://localhost:4000/books -H 'Content-Type: application/json' -d '{"title":"Go"}'
curl -i -X POST http://localhost:4000/books -H 'Content-Type: application/json' -d '{}'
curl -i http://localhost:4000/unknown
```

Номын өгөгдөл одоогоор RAM дахь массивт байгаа. Сервер дахин асахад анхны 3 номоор эхэлнэ. Энэ нь семинар 1–4-ийн үе шаттай нийцнэ; database холболт дараагийн семинарын ажил.

## 6. Материалын холбоос

- Лекц: `/Users/udvalosgonbold/Downloads/Backend lectures/lecture-04.pdf`, ялангуяа 6, 8–11, 16, 18–19, 23–24, 27-р слайд.
- Семинар: `/Users/udvalosgonbold/Downloads/Backend lectures/seminar-4 (1).pdf`, 4–10-р слайдын алдаанууд, 13-р слайдын 6 тест, 14-р слайдын гэрийн даалгавар.
