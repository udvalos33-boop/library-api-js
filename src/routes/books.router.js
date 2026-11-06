import { Router } from "express";

import * as c from "../controllers/books.controller.js";

const router = Router();

router.get("/", c.list);

// Тогтмол /search замыг хувьсах /:id замаас өмнө бүртгэнэ.
router.get("/search", c.search);

router.get("/:id", c.getOne);

router.post("/", c.create);

router.patch("/:id", c.update);

router.delete("/:id", c.remove);

export default router;