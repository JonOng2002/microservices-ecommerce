"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ProductType } from "@repo/types";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import EditInventory from "@/components/EditInventory";
import { useQuery } from "@tanstack/react-query";

// export type Product = {
//   id: string | number;
//   price: number;
//   name: string;
//   shortDescription: string;
//   description: string;
//   sizes: string[];
//   colors: string[];
//   images: Record<string, string>;
// };

export const columns: ColumnDef<ProductType>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        checked={row.getIsSelected()}
      />
    ),
  },
  {
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div className="w-9 h-9 relative">
          <Image
            src={
              (product.images as Record<string, string>)?.[
                product.colors[0] || ""
              ] || ""
            }
            alt={product.name}
            fill
            className="rounded-full object-cover"
          />
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "price",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "shortDescription",
    header: "Description",
  },
  {
    id: "inventory",
    header: "Inventory",
    cell: ({ row }) => {
      const product = row.original;
      return <InventoryCell productId={product.id} />;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const product = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() =>
                navigator.clipboard.writeText(product.id.toString())
              }
            >
              Copy product ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href={`/products/${product.id}`}>View product</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <EditInventory
                productId={product.id}
                productName={product.name}
                trigger={
                  <div className="w-full text-left cursor-pointer">
                    Edit Inventory
                  </div>
                }
              />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

// Component to display inventory quantities in the table
const InventoryCell = ({ productId }: { productId: number | string }) => {
  const { data: inventory, isLoading } = useQuery({
    queryKey: ["inventory", productId],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL}/inventory?productId=${productId}`
      );
      if (!res.ok) {
        if (res.status === 404) {
          return null;
        }
        throw new Error("Failed to fetch inventory");
      }
      return await res.json();
    },
  });

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading...</div>;
  }

  if (!inventory) {
    return (
      <div className="text-sm text-muted-foreground flex items-center gap-1">
        <Package className="h-3 w-3" />
        <span>No inventory</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 text-sm">
      <div className="flex items-center gap-2">
        <span className="font-medium">S:</span>
        <span
          className={cn(
            "px-2 py-0.5 rounded",
            (inventory.quantity_s || 0) === 0
              ? "bg-red-100 text-red-800"
              : (inventory.quantity_s || 0) < 10
              ? "bg-yellow-100 text-yellow-800"
              : "bg-green-100 text-green-800"
          )}
        >
          {inventory.quantity_s || 0}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-medium">M:</span>
        <span
          className={cn(
            "px-2 py-0.5 rounded",
            (inventory.quantity_m || 0) === 0
              ? "bg-red-100 text-red-800"
              : (inventory.quantity_m || 0) < 10
              ? "bg-yellow-100 text-yellow-800"
              : "bg-green-100 text-green-800"
          )}
        >
          {inventory.quantity_m || 0}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-medium">L:</span>
        <span
          className={cn(
            "px-2 py-0.5 rounded",
            (inventory.quantity_l || 0) === 0
              ? "bg-red-100 text-red-800"
              : (inventory.quantity_l || 0) < 10
              ? "bg-yellow-100 text-yellow-800"
              : "bg-green-100 text-green-800"
          )}
        >
          {inventory.quantity_l || 0}
        </span>
      </div>
    </div>
  );
};
