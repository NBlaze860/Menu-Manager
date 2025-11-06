import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './src/config/database.js';
import errorHandler from './src/middlewares/errorHandler.js';

import path from "path";

// Import routes
import categoryRoutes from './src/routes/category.routes.js';
import subCategoryRoutes from './src/routes/subcategory.routes.js';
import itemRoutes from './src/routes/item.routes.js';

const __dirname = path.resolve();

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/categories', categoryRoutes);
app.use('/api/subcategories', subCategoryRoutes);
app.use('/api/items', itemRoutes);

// Search endpoint (mounted separately for clarity)
// This handles GET /api/search/items?name=searchTerm
import { searchItems } from './src/controllers/item.controller.js';
import { searchValidation } from './src/utils/validators.js';
app.get('/api/search/items', searchValidation, searchItems);

// Production: Serve static files and handle client-side routing
// IMPORTANT: This must come BEFORE the 404 handler
if (process.env.NODE_ENV === "production") {
  // Serve static files from frontend build
  const frontendPath = path.join(__dirname, "frontend", "dist");
  app.use(express.static(frontendPath));

  // Handle client-side routing - return index.html for all non-API routes
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
} else {
  // Development: Handle undefined routes with 404
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      message: 'Route not found',
    });
  });
}

// Error handling middleware (must be last)
app.use(errorHandler)

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  // Close server and exit process
  process.exit(1);
});
