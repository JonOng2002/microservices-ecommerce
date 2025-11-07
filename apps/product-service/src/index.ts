import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
// import { clerkMiddleware } from "@clerk/express"; // Temporarily disabled for deployment testing
// import { shouldBeUser } from "./middleware/authMiddleware.js"; // Temporarily disabled for deployment testing
import productRouter from "./routes/product.route";
import categoryRouter from "./routes/category.route";
import inventoryRouter from "./routes/inventory.route";
import uploadRouter from "./routes/upload.route";
import { consumer, producer } from "./utils/kafka.js";
import { getProducts, getProduct } from "./controllers/product.controller.js";
import { getCategories } from "./controllers/category.controller.js";

const app = express();

app.use(
  cors({
    origin: [
      process.env.CLIENT_URL || "http://localhost:3002",
      process.env.ADMIN_URL || "http://localhost:3003",
      "https://main.d18wbnrtlaqqva.amplifyapp.com", // Amplify client domain
      "https://main.d21ddnl9n8aqva.amplifyapp.com", // Amplify admin domain
      "https://shop.is458g1t2.jonongca.com", // Custom client domain
      "https://admin.is458g1t2.jonongca.com", // Custom admin domain
    ],
    credentials: true,
  })
);

app.use(express.json());

// Health endpoint (completely public, no auth)
app.get("/health", (req: Request, res: Response) => {
  return res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

// Public GET routes (no auth needed to view products/categories)
app.get("/products", getProducts);
app.get("/products/:id", getProduct);
app.get("/categories", getCategories);

// Test endpoint (no auth required for deployment testing)
app.get("/test", (req, res) => {
  res.json({ message: "Product service working", status: "ok" });
});

// All routes are now public for deployment testing
// Protected routes (POST, PUT, DELETE) - auth temporarily removed
app.use("/upload", uploadRouter);
app.use("/products", productRouter);
app.use("/categories", categoryRouter);
app.use("/inventory", inventoryRouter);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.log(err);
  return res
    .status(err.status || 500)
    .json({ message: err.message || "Inter Server Error!" });
});

const start = async () => {
  try {
    await Promise.all([producer.connect(), consumer.connect()]);
    console.log("Product service: Kafka connected");
    app.listen(8000, () => {
      console.log("Product service is running on 8000");
      console.log("🚀 Authentication temporarily disabled for deployment testing");
    });
  } catch (error) {
    console.error("Product service startup error:", error);
    process.exit(1);
  }
};

start();