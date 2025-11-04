import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "../controllers/category.controller";

const router: Router = Router();

// Removed auth - making public for easier deployment
router.post("/", createCategory);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);
// GET /categories moved to index.ts as public route

export default router;
