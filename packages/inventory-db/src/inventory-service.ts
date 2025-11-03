import { PutCommand, GetCommand, UpdateCommand, DeleteCommand, QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodbClient, InventoryItem } from "./client.js";

const TABLE_NAME = process.env.INVENTORY_TABLE_NAME || "Inventory";

export const createInventoryItem = async (item: InventoryItem) => {
  await dynamodbClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        ...item,
        lastUpdated: new Date().toISOString(),
      },
    })
  );
  return item;
};

export const getInventoryItem = async (productId: string, variantKey: string): Promise<InventoryItem | null> => {
  const result = await dynamodbClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        productId,
        variantKey,
      },
    })
  );
  return (result.Item as InventoryItem) || null;
};

export const updateInventoryQuantity = async (
  productId: string,
  variantKey: string,
  quantity: number,
  operation: "add" | "set" = "set"
) => {
  const updateExpression = operation === "add" 
    ? "ADD quantity :quantity" 
    : "SET quantity = :quantity, lastUpdated = :timestamp";
  
  const result = await dynamodbClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        productId,
        variantKey,
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: {
        ":quantity": quantity,
        ":timestamp": new Date().toISOString(),
      },
      ReturnValues: "ALL_NEW",
    })
  );
  return result.Attributes as InventoryItem;
};

export const deleteInventoryItem = async (productId: string, variantKey: string) => {
  await dynamodbClient.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: {
        productId,
        variantKey,
      },
    })
  );
};

export const getInventoryByProduct = async (productId: string): Promise<InventoryItem[]> => {
  const result = await dynamodbClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "productId = :productId",
      ExpressionAttributeValues: {
        ":productId": productId,
      },
    })
  );
  return (result.Items as InventoryItem[]) || [];
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
      FilterExpression: "quantity <= reorderLevel",
    })
  );
  return (result.Items as InventoryItem[]) || [];
};

