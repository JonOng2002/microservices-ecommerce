import { Request, Response } from "express";
import { prisma, Prisma } from "@repo/product-db";
import { producer } from "../utils/kafka";
import { StripeProductType } from "@repo/types";
import { createInventoryItem, updateInventoryQuantity, deleteInventoryItem, getInventoryItem } from "@repo/inventory-db";

// Helper function to generate slug from product name
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-"); // Replace multiple hyphens with single hyphen
};

export const createProduct = async (req: Request, res: Response) => {
  const body = req.body as any;
  
  // Extract inventory fields (not part of Product model)
  const { quantity_l, quantity_m, quantity_s, stock_threshold, ...productData } = body;
  
  const data: Prisma.ProductCreateInput = productData;

  const { colors, images } = data;
  if (!colors || !Array.isArray(colors) || colors.length === 0) {
    return res.status(400).json({ message: "Colors array is required!" });
  }

  if (!images || typeof images !== "object") {
    return res.status(400).json({ message: "Images object is required!" });
  }

  const missingColors = colors.filter((color) => !(color in images));

  if (missingColors.length > 0) {
    return res
      .status(400)
      .json({ message: "Missing images for colors!", missingColors });
  }

  const product = await prisma.product.create({ data });

  // Create inventory item in DynamoDB
  try {
    const productSlug = generateSlug(product.name);
    const inventoryData = {
      product_id: product.id.toString(),
      product_name: product.name,
      product_slug: productSlug,
      quantity_l: quantity_l || 0,
      quantity_m: quantity_m || 0,
      quantity_s: quantity_s || 0,
      stock_threshold: stock_threshold || 5,
    };

    await createInventoryItem(inventoryData);
    console.log(`✅ Inventory created for product ${product.id}`);
  } catch (inventoryError) {
    console.error(`❌ Failed to create inventory for product ${product.id}:`, inventoryError);
    // Don't fail the request if inventory creation fails - log for manual review
  }

  const stripeProduct: StripeProductType = {
    id: product.id.toString(),
    name: product.name,
    price: product.price,
  };

  producer.send("product.created", { value: stripeProduct });
  res.status(201).json(product);
};

export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const body = req.body as any;
  
  // Extract inventory fields (not part of Product model)
  const { quantity_l, quantity_m, quantity_s, stock_threshold, ...productData } = body;
  
  const data: Prisma.ProductUpdateInput = productData;

  const updatedProduct = await prisma.product.update({
    where: { id: Number(id) },
    data,
  });

  // Update inventory in DynamoDB if quantities are provided
  try {
    const updates: {
      quantity_l?: number;
      quantity_m?: number;
      quantity_s?: number;
    } = {};

    if (quantity_l !== undefined) updates.quantity_l = quantity_l;
    if (quantity_m !== undefined) updates.quantity_m = quantity_m;
    if (quantity_s !== undefined) updates.quantity_s = quantity_s;

    if (Object.keys(updates).length > 0) {
      // Check if inventory exists, create if not
      const existingInventory = await getInventoryItem(id);
      if (!existingInventory) {
        // Create new inventory item if it doesn't exist
        const productSlug = generateSlug(updatedProduct.name as string);
        await createInventoryItem({
          product_id: id,
          product_name: updatedProduct.name as string,
          product_slug: productSlug,
          quantity_l: quantity_l || 0,
          quantity_m: quantity_m || 0,
          quantity_s: quantity_s || 0,
          stock_threshold: stock_threshold || 5,
        });
        console.log(`✅ Inventory created for product ${id}`);
      } else {
        // Update existing inventory
        await updateInventoryQuantity(id, {
          ...updates,
          operation: "set",
        });
        console.log(`✅ Inventory updated for product ${id}`);
      }
    }
  } catch (inventoryError) {
    console.error(`❌ Failed to update inventory for product ${id}:`, inventoryError);
    // Don't fail the request if inventory update fails - log for manual review
  }

  return res.status(200).json(updatedProduct);
};

export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;

  const deletedProduct = await prisma.product.delete({
    where: { id: Number(id) },
  });

  // Delete inventory from DynamoDB
  try {
    await deleteInventoryItem(id);
    console.log(`✅ Inventory deleted for product ${id}`);
  } catch (inventoryError) {
    console.error(`❌ Failed to delete inventory for product ${id}:`, inventoryError);
    // Don't fail the request if inventory deletion fails - log for manual review
  }

  producer.send("product.deleted", { value: Number(id) });

  return res.status(200).json(deletedProduct);
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { sort, category, search, limit, popular } = req.query;

    const orderBy = (() => {
      switch (sort) {
        case "asc":
          return { price: Prisma.SortOrder.asc };
        case "desc":
          return { price: Prisma.SortOrder.desc };
        case "oldest":
          return { createdAt: Prisma.SortOrder.asc };
        default:
          return { createdAt: Prisma.SortOrder.desc };
      }
    })();

    // Build where clause conditionally
    const where: Prisma.ProductWhereInput = {};
    
    if (category) {
      where.category = {
        slug: category as string,
      };
    }
    
    if (search) {
      where.name = {
        contains: search as string,
        mode: "insensitive",
      };
    }

    // Handle popular filter if needed (you may want to add this logic)
    // if (popular === "true") {
    //   // Add logic for popular products
    // }

    const products = await prisma.product.findMany({
      where,
      orderBy,
      take: limit ? Number(limit) : undefined,
      include: {
        category: true,
      },
    });

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Failed to fetch products", error: error instanceof Error ? error.message : "Unknown error" });
  }
};

export const getProduct = async (req: Request, res: Response) => {
  const { id } = req.params;

  const product = await prisma.product.findUnique({
    where: { id: Number(id) },
  });

  return res.status(200).json(product);
};
