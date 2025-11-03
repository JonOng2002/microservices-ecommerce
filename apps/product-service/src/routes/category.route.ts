import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "../controllers/category.controller";
import { shouldBeAdmin } from "../middleware/authMiddleware";

const router: Router = Router();

// Only protected routes (GET routes are public and handled in index.ts)
router.post("/", shouldBeAdmin, createCategory);
router.put("/:id", shouldBeAdmin, updateCategory);
router.delete("/:id", shouldBeAdmin, deleteCategory);
// GET /categories moved to index.ts as public route

export default router;
