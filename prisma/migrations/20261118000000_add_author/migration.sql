BEGIN;

CREATE TABLE "Author" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    CONSTRAINT "Author_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Author_email_key" ON "Author"("email");

ALTER TABLE "Book" ADD COLUMN "authorId" INTEGER;

-- Seminar 5 books did not store author information.
WITH placeholder AS (
    INSERT INTO "Author" ("name", "email")
    SELECT 'Зохиогч тодорхойгүй', 'unknown-author@library.invalid'
    WHERE EXISTS (SELECT 1 FROM "Book")
    RETURNING "id"
)
UPDATE "Book" SET "authorId" = (SELECT "id" FROM placeholder);

ALTER TABLE "Book" ALTER COLUMN "authorId" SET NOT NULL;
CREATE INDEX "Book_authorId_idx" ON "Book"("authorId");
ALTER TABLE "Book" ADD CONSTRAINT "Book_authorId_fkey"
    FOREIGN KEY ("authorId") REFERENCES "Author"("id")
    ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT;
