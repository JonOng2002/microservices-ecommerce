"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";

const inventorySchema = z.object({
  quantity_l: z.number().min(0, { message: "Quantity must be 0 or greater!" }),
  quantity_m: z.number().min(0, { message: "Quantity must be 0 or greater!" }),
  quantity_s: z.number().min(0, { message: "Quantity must be 0 or greater!" }),
});

type InventoryFormData = z.infer<typeof inventorySchema>;

interface EditInventoryProps {
  productId: string | number;
  productName: string;
  trigger?: React.ReactNode;
}

const fetchInventory = async (productId: string | number) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL}/inventory?productId=${productId}`
  );
  if (!res.ok) {
    if (res.status === 404) {
      // Return default values if inventory doesn't exist
      return { quantity_l: 0, quantity_m: 0, quantity_s: 0 };
    }
    throw new Error("Failed to fetch inventory!");
  }
  return await res.json();
};

const EditInventory = ({
  productId,
  productName,
  trigger,
}: EditInventoryProps) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: inventoryData, isLoading } = useQuery({
    queryKey: ["inventory", productId],
    queryFn: () => fetchInventory(productId),
    enabled: open, // Only fetch when sheet is open
  });

  const form = useForm<InventoryFormData>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      quantity_l: 0,
      quantity_m: 0,
      quantity_s: 0,
    },
  });

  // Update form when inventory data is loaded
  useEffect(() => {
    if (inventoryData && open) {
      form.reset({
        quantity_l: inventoryData.quantity_l || 0,
        quantity_m: inventoryData.quantity_m || 0,
        quantity_s: inventoryData.quantity_s || 0,
      });
    }
  }, [inventoryData, open, form]);

  const mutation = useMutation({
    mutationFn: async (data: InventoryFormData) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL}/inventory/${productId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            quantity_l: data.quantity_l,
            quantity_m: data.quantity_m,
            quantity_s: data.quantity_s,
            operation: "set", // Set the values directly
          }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData?.message || `Failed to update inventory (${res.status})`
        );
      }

      return await res.json();
    },
    onSuccess: () => {
      toast.success("Inventory updated successfully!");
      // Invalidate queries to refetch inventory data
      queryClient.invalidateQueries({ queryKey: ["inventory", productId] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update inventory");
    },
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            Edit Inventory
          </Button>
        )}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Inventory - {productName}</SheetTitle>
          <SheetDescription>
            Update stock quantities for sizes S, M, and L. Changes are saved to
            DynamoDB in real-time.
          </SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <div className="py-8 text-center">Loading inventory...</div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
              className="space-y-6 mt-6"
            >
              <FormField
                control={form.control}
                name="quantity_s"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity (S)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(Number(e.target.value))
                        }
                        min={0}
                      />
                    </FormControl>
                    <FormDescription>
                      Current stock quantity for size S.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quantity_m"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity (M)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(Number(e.target.value))
                        }
                        min={0}
                      />
                    </FormControl>
                    <FormDescription>
                      Current stock quantity for size M.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quantity_l"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity (L)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(Number(e.target.value))
                        }
                        min={0}
                      />
                    </FormControl>
                    <FormDescription>
                      Current stock quantity for size L.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-4 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {mutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default EditInventory;

