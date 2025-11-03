import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { clerkMiddleware, getAuth } from "@clerk/express";
import { shouldBeUser } from "./middleware/authMiddleware.js";
import productRouter from "./routes/product.route";
import categoryRouter from "./routes/category.route";
import inventoryRouter from "./routes/inventory.route";
import { consumer, producer } from "./utils/kafka.js";
import { getProducts, getProduct } from "./controllers/product.controller.js";
import { getCategories } from "./controllers/category.controller.js";
const app = express();
app.use(
  cors({
    origin: ["http://localhost:3002", "http://localhost:3003"],
    credentials: true,
  })
);
// Health endpoint BEFORE Clerk middleware (so it doesn't require auth)
app.get("/health", (req: Request, res: Response) => {
  return res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

app.use(express.json());

// Public GET routes - before Clerk middleware (no auth needed to view products)
app.get("/products", getProducts);
app.get("/products/:id", getProduct);
app.get("/categories", getCategories);

// Clerk middleware for protected routes
app.use(clerkMiddleware());

app.get("/test", shouldBeUser, (req, res) => {
  res.json({ message: "Product service authenticated", userId: req.userId });
});

// Protected routes (POST, PUT, DELETE) - require authentication
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
    });
  } catch (error) {
    console.error("Product service startup error:", error);
    process.exit(1);
  }
};

start()
