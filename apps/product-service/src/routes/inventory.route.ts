import { Router } from "express";
import {
  createInventory,
  getInventory,
  updateInventory,
  deleteInventory,
  getLowStock,
} from "../controllers/inventory.controller";

const router: Router = Router();

router.post("/", createInventory);
router.get("/low-stock", getLowStock);
router.get("/", getInventory);
router.put("/:productId", updateInventory);
router.delete("/:productId", deleteInventory);

export default router;

