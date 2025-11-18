/**
 * E-commerce Backend Interview Exercise
 * 
 * Main Express application entry point
 */

import express from 'express';
import 'express-async-errors';
import ordersRouter from './routes/orders';
import paymentsRouter from './routes/payments';
import productsRouter from './routes/products';
import checkoutRouter from './routes/checkout';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/orders', ordersRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/products', productsRouter);
app.use('/api/checkout', checkoutRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'E-commerce Backend Interview Exercise',
    version: '1.0.0',
    endpoints: {
      orders: '/api/orders',
      payments: '/api/payments',
      products: '/api/products',
      checkout: '/api/checkout',
      health: '/health'
    }
  });
});

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║   E-commerce Backend - Staff Engineer Interview           ║
║   Server running on http://localhost:${PORT}              ║
║                                                           ║
║   Endpoints:                                              ║
║   - POST /api/orders/:orderId/fulfill                     ║
║   - POST /api/payments/process                            ║
║   - POST /api/products/bulk-upload                        ║
║   - POST /api/checkout                                    ║
║   - POST /api/checkout/:orderId/apply-coupon              ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

export default app;

