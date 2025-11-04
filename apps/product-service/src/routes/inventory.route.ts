import { Router } from "express";
import {
  createInventory,
  getInventory,
  updateInventory,
  deleteInventory,
  getLowStock,
} from "../controllers/inventory.controller";
import { shouldBeAdmin } from "../middleware/authMiddleware";

const router: Router = Router();

router.post("/", shouldBeAdmin, createInventory);
router.get("/low-stock", shouldBeAdmin, getLowStock);
router.get("/", getInventory);
router.put("/:productId", shouldBeAdmin, updateInventory);
router.delete("/:productId", shouldBeAdmin, deleteInventory);

export default router;

