import type { Product, Category } from "@repo/product-db";
import z from "zod";

export type ProductType = Product;

export type ProductsType = ProductType[];

export type StripeProductType = {
  id: string;
  name: string;
  price: number;
};

export const colors = [
  "blue",
  "green",
  "red",
  "yellow",
  "purple",
  "orange",
  "pink",
  "brown",
  "gray",
  "black",
  "white",
] as const;

// Only L, M, S sizes for inventory management
export const sizes = ["l", "m", "s"] as const;

export const ProductFormSchema = z
  .object({
    name: z
      .string({ message: "Product name is required!" })
      .min(1, { message: "Product name is required!" }),
    shortDescription: z
      .string({ message: "Short description is required!" })
      .min(1, { message: "Short description is required!" })
      .max(60),
    description: z
      .string({ message: "Description is required!" })
      .min(1, { message: "Description is required!" }),
    price: z
      .number({ message: "Price is required!" })
      .min(1, { message: "Price is required!" }),
    categorySlug: z
      .string({ message: "Category is required!" })
      .min(1, { message: "Category is required!" }),
    sizes: z
      .array(z.enum(sizes))
      .min(1, { message: "At least one size is required!" }),
    colors: z
      .array(z.enum(colors))
      .min(1, { message: "At least one color is required!" }),
    images: z.record(z.string(), z.string(), {
      message: "Image for each color is required!",
    }),
    // Inventory quantities for each size
    quantity_l: z
      .number({ message: "Quantity for L is required!" })
      .min(0, { message: "Quantity must be 0 or greater!" })
      .optional(),
    quantity_m: z
      .number({ message: "Quantity for M is required!" })
      .min(0, { message: "Quantity must be 0 or greater!" })
      .optional(),
    quantity_s: z
      .number({ message: "Quantity for S is required!" })
      .min(0, { message: "Quantity must be 0 or greater!" })
      .optional(),
    stock_threshold: z
      .number({ message: "Stock threshold is required!" })
      .min(0, { message: "Stock threshold must be 0 or greater!" })
      .optional(),
  })
  .refine(
    (data) => {
      const missingImages = data.colors.filter(
        (color: string) => !data.images?.[color]
      );
      return missingImages.length === 0;
    },
    {
      message: "Image is required for each selected color!",
      path: ["images"],
    }
  )
  .refine(
    (data) => {
      // If a size is selected, quantity for that size must be provided
      if (data.sizes.includes("l") && data.quantity_l === undefined) {
        return false;
      }
      if (data.sizes.includes("m") && data.quantity_m === undefined) {
        return false;
      }
      if (data.sizes.includes("s") && data.quantity_s === undefined) {
        return false;
      }
      return true;
    },
    {
      message: "Quantity must be provided for each selected size!",
      path: ["quantity_l"],
    }
  );

export type CategoryType = Category;

export const CategoryFormSchema = z.object({
  name: z
    .string({ message: "Name is Required!" })
    .min(1, { message: "Name is Required!" }),
  slug: z
    .string({ message: "Slug is Required!" })
    .min(1, { message: "Slug is Required!" }),
});
