import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  endpoint: process.env.DYNAMODB_ENDPOINT, // For LocalStack: http://localhost:4566
});

export const dynamodbClient = DynamoDBDocumentClient.from(client);

export interface InventoryItem {
  productId: string;
  variantKey: string; // e.g., "color:red:size:M"
  productName: string;
  quantity: number;
  reorderLevel: number;
  lastUpdated: string;
}

