import { PutCommand, GetCommand, UpdateCommand, DeleteCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodbClient, InventoryItem } from "./client.js";

const TABLE_NAME = process.env.INVENTORY_TABLE_NAME || "ProductInventory";

export const createInventoryItem = async (item: InventoryItem) => {
  await dynamodbClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    })
  );
  return item;
};

export const getInventoryItem = async (productId: string): Promise<InventoryItem | null> => {
  const result = await dynamodbClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        product_id: productId,
      },
    })
  );
  return (result.Item as InventoryItem) || null;
};

export const updateInventoryQuantity = async (
  productId: string,
  updates: {
    quantity_l?: number;
    quantity_m?: number;
    quantity_s?: number;
    operation?: "add" | "set";
  }
) => {
  const { quantity_l, quantity_m, quantity_s, operation = "set" } = updates;
  
  const updateExpressions: string[] = [];
  const expressionAttributeValues: Record<string, number> = {};

  if (quantity_l !== undefined) {
    if (operation === "add") {
      updateExpressions.push("ADD quantity_l :quantity_l");
    } else {
      updateExpressions.push("SET quantity_l = :quantity_l");
    }
    expressionAttributeValues[":quantity_l"] = quantity_l;
  }

  if (quantity_m !== undefined) {
    if (operation === "add") {
      updateExpressions.push("ADD quantity_m :quantity_m");
    } else {
      updateExpressions.push("SET quantity_m = :quantity_m");
    }
    expressionAttributeValues[":quantity_m"] = quantity_m;
  }

  if (quantity_s !== undefined) {
    if (operation === "add") {
      updateExpressions.push("ADD quantity_s :quantity_s");
    } else {
      updateExpressions.push("SET quantity_s = :quantity_s");
    }
    expressionAttributeValues[":quantity_s"] = quantity_s;
  }

  if (updateExpressions.length === 0) {
    throw new Error("At least one quantity field must be provided");
  }

  const result = await dynamodbClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        product_id: productId,
      },
      UpdateExpression: updateExpressions.join(", "),
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    })
  );
  return result.Attributes as InventoryItem;
};

export const deleteInventoryItem = async (productId: string) => {
  await dynamodbClient.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: {
        product_id: productId,
      },
    })
  );
};

export const getInventoryByProduct = async (productId: string): Promise<InventoryItem | null> => {
  return getInventoryItem(productId);
};

export const getAllInventory = async (): Promise<InventoryItem[]> => {
  const result = await dynamodbClient.send(
    new ScanCommand({
      TableName: TABLE_NAME,
    })
  );
  return (result.Items as InventoryItem[]) || [];
};

export const getLowStockItems = async (): Promise<InventoryItem[]> => {
  const result = await dynamodbClient.send(
    new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: "(quantity_l <= stock_threshold) OR (quantity_m <= stock_threshold) OR (quantity_s <= stock_threshold)",
    })
  );
  return (result.Items as InventoryItem[]) || [];
};

