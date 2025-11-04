import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { fromIni } from "@aws-sdk/credential-providers";

const region = process.env.AWS_REGION || "ap-southeast-1";
const awsProfile = process.env.AWS_PROFILE;

const client = new DynamoDBClient({
  region: region,
  credentials: awsProfile ? fromIni({ profile: awsProfile }) : undefined,
  endpoint: process.env.DYNAMODB_ENDPOINT, // For LocalStack: http://localhost:4566
});

export const dynamodbClient = DynamoDBDocumentClient.from(client);

export interface InventoryItem {
  product_id: string;
  product_name: string;
  product_slug: string;
  quantity_l: number;
  quantity_m: number;
  quantity_s: number;
  stock_threshold: number;
}

