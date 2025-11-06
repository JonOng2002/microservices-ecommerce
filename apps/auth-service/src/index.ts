import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
// Auth removed - no middleware needed
import userRoute from "./routes/user.route";
import { producer } from "./utils/kafka.js";

const app = express();
app.use(
  cors({
    origin: [process.env.ADMIN_URL || "http://localhost:3003"],
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
// Auth removed - Clerk middleware not needed
// app.use(clerkMiddleware());

// Auth removed - all routes are public for easier deployment
app.use("/users", userRoute);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.log(err);
  return res
    .status(err.status || 500)
    .json({ message: err.message || "Inter Server Error!" });
});

const start = async () => {
  try {
    await producer.connect();
    app.listen(8003, () => {
      console.log("Auth service is running on 8003");
    });
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

start();
