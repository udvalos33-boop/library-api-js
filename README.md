# Library API · Семинар 6

Express, Prisma, PostgreSQL ашиглан ном болон зохиогчийн бүртгэл хөтөлнө. Өмнөх семинарын HTTP болон middleware тайлбар [SEMINAR-4.md](./SEMINAR-4.md)-д бий.

## Ажиллуулах

1. PostgreSQL дээр `library` нэртэй сан үүсгэнэ.
2. `.env.example` дахь `DATABASE_URL`-ийг `.env` файлд нэмээд PostgreSQL-ийн өөрийн хэрэглэгч, нууц үг, портоор тохируулна.
3. Дараах командуудыг ажиллуулна.

```sh
npm ci
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Серверийн портыг `.env`-ийн `PORT`-оос авна. Жишээ хаяг `http://localhost:4000`. Seed нь Бат, Сараа болон гурван ном нэмнэ.

Семинар 5-аас шилжихэд өмнөх номын бүртгэлүүдийг хадгалж, зохиогчийн мэдээлэлгүй номыг «Зохиогч тодорхойгүй» гэсэн бүртгэлтэй холбоно.

## Турших

| Хүсэлт | Үр дүн |
| --- | --- |
| `GET /authors` | Зохиогчдын жагсаалт, номын тоо `_count.books` талбарт |
| `GET /authors/1` | Цэвэр санд seed ажиллуулсан бол Батын мэдээлэл |
| `GET /authors/1/books` | Батын хоёр ном |
| `GET /authors/99/books` | Зохиогч байхгүй бол `404` |
| `POST /authors` | `name`, `email` өгч шинэ зохиогч нэмэх |
| `POST /authors/:id/books` | URL дахь зохиогчид `title`, `price` өгч ном нэмэх |
| `DELETE /authors/:id` | Номтой бол `409`, номгүй бол устгаад `204` |
| `GET /books` | `{ count, data }` бүтэцтэй жагсаалт, ном бүрд `author` багтана |
| `POST /books` | `title`, `price`, `authorId` өгч ном нэмэх |

```sh
curl http://localhost:4000/authors/1/books
curl -X POST http://localhost:4000/books \
  -H 'Content-Type: application/json' \
  -d '{"title":"New Book","price":25000,"authorId":2}'
```

Автомат шалгалт өгөгдөл нэмдэг. Тусдаа шинэ PostgreSQL сан бэлдээд түүн рүү заасан URL-аар migration, seed, тест ажиллуулна.

```sh
export TEST_DATABASE_URL='postgresql://postgres:postgres@localhost:5432/library_test'
DATABASE_URL="$TEST_DATABASE_URL" npx prisma migrate deploy
DATABASE_URL="$TEST_DATABASE_URL" npm run db:seed
npm test
```
