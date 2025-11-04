import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  updateProduct,
} from "../controllers/product.controller";

const router: Router = Router();

// Removed auth - making public for easier deployment
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
// GET routes moved to index.ts as public routes

export default router;
