import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connectDatabase } from "./config/dbConnect.js";
import errorMiddleware from "./middlewares/errors.js";
import productRoutes from "./routes/products.js";
import authRoutes from "./routes/auth.js";
import orderRoutes from "./routes/order.js";
import paymentRoutes from "./routes/payment.js";


import path from 'path'
import { fileURLToPath } from "url";
const __filename = fileURLToPath (import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: 'backend/config/config.env' });

// Create an Express application
const app = express();

// Set up global error handling for uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`ERROR: ${err}`);
  console.error("Shutting down server due to Uncaught exception");
  process.exit(1);
});

// Connect to the database
connectDatabase();

// Middleware setup
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  },
}));
app.use(cookieParser());



// Routes setup
app.use("/api/v1", productRoutes);
app.use("/api/v1", authRoutes);
app.use("/api/v1", orderRoutes);
app.use("/api/v1", paymentRoutes);

if (process.env.NODE_ENV === "PRODUCTION") {
  app.use(express.static (path.join(__dirname, "../frontend/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend/build/index.html"));
    });

  }

// Global error handling middleware
app.use(errorMiddleware);

// Start the server
const server = app.listen(process.env.PORT, () => {
  console.log(`🚀Server started on PORT: ${process.env.PORT} in ${process.env.NODE_ENV} mode.`);
});

// Set up global error handling for unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`ERROR: ${err}`);
  console.error("🍆💦Shutting down server due to Unhandled Promise Rejection");
  server.close(() => {
    process.exit(1);
  });
});
