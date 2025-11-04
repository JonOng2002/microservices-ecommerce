import { Request, Response } from "express";
import {
  createInventoryItem,
  getInventoryItem,
  updateInventoryQuantity,
  deleteInventoryItem,
  getInventoryByProduct,
  getAllInventory,
  getLowStockItems,
  InventoryItem,
} from "@repo/inventory-db";

export const createInventory = async (req: Request, res: Response) => {
  try {
    const data: InventoryItem = req.body;
    
    if (!data.product_id || !data.product_name || !data.product_slug) {
      return res.status(400).json({ 
        message: "product_id, product_name, and product_slug are required!" 
      });
    }

    if (data.quantity_l === undefined || data.quantity_m === undefined || data.quantity_s === undefined) {
      return res.status(400).json({ 
        message: "quantity_l, quantity_m, and quantity_s are required!" 
      });
    }

    if (data.stock_threshold === undefined) {
      return res.status(400).json({ 
        message: "stock_threshold is required!" 
      });
    }

    const inventoryItem = await createInventoryItem(data);

    res.status(201).json(inventoryItem);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message || "Failed to create inventory item" });
  }
};

export const getInventory = async (req: Request, res: Response) => {
  try {
    const { productId } = req.query;

    if (productId) {
      const item = await getInventoryItem(productId as string);
      if (!item) {
        return res.status(404).json({ message: "Inventory item not found" });
      }
      return res.status(200).json(item);
    }

    const items = await getAllInventory();
    res.status(200).json(items);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message || "Failed to get inventory" });
  }
};

export const updateInventory = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { quantity_l, quantity_m, quantity_s, operation = "set" } = req.body;

    if (quantity_l === undefined && quantity_m === undefined && quantity_s === undefined) {
      return res.status(400).json({ 
        message: "At least one of quantity_l, quantity_m, or quantity_s is required" 
      });
    }

    const updatedItem = await updateInventoryQuantity(
      productId,
      {
        quantity_l,
        quantity_m,
        quantity_s,
        operation,
      }
    );

    res.status(200).json(updatedItem);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message || "Failed to update inventory" });
  }
};

export const deleteInventory = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;

    await deleteInventoryItem(productId);
    res.status(200).json({ message: "Inventory item deleted successfully" });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message || "Failed to delete inventory item" });
  }
};

export const getLowStock = async (req: Request, res: Response) => {
  try {
    const lowStockItems = await getLowStockItems();
    res.status(200).json(lowStockItems);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message || "Failed to get low stock items" });
  }
};

