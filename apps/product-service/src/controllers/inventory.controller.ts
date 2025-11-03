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
    const data: Omit<InventoryItem, "lastUpdated"> = req.body;
    
    if (!data.productId || !data.variantKey || data.quantity === undefined) {
      return res.status(400).json({ 
        message: "productId, variantKey, and quantity are required!" 
      });
    }

    const inventoryItem = await createInventoryItem({
      ...data,
      lastUpdated: new Date().toISOString(),
    });

    res.status(201).json(inventoryItem);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message || "Failed to create inventory item" });
  }
};

export const getInventory = async (req: Request, res: Response) => {
  try {
    const { productId, variantKey } = req.query;

    if (productId && variantKey) {
      const item = await getInventoryItem(productId as string, variantKey as string);
      if (!item) {
        return res.status(404).json({ message: "Inventory item not found" });
      }
      return res.status(200).json(item);
    }

    if (productId) {
      const items = await getInventoryByProduct(productId as string);
      return res.status(200).json(items);
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
    const { productId, variantKey } = req.params;
    const { quantity, operation = "set" } = req.body;

    if (quantity === undefined) {
      return res.status(400).json({ message: "quantity is required" });
    }

    const updatedItem = await updateInventoryQuantity(
      productId,
      variantKey,
      quantity,
      operation
    );

    res.status(200).json(updatedItem);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message || "Failed to update inventory" });
  }
};

export const deleteInventory = async (req: Request, res: Response) => {
  try {
    const { productId, variantKey } = req.params;

    await deleteInventoryItem(productId, variantKey);
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

