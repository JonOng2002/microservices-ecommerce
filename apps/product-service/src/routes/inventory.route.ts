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
router.put("/:productId/:variantKey", shouldBeAdmin, updateInventory);
router.delete("/:productId/:variantKey", shouldBeAdmin, deleteInventory);

export default router;

