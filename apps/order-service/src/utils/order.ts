import { Order } from "@repo/order-db";
import { OrderType } from "@repo/types";
import { producer } from "./kafka";
import { updateInventoryQuantity } from "@repo/inventory-db";

export const createOrder = async (order: OrderType) => {
  const newOrder = new Order(order);

  try {
    const savedOrder = await newOrder.save();
    
    // Update inventory for each product in the order
    if (order.products && Array.isArray(order.products)) {
      await Promise.all(
        order.products.map(async (product: any) => {
          try {
            // Decrease inventory quantity
            // Assuming product has: { id, name, quantity, size }
            const productId = product.id || product.productId;
            const size = product.size?.toLowerCase() || "m"; // Default to medium if not specified
            
            // Skip inventory update if product ID is missing
            if (!productId) {
              console.warn(`⚠️  Skipping inventory update - product ID missing for product: ${product.name}`);
              return;
            }
            
            // Map size to quantity field
            const updates: {
              quantity_l?: number;
              quantity_m?: number;
              quantity_s?: number;
            } = {};
            
            if (size === "l" || size === "large") {
              updates.quantity_l = -product.quantity; // Negative to decrease
            } else if (size === "s" || size === "small") {
              updates.quantity_s = -product.quantity;
            } else {
              // Default to medium
              updates.quantity_m = -product.quantity;
            }
            
            // Reduce quantity in DynamoDB
            await updateInventoryQuantity(
              productId.toString(),
              {
                ...updates,
                operation: "add" // Use ADD operation to increment/decrement
              }
            );
            
            console.log(`✅ Inventory updated for product ${productId}, size ${size}, reduced by ${product.quantity}`);
          } catch (inventoryError) {
            console.error(`❌ Failed to update inventory for product ${product.id || product.name}:`, inventoryError);
            // Don't throw - order is already created, log the error for manual review
          }
        })
      );
    }
    
    // Send order created event for email notification
    producer.send("order.created", {
      value: {
        email: savedOrder.email,
        amount: savedOrder.amount,
        status: savedOrder.status,
      },
    });
    
    return savedOrder;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

